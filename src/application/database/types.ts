'use strict'

import { JsonData } from '../../public/database'


export type Filename = string
export type Json = Record<string, any>
export type JsonDataFiles = Record<Filename, Json>

export type LoadJsonFunction = (filename: string) => JsonData
export type SavejsonFunction = (filename: string, data: JsonData) => void
export type ExecuteSqlFunction = (sql: string) => Promise<Record<string, any>[]>//Promise<SqlStatementResult>

