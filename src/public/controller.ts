'use strict'

import { GlobalData } from './global'
import { RequestData } from './request'
import { Database } from './database'
import { Session, SessionData } from './session'


interface BaseResult {
    status: number
}

export interface EmptyResult extends BaseResult {
}

export interface TextResult extends BaseResult {
    text: string
}

export interface JsonResult extends BaseResult {
    json: Record<string, any>
}

export interface RedirectResult extends BaseResult {
    redirect: string
}

export interface PageResult extends BaseResult {
    page: string
    frontmatter?: Record<string, any>
}

export interface FragmentResult extends BaseResult {
    fragment: string
    frontmatter?: Record<string, any>
}


export type ControllerStandardResult =
    EmptyResult |
    TextResult |
    RedirectResult |
    JsonResult |
    PageResult |
    FragmentResult

export type ControllerResult = ControllerStandardResult | Promise<ControllerStandardResult>



export type ControllerFunction = (
    data: {
        global: GlobalData,
        request: RequestData,
        session: SessionData
    },
    database: Database,
    session: Session) => ControllerResult

export type FunctionName = string

export type Controller = Record<FunctionName, ControllerFunction>