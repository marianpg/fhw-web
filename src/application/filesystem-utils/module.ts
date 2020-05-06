'use strict'

import { transpileModule, ModuleKind, ScriptTarget } from 'typescript'

import { Logging } from '../logging'
import { FileUtils } from './file'


export enum ModuleExtension {
    JS = 'js',
    TS = 'ts'
}

export type DynamicModule<T> = {
    name: string,
    _exports: {
        [name: string]: T
    },
}

export type ModuleExportsParser<T> = (_exports: Record<string, any>) => Record<string, T>

export class ModuleLoader<T> {

    constructor(
        protected logging: Logging,
        private fileUtils: FileUtils
    ) { }

    async listModules(directory: string, recursively: boolean = true): Promise<Record<ModuleExtension, string[]>> {
        const filenames = await this.fileUtils.listFiles({ directory, recursively })

        const jsModulenames = filenames.filter(filename => filename.includes(ModuleExtension.JS))

        const tsModulenames = filenames.filter(filename => filename.includes(ModuleExtension.TS))

        return {
            [ModuleExtension.JS]: jsModulenames,
            [ModuleExtension.TS]: tsModulenames
        }
    }

    private parseTypescriptModule(filename: string, tsContent: string): string {
        const jsContent = transpileModule(tsContent, {
            fileName: filename,
            compilerOptions: {
                alwaysStrict: true,
                module: ModuleKind.CommonJS,
                target: ScriptTarget.ES2015,
                skipLibCheck: true,
                experimentalDecorators: true
            }
        })
        return jsContent.outputText
    }

    private createModule(filename: string, content: string): Record<string, any> {
        if (filename.includes(ModuleExtension.TS)) {
            content = this.parseTypescriptModule(filename, content)
        }

        // note: it has to be declared as an any-type, so it can be constructed
        // @see https://stackoverflow.com/a/41017777
        const Module: any = module.constructor
        const m = new Module() //note: this expression, in fact, is constructable
        m._compile(content, filename)
        return m.exports
    }

    private async _openModules(
        parseModuleExports: ModuleExportsParser<T>,
        directory: string,
        recursively: boolean = true
    ): Promise<DynamicModule<T>[]> {
        const modulenames = await this.listModules(directory, recursively)
        const allModuleNames = [...modulenames[ModuleExtension.JS], ...modulenames[ModuleExtension.TS]]

        const promisedModules = allModuleNames
            .map(async filename => await this.fileUtils.readFile(filename, directory))

        const modules = (await Promise.all(promisedModules))
            .map((script, index) => {
                const filename = allModuleNames[index]
                const module = this.createModule(filename, script)

                const result: DynamicModule<T> = {
                    name: filename,
                    _exports: parseModuleExports(module)
                }
                return result
            })
        return modules
    }

    async openModules(
        parseModuleExports: ModuleExportsParser<T>,
        directory: string,
        recursively: boolean = true
    ): Promise<DynamicModule<T>[]> {
        const folderExists = await this.fileUtils.exist(directory)
        return folderExists
            ? this._openModules(parseModuleExports, directory, recursively)
            : []
    }
}