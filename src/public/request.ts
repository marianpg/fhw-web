'use strict'


export type RequestQuery = Record<string, any>
export type RequestBody = Record<string, any>
export type RequestParams = { [key: string]: string } // TODO: is value always string-typed?
export type RequestHeaders = Record<string, string>


export enum RequestMethods {
    GET = 'get',
    POST = 'post',
    PATCH = 'patch',
    PUT = 'put',
    DELETE = 'delete'
}

export type RequestMethod = 'get' | 'post' | 'patch' | 'put' | 'delete'

export interface RequestData {
    get: RequestQuery
    post: RequestBody
    path: RequestParams
    method: RequestMethod
    url: string
    originalUrl: string
    ip: string
    headers: RequestHeaders
}