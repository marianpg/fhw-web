'use strict'

import { FileDataConfig } from '../../public/config/database-config'
import { Database as IDatabase, JsonData } from '../../public/database'

import { Logging } from '../logging'
import { FileUtils } from '../filesystem-utils'
import { JsonDataFiles } from './types'
import { SqlDataService } from './sql-data-service'
import { isDefined } from '../helper'



export class FileDataService {
    private data: JsonDataFiles

    constructor(
        private config: FileDataConfig,
        private logging: Logging,
        private fileUtils: FileUtils,
    ) { }

    private normalizeFilename(filename: string): string {
        return filename.endsWith('.json') ? filename : `${filename}.json`
    }

    loadJson(filename: string): JsonData | null {
        if (!isDefined(filename) && (typeof filename !== 'string')) {
            throw new Error('Error while executing "loadJson": either filename is missing or is not of type string.')
        }
        filename = this.normalizeFilename(filename)
        return isDefined(this.data[filename])
            ? JSON.parse(JSON.stringify(this.data[filename]))
            : null
    }

    saveJson(filename: string, data: JsonData): void {
        if (!isDefined(filename) && (typeof filename !== 'string')) {
            throw new Error('Error while executing "saveJson": either filename is missing or is not of type string.')
        }
        if (!isDefined(data)) {
            throw new Error('Error while executing "saveJson": data, which has to be saved, is missing.')
        }
        filename = this.normalizeFilename(filename)
        this.data[filename] = data
    }

    // TODO: Unhandled Promise Rejection
    private async _build(): Promise<void> {
        const result: JsonDataFiles = {}

        const files = await this.fileUtils.listFiles({
            directory: this.config.path, recursively: true
        })

        await Promise.all(
            files.map(async (filename) => {
                if (filename.endsWith(`.${this.config.format}`)) {
                    result[filename] = await this.fileUtils.readJson(filename, this.config.path)
                }
            })
        )

        this.data = result
    }

    async build(): Promise<FileDataService> {
        if (this.config.active) {
            await this._build()
        }
        return this
    }

    async reload(): Promise<void> {
        if (this.config.reloadOnEveryRequest) {
            await this.build()
        }
    }

    async save(): Promise<void> {
        if (this.config.active) {
            await Promise.all(
                Object.keys(this.data).map(async (filename) => {
                    filename = this.normalizeFilename(filename)
                    await this.fileUtils.writeJson(this.data[filename], filename, this.config.path)
                })
            )
        }
    }
}