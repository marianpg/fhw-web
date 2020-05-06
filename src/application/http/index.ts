'use strict'

import { Config } from '../../public/config'

import { Express } from 'express'
import express = require('express') //see https://stackoverflow.com/a/34520891
import { Server as HttpServer } from 'http'
import cookieParser = require('cookie-parser') //and again...

import { isDefined } from '../helper'
import { Logging, LoggingService } from '../logging'
import { FileUtils } from '../filesystem-utils'

import { Router } from './router'
import { ResponseService } from '../response-service'

export { parseRequest } from './request'
export { Response, ResponseEmpty, ResponseHtml, ResponseJson, ResponseRedirect, ResponseStatic, ResponseText } from './response'
export { parseMethod } from './method'
export { SessionService } from './session-service'


export class Server {
    private logging: Logging
    private app: Express
    private httpServer: HttpServer

    constructor(
        private config: Config,
        private logService: LoggingService,
        private fileUtils: FileUtils,
        private responseService: ResponseService
    ) {
        this.logging = this.logService.create('server', this.config.server.logging)
    }

    async build(): Promise<void> {
        this.app = express()
        this.app.use(express.urlencoded({ extended: true }))
        this.app.use(express.json())
        this.app.use(cookieParser())

        const router = new Router(
            this.config,
            this.logService,
            this.fileUtils,
            this.responseService)
        await router.plugIn(this.app)
    }

    async start(): Promise<void> {
        this.httpServer = this.app.listen(this.config.server.port, () => {
            this.logging.info(`Server is listening on port ${this.config.server.port}`)
        })
    }

    async close(): Promise<void> {

    }

    get listening(): boolean {
        return isDefined(this.httpServer) && this.httpServer.listening
    }
}