'use strict'

import YAML = require('yaml')


export const isDefined = (a?: any) => a != null

export const isInteger = Number.isInteger

export const isArray = Array.isArray

//@see https://stackoverflow.com/a/7356528
export const isFunction = (functionToCheck) => {
    return functionToCheck && {}.toString.call(functionToCheck) === '[object Function]'
}

export const isAsyncFunction = (functionToCheck) => {
    return functionToCheck && functionToCheck.constructor.name === 'AsyncFunction'
}

export const isPromise = (p?: any) => isDefined(p) && isDefined(p.then) && isFunction(p.then)

export const hasKeys = (v: any) => typeof v === 'object' && v !== null

export const xor =
    (a: boolean, b: boolean): boolean => a ? !b : b

export const jsonStringify = (obj: any, newLine?: boolean) => `${newLine ? '\n' : ''}${JSON.stringify(obj, null, 4)}`

export const parseJson = (raw: string) => {
    return JSON.parse(raw)
}

export const parseYaml = (raw: string) => {
    return YAML.parse(raw)
}

export const now = () => (new Date).toString()

export class CollisionCheck<T> {

    private list: T[]
    constructor() {
        this.list = []
    }

	/**
	 * 
	 * @param element element to verify, if it's already included
	 * @returns true, if element is a new one
	 */
    verify(element: T): boolean {
        if (this.list.includes(element)) {
            return false
        }
        this.list.push(element)
        return true
    }
}

export class PaddedCounter {

    private originalStart: number
    private maxLength: number

    constructor(
        private start: number,
        private end?: number) {
        this.originalStart = this.start
        this.end = isDefined(end) ? end : Number.MAX_SAFE_INTEGER
        this.maxLength = this.length(end)
    }

    private length(n: number): number {
        return `${n}`.length
    }

    private inc(): void {
        this.start = this.start >= this.end ? this.originalStart : this.start + 1
    }

    private padding(n: number): string {
        let result = ''
        for (let i = this.length(n); i < this.maxLength; ++i) {
            result = `0${result}`
        }
        return result
    }

    next(): string {
        const n = this.start
        const padding = this.padding(n)

        this.inc()

        return `${padding}${n}`
    }

    getMaxLength(): number {
        return this.maxLength
    }
}

export const replaceAt = (str: string, index: number, replacement: string): string => {
    return `${str.substr(0, index)}${replacement}${str.substr(index + replacement.length)}`
}
