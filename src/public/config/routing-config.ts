'use strict'


export enum RoutingFileExtensions {
    JSON = 'json',
    TS = 'ts'
}

export type RoutingFileExtension = 'json' | 'ts'

export interface RoutingConfig {
    magic: boolean
    fileName: string
    fileExtension: RoutingFileExtension
    reloadOnEveryRequest: boolean
    logging: boolean
}
