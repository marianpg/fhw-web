'use strict';

import express from 'express';
import bodyParser from 'body-parser';

import compile from './compile';
const { generateErrorPage } = require('./customError');
import * as validator from './validator';
import defaultConfig from './defaultConfig';
import routes from './routes';
import { loadJson } from './file-utils';
import { conditionalPromise, isObject, isUndefined } from './helper';

const app = express();/*
app.use(function(req, res, next) {
	if (req.method === "POST") {
		req.headers['content-type'] = 'application/json';
	}
	next();
});*/
//app.use(bodyParser.json());


// request handler
function magicRoutes(config) {
	return function(req, res) {
		let html = '';
		let status = 200;

		// TODO: json validation
		const frontmatterGlobal = { global: loadJson('global.json') };
		html = compile(req.originalUrl, frontmatterGlobal);

		conditionalPromise(config.validator.css, validator.html(html))
			.then(() => conditionalPromise(config.validator.html, validator.html(html)))
			.catch((error) => {
				html = generateErrorPage(error);
				status = error.status || 500;
			})
			.finally(() => {
				res.status(status);
				res.send(html);
			});
	}
}

// use the defaultConfig as a basis
// overwrite only entries which are user defined
function combineConfiguration(userConfig) {

	function combineObjects(defaultObj, userObj) {
		return Object.keys(defaultObj).reduce((acc, key) => {

			acc[key] = isObject(defaultObj[key]) && !isUndefined(userObj[key])
				? combineObjects(defaultObj[key], userObj[key])
				: defaultObj[key];

			return acc;
		}, {});
	}

	return combineObjects(defaultConfig, userConfig);
}
/*
	userConfig ::= { <port> }

	port ::= <Integer>
 */
export function start(userConfig) {
	const config = combineConfiguration(userConfig);

	app.use('/assets', express.static('assets'));

	app.use(magicRoutes(config));
	//routes(app, config);

	app.listen(config.port);
	console.log(`Server listening on http://localhost:${config.port}/`);
}