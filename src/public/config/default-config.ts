'use strict'

import { Config } from '.'
import { Languages } from './languages'
import { FrontmatterTypes } from '../frontmatter'
import { LoggingTypes } from './logging-types'
import { RoutingFileExtensions } from './routing-config'


export const DefaultConfig: Config = {
    rootPath: process.cwd(),
    language: Languages.DE,
    loggingActive: [LoggingTypes.INFO, LoggingTypes.DATA, LoggingTypes.WARN, LoggingTypes.ERROR],
    server: {
        host: 'localhost',
        port: 8080,
        logging: true
    },
    routing: {
        magic: false,
        fileName: 'routes',
        fileExtension: RoutingFileExtensions.JSON,
        reloadOnEveryRequest: true,
        logging: true
    },
    templating: {
        validation: true,
        paths: {
            pages: 'pages',
            templates: 'templates',
            helpers: 'helpers',
            controller: 'controller'
        },
        allowedExtensions: ['html', 'hbs'],
        frontmatterFormat: FrontmatterTypes.JSON,
        helpers: {
            reloadOnEveryRequest: true,
        },
        logging: true
    },
    sessions: {
        active: false,
        path: 'sessions',
        logging: true
    },
    database: {
        globalData: {
            active: true,
            reloadOnEveryRequest: true,
            pathToFile: './global.json',
            format: FrontmatterTypes.JSON,
            logging: true
        },
        fileData: {
            active: false,
            reloadOnEveryRequest: true,
            path: './data',
            format: FrontmatterTypes.JSON,
            logging: true
        },
        sqliteData: {
            active: false,
            reloadOnEveryRequest: true,
            pathToFile: './data/sqlite.db',
            logging: true
        }
    }
}