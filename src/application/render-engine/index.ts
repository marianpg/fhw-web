'use strict'

import { TemplatingConfig } from '../../public/config'
import { GlobalData } from '../../public/global'
import { RequestData } from '../../public/request'
import { SessionData } from '../../public/session'
import { Frontmatter, PageData } from '../../public/frontmatter'

import Handlebars = require('handlebars') //see https://stackoverflow.com/a/34520891
import promisedHandlebars = require('promised-handlebars')

import { isDefined } from '../helper'
import { Logging } from '../logging'
import { FileUtils } from '../filesystem-utils'

import { FrontmatterService } from './frontmatter-service'
import { HelpersRegistration } from './helper'
import { Validation } from '../validator'

import { ErrorBannerTemplate } from './templates/error-banner-template.hbs'
import { AnyErrorTemplate } from './templates/any-error-template.hbs'
import { ValidationErrorTemplate } from './templates/validation-error-template.hbs'
import { DatabaseService } from '../database'
import { TemplateFileService, TemplateFile, TemplateType } from './template-file-service'


export class RenderEngine {
    private hbs: typeof Handlebars
    private helpers: HelpersRegistration
    private templateFileService: TemplateFileService

    constructor(
        private config: TemplatingConfig,
        private logging: Logging,
        private fileUtils: FileUtils,
        private databaseService: DatabaseService
    ) {
        this.helpers = new HelpersRegistration(this.config, this.logging, this.fileUtils)
        this.templateFileService = new TemplateFileService(this.config, this.fileUtils, this.databaseService)
    }

    async build(): Promise<RenderEngine> {
        this.hbs = promisedHandlebars(Handlebars)
        this.helpers.registerGlobalHelpers(this.hbs)
        await this.helpers.registerCustomHelpers(this.hbs)

        return this
    }

    async reloadRenderer(): Promise<void> {
        if (this.config.helpers.reloadOnEveryRequest) {
            await this.build()
        }
    }

    private async _render(file: TemplateFile, contentHtml?: string): Promise<string> {
        this.logging.info(`render ${file.getName()}`)
        const frontmatter = file.getFrontmatter()

        this.hbs.registerHelper('content', () => {
            return new this.hbs.SafeString(contentHtml)
        })

        this.hbs.registerHelper('include', async (fname) => {
            if (isDefined(fname)) {
                const templateHtml = await this._renderTemplate(fname, frontmatter)
                return new this.hbs.SafeString(templateHtml)
            } else {
                this.logging.warn(`there is a include-helper without a specified filename in ${file.getName()}. Did you miss to put the filename in quotation marks, like in {{ include "fragment" }} ?`)
                return ''
            }
        })

        let templateName = null
        if (isDefined(frontmatter.page.template)) {
            templateName = frontmatter.page.template
            delete frontmatter.page.template
        }

        const hbsTemplate = this.hbs.compile(file.getMarkup())

        // note: it's the 'promised-handlebars' api, function 'hbsTemplate' returns a promise
        let html = await hbsTemplate(frontmatter)

        if (isDefined(templateName)) {
            html = await this._renderTemplate(templateName, frontmatter, html)
        }

        return html
    }

    private async _renderTemplate(filePath: string, frontmatter: Frontmatter, contentHtml?: string): Promise<string> {
        const file = await this.templateFileService.build(filePath, TemplateType.TEMPLATE, frontmatter)
        return this._render(file, contentHtml)
    }

    async renderTemplate(filePath: string, frontmatter: Frontmatter): Promise<string> {
        const file = await this.templateFileService.build(filePath, TemplateType.TEMPLATE, frontmatter)
        return this._render(file)
    }

    async renderPage(filePath: string, frontmatter: Frontmatter): Promise<string> {
        const file = await this.templateFileService.build(filePath, TemplateType.PAGE, frontmatter)
        return this._render(file)
    }

    private injectErrorHtml(html: string, errorHtml: string): string {
        const bodytagClosingPosition = html.lastIndexOf('</body>')
        if (bodytagClosingPosition >= 0) {
            return `${html.substr(0, bodytagClosingPosition)}\n${errorHtml}\n${html.substr(bodytagClosingPosition)}`
        } else {
            return `${html}\n${errorHtml}`
        }
    }

    private async renderError(errorHtml: string): Promise<string> {
        const frontmatter: Frontmatter = FrontmatterService.From({
            global: {
                errorHtml
            }
        })
        const file = await this.templateFileService.from(ErrorBannerTemplate, frontmatter)

        return await this._render(file)
    }

    async renderAnyError(error: Error, html?: string): Promise<string> {
        this.logging.warn('an error page will be rendered')
        const frontmatter: Frontmatter = FrontmatterService.From({
            global: {
                error: {
                    name: error.name,
                    message: error.message,
                    stacktrace: error.stack
                }
            }
        })
        const file = await this.templateFileService.from(AnyErrorTemplate, frontmatter)

        const errorHtml = await this.renderError(
            await this._render(file)
        )

        if (isDefined(html)) {
            return this.injectErrorHtml(html, errorHtml)
        } else {
            return errorHtml
        }
    }

    async renderValidationError(validation: Validation, html: string): Promise<string> {
        this.logging.warn('an error page will be rendered')
        const frontmatter: Frontmatter = FrontmatterService.From({
            global: { validation, clientHtml: html }
        })
        const file = await this.templateFileService.from(ValidationErrorTemplate, frontmatter)

        const errorHtml = await this.renderError(
            await this._render(file)
        )

        return this.injectErrorHtml(html, errorHtml)
    }
}