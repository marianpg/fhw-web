'use strict';

import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';

import compile from './compile';
const { generateErrorPage, NotImplementedError, RessourceNotFoundError, FunctionNotFoundError } = require('./customError');
import { validateHtml, validateCss } from './validator';
import defaultConfig from './defaultConfig';
import prepareRoutes from './routes';
import { loadDynamicModule, loadGlobalFrontmatter, resolveRessource, loadJson as openJson, saveJson as writeJson} from './ressource-utils';
import { isObject, isDefined, isUndefined, isFunction, copy } from './helper';
import { parseParams } from './parameters';

// use the defaultConfig as a basis
// overwrite only entries which are user defined
function combineConfiguration(userConfig = {}) {
	function combineObjects(defaultObj, userObj) {
		return Object.keys(defaultObj).reduce((acc, key) => {

			if (isObject(defaultObj[key])) {
				acc[key] = isDefined(userObj[key])
					? combineObjects(defaultObj[key], userObj[key])
					: defaultObj[key];
			} else {
				acc[key] = isDefined(userObj[key])
					? userObj[key]
					: defaultObj[key]
			}

			return acc;
		}, {});
	}

	return combineObjects(defaultConfig, userConfig);
}

function serveStatic(url, res) {
	const pathToStatic = resolveRessource(url);

	return new Promise((resolve, reject) => {
		res.sendFile(pathToStatic, error => {
			if (error) {
				return reject(error); //TODO: CustomError Class?
			} else {
				return resolve(true);
			}
		})
	});
}

function servePage(pathToPage, params = {}, data = {}, status = 200) {
	const frontmatter = Object.assign({}, { request: params }, { global: loadGlobalFrontmatter() }, { page: data });

	return new Promise((resolve, reject) => {
		const html = compile(pathToPage, frontmatter);
		resolve({html, status});
	});
}

function serveJson(response, json, status) {
	response.status(status);
	response.json(json);
}

function serveContent() {
	throw NotImplementedError("Serving plain text content is not implemented");
}


function serveController(response, controllerName, functionName, params = {}) {
	const module = loadDynamicModule(controllerName, 'controller');

	if (isUndefined(module[functionName])) {
		throw FunctionNotFoundError(`Module ${controllerName} does not exports a function named ${functionName}. Please check the documentation.`);
	}
	const frontmatter = Object.assign({}, { request: copy(params) }, { global: loadGlobalFrontmatter() });
	const controllerResult = module[functionName](frontmatter);

	// Controller call can return either a Promise or the result directly
	function resolveControllerCall(result) {
		if (isDefined(result.page)) {
			return servePage(result.page, params, result.data, result.status);

		} else if (isDefined(result.json)) {
			return serveJson(response, JSON.stringify(result.json), result.status);

		} else if (isDefined(result.content)) {
			return serveContent();

		} else if (isDefined(result.redirect)) {
			return response.redirect(result.status || 301, result.redirect);

		} else {
			return Promise.reject("Return Value of Controller does not fulfill the required syntax. Please check the documentation.");
		}
	}

	return isDefined(controllerResult.then) && isFunction(controllerResult.then)
		? controllerResult.then(resolveControllerCall)
		: resolveControllerCall(controllerResult);
}



/*
	userConfig ::= { <port> }

	port ::= <Integer>
 */
export function start(userConfig) {
	const app = express();
	let config = combineConfiguration(userConfig);

	app.use(bodyParser.urlencoded({ extended: true }));
	app.use(bodyParser.json());
	app.use(cookieParser());

	// TODO: therefore there is no favicon in the root directory allowed
	app.get('/favicon.ico', (req, res) => {
		console.log('NOTE: A favicon in the projects\' root directory will be ignored. Please change its location in a subdirectory like "assets" and define a route for it.');
		res.status(204);
		res.send();
	});

	app.use((req, res) => {
		prepareRoutes(config)
			.then(routes => { //TODO fallback, if no route found
				// loop will stop early, if a route for called url was found
				for (let index = 0; index < routes.length; ++index) {
					const route = routes[index];
					const isDefinedRoute = new RegExp(route.urlRegex).test(req.path);
					const isDefinedMethod = route.method.includes(req.method.toLowerCase());

					console.log(`Calling ressource "${req.path}". Does it match route "${route.urlRegex}"? ${isDefinedRoute}. Does it match Method "${route.method}"? ${isDefinedMethod}`);
					if (isDefinedRoute && isDefinedMethod) {

						if (isDefined(route.static)) {
							return serveStatic(req.path, res);
						}

						const params = parseParams(req, route, res);

						if (isDefined(route.page)) {
							return servePage(req.path, params);
						}
						if (isDefined(route.controller)) {
							return serveController(res, route.controller.file, route.controller.function, params);
						}
					}
				}
			}).then(result => {
				if (!res.finished && result && result.html && config.validator.html) {
					return validateHtml(result);
				} else {
					return Promise.resolve(result);
				}
			}).then(result => {
				if (!res.finished && result && result.html && config.validator.css) {
					return validateCss(result);
				} else {
					return Promise.resolve(result);
				}
			}).then(result => {
				// check, if result was already sent
				//   i.e. when serving static content
				//   express' function "sendFile" already handles the response
				if (!res.finished) {
					if (result && result.html) {
						res.status(result.status || 200);
						res.send(result.html);
					} else {
						throw RessourceNotFoundError(`Could not find ressource "${req.originalUrl}" with requeset method "${req.method}".`);
					}
				}
			}).catch(error => {
				// TODO: CustomError?
				if (!res.finished) {
					res.status(500);
					res.send(generateErrorPage(error));
				} else {
					console.log("Unexpected Server Error with Code 1. Please send a report to mpg@fh-wedel.de.");
				}
			});
	});

	// TODO: do a server restart if configuration (i.e. port) has changed
	app.listen({
		port: config.port
	}, () => {
		console.log(`\nServer listening on http://localhost:${config.port}/\n`);
	});
}

export function loadJson(documentName) {
	return openJson(documentName, 'data');
}

export function saveJson(documentName, obj) {
	return writeJson(documentName, obj, 'data');
}