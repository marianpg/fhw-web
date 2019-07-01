import { loadJson } from "./ressource-utils";
import { RouteDefinitionError, JsonParseError } from './customError';

import { isDefined, isUndefined, isArray, copy } from './helper';



const HttpMethods = ['get', 'post', 'put', 'patch', 'delete'];

const magicRoutes = [{
    "url": "/*",
    "static": "/*"
}, {
    "url": "/*",
    "page": "*"
}];

export default function prepareRoutes(config) {
    let routeDefinitions = {};

    if (config.magicRoutes) {
        routeDefinitions = JSON.parse(JSON.stringify(magicRoutes));
    } else if (config.routes) {
        routeDefinitions = JSON.parse(JSON.stringify(config.routes));
    } else {
        routeDefinitions = loadJson('routes.json');
        if (!routeDefinitions) {
            throw JsonParseError('routes.json', 'Could not read routes.json file.');
        }
    }


    // TODO: Mit Sternchen umgehen
    // TODO: was, wenn url === "" ? Ist das schlimm?
    // TODO: URL-String sowie PAGE-String validieren

    const routes = routeDefinitions.map((definition, index) => {
        let modified = copy(definition);

        if (isUndefined(definition.url)) {
            throw RouteDefinitionError(`Route no. ${index}: missing url definition.`);
        } else if (definition.url.split('*').length > 2) {
            throw RouteDefinitionError(`Route no. ${index}: url definition contains more than one wildecard "*".`);
        }
        if (isDefined(definition.method)) {
            if (!isArray(definition.method)) {
                throw RouteDefinitionError(`Route no. ${index}: method definition has to be an array of supported http methods.`);
            }
            modified.method = definition.method.map(method => {
                const m = method.toLowerCase();
                if (!HttpMethods.includes(m)) {
                    throw RouteDefinitionError(`Route no. ${index}: invalid method "${method}" declared.`);
                }
                return m;
            })
        } else {
            modified.method = ['get'];
        }
        if (!(isDefined(definition.static) || isDefined(definition.page) || isDefined(definition.controller))) {
            throw RouteDefinitionError(`Route no. ${index}: one of those definitions (static, page or controller) is required.`);
        }
        if (isDefined(definition.static) && isDefined(definition.page)) {
            throw RouteDefinitionError(`Route no. ${index}: both, "static" and "page" are declared, but only one of those definitions one the same route are supported.`);
        }
        if (isDefined(definition.static) && isDefined(definition.controller)) {
            throw RouteDefinitionError(`Route no. ${index}: both, "static" and "controller" are declared, but only one of those definitions one the same route are supported.`);
        }
        if (isDefined(definition.page) && isDefined(definition.controller)) {
            throw RouteDefinitionError(`Route no. ${index}: both, "page" and "controller" are declared, but only one of those definitions one the same route are supported.`);
        }
        if (isDefined(definition.static)) {
            modified.static = definition.static[0] === '/' ? definition.static : `/${definition.static}`;
        }
        if (isDefined(definition.params)) {
            if (isDefined(definition.params.get)) {
                if (!isArray(definition.params.get)) {
                    throw RouteDefinitionError(`Route no. ${index}: params.get has to be an array.`);
                }
            } else {
                modified.params.get = [];
            }
            if (isDefined(definition.params.post)) {
                if (!isArray(definition.params.post)) {
                    throw RouteDefinitionError(`Route no. ${index}: params.post has to be an array.`);
                }
            } else {
                modified.params.post = [];
            }
        } else {
            modified.params = { path: [], get: [], post: [] }
        }
        if (isDefined(definition.controller)) {
            if (isUndefined(definition.controller.file) || isUndefined(definition.controller.function)) {
                throw RouteDefinitionError(`Route no. ${index}: controller definition is wrong.`);
            }
        }

        const pathParams = [];
        let urlRegex = definition.url;

        urlRegex = urlRegex.includes('*')
            ? urlRegex.replace('*', _ => '(.*)')
            : urlRegex;

        urlRegex = urlRegex.includes(':')
            ? urlRegex.replace(/:[a-zA-Z]*/g, match => {
                pathParams.push(match.substr(1));
                return '[^\/]*';
            })
            : urlRegex;
        urlRegex = `^${urlRegex}$`;
        modified.urlRegex = urlRegex;
        modified.params.path = pathParams;

        return modified;
    });

    return Promise.resolve(routes);
}
