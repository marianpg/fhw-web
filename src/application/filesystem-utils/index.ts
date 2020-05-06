'use strict'


import { Logging } from '../logging'
import { FileUtils as _FileUtils } from './file'
import { ModuleLoader } from './module'

export { DynamicModule, ModuleLoader, ModuleExportsParser } from './module'


export class FileUtils extends _FileUtils {

    constructor(
        logging: Logging,
        basePath?: string
    ) {
        super(logging, basePath)
    }

    createModuleLoader<T>(): ModuleLoader<T> {
        return new ModuleLoader<T>(this.logging, this)
    }
}