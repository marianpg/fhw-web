'use strict'

import { FrontmatterType } from '../frontmatter'


export interface GlobalDataConfig {
    active: boolean
    reloadOnEveryRequest: boolean
    pathToFile: string
    format: FrontmatterType
    logging: boolean
}

export interface FileDataConfig {
    active: boolean
    reloadOnEveryRequest: boolean
    path: string
    format: FrontmatterType
    logging: boolean
}

export interface SqlDataConfig {
    active: boolean
    reloadOnEveryRequest: boolean
    pathToFile: string
    logging: boolean
}

export interface DatabaseConfig {
    globalData: GlobalDataConfig
    fileData: FileDataConfig
    sqliteData: SqlDataConfig
}