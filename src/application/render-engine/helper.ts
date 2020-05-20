'use strict'

import { TemplatingConfig } from '../../public/config'
import { Helper } from '../../public/helper'

import Handlebars = require('handlebars') //see https://stackoverflow.com/a/34520891
import { CollisionCheck, isFunction } from '../helper'

import { Logging } from '../logging'
import { FileUtils, ModuleLoader, ModuleExportsParser } from '../filesystem-utils'


export class HelpersRegistration {
    private moduleLoader: ModuleLoader<Helper>

    constructor(
        private config: TemplatingConfig,
        private logging: Logging,
        private fileUtils: FileUtils
    ) {
        this.moduleLoader = this.fileUtils.createModuleLoader()
    }

    registerGlobalHelpers(hbs: typeof Handlebars): void {
        hbs.registerHelper('debugJson', (context) => {
            const pageData = context.data.root
            const toReturn = `<pre>${JSON.stringify(pageData, null, 4)}</pre>`
            return new hbs.SafeString(toReturn)
        })
    }

    private parseCustomHelpers(_exports: Record<string, any>): Record<string, Helper> {
        Object.keys(_exports).forEach(name => {
            if (!isFunction(_exports[name])) {
                throw new Error(`Helper Function "${name}" is not a correctly declared function. Please read the docs.`)
            }
        })
        return _exports
    }

    async registerCustomHelpers(hbs: typeof Handlebars): Promise<void> {
        const helpers = await this.moduleLoader.openModules(this.parseCustomHelpers, this.config.paths.helpers)
        const collissionCheck = new CollisionCheck<string>()
        helpers.forEach(module => {
            const { name: fileName, _exports } = module
            Object.keys(_exports).forEach((functionsName) => {
                const _function = _exports[functionsName]
                if (!collissionCheck.verify(functionsName)) {
                    throw new Error(`Die Helper-Funktion "${functionsName}" im Controller ${fileName} wurde bereits in einem anderen Controller definiert.`)
                }

                hbs.registerHelper(functionsName, (...args: any[]) => {
                    args.pop() //last argument contains an options object, we do not need it here
                    return _function(...args)
                })
            })
        })
    }
} 