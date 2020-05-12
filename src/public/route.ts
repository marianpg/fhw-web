'use strict'

import { RequestMethod, RequestMethods } from './request'

export const DefaultMethod: RequestMethod = RequestMethods.GET

interface RouteBasic {
    url: string
}

export interface StaticRoute extends RouteBasic {
    static: string
}

export interface PageRoute extends RouteBasic {
    page: string
    method?: RequestMethod[]
}

export interface ControllerRoute extends RouteBasic {
    controller: { file: string, function: string }
    method?: RequestMethod[]
}

export type Route = StaticRoute | PageRoute | ControllerRoute