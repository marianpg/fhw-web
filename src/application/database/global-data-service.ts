'use strict'

import { GlobalDataConfig } from '../../public/config/database-config'

import { Logging } from '../logging'
import { FileUtils } from '../filesystem-utils'
import { SqlDataService } from './sql-data-service'


type GlobalData = Record<string, any> | Record<string, any>[]

export class GlobalDataService {

    private data: GlobalData

    constructor(
        private config: GlobalDataConfig,
        private logging: Logging,
        private fileUtils: FileUtils,
        private sqlDataService: SqlDataService
    ) {
        this.config.pathToFile = `${this.fileUtils.parseFilename(this.config.pathToFile)}.${this.config.format}`
    }

    private async _build(): Promise<void> {
        const fileExists = await this.fileUtils.exist(this.config.pathToFile)
        this.data = fileExists
            ? await this.fileUtils.readJson<GlobalData>(this.config.pathToFile)
            : {}

        this.data = this.sqlDataService.parseAndExecuteSql(this.data, {})
    }

    async build(): Promise<GlobalDataService> {
        if (this.config.active) {
            await this._build()
        }
        return this
    }

    async reload(): Promise<void> {
        if (this.config.reloadOnEveryRequest) {
            await this._build()
        }
    }

    async getData(): Promise<GlobalData> {
        await this.reload()
        return this.data
    } 
}