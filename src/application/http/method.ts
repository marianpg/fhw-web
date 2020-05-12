'use strict'

import { RequestMethod, RequestMethods } from '../../public/request'

import { isDefined } from '../helper'


export { RequestMethod as Method } from '../../public/request'

export const AllMethods: RequestMethod[] = Object.values(RequestMethods)

export const parseMethod = (method: string): RequestMethod => {
    const m = AllMethods.find(aMethod => aMethod === method.toLowerCase())

    if (!isDefined(m)) {
        throw new Error(`Ciritcal Error - could not extrat HTTP Method "${method}" from request.`)
    }

    return m
} 