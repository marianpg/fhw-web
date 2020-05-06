'use strict'

import { RequestData } from '../../public/request'
import { DefaultMethod } from '../../public/route'
import { Frontmatter, PageData, FrontmatterType } from '../../public/frontmatter'
import { GlobalData } from '../../public/global'
import { SessionData } from '../../public/session'

import { isDefined, parseJson, parseYaml } from '../helper'



// TODO: json or yaml frontmatter
// TODO: allow sql statements and fetch and execute them


interface MaybeFrontmatter {
    global?: GlobalData
    page?: PageData
    request?: RequestData
    session?: SessionData
}

export class FrontmatterService {

    static CreateEmpty(): Frontmatter {
        return {
            global: {},
            page: {},
            request: {
                query: {}, body: {}, params: {},
                method: DefaultMethod, path: '',
                originalUrl: '', ip: '', headers: {}
            },
            session: { id: '' }
        }
    }

    static Merge(parent: Frontmatter, page: PageData): Frontmatter {
        return {
            global: parent.global,
            page: { ...parent.page, ...page },
            request: { ...parent.request },
            session: { ...parent.session },
        }
    }

    static From(fm: MaybeFrontmatter): Frontmatter {
        const empty = FrontmatterService.CreateEmpty()
        const request: RequestData = isDefined(fm.request)
            ? {
                query: fm.request.query || empty.request.query,
                body: fm.request.body || empty.request.body,
                params: fm.request.params || empty.request.params,
                method: fm.request.method || empty.request.method,
                path: fm.request.path || empty.request.path,
                originalUrl: fm.request.originalUrl || empty.request.originalUrl,
                ip: fm.request.ip || empty.request.ip,
                headers: fm.request.headers || empty.request.headers
            }
            : empty.request

        return {
            global: fm.global || empty.global,
            page: fm.page || empty.page,
            request: request,
            session: fm.session || empty.session
        }
    }

    //  TODO result type and actual value are not matching everytime
    static FromRawString(raw: string): [Frontmatter, FrontmatterType] {
        let error = null

        try {
            const asJson = parseJson(raw)
            return [asJson, FrontmatterType.JSON]
        } catch (err) {
            error = err
        }

        try {
            const asYaml = parseYaml(raw)
            return [asYaml, FrontmatterType.YAML]
        } catch (_) { }

        // TODO: determine whenever json or yaml is requested and print the corresponding error output, if present
        // TODO: provide a link to a json or yaml online parser with beautiful error recognition
        throw new Error(`Invalid Frontmatter-Format: ${error}`)
    }
}