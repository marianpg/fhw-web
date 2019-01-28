'use strict';

import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import multer from 'multer';

import { compile, reloadDatabase } from './compile';
import {
    generateErrorPage,
    RessourceNotFoundError,
    FunctionNotFoundError,
    JsonParseError,
	ControllerReturnValueError,
	RouteNotFoundError
} from './customError';

import { validateHtml, validateCss } from './validator';
import defaultConfig from './defaultConfig';
import prepareRoutes from './routes';
import { toAbsolutePath, loadDynamicModule, loadGlobalFrontmatter, resolvePage, resolveStatic, loadJson as openJson, saveJson as writeJson} from './ressource-utils';
import { isObject, isDefined, isUndefined, isFunction, copy } from './helper';
import { parseParams, parseSession, saveSessionData } from './parameters';

const noValidation = {
	html: false,
	css: false
};

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


function serveStatic(pathToFile, params, response) {
	if (pathToFile instanceof Error) {
		return pathToFile;
	}
	const pathToStatic = toAbsolutePath(pathToFile);

	return new Promise((resolve, reject) => {
		response.sendFile(pathToStatic, error => {
			if (error) {
				console.log("Error in serving static ressource:", error.message);
				return reject(error); //TODO: CustomError Class?
			} else {
				return resolve({ html: false, validation: noValidation});
			}
		})
	});
}

function servePage(pathToFile, params = {}, sessionData = {}, pageData = {}, status = 200) {
	if (pathToFile instanceof Error) {
		return pathToFile;
	}
    const frontmatter = Object.assign({}, { request: params }, { global: loadGlobalFrontmatter() }, { page: pageData }, { session: sessionData });
	console.log("serverPage", pathToFile);
	return compile(pathToFile, frontmatter)
		.then(html => Promise.resolve({html, status}));
}

function serveFragment(pathToFile, params = {}, sessionData = {}, pageData = {}, status = 200) {
    const frontmatter = Object.assign({}, { request: params }, { global: loadGlobalFrontmatter() }, { page: pageData }, { session: sessionData });

    return compile(pathToFile, frontmatter, 'templates')
		.then(html => Promise.resolve({html, status, validation: noValidation}));
}

function serveJson(response, json, status) {
    return new Promise((resolve, reject) => {
        response.status(status);
        response.json(json);
        resolve({html: false, validation: noValidation});
    })
}

function serveText(response, text, status) {
    return new Promise((resolve, reject) => {
        response.status(status || 200);
        response.send(text);
        resolve({html: false, status, validation: noValidation});
    })
}


function serveController(response, controllerName, functionName, params = {}, sessionData = {}) {
	const module = loadDynamicModule(controllerName, 'controller');

	if (module instanceof Error) {
		return module;
	}

	if (isUndefined(module[functionName])) {
		throw FunctionNotFoundError(`Module ${controllerName} does not exports a function named ${functionName}. Please check the documentation.`);
	}
	const frontmatter = Object.assign({}, { request: copy(params) }, { session: sessionData }, { global: loadGlobalFrontmatter() });
	const controllerResult = module[functionName](frontmatter);

	// Controller call can return either a Promise or the result directly
	function resolveControllerCall(result) {
		// Controller could edit the session data; so save the session!
		saveSessionData(sessionData);

		if (isDefined(result.page)) {
			return servePage(result.page, params, sessionData, result.data, result.status);

		} else if(isDefined(result.fragment)) {
            return serveFragment(result.fragment, params, sessionData, result.data, result.status);

        } else if (isDefined(result.json)) {
			return serveJson(response, result.json, result.status);

		} else if (isDefined(result.text)) {
			return serveText(response, result.text, result.status);

		} else if (isDefined(result.redirect)) {
			return response.redirect(result.status || 301, result.redirect);

		} else {
			throw ControllerReturnValueError("Return Value of Controller does not fulfill the required syntax. Please check the documentation.");
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

	/* parse multipart/form-data (provided by a XMLHttpRequest with FormData) */
    app.use(multer().fields([]), (req, res, next) => {
    	next();
    });

	app.use((req, res) => {
		const calledUrl = req.path;
		console.log(`\n\nCalling ressource "${calledUrl} with method ${req.method}".`);

        reloadDatabase()
			.then(prepareRoutes.bind(null, config))
			.then(routes => { //TODO different error msg, if no route found

				// loop will stop early, if a route for called url was found
				for (let index = 0; index < routes.length; ++index) {
					const route = routes[index];
					const isDefinedRoute = new RegExp(route.urlRegex).test(calledUrl);
					const isDefinedMethod = route.method.includes(req.method.toLowerCase());
					
					if (isDefinedRoute && isDefinedMethod) {
						console.log(`Found matching route with index ${index}`);
						let result = {};
						const params = parseParams(req, route, res);
						
						if (isDefined(route.static)) {
							const pathToFile = resolveStatic(calledUrl, route);
							result = serveStatic(pathToFile, params, res);
						}
                        const sessionData = parseSession(req, res, params);

						if (isDefined(route.page)) {
							const pathToFile = resolvePage(calledUrl, route.page);
							result = servePage(pathToFile, params, sessionData);
						}
						if (isDefined(route.controller)) {
							result = serveController(res, route.controller.file, route.controller.function, params, sessionData);
						}

						if (!(result instanceof Error)) {
							return result;
						}
					}
				}
				throw RouteNotFoundError(`Could not find any matching route definition for called url ${calledUrl}.`);

			}).then(result => {
				const validate = (isDefined(result.validation) && result.validation.html)
					|| (!isDefined(result.validation) && config.validator.html);

				if (!res.finished && result && result.html && validate) {
					return validateHtml(result);
				} else {
					return Promise.resolve(result);
				}
			}).then(result => {
            const validate = (isDefined(result.validation) && result.validation.css)
                || (!isDefined(result.validation) && config.validator.css);

				if (!res.finished && result && result.html && validate) {
					return validateCss(result);
				} else {
					return Promise.resolve(result);
				}
			}).then(result => {
				// check, if result was already sent
				//   i.e. when serving static content
				//        express' function "sendFile" already handles the response
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
			}).finally();
	});

	// TODO: do a server restart if configuration (i.e. port) has changed
	app.listen({
		port: config.port
	}, () => {
		console.log(`\nServer listening on http://localhost:${config.port}/\n`);
	});
}

export function loadJson(documentName) {
	try {
        return openJson(documentName, 'data');
	} catch(error) {
		throw JsonParseError(`data/${documentName}.json`, error.message);
	}
}

export function saveJson(documentName, obj) {
    try {
        return writeJson(documentName, obj, 'data');
    } catch(error) {
        throw JsonParseError(`data/${documentName}.json`, obj, error.message);
    }
}
