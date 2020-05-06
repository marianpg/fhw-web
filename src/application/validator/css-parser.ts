'use strict'

import { FileUtils } from '../filesystem-utils'

import { isDefined } from '../helper'

import { Regex } from './regex'
import { ReferencedCss } from './types'
import { Request } from '../request'


export class CssParser {

    constructor(
        private fileUtils: FileUtils,
        private request: Request
    ) { }

    async fetchFromImportRule(path: string, css: string): Promise<ReferencedCss[]> {
        let matches = Array.from(css.matchAll(Regex.IMPORTED_CSS))

        const parseRegex = async (regexMatch: RegExpMatchArray): Promise<ReferencedCss> => {
            const [match, stylesheetName, mediaQuery] = regexMatch
            const { path: _path } = this.fileUtils.parsePath(path)
            const stylesheetPath = isDefined(path) ? this.fileUtils.join(_path, stylesheetName) : stylesheetName
            const stylesheet = await this.request.getStylesheet(stylesheetPath)
            const source = path.length > 0 ? path : 'inline style'

            return {
                name: stylesheetName,
                source: `imported via "${match} from stylesheet located in ${source}"`,
                media: mediaQuery,
                content: stylesheet
            }
        }
        const fetchingCss = matches.map(parseRegex)
        const fetchedCss = await Promise.all(fetchingCss)

        return fetchedCss
    }

    async fetchInlineStyles(html: string): Promise<ReferencedCss[]> {
        let matches = Array.from(html.matchAll(Regex.INLINE_CSS))

        const parseRegex = async (regexMatch: RegExpMatchArray): Promise<ReferencedCss[]> => {
            const [_, stylesheet] = regexMatch
            const inlineCss = {
                name: 'inline',
                source: 'declared in html content',
                media: null,
                content: stylesheet
            }
            const importedCss = await this.fetchFromImportRule('', stylesheet)
            return [inlineCss, ...importedCss]
        }

        const fetchingCss = matches.map(parseRegex)
        const fetchedCss = await Promise.all(fetchingCss)

        return [].concat(...fetchedCss)
    }

    async fetchLinkedStyles(html: string): Promise<ReferencedCss[]> {
        let matches = Array.from(html.matchAll(Regex.LINKED_CSS))

        const parseRegex = async (regexMatch: RegExpMatchArray): Promise<ReferencedCss[]> => {
            const [match, stylesheetPath] = regexMatch
            const stylesheet = await this.request.getStylesheet(stylesheetPath)
            const linkedCss: ReferencedCss = {
                name: stylesheetPath,
                source: 'linked in html content',
                media: null,
                content: stylesheet
            }
            const importedCss = await this.fetchFromImportRule(stylesheetPath, stylesheet)

            return [linkedCss, ...importedCss]
        }
        const fetchingCss = matches.map(parseRegex)
        const fetchedCss = await Promise.all(fetchingCss)

        return [].concat(...fetchedCss)
    }

    removeStyles(html: string): string {
        const commentOut = (html) => `<!--${html}-->`
        let htmlWithoutStyles = html.replace(Regex.INLINE_CSS, commentOut)
        htmlWithoutStyles = htmlWithoutStyles.replace(Regex.LINKED_CSS, commentOut)

        return htmlWithoutStyles
    }
}