'use strict'

import { WriteFileOptions } from 'fs'
import path = require('path') //see https://stackoverflow.com/a/34520891
import fs = require('fs') //and again..

const fsp = fs.promises
import { isDefined } from '../helper'
import { Logging } from '../logging'


export { WriteFileOptions } from 'fs'


//TODO better file-type organization.
export class FileUtils {

    constructor(
        protected logging: Logging,
        private basePath: string
    ) {
        const processPath = process.cwd()
        if (!basePath.includes(processPath)) {
            this.basePath = path.join(processPath, basePath)
        }
    }

    projectPath(): string {
        return this.basePath
    }

    parseFilename(aPath: string): string {
        return path.parse(aPath).name
    }

    fullPath(filename: string, relativePath?: string): string {
        if (filename.includes(this.basePath)) {
            return relativePath
                ? path.join(relativePath, filename)
                : filename
        } else {
            return relativePath
                ? path.join(this.basePath, relativePath, filename)
                : path.join(this.basePath, filename)
        }
    }

    join(...subpaths: string[]): string {
        return path.join(...subpaths)
    }

    async exist(filename: string, relativePath?: string): Promise<boolean> {
        try {
            await fsp.stat(this.fullPath(filename, relativePath))
            return true
        } catch (err) {
            return false
        }
    }

    async fileExist(filename: string, relativePath?: string): Promise<boolean> {
        try {
            const pathToFile = this.fullPath(filename, relativePath)
            const stats = await fsp.stat(pathToFile)
            return stats.isFile()
        } catch (_e) {
            return false
        }
    }

    async isDirectory(filename: string, relativePath?: string): Promise<boolean> {
        try {
            const pathToFile = this.fullPath(filename, relativePath)
            const stats = await fsp.stat(pathToFile)
            return stats.isDirectory()
        } catch (_e) {
            return false
        }
    }

    async mkdir(directory: string, relativePath?: string): Promise<boolean> {
        try {
            await fsp.mkdir(this.fullPath(directory, relativePath))
            return true
        } catch (err) {
            return false
        }
    }

    async readBuffer(filename: string, relativePath?: string): Promise<Buffer> {
        const fullPath = this.fullPath(filename, relativePath)
        try {
            const content = await fsp.readFile(fullPath)
            return content
        } catch (err) {
            throw new Error(`'File not Found: '${fullPath}`)
        }
    }

    async readFile(filename: string, relativePath?: string): Promise<string> {
        const fullPath = this.fullPath(filename, relativePath)
        try {
            const content = await fsp.readFile(fullPath, 'utf8')
            return content
        } catch (err) {
            throw new Error(`'File not Found: '${fullPath}`)
        }
    }

    async readJson<T>(filename: string, relativePath?: string): Promise<T> {
        const name = path.parse(filename).name
        const content = await this.readFile(`${name}.json`, relativePath)
        try {
            return JSON.parse(content) as T
        } catch (err) {
            throw new Error(`Could not convert to json: ${err}`)
        }
    }

    async writeBuffer(content: Buffer, filename: string, relativePath?: string): Promise<void> {
        const fullPath = this.fullPath(filename, relativePath)
        try {
            await fsp.writeFile(fullPath, content)
        } catch (err) {
            throw new Error(`Could not write buffer-file: ${err}`)
        }
    }

    async writeFile(options: WriteFileOptions, content: string, filename: string, relativePath?: string): Promise<void> {
        const name = path.parse(filename).name
        const fullPath = this.fullPath(`${name}.json`, relativePath)
        try {
            await fsp.writeFile(fullPath, content, options)
        } catch (err) {
            throw new Error(`Could not write file: ${err}`)
        }
    }

    async writeJson(content: any, filename: string, relativePath?: string): Promise<void> {
        filename = filename.endsWith('.json') ? filename : `${filename}.json`
        try {
            const json = JSON.stringify(content, null, 4)
            await this.writeFile({ encoding: 'utf8' }, json, filename, relativePath)
        } catch (err) {
            throw new Error(`Could not write json file: ${err}`)
        }
    }

    async _listFiles({ directory, recursively = false }: {
        directory?: string,
        recursively?: boolean
    }): Promise<string[]> {
        directory = isDefined(directory) ? directory : this.basePath
        const stats = await fsp.readdir(this.fullPath(directory), { withFileTypes: true })
        const paths = await Promise.all(stats.map(async (stat) => {
            const paths: string[] = []
            if (stat.isDirectory() && recursively) {
                const subFiles = await this.listFiles({
                    directory: this.join(directory, stat.name),
                    recursively
                })
                const subPaths = subFiles.map(f => this.join(stat.name, f))
                paths.push(...subPaths)
            } else if (stat.isFile()) {
                paths.push(stat.name)
            }
            return paths
        }))

        return paths.flat()
    }

    async listFiles({ directory, recursively = false }: {
        directory: string,
        recursively?: boolean
    }): Promise<string[]> {
        const folderExists = await this.exist(directory)
        return folderExists
            ? this._listFiles({ directory, recursively })
            : []
    }

    parsePath(aPath: string): { path: string, file: string } {
        const { dir, base } = path.parse(aPath)
        return {
            path: dir,
            file: base
        }
    }

    hasExtension(aPath: string): boolean {
        const { ext } = path.parse(aPath)

        return isDefined(ext) && ext.length > 0
    }
}