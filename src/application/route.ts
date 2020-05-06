'use strict'

import { RequestMethod, RequestParams } from '../public/request'
import { Route, StaticRoute, PageRoute, ControllerRoute, DefaultMethod } from '../public/route'

import { isDefined, jsonStringify, isArray, isInteger } from './helper'
import { parseMethod } from './http'


const toString = (obj) => jsonStringify(obj, true)


export type RouteType = 'static' | 'page' | 'controller'


const parseStaticRoute = (obj: Record<string, any>): StaticRoute => {
    if (Object.keys(obj).length > 2) {
        throw new Error(`Bei einer statischen Route sind neben den erlaubten Attributen ("url" und "static") unerlaubte Attribute angegeben: ${toString(obj)}`)
    }
    const result: StaticRoute = {
        url: obj.url,
        static: obj.static
    }
    return result
}

const parseRouteMethod = (obj: Record<string, any>): RequestMethod[] => {
    if (isDefined(obj.method) && !isArray(obj.method)) {
        throw new Error(`Bei einer Route ist die Deklaration des "method" Attributs fehlerhaft. Angegeben werden muss eine Liste von HTTP-Methoden: ${toString(obj)}`)
    }
    const methods: RequestMethod[] = !isDefined(obj.method)
        ? [DefaultMethod]
        : obj.method.map(m => parseMethod(m))

    return methods
}

const parsePageRoute = (obj: Record<string, any>): PageRoute => {
    if (Object.keys(obj).length > 3) {
        throw new Error(`Bei einer page Route sind neben den erlaubten Attributen (url, page, method) unerlaubte Attribute angegeben: ${toString(obj)}`)
    }

    const result: PageRoute = {
        url: obj.url,
        page: obj.page,
        method: parseRouteMethod(obj)
    }

    return result
}

const parseControllerRoute = (obj: Record<string, any>): ControllerRoute => {
    if (Object.keys(obj).length > 3) {
        throw new Error(`Bei einer controller Route sind neben den erlaubten Attributen (url, controller, method) unerlaubte Attribute angegeben: ${toString(obj)}`)
    }
    if (!isDefined(obj.controller.file)) {
        throw new Error(`Bei einer controller Route fehlt in der "controller" Beschreibung das Attribut "file": ${toString(obj)}`)
    }
    if (!isDefined(obj.controller.function)) {
        throw new Error(`Bei einer controller Route fehlt in der "controller" Beschreibung das Attribut "function": ${toString(obj)}`)
    }
    if (Object.keys(obj.controller).length > 2) {
        throw new Error(`Bei einer controller Route sind in der "controller" Beschreibung neben den erlaubten Attributen (file, function) unerlaubte Attribute angegeben: ${toString(obj)}`)
    }
    const result: ControllerRoute = {
        url: obj.url,
        controller: obj.controller,
        method: parseRouteMethod(obj)
    }
    return result
}
export const parseRoutes = (json: Record<string, any>[]): Route[] => {
    return json.map(
        (entry) => {
            if (!isDefined(entry.url)) {
                throw new Error(`Bei einer Route fehlt das "url" Attribut: ${toString(entry)}`)
            }
            else if (isDefined(entry.static)) {
                return parseStaticRoute(entry)
            }
            else if (isDefined(entry.page)) {
                return parsePageRoute(entry)
            }
            else if (isDefined(entry.controller)) {
                return parseControllerRoute(entry)
            }
            throw new Error(`Eine Route stimmt nicht mit der Routen-Beschreibung überein: ${toString(entry)}`)
        }
    )
}

export const isStaticRoute = (route: Route): route is StaticRoute => {
    return isDefined((route as StaticRoute).static)
}

export const isPageRoute = (route: Route): route is PageRoute => {
    return isDefined((route as PageRoute).page)
}

export const isControllerRoute = (route: Route): route is ControllerRoute => {
    return isDefined((route as ControllerRoute).controller)
}

export const determineFilepath = (routePath: string, params: RequestParams): string => {
    const result = Object.keys(params).reduce((path, key) => {
        return isInteger(+key)
            ? path.replace('*', params[key])
            : path.replace(`:${key}`, params[key])
    }, routePath)

    return result
}


export const MagicRoutes: Route[] = [
    {
        url: '/*',
        static: '*'
    },
    {
        url: '/*',
        page: '*'
    }
]