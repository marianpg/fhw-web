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
import { isObject, isDefined, isUndefined, isFunction, zip } from './helper';


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

function servePage(pathToPage, params = {}) {
	const frontmatter = Object.assign({}, { request: params }, { global: loadGlobalFrontmatter() });

	return new Promise((resolve, reject) => {
		const html = compile(pathToPage, frontmatter);
		resolve(html);
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
	const frontmatter = Object.assign({}, { request: params }, { global: loadGlobalFrontmatter() });

	if (isUndefined(module[functionName])) {
		throw FunctionNotFoundError(`Module ${controllerName} does not exports a function named ${functionName}. Please check the documentation.`);
	}

	// Controller call can return either a Promise or the result directly
	const controllerResult = module[functionName](frontmatter);
	function resolveControllerCall(result) {
		if (isDefined(result.page)) {
			return servePage(result.page, frontmatter);

		} else if (isDefined(result.json)) {
			return serveJson(response, JSON.stringify(result.json), result.status);

		} else if (isDefined(result.content)) {
			return serveContent();

		} else {
			return Promise.reject("Return Value of Controller does not fulfill the required syntax. Please check the documentation.");
		}
	}

	return isDefined(controllerResult.then) && isFunction(controllerResult.then)
		? controllerResult.then(resolveControllerCall)
		: resolveControllerCall(controllerResult);
}


// TODO: Klären: url "/item/:id/price" würde ohne controller eine Suche nach einer page "/pages/item/id42/price" auslösen.
function parseParams(req, route) {
	let url = req.originalUrl;
	let params = {
		path: {},
		get: {},
		post: {},
		cookie: req.cookies // TODO: whitelist?
	};

	// Input
	// url			::= /item/id42/price?currency=euro
	// route.url	::= /item/:id/*
	// route.params ::= { path: ["id"], get: [], post: [] }

	// Extracting Path Parameters
	const combined = zip([route.url.split('/'), url.split('/')]);
	combined.forEach(([key, value]) => {
		if (key.startsWith(':')) {
			const k = key.substr(1);
			if (route.params.path.includes(k)) {
				params.path[k] = value;
			}
		}
	});

	// Extracting Get Parameters
	// TODO: Array vs. String ("/item/id42/price?currency=euro&sortBy=price&groupBy[]=name&groupBy[]=country")
	Object.keys(req.query).forEach(key => {
		if (route.params.get.includes(key) && isDefined(req.query[key])) {
			params.get[key] = req.query[key];
		}
	});

	// Extracting Post Parameters
	Object.keys(req.body).forEach(key => {
		if (route.params.post.includes(key) && isDefined(req.body[key])) {
			params.post[key] = req.body[key];
		}
	});

	// Output
	// url			::= /item/.*/.*
	// params		::=	{ path: {"id": "id42}, get: {"currency": "euro"}, post: {} }
	console.log(`Parsed request parameters are: ${JSON.stringify(params)}`);
	return params;
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
			.then(routes => {
				// loop will stop early, if a route for called url was found
				for (let index = 0; index < routes.length; ++index) {
					const route = routes[index];
					const isDefinedRoute = new RegExp(route.urlRegex).test(req.path);
					const isDefinedMethod = route.method.includes(req.method.toLowerCase());

					console.log(`Calling ressource "${req.path}". Does it match route "${route.urlRegex}"? ${isDefinedRoute}. Does it match Method "${route.method}"? ${isDefinedMethod}`);
					if (isDefinedRoute && isDefinedMethod) {
						const params = parseParams(req, route);

						if (isDefined(route.static)) {
							return serveStatic(req.path, res);
						}

						if (isDefined(route.page)) {
							return servePage(req.path, params);
						}
						if (isDefined(route.controller)) {
							return serveController(res, route.controller.file, route.controller.function, params);
						}
					}
				}
			}).then(html => {
				if (!res.finished && html && config.validator.html) {
					return validateHtml(html);
				} else {
					return Promise.resolve(html);
				}
			}).then(html => {
				if (!res.finished && html && config.validator.css) {
					return validateCss(html);
				} else {
					return Promise.resolve(html);
				}
			}).then(html => {
				// check, if result was already sent
				//   i.e. when serving static content
				//   express' function "sendFile" already handles the response
				if (!res.finished) {
					if (html) {
						res.status(200);
						res.send(html);
					} else {
						throw RessourceNotFoundError(`Could not find ressource "${req.originalUrl}"`);
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