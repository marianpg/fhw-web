'use strict'

import { RequestData } from '../../public/request'

import { Request as ExpRequest } from 'express'

import { parseMethod } from './method'
import { parseHeaders } from './headers'


export const parseRequest = (req: ExpRequest): RequestData => {
    return {
        get: req.query,
        post: req.body,
        path: req.params,
        method: parseMethod(req.method),
        url: req.path,
        originalUrl: req.originalUrl,
        ip: req.ip,
        headers: parseHeaders(req.headers)
    }
}