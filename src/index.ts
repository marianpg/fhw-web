'use strict'

import { Config } from './public/config'

import { parseConfig } from './application/config'
import { LoggingService, Logging } from './application/logging'
import { Application } from './application'
import { FileUtils } from './application/filesystem-utils'

export interface BuzzyInterface {
    start(): Promise<void>
    stop(): Promise<void>
}

// TODO express.Router({ caseSensitive: true })
// TODO CodeStyle (Spaces instead of Tabs)
class Buzzy implements BuzzyInterface {

    private logging: Logging
    private config: Config
    private app: Application

    constructor(
        config?: RecursivePartial<Config>
    ) {
        this.config = parseConfig(config)
        const shouldLog = this.config.server.logging

        const logService = new LoggingService(this.config.loggingActive)
        this.logging = logService.create('server', shouldLog)

        const fileUtils = new FileUtils(
            logService.create('filesystem', shouldLog),
            this.config.rootPath
        )
        this.app = new Application(this.config, logService, fileUtils)
    }

    async start(): Promise<void> {
        try {
            await this.app.start()
            this.logging.info('Application started successfully')
        } catch (err) {
            this.logging.error('Application start failed', err)
        }
    }

    async stop(): Promise<void> {
        try {
            await this.app.stop()
            this.logging.info('Application stopped successfully')
        } catch (err) {
            this.logging.error('Application stop failed', err)
        }
    }
}

export default Buzzy
module.exports = Buzzy
module.exports.default = Buzzy

export {
    Config,
    DefaultConfig,

    Controller,
    ControllerFunction,
    EmptyResult,
    TextResult,
    JsonResult,
    RedirectResult,
    PageResult,
    FragmentResult,

    Helper,

    Route,
    DefaultMethod
} from './public'


// TODO: fileExtension: 'ts'
// TODO: angelegte, aber leere global.json wirft unleserlichen Fehler
// TODO: Fehlermeldungen ausschaltbar, aber mit Möglichkeit diese in Datei zu schreiben.
/* TODO: was passiert, wenn der Nutzer in einer Controller-Datei erwartet, dass ein saveJson sofort ausgeführt wird?
Beispiel:
const data = db.loadJson()
// change data
db.saveJson()
// change data
const originalData = db.loadJson()
// --> compare changeData and originalData
*/