'use strict'

import { LoggingType, LoggingTypes } from '../../public/config'


const colors = require('colors')

const themeConfig: Record<LoggingType, string> = {
    info: 'brightCyan',
    data: 'grey',
    warn: 'brightYellow',
    error: 'brightRed',
    debug: 'brightBlue'
}
colors.setTheme(themeConfig)


export class Logging {

    constructor(
        private tag: string,
        private shouldLog: boolean,
        private loggingActive: LoggingType[]
    ) { }

    protected log(type: LoggingType, ...args: any[]) {
        if (this.loggingActive.includes(type) && this.shouldLog) {
            let tag = `[${this.tag}]`
            console.log(colors[type](...[tag, ...args]))
        }
    }

    info(...args: any[]): void {
        this.log(LoggingTypes.INFO, ...args)
    }

    data(...args: any[]): void {
        this.log(LoggingTypes.DATA, ...args)
    }

    warn(...args: any[]): void {
        this.log(LoggingTypes.WARN, ...args)
    }

    error(...args: any[]): void {
        this.log(LoggingTypes.ERROR, ...args)
    }

    debug(...args: any[]): void {
        this.log(LoggingTypes.DEBUG, ...args)
    }
}


export class FakeLogging extends Logging {
    constructor() {
        const tag = ''
        const shouldLog = false
        super(tag, shouldLog, [])
    }
}

export class LoggingService {
    constructor(
        private loggingActive: LoggingType[]
    ) { }

    create(tag: string, shouldLog: boolean): Logging {
        return new Logging(tag, shouldLog, this.loggingActive)
    }
}