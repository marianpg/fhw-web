'use strict'

import { RequestHeaders } from '../../public/request'

import {
    Response as ExpResponse
} from 'express'
import { IncomingHttpHeaders } from 'http'


export interface Headers extends RequestHeaders {
    'content-type': string // ??
    referer: string
    'user-agent': string
    authorization: string
    'accept-language': string //@see https://stackoverflow.com/questions/6157485/what-are-content-language-and-accept-language/6157546#6157546
}

export const parseHeaders = (headers: IncomingHttpHeaders): Headers => {
    return {
        'content-type': headers['content-type'] || '',
        referer: headers['referer'] || '',
        'user-agent': headers['user-agent'] || '',
        authorization: headers['authorization'] || '',
        'accept-language': headers['accept-language'] || ''
    }
}

export const setHeaders = (res: ExpResponse, headers: Record<string, string>): void => {
    Object.keys(headers)
        .forEach(name => res.setHeader(name, headers[name]))
}