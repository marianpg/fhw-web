'use strict'

import { TemplatingConfig } from '../../public/config'
import { Logging } from '../logging'
import { FileUtils } from '../filesystem-utils'

import { Request } from '../request'
import { CssParser } from './css-parser'
import { Regex } from './regex'
import { ReferencedCss, Validation } from './types'
import { TransformValidation } from './transform-validation'
import { isDefined } from '../helper'


export { Validation, NuValidation, ValidationResult } from './types'

//TODO address the original line number in source file
export class Validator {
    private cssParser: CssParser
    private transformer: TransformValidation

    constructor(
        private config: TemplatingConfig,
        private logging: Logging,
        private fileUtils: FileUtils,
        private request: Request
    ) {
        this.cssParser = new CssParser(this.fileUtils, this.request)
        this.transformer = new TransformValidation()
    }

    private addInlineStyles(html: string, styles: ReferencedCss[]): string {
        const hint = 'For the validation all linked or imported css have been commented out and have been injected in the html by the framework automatically. Your stylesheets declarations have been commented out.'
        const css = styles.map(refCss => {
            const comment = `/* file: "${refCss.name}" source: "${refCss.source}" */`
            const stylesheet = refCss.content.split('\n').map(line => `\t${line}`).join('\n')
            return `<style> ${comment}\n${stylesheet}\n</style>`
        }).join('\n')

        const replace = `\n<!-- START INJECTION: ${hint} -->\n${css}\n<!-- END INJECTION -->$&`
        const htmlWithStyles = html.replace(Regex.CLOSING_HEAD_TAG, replace)

        return htmlWithStyles
    }

    private async injectLinkedCss(html): Promise<string> {
        const inlineCss = await this.cssParser.fetchInlineStyles(html)
        const linkedCss = await this.cssParser.fetchLinkedStyles(html)
        const allStyles = [...inlineCss, ...linkedCss]

        const htmlWithoutStyles = this.cssParser.removeStyles(html)
        const htmlWithAllStylesInline = this.addInlineStyles(htmlWithoutStyles, allStyles)

        return htmlWithAllStylesInline
    }

    private async _validate(html: string): Promise<Validation> {
        const htmlWithAllStylesInline = await this.injectLinkedCss(html)

        try {
            const validation = await this.request.sendNuChecker(htmlWithAllStylesInline)
            return this.transformer.transform(validation, htmlWithAllStylesInline)
        } catch (error) {
            this.logging.error('Validation-Request failed', error)
        }
    }

    async validate(html: string): Promise<Validation> {
        return this.config.validation && isDefined(html) && (typeof html === 'string')
            ? await this._validate(html)
            : { results: [], html }
    }
}