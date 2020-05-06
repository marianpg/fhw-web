'use strict'

import { GlobalData } from './global'
import { RequestData } from './request'
import { SessionData } from './session'


export type PageData = Record<string, any>

export enum FrontmatterType {
    JSON = 'json',
    YAML = 'yaml'
}

export interface Frontmatter {
    global: GlobalData
    page: PageData
    request: RequestData
    session: SessionData
}