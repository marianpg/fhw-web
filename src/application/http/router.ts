'use strict'

import { Config } from '../../public/config'
import { RequestMethod, RequestData } from '../../public/request'
import { DefaultMethod } from '../../public/route'

import {
    Express,
    Router as ExpRouter,
    Request as ExpRequest,
    Response as ExpResponse,
    NextFunction as ExpNextFunction
} from 'express'
import express = require('express') //see https://stackoverflow.com/a/34520891

import { isDefined, jsonStringify } from '../helper'
import { Logging, LoggingService } from '../logging'
import { FileUtils } from '../filesystem-utils'

import { RoutesParser } from './routes-parser'
import { ResponseService } from '../response-service'
import { parseRequest } from './request'
import { Response, checkResponse } from './response'
import { setHeaders } from './headers'
import { SessionService } from './session-service'
import { isException, ExceptionType } from '../exception'
import { Favicon } from '../response-service/favicon'


// TODO: determine first request for a nicer logging and less frequent routes reloading
export class Router {
    private logging: Logging
    private app: Express
    private expRouter: ExpRouter

    constructor(
        private config: Config,
        private logService: LoggingService,
        private fileUtils: FileUtils,
        private responseService: ResponseService
    ) {
        this.logging = logService.create('routing', this.config.routing.logging)
    }

    private logRequest(request: RequestData): void {
        const userAgent = request.headers['user-agent'] || ''
        const isUserAgent = userAgent.includes('fhw-web')
        const wantsFavicon = request.originalUrl.includes('favicon')
        
        if (!isUserAgent && !wantsFavicon) {
            this.logging.data(
                'Incomming Request:',
                request.method,
                request.originalUrl,
                jsonStringify(request.body)
            )
        }
    }

    private logResponse(request: RequestData, response: Response): void {
        const userAgent = request.headers['user-agent'] || ''
        const isUserAgent = userAgent.includes('fhw-web')
        const wantsFavicon = request.originalUrl.includes('favicon')

        if (!isUserAgent && !wantsFavicon) {
            this.logging.data(
                'Sending Response',
                request.originalUrl,
                response.statusCode,
                response.type
            )
        }
    }

    async plugIn(app: Express): Promise<void> {
        this.app = app
        this.app.use(async (req: ExpRequest, res: ExpResponse, next: ExpNextFunction) => {
            const request = parseRequest(req)
            //TODO proper favicon handling
            if (request.originalUrl.endsWith('favicon.ico')) {
                const favicon = Buffer.from(Favicon, 'base64')
                res.writeHead(200, {
                    'Content-Type': 'image/png',
                    'Content-Length': favicon.length
                })
                res.end(favicon)
            } else {
                this.logRequest(request)
                if (this.config.routing.reloadOnEveryRequest) {
                    await this.setup()
                }
                this.expRouter(req, res, next)
            }
        })
        await this.setup()
    }


    private async setup(): Promise<void> {
        this.expRouter = express.Router({ caseSensitive: true })
        const routesParser = new RoutesParser(this.config.routing, this.logging, this.fileUtils)
        const routes = await routesParser.parseRoutesDefinitionFile()

        routes.forEach(async route => {
            const methods: RequestMethod[] = (route as any).method || [DefaultMethod]
            methods.forEach(async method => {
                this.expRouter[method](route.url, async (req: ExpRequest, res: ExpResponse, next: ExpNextFunction) => {
                    let response: Response
                    const request = parseRequest(req)
                    try {
                        const sessionService = new SessionService(
                            this.config.sessions,
                            this.logService.create('sessions', this.config.sessions.logging),
                            this.fileUtils, req, res
                        )
                        response = await this.responseService.serve(route, request, sessionService)
                        checkResponse(response)
                        this.sendResponse(request, response, res)
                    } catch (error) {
                        if (isException(error)) {
                            if (error.getType() === ExceptionType.ROUTE) {
                                next()
                            }
                        } else {
                            response = {
                                type: 'text/html',
                                statusCode: 500,
                                html: await this.responseService.serveErrorPage(error)
                            }
                            this.sendResponse(request, response, res)
                        }
                    }
                })
            })
        })
    }

	/**
	 * @important must not throw any error
	 * 
	 * @param response FHW-Web-Response Object
	 * @param res Express-Response Object
	 */
    private sendResponse(request: RequestData, response: Response, res: ExpResponse): void {
        if (isDefined(response.headers)) {
            setHeaders(res, response.headers)
        }
        res.status(response.statusCode)

        this.logResponse(request, response)

        switch (response.type) {
            case 'empty':
                res.sendStatus(response.statusCode)
                break
            case 'text/plain':
                res.send(response.text)
                break
            case 'static':
                res.sendFile(response.pathToFile)
                break
            case 'text/html':
                res.send(response.html)
                break
            case 'application/json':
                res.json(response.body)
                break
            case 'redirect':
                res.redirect(response.redirectLocation)
                break
        }
    }
}