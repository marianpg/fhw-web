'use strict'

import { isDefined } from '../helper'

export enum ExceptionType {
    ROUTE = 'route'
}

class BaseException extends Error {

    protected constructor(
        private type: string,
        msg: string
    ) {
        super(`[${type}] ${msg}`)
    }

    getType(): string {
        return this.type
    }

    isFhwWebError(): boolean {
        return true
    }
}

export const isException = (error: Error): error is BaseException => {
    return isDefined((error as any).isFhwWebError)
        && (error as any).isFhwWebError()
}

export class RouteException extends BaseException {
    static NotFound(msg: string): Error {
        return new RouteException(ExceptionType.ROUTE, msg)
    }
}