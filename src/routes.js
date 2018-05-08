import { loadJson } from "./ressource-utils";
const { RouteDefinitionError } = require('./customError');

import { isDefined, isUndefined, isArray, copy } from './helper';



const HttpMethods = ['get', 'post', 'put', 'patch', 'delete'];

const magicRoutes = [
	{
		"url": "/assets/*",
		"static": "assets/*"
	}, {
		"url": "/*",
		"method": ["get"],
		"page": "*"
	}
];

// TODO: bei jedem Request Routes neu einlesen
export default function prepareRoutes(config) {
	const routeDefinitions = loadJson('routes.json') || JSON.parse(JSON.stringify(magicRoutes));

	// TODO: Mit Sternchen umgehen
	// TODO: was, wenn url === "" ? Ist das schlimm?
	// TODO: URL-String sowie PAGE-String validieren

	const routes = routeDefinitions.map((definition, index) => {
		let modified = copy(definition);

		if (isUndefined(definition.url)) {
			throw RouteDefinitionError(`Route no. ${index}: missing url definition.`);
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
			? urlRegex.replace('*', _ => '.*')
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