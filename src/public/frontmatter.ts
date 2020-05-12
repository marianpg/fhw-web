'use strict'

import { GlobalData } from './global'
import { RequestData } from './request'
import { SessionData } from './session'


export type PageData = Record<string, any>

export enum FrontmatterTypes {
    JSON = 'json',
    YAML = 'yaml'
}

export type FrontmatterType = 'json' | 'yaml'

export interface Frontmatter {
    global: GlobalData
    page: PageData
    request: RequestData
    session: SessionData
}