'use strict'

import { expect } from 'chai'
import 'mocha'

import { RequestMethod, RequestParams } from '../public/request'
import { PageRoute, StaticRoute, ControllerRoute } from '../public/route'

import { parseRoutes, determineFilepath } from './route'

describe('Route', () => {

    describe('Route #1', () => {
        it('should parse an empty route definition', () => {
            const json = []
            try {
                parseRoutes(json)
                expect(true).to.be.true
            } catch (_) {
                expect(false).to.be.true
            }
        })
        it('should fail to parse an invalid static route (with "method" attribute)', () => {
            const json = [{ url: '/test', static: 'test.txt', method: ['get'] }]
            try {
                parseRoutes(json)
                expect(false).to.be.true
            } catch (_) {
                expect(true).to.be.true
            }
        })
        it('should fail to parse an invalid static route (with additional attribute)', () => {
            const json = [{ url: '/test', static: 'test.txt', invalid: true }]
            try {
                parseRoutes(json)
                expect(false).to.be.true
            } catch (_) {
                expect(true).to.be.true
            }
        })
        it('should fail to parse an invalid page route (with additional attribute)', () => {
            const json = [{ url: '/test', page: 'test', invalid: true }]
            try {
                parseRoutes(json)
                expect(false).to.be.true
            } catch (_) {
                expect(true).to.be.true
            }
        })
        it('should fail to parse an invalid controller route (with additional attribute)', () => {
            const json = [{ url: '/test', controller: { file: 'test', function: 'main' }, invalid: true }]
            try {
                parseRoutes(json)
                expect(false).to.be.true
            } catch (_) {
                expect(true).to.be.true
            }
        })

        it('should fail to parse a mixed route (static and page route)', () => {
            const json = [{ url: '/test', static: 'test.txt', page: 'test' }]
            try {
                parseRoutes(json)
                expect(false).to.be.true
            } catch (_) {
                expect(true).to.be.true
            }
        })
        it('should fail to parse a mixed route (static and controller route)', () => {
            const json = [{ url: '/test', static: 'test.txt', controller: { file: 'test', function: 'main' } }]
            try {
                parseRoutes(json)
                expect(false).to.be.true
            } catch (_) {
                expect(true).to.be.true
            }
        })
        it('should fail to parse a mixed route (page and controller route)', () => {
            const json = [{ url: '/test', page: 'test', controller: { file: 'test', function: 'main' } }]
            try {
                parseRoutes(json)
                expect(false).to.be.true
            } catch (_) {
                expect(true).to.be.true
            }
        })
        it('should fail to parse an invalid controller route (without "file" attribute)', () => {
            const json = [{ url: '/test', controller: { function: 'main' } }]
            try {
                parseRoutes(json)
                expect(false).to.be.true
            } catch (_) {
                expect(true).to.be.true
            }
        })
        it('should fail to parse an invalid controller route (without "function" attribute)', () => {
            const json = [{ url: '/test', controller: { file: 'test' } }]
            try {
                parseRoutes(json)
                expect(false).to.be.true
            } catch (_) {
                expect(true).to.be.true
            }
        })
        it('should fail to parse an invalid controller route (additional attribute)', () => {
            const json = [{ url: '/test', controller: { file: 'test', function: 'main', invalid: true } }]
            try {
                parseRoutes(json)
                expect(false).to.be.true
            } catch (_) {
                expect(true).to.be.true
            }
        })
    })

    describe('Route #2', () => {
        it('should parse a route with method attribute (lowercase)', () => {
            const json = [{ url: '/test', page: 'test', method: ['get'] }]
            try {
                const route: PageRoute = parseRoutes(json)[0] as PageRoute
                const method = RequestMethod.GET
                expect(route.method[0]).to.equal(method)
            } catch (_) {
                expect(false).to.be.true
            }
        })
        it('should parse a route with method attribute (uppercase)', () => {
            const json = [{ url: '/test', page: 'test', method: ['GET'] }]
            try {
                const route: PageRoute = parseRoutes(json)[0] as PageRoute
                const method = RequestMethod.GET
                expect(route.method[0]).to.equal(method)
            } catch (_) {
                expect(false).to.be.true
            }
        })
        it('should parse a route with method attribute (mixed lower-/uppercase)', () => {
            const json = [{ url: '/test', page: 'test', method: ['GeT'] }]
            try {
                const route: PageRoute = parseRoutes(json)[0] as PageRoute
                const method = RequestMethod.GET
                expect(route.method[0]).to.equal(method)
            } catch (_) {
                expect(false).to.be.true
            }
        })
        it('should parse a route testing the url attribute', () => {
            const json = [{
                url: '/public/test',
                static: 'anything'
            }]
            const routes = parseRoutes(json)
            expect(routes).to.have.lengthOf(1)
            const staticRoute = routes[0] as StaticRoute
            expect(staticRoute.url).to.be.not.undefined
            expect(staticRoute.url).to.equal(json[0].url)
        })
        it('should parse a static route', () => {
            const json = [{
                url: '/public/test',
                static: 'test.txt'
            }]
            const routes = parseRoutes(json)
            expect(routes).to.have.lengthOf(1)
            const staticRoute = routes[0] as StaticRoute
            expect(staticRoute.static).to.be.not.undefined
            expect(staticRoute.static).to.equal(json[0].static)
        })
        it('should parse a page route', () => {
            const json = [{
                url: '/test',
                page: 'test'
            }]
            const routes = parseRoutes(json)
            expect(routes).to.have.lengthOf(1)
            const staticRoute = routes[0] as PageRoute
            expect(staticRoute.page).to.be.not.undefined
            expect(staticRoute.page).to.equal(json[0].page)
        })
        it('should parse a controller route', () => {
            const json = [{
                url: '/test-script',
                controller: { file: 'test', function: 'main' }
            }]
            const routes = parseRoutes(json)
            expect(routes).to.have.lengthOf(1)
            const staticRoute = routes[0] as ControllerRoute
            expect(staticRoute.controller).to.be.not.undefined
            expect(staticRoute.controller.file).to.equal(json[0].controller.file)
            expect(staticRoute.controller.function).to.equal(json[0].controller.function)
        })
        it('should parse several routes and preserve the correct order', () => {
            const json = [
                { url: '/public/test', static: 'test.txt' },
                { url: '/test', page: 'test' },
                { url: '/test-script', controller: { file: 'test', function: 'main' } }
            ]
            const routes = parseRoutes(json)
            expect(routes).to.have.lengthOf(3)
            expect((routes[0] as StaticRoute).static).to.be.not.undefined
            expect((routes[1] as PageRoute).page).to.be.not.undefined
            expect((routes[2] as ControllerRoute).controller).to.be.not.undefined
        })
        it('should parse the optional method attributes', () => {
            const json = [
                { url: '/public/test', static: 'test.txt' },
                { url: '/test', page: 'test', 'method': ['get'] },
                { url: '/test-script', controller: { file: 'test', function: 'main' }, 'method': ['get'] }
            ]
            const routes = parseRoutes(json)
            expect(routes).to.have.lengthOf(3)
            expect((routes[0] as any).method).to.be.undefined
            expect((routes[1] as PageRoute).method).to.be.not.undefined
            expect((routes[2] as ControllerRoute).method).to.be.not.undefined
        })
    })

    describe('determineFilepath', () => {
        it('all-matching wildcard: without sub-directories', () => {
            const routePath = 'assets/*'
            const params: RequestParams = { '0': 'test.txt' }
            const filepath = determineFilepath(routePath, params)
            expect(filepath).to.equal('assets/test.txt')
        })
        it('all-matching wildcard: with sub-directory', () => {
            const routePath = 'assets/*'
            const params: RequestParams = { '0': 'sub/test.txt' }
            const filepath = determineFilepath(routePath, params)
            expect(filepath).to.equal('assets/sub/test.txt')
        })
        it('named wildcard: without sub-directories', () => {
            const routePath = 'assets/:file'
            const params: RequestParams = { 'file': 'test.txt' }
            const filepath = determineFilepath(routePath, params)
            expect(filepath).to.equal('assets/test.txt')
        })
        it('named wildcard: with sub-directory', () => {
            const routePath = 'assets/:dir/:file'
            const params: RequestParams = { 'dir': 'sub', 'file': 'test.txt' }
            const filepath = determineFilepath(routePath, params)
            expect(filepath).to.equal('assets/sub/test.txt')
        })
        it('mixed wildcards #1 without subdirectory', () => {
            const routePath = 'assets/*/:file'
            const params: RequestParams = { '0': 'sub', 'file': 'test.txt' }
            const filepath = determineFilepath(routePath, params)
            expect(filepath).to.equal('assets/sub/test.txt')
        })
        it('mixed wildcards #1 with subdirectory', () => {
            const routePath = 'assets/*/:file'
            const params: RequestParams = { '0': 'sub/subsub', 'file': 'test.txt' }
            const filepath = determineFilepath(routePath, params)
            expect(filepath).to.equal('assets/sub/subsub/test.txt')
        })
        it('mixed wildcards #2 without subdirectory', () => {
            const routePath = 'assets/:dir/*'
            const params: RequestParams = { 'dir': 'sub', '0': 'test.txt' }
            const filepath = determineFilepath(routePath, params)
            expect(filepath).to.equal('assets/sub/test.txt')
        })
        it('mixed wildcards #2 with subdirectory', () => {
            const routePath = 'assets/:dir/*'
            const params: RequestParams = { 'dir': 'sub', '0': 'subsub/test.txt' }
            const filepath = determineFilepath(routePath, params)
            expect(filepath).to.equal('assets/sub/subsub/test.txt')
        })
    })
})