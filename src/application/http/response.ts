'use strict'

import { isDefined } from '../helper'


interface ResponseBasic {
    headers?: Record<string, string>
    statusCode: number
}
export interface ResponseEmpty extends ResponseBasic {
    type: 'empty'
}
export interface ResponseStatic extends ResponseBasic {
    type: 'static',
    pathToFile: string
}
export interface ResponseText extends ResponseBasic {
    type: 'text/plain'
    text: string
}
export interface ResponseJson extends ResponseBasic {
    type: 'application/json'
    body: Record<string, any>
}
export interface ResponseRedirect extends ResponseBasic {
    type: 'redirect'
    redirectLocation: string
}
export interface ResponseHtml extends ResponseBasic {
    type: 'text/html'
    html: string
}

export type Response = ResponseEmpty | ResponseStatic | ResponseText | ResponseJson | ResponseRedirect | ResponseHtml

export const checkResponse = (response: Response): void => {
    const checkAndThrowError = (shouldThrow: boolean, type: string, property?: string) => {
        if (shouldThrow) {
            const propertyHint = isDefined(property) ? ` Missing property "${property}"` : ''
            const message = `Invalid Response Type "${type}".${propertyHint}`
            throw new Error(message)
        }
    }

    switch (response.type) {
        case 'empty':
            break
        case 'text/plain':
            checkAndThrowError(!isDefined(response.text), response.type, 'text')
            break
        case 'static':
            checkAndThrowError(!isDefined(response.pathToFile), response.type, 'pathToFile')
            break
        case 'text/html':
            checkAndThrowError(!isDefined(response.html), response.type, 'html')
            break
        case 'application/json':
            checkAndThrowError(!isDefined(response.body), response.type, 'body')
            break
        case 'redirect':
            checkAndThrowError(!isDefined(response.redirectLocation), response.type, 'redirectLocation')
            break
        default:
            //@ts-ignore // TODO: explain
            throw new Error(`Unkown response type: ${response.type}`)
    }
}