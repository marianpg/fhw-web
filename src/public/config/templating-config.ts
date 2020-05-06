'use strict'

import { FrontmatterType } from '../frontmatter'


export interface TemplatingConfig {
    validation: boolean
    paths: {
        pages: string
        templates: string
        helpers: string
        controller: string
    }
    allowedExtensions: string[]
    frontmatterFormat: FrontmatterType
    helpers: { 
        reloadOnEveryRequest: boolean
    }
    logging: boolean
}