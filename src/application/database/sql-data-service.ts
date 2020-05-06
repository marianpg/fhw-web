'use strict'

import { SqlDataConfig } from '../../public/config/database-config'
import { Database as IDatabase, ResultType, AllResultTypes } from '../../public/database'

const InitSqlJs = require('sql.js')
const escapeSqlString = require('sql-string-escape')

import { Logging } from '../logging'
import { FileUtils } from '../filesystem-utils'
import { hasKeys, isDefined } from '../helper'

type SqlDriverResult = {
    columns: string[],
    values: any[][]
}[]

type SqlResult = Record<string, any>[]

export class SqlDataService {

    private sqliteDatabase: any

    constructor(
        private config: SqlDataConfig,
        private logging: Logging,
        private fileUtils: FileUtils
    ) { }

    private async _build(): Promise<void> {
        const dataPath = this.fileUtils.fullPath(this.config.pathToFile)

        const SQL = await InitSqlJs()
        const filebuffer = await this.fileUtils.readBuffer(dataPath)
        this.sqliteDatabase = new SQL.Database(filebuffer)
    }

    async build(): Promise<SqlDataService> {
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

    private flattenParams(p: Record<string, any>): Record<string, string> {
        const result: Record<string, string> = {}

        type Strategy = (obj: Record<string, any>, key: string, result: Record<string, string>) => void
        const strategy: Strategy = (obj, key, result) => {
            if (!hasKeys(obj[key])) {
                result[key] = obj[key]
            }
        }

        const iterate = (obj: Record<string, any>, strategy: Strategy, result: Record<string, string>): void => {
            if (hasKeys(obj)) {
                Object.keys(obj).forEach(key => {
                    strategy(obj, key, result)
                    iterate(obj[key], strategy, result)
                })
            }
        }

        iterate(p, strategy, result)

        return result
    }

    private prepareSql(sql: string, params: Record<string, any>): string {
        const flattenedParams = this.flattenParams(params)
        const paramsRegex = /(([:@$])([\w\d]*))/g

        const preparedSql = Array.from(sql.matchAll(paramsRegex)).reduce(
            (acc, [_, match, prefix, name]) => {
                const replacement = flattenedParams[name]
                if (isDefined(replacement)) {
                    return acc.replace(match, escapeSqlString(replacement))
                } else {
                    throw new Error(`SQL: Can not execute SQL statement. No parameter defined for ${match}.`)
                }
            },
            sql
        )

        return preparedSql
    }

    private convertSqlResult(result: SqlDriverResult): SqlResult {
        if (isDefined(result) && isDefined(result[0])
            && isDefined(result[0].columns) && isDefined(result[0].values)
        ) {
            const columns = result[0].columns
            const values = result[0].values

            return values.map(
                row => {
                    return row.reduce(
                        (acc, val, idx) => ({
                            ...acc,
                            [columns[idx]]: val
                        }), {}
                    )
                })
        } else {
            return []
        }
    }

    private _executeSql(sql: string, params: Record<string, any>): SqlResult {
        const preparedSql = this.prepareSql(sql, params)
        try {
            const sqlDriverResult: SqlDriverResult = this.sqliteDatabase.exec(preparedSql)
            return this.convertSqlResult(sqlDriverResult)
        } catch (err) {
            throw new Error(`SQL Error: ${err}`)
        }
    }


    async query(sql: string, params: Record<string, any>): Promise<SqlResult> {
        if (this.config.active) {
            return this._executeSql(sql, params)
        } else {
            return []
        }
    }

    async parseAndExecuteSql(obj: Record<string, any>, params: Record<string, any>): Promise<Record<string, any>> {
        if (!this.config.active || !hasKeys(obj)) {
            return obj
        }

        if (!Object.keys(obj).includes('query')) {
            await Promise.all(Object.keys(obj).map(async key => {
                obj[key] = await this.parseAndExecuteSql(obj[key], params)
            }))
            return obj
        }

        const resultType: ResultType =
            obj['result'] && AllResultTypes.includes(obj['result'])
                ? obj['result']
                : 'mixed'

        const sqlResult = await this.query(obj['query'], params)

        if (resultType === 'array') {
            return sqlResult
        }

        const objResult = isDefined(sqlResult) && isDefined(sqlResult[0])
            ? Object.keys(sqlResult[0]).reduce(
                (acc, key) => {
                    acc[`_${key}`] = sqlResult[0][key]
                    return acc
                }
                , {})
            : {}

        if (resultType === 'object') {
            return objResult
        }
        const mixedResult = Object.assign([], sqlResult, objResult)

        return mixedResult
    }

    async save(): Promise<void> {
        if (this.config.active) {
            const dataPath = this.fileUtils.fullPath(this.config.pathToFile)
            const data = this.sqliteDatabase.export()
            const buffer = Buffer.from(data)
            await this.fileUtils.writeBuffer(buffer, dataPath)
        }
    }
}
