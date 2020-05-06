'use strict'

import { FileUtils } from '../filesystem-utils'
import { TemplatingConfig } from '../../public/config'
import { RouteException } from '../exception'
import { Frontmatter, PageData, FrontmatterType } from '../../public/frontmatter'
import { DatabaseService } from '../database'
import { FrontmatterService } from './frontmatter-service'
import { isDefined } from '../helper'

export enum TemplateType {
    PAGE,
    TEMPLATE
}


export class TemplateFileService {

    constructor(
        private config: TemplatingConfig,
        private fileUtils: FileUtils,
        private databaseService: DatabaseService
    ) { }


    private async findExtension(path: string): Promise<string> {
        const acceptedExtensions = await Promise.all(this.config.allowedExtensions.map(
            async (ext) => {
                return await this.fileUtils.exist(`${path}.${ext}`)
            }
        ))
        if (acceptedExtensions.indexOf(true) === -1) {
            throw new Error(`Can not find file on filesystem with any of the valid file extensions(${this.config.allowedExtensions}): ${path}`)
        }
        const extension = this.config.allowedExtensions[acceptedExtensions.indexOf(true)]

        return extension
    }

    private async readFile(filepath: string): Promise<string> {
        let path = this.fileUtils.fullPath(filepath)
        path = await this.fileUtils.isDirectory(path)
            ? this.fileUtils.join(path, 'index')
            : path

        path = this.fileUtils.hasExtension(path)
            ? path
            : `${path}.${await this.findExtension(path)}`

        if (!await this.fileUtils.fileExist(path)) {
            throw RouteException.NotFound(`Can not find requested file: ${path}`)
        }
        const file = await this.fileUtils.readFile(path)

        return file
    }

    async build(filepath: string, type: TemplateType, parentFrontmatter: Frontmatter): Promise<TemplateFile> {
        switch (type) {
            case TemplateType.PAGE:
                filepath = this.fileUtils.join(this.config.paths.pages, filepath)
                break
            case TemplateType.TEMPLATE:
                filepath = this.fileUtils.join(this.config.paths.templates, filepath)
                break
        }
        const file = await this.readFile(filepath)
        const templateFile = (new TemplateFile(filepath, this.databaseService, file)).build(parentFrontmatter)

        return templateFile
    }

    async from(fileContent: string, parentFrontmatter: Frontmatter): Promise<TemplateFile> {
        const templateFile = await (new TemplateFile('from memory', this.databaseService, fileContent)).build(parentFrontmatter)
        return templateFile
    }
}

export class TemplateFile {

    private parentFrontmatter: Frontmatter
    private frontmatter: Frontmatter
    private markup: string

    constructor(
        private name: string,
        private databaseService: DatabaseService,
        private file: string
    ) { }

    private validateFrontmatterType(fmatterType: FrontmatterType): void {
        // TODO validate fmatterType
    }

    private async transformFrontmatter(fmatter: Frontmatter, parent: Frontmatter): Promise<Frontmatter> {
        const fmatterMerged = FrontmatterService.Merge(parent, fmatter)
        const params = {
            ...fmatterMerged.global,
            ...fmatterMerged.session,
            ...fmatterMerged.page,
            ...fmatterMerged.request
        }
        
        return await this.databaseService.parseAndExecuteSql(fmatter, params) as Frontmatter
    }


    async build(parentFrontmatter: Frontmatter): Promise<TemplateFile> {
        // TODO check this.file != null
        this.parentFrontmatter = parentFrontmatter

        const fmatterRegex = /(?:---)([\s\S]*?)(?:---)/g
        let matching = fmatterRegex.exec(this.file)

        if (matching) { // frontmatter there
            const [ _, rawFmatter ] = matching
            const [fmatter, fmatterType] = FrontmatterService.FromRawString(rawFmatter.trim())
            this.validateFrontmatterType(fmatterType)
            this.frontmatter = await this.transformFrontmatter(fmatter, parentFrontmatter)
            const markupRegex = /(?:---[\s\S]*?---)([\s\S]*)/g
            matching = markupRegex.exec(this.file)
            if (matching) {
                const [ _, rawMarkup ] = matching
                this.markup = rawMarkup.trim()
            } else {
                this.markup = ''
            }
        } else { // no frontmatter
            this.markup = this.file.trim()
        }
        
        return this
    }

    getFrontmatter(): Frontmatter {
        return FrontmatterService.Merge(this.parentFrontmatter, this.frontmatter)
    }

    getMarkup(): string {
        return this.markup
    }

    getName(): string {
        return this.name
    }
}