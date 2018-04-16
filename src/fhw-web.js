'use strict';

import express from 'express';

import compile from './compile';
const { generateErrorPage, NotImplementedError } = require('./customError');
import { validateHtml, validateCss } from './validator';
import defaultConfig from './defaultConfig';
import prepareRoutes from './routes';
import { loadJson, resolveRessource } from './file-utils';
import { isObject, isDefined } from './helper';

import path from 'path'


// use the defaultConfig as a basis
// overwrite only entries which are user defined
function combineConfiguration(userConfig) {
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

function serveStatic(pathToStatic, res) {
	const options = {};

	return new Promise((resolve, reject) => {
		res.sendFile(pathToStatic, options, error => {
			if (error) {
				return reject(error); //TODO: CustomError Class
			} else {
				return resolve(true);
			}
		})
	});
}

function servePage(pathToPage, params = {}) {
	const frontmatter = { global: loadJson('global.json') };

	return new Promise((resolve, reject) => {
		const html = compile(pathToPage, frontmatter);
		resolve(html);
	});
}

function serveJson() {
	throw NotImplementedError("Serving Json-Response is not implemented");
}

function serveContent() {
	throw NotImplementedError("Serving plain text content is not implemented");
}

function controller() {
	throw NotImplementedError("Controller is not implemented");
}

function serveController(pathToController, params = {}) {
	throw NotImplementedError("Controller is not implemented");

	return controller().then(result => {
		if (isDefined(result.page)) {
			return servePage();
		} else if (isDefined(result.json)) {
			return serveJson();
		} else if (isDefined(result.content)) {
			return serveContent();
		} else {
			return Promise.reject("Return Value of Controller is not defined");
		}
	})
}

// TODO: Klären: url "/item/:id/price" würde ohne controller eine Suche nach einer page "/pages/item/id42/price" auslösen.
function parseParams(req, route) {
	let url = req.originalUrl;
	let params = { path: {}, get: {}, post: {} };



	return { url, params }
}

/*
	userConfig ::= { <port> }

	port ::= <Integer>
 */
export function start(userConfig) {
	const app = express();
	let config = combineConfiguration(userConfig);

	app.use((req, res) => {
		prepareRoutes(config)
			.then(routes => {
				// loop will stop early, if a route for called url was found
				for (let index = 0; index < routes.length; ++index) {
					const route = routes[index];
					const { url, params } = parseParams(req, route);
					const pathToRessource = resolveRessource(url, route);

					if (new RegExp(route.url).test(req.originalUrl)) {
						if (isDefined(route.static)) {
							console.log("serve static", pathToRessource);
							return serveStatic(pathToRessource, res);
						}

						if (isDefined(route.page)) {
							console.log("serve page", pathToRessource);
							return servePage(pathToRessource, params);
						}
						if (isDefined(route.controller)) {
							console.log("serve controller", pathToRessource);
							return serveController(pathToRessource, params);
						}
					}
				}
			}).then(html => {
				if (html && config.validator.html) {
					return validateHtml(html);
				} else {
					return Promise.resolve(html);
				}
			}).then(html => {
				if (html && config.validator.css) {
					return validateCss(html);
				} else {
					return Promise.resolve(html);
				}
			}).then(html => {
				// TODO: PageNotFound missing
				// check, if result was already sent
				//   i.e. when serving static content
				//   express' function "sendFile" already handles the response
				if (!res.finished) {
					console.log("sending success response");
					res.status(200);
					res.send(html);
				} else if (html) {
					console.log("Unexpected Server Error with Code 1. Please send a report to mpg@fh-wedel.de.");
				}
			}).catch(error => {
				// TODO: CustomError?
				console.log("sending error response");
				if (!res.finished) {
					res.status(500);
					res.send(generateErrorPage(error));
				} else {
					console.log("Unexpected Server Error with Code 2. Please send a report to mpg@fh-wedel.de.");
				}
			});
	});

	// TODO: do a server restart if configuration (i.e. port) has changed
	app.listen({
		port: config.port
	}, () => {
		console.log(`Server listening on http://localhost:${config.port}/`);
	});
}