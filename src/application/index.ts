'use strict'

import { Config } from '../public/config'

import { LoggingService, Logging } from './logging'
import { FileUtils } from './filesystem-utils'

import { Server } from './http'

import { Request } from './request'
import { ResponseService } from './response-service'
import { RenderEngine } from './render-engine'
import { Validator } from './validator'
import { DatabaseService } from './database'



export class Application {
    private server: Server

    constructor(
        private config: Config,
        private logService: LoggingService,
        private fileUtils: FileUtils
    ) { }

    private async buildServer(): Promise<void> {
        const databaseService = await new DatabaseService(
            this.config.database,
            this.logService,
            this.fileUtils
        ).build()

        const renderEngine = await new RenderEngine(
            this.config.templating,
            this.logService.create('templating', this.config.templating.logging),
            this.fileUtils,
            databaseService
        ).build()

        const request = new Request(
            this.config.server,
            this.logService.create('server', this.config.server.logging)
        )

        const validator = new Validator(
            this.config.templating,
            this.logService.create('validation', this.config.templating.logging),
            this.fileUtils,
            request
        )
        const responseService = await new ResponseService(
            this.config,
            this.logService.create('routing', this.config.routing.logging),
            this.fileUtils,
            renderEngine, validator, databaseService
        ).build()

        this.server = new Server(
            this.config,
            this.logService,
            this.fileUtils,
            responseService
        )

        await this.server.build()
    }

    private async startServer(): Promise<void> {
        await this.server.start()
    }

    async start(): Promise<void> {
        await this.buildServer()
        await this.startServer()
    }

    async stop(): Promise<void> {
        if (this.server && this.server.listening) {
            await this.server.close()
        }
    }
}