'use strict'

export enum LoggingTypes {
    INFO = 'info',
    DATA = 'data',
    WARN = 'warn',
    ERROR = 'error',
    DEBUG = 'debug'
}

export type LoggingType = 
    'info' | 'data' | 'warn' | 'error' | 'debug'