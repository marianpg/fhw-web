'use strict'


export enum RoutingFileExtensions {
    JSON = 'json',
    TS = 'ts'
}

export interface RoutingConfig {
    magic: boolean
    fileName: string
    fileExtension: RoutingFileExtensions
    reloadOnEveryRequest: boolean
    logging: boolean
}
