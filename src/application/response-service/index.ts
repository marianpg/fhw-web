'use strict'

import { Config } from '../../public/config'
import {
    Route,
    StaticRoute,
    PageRoute,
    ControllerRoute
} from '../../public/route'
import { ControllerResult } from '../../public/controller'
import { GlobalData } from '../../public/global'
import { RequestData } from '../../public/request'
import { Session, SessionData } from '../../public/session'
import { Database } from '../../public/database'

import { Logging } from '../logging'
import { FileUtils } from '../filesystem-utils'

import { DatabaseService } from '../database'
import { RenderEngine } from '../render-engine'
import { Validator } from '../validator'
import {
    isStaticRoute,
    isPageRoute,
    isControllerRoute,
    determineFilepath
} from '../route'
import {
    Response,
    ResponseStatic,
    ResponseHtml
} from '../http'
import { HtmlService } from './html-service'
import {
    ControllerService,
    isTextResult,
    isJsonResult,
    isRedirectResult,
    isPageResult,
    isFragmentResult
} from './controller-service'
import { isPromise } from '../helper'
import { SessionService } from '../http'
import { RouteException } from '../exception'
import { FrontmatterService } from '../render-engine/frontmatter-service'
import { Frontmatter } from '../../public/frontmatter'


export class ResponseService {
    private htmlService: HtmlService
    private controllerService: ControllerService

    constructor(
        private config: Config,
        private logging: Logging,
        private fileUtils: FileUtils,
        private renderEngine: RenderEngine,
        private validator: Validator,
        private databaseService: DatabaseService
    ) {
        this.htmlService = new HtmlService(this.config.routing, this.logging, this.fileUtils, this.renderEngine, this.validator)
        this.controllerService = new ControllerService(this.config.templating, this.logging, this.fileUtils)
    }

    async build(): Promise<ResponseService> {
        this.controllerService = await this.controllerService.build()

        return this
    }

    async serve(route: Route, request: RequestData, sessionService: SessionService): Promise<Response> {
        let response: Response
        if (isStaticRoute(route)) {
            response = await this.serveStatic(route, request)
        } else {
            const globalData: GlobalData = await this.databaseService.getGlobalData()
            const session: Session = await sessionService.getSession(request.originalUrl)

            if (isPageRoute(route)) {
                const frontmatter = FrontmatterService.From({
                    request,
                    global: globalData,
                    session: session.getData()
                })
                response = await this.servePage(route, frontmatter)
            } else if (isControllerRoute(route)) {
                response = await this.serveController(route, globalData, request, session)
            } else {
                // TODO: double check when this happens
                response = { type: 'empty', statusCode: 200 }
            }
            await sessionService.closeSession()
            await this.databaseService.save()
        }

        return response
    }

    async serveErrorPage(error: Error): Promise<string> {
        const html = await this.renderEngine.renderAnyError(error)
        return html
    }

    async serveStatic(route: StaticRoute, request: RequestData): Promise<ResponseStatic> {
        const relativePath = determineFilepath(route.static, request.params)
        const fullPath = this.fileUtils.fullPath(relativePath)
        if (!await this.fileUtils.fileExist(fullPath)) {
            throw RouteException.NotFound(`The searched path is not a file or does not exist on filesystem: "${fullPath}"`)
        }

        return { type: 'static', statusCode: 200, pathToFile: fullPath }
    }

    async servePage(ressource: string | PageRoute, frontmatter: Frontmatter): Promise<ResponseHtml> {
        const pageHtml = await this.htmlService.parsePage(ressource, frontmatter)
        const [valid, html] = await this.htmlService.validate(pageHtml)
        if (valid) {
            return { statusCode: 200, type: 'text/html', html }
        } else {
            return { statusCode: 500, type: 'text/html', html }
        }
    }

    async serveFragment(ressource: string | PageRoute, frontmatter: Frontmatter): Promise<ResponseHtml> {
        const templateHtml = await this.htmlService.parseTemplate(ressource, frontmatter)
        return { statusCode: 200, type: 'text/html', html: templateHtml }
    }

    private async processControllerResult(result: ControllerResult, globalData: GlobalData, request: RequestData, session: SessionData): Promise<Response> {
        if (isTextResult(result)) {
            return { statusCode: result.status, type: 'text/plain', text: result.text }
        } else if (isJsonResult(result)) {
            return { statusCode: result.status, type: 'application/json', body: result.json }
        } else if (isRedirectResult(result)) {
            return { statusCode: result.status, type: 'redirect', redirectLocation: result.redirect }
        } else if (isPageResult(result)) {
            const frontmatter = FrontmatterService.From({
                request,
                session,
                global: globalData,
                page: result.frontmatter
            })
            return this.servePage(result.page, frontmatter)
        } else if (isFragmentResult(result)) {
            const frontmatter = FrontmatterService.From({
                request,
                session,
                global: globalData,
                page: result.frontmatter
            })
            return this.serveFragment(result.fragment, frontmatter)
        } else if (isPromise(result)) {
            try {
                const promiseResult = await Promise.resolve(result)
                return this.processControllerResult(promiseResult, globalData, request, session)
            } catch (err) {
                throw new Error(`One of your controller rejected a promise: ${err})`)
            }
        }

        // TODO: double check when this happens
        // - case 1: when a returned chained promise does not get called
        return { type: 'empty', statusCode: 200 }
    }

    async serveController(route: ControllerRoute, globalData: GlobalData, request: RequestData, session: Session): Promise<Response> {
        if (this.config.routing.reloadOnEveryRequest) {
            this.controllerService = await this.controllerService.build()
        }

        const frontmatter = FrontmatterService.From({
            global: globalData,
            request
        })
        const database: Database = await this.databaseService.getDatabase(frontmatter)
        
        try {
            const result = await this.controllerService.callController(route, global, request, session, database)
            const response = this.processControllerResult(result, globalData, request, session.getData())
            return response
        } catch (err) {
            throw new Error(`Your controller (function "${route.controller.function}" in file "${route.controller.file}") threw the following error: ${err}`)
        }
    }
}