'use strict'


import { Language } from './languages'
import { LoggingType } from './logging-types'
import { ServerConfig } from './server-config'
import { RoutingConfig } from './routing-config'
import { TemplatingConfig } from './templating-config'
import { SessionsConfig } from './sessions-config'
import { DatabaseConfig } from './database-config'


export { DefaultConfig } from './default-config'
export { Language, Languages } from './languages'
export { LoggingType, LoggingTypes } from './logging-types'
export { ServerConfig } from './server-config'
export { RoutingConfig,
    RoutingFileExtension, RoutingFileExtensions } from './routing-config'
export { TemplatingConfig } from './templating-config'
export { SessionsConfig } from './sessions-config'
export { DatabaseConfig } from './database-config'


export interface Config {
	rootPath: string
	language: Language
	loggingActive: LoggingType[]
	server: ServerConfig
	routing: RoutingConfig
	templating: TemplatingConfig
	sessions: SessionsConfig
	database: DatabaseConfig
}

