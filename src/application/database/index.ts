'use strict'

import { DatabaseConfig } from '../../public/config'
import { Database as IDatabase, JsonData } from '../../public/database'



import { LoggingService } from '../logging'
import { FileUtils } from '../filesystem-utils'
import { GlobalData } from '../../public/global'
import { GlobalDataService } from './global-data-service'
import { FileDataService } from './file-data-service'
import { SqlDataService } from './sql-data-service'
import { LoadJsonFunction, SavejsonFunction, ExecuteSqlFunction } from './types'
import { Frontmatter } from '../../public/frontmatter'



class Database implements IDatabase {
    constructor(
        public loadJson: LoadJsonFunction,
        public saveJson: SavejsonFunction,
        public executeSql: ExecuteSqlFunction
    ) { }
}

// import sequelize

// TODO: yaml global.yaml should be possible

// TODO: json and sqlite databases are possible
// read from config which to choose and to deliver
// ==> need for generic functions to open/save json and to run sql statements

export class DatabaseService {
    
    private globalDataService: GlobalDataService
    private fileDataService: FileDataService
    private sqlDataService: SqlDataService

    private database: IDatabase

    constructor(
        private config: DatabaseConfig,
        private logService: LoggingService,
        private fileUtils: FileUtils
    ) {
        this.sqlDataService = new SqlDataService(
            this.config.sqliteData,
            this.logService.create('sql-data', this.config.sqliteData.logging),
            this.fileUtils
        )
        this.globalDataService = new GlobalDataService(
            this.config.globalData,
            this.logService.create('global-data', this.config.globalData.logging),
            this.fileUtils,
            this.sqlDataService
        )
        this.fileDataService = new FileDataService(
            this.config.fileData,
            this.logService.create('file-data', this.config.fileData.logging),
            this.fileUtils
        )
    }

    async build(): Promise<DatabaseService> {
        await this.sqlDataService.build()
        await this.globalDataService.build()
        await this.fileDataService.build()
        
        return this
    }

    async reload(): Promise<void> {
        await this.globalDataService.reload()
        await this.fileDataService.reload()
        await this.sqlDataService.reload()
    }

    async getGlobalData(): Promise<GlobalData> {
        return this.globalDataService.getData()
    }

    async getDatabase(frontmatter: Frontmatter): Promise<IDatabase> {
        const params = Object.assign({}, frontmatter.page, frontmatter.request.params, frontmatter.request.query, frontmatter.request.body)
        return new Database(
            (filename: string) => this.fileDataService.loadJson(filename),
            (filename: string, data: JsonData) => this.fileDataService.saveJson(filename, data),
            (sql: string) => this.sqlDataService.query(sql, params)
        )
    }
    
    async parseAndExecuteSql(obj: Record<string, any>, params: Record<string, any>): Promise<Record<string, any>> {
        return this.sqlDataService.parseAndExecuteSql(obj, params)
    }

    async save(): Promise<void> {
        await this.fileDataService.save()
        await this.sqlDataService.save()
    }
}