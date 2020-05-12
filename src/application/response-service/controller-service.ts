'use strict'

import { RoutingConfig, TemplatingConfig } from '../../public/config'
import { ControllerRoute } from '../../public/route'
import { ControllerFunction, ControllerResult, TextResult, JsonResult, RedirectResult, PageResult, FragmentResult } from '../../public/controller'
import { GlobalData } from '../../public/global'
import { RequestData } from '../../public/request'
import { Session } from '../../public/session'
import { Database } from '../../public/database'

import { isDefined, isFunction, isAsyncFunction } from '../helper'

import { Logging } from '../logging'
import { FileUtils, ModuleLoader, DynamicModule } from '../filesystem-utils'



export const isTextResult = (result: ControllerResult): result is TextResult => {
    return isDefined((result as TextResult).text)
}
export const isJsonResult = (result: ControllerResult): result is JsonResult => {
    return isDefined((result as JsonResult).json)
}
export const isRedirectResult = (result: ControllerResult): result is RedirectResult => {
    return isDefined((result as RedirectResult).redirect)
}
export const isPageResult = (result: ControllerResult): result is PageResult => {
    return isDefined((result as PageResult).page)
}
export const isFragmentResult = (result: ControllerResult): result is FragmentResult => {
    return isDefined((result as FragmentResult).fragment)
}

export const parseControllerFunction = (_exports: Record<string, any>): Record<string, ControllerFunction> => {
    Object.keys(_exports).forEach(name => {
        if (!isFunction(_exports[name]) && !isAsyncFunction(_exports[name])) {
            throw new Error(`Controller Function "${name}" is not a correctly declared function. Please read the docs.`)
        }
    })

    return _exports
}

export class ControllerService {

    private moduleLoader: ModuleLoader<ControllerFunction>
    private allController: DynamicModule<ControllerFunction>[]

    constructor(
        private config: TemplatingConfig,
        private logging: Logging,
        private fileUtils: FileUtils
    ) {
        this.moduleLoader = this.fileUtils.createModuleLoader()
    }

    async build(): Promise<ControllerService> {
        this.allController = await this.moduleLoader.openModules(parseControllerFunction, this.config.paths.controller)
        return this
    }

    async callController(
        route: ControllerRoute,
        globalData: GlobalData,
        request: RequestData,
        session: Session,
        database: Database
    ): Promise<ControllerResult> {
        const controller = this.allController.find(({ name }) => {
            return this.fileUtils.parseFilename(name) === route.controller.file
        })
        if (!isDefined(controller)) {
            throw new Error(`Can not find Controller File "${route.controller.file}"`)
        }

        const _function = controller._exports[route.controller.function]
        if (!isDefined(_function)) {
            throw new Error(`Can not call function "${route.controller.function}" in Controller File "${route.controller.file}". Did you forget to export or to define the function?`)
        }

        const dataArgument = {
            request,
            session: session.getData(),
            global: globalData
        }

        return _function(dataArgument, database, session)
    }
}