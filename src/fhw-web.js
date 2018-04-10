'use strict';

const express = require('express');
const compile = require('./compile');
const fs = require('fs');
const path = require('path');
const { generateErrorPage } = require('./customError');
const validator = require('./validator');

const app = express();


const config = {
	validator: {
		html: false
	}
};


function loadGlobalFrontmatter() {
	return fs.existsSync(path.join(process.cwd(), 'global.json'))
		? { global: JSON.parse(fs.readFileSync('global.json', 'utf8')) }
		: {};
}


// request handler
function magicRoutes() {
	return async function(req, res) {
		let html = '';
		let status = 200;

		try {
			// TODO: json validation
			const frontmatterGlobal = loadGlobalFrontmatter();
			html = await compile(req.originalUrl, frontmatterGlobal);
			if (config.validator.html) {

				await validator.html(html);
			}

		} catch(error) {
			html = generateErrorPage(error);
			status = error.status || 500;

		} finally {
			res.status(status);
			res.send(html);
		}
	}
}

/*
	userConfig ::= { <port> }

	port ::= <Integer>
 */
function start(userConfig) {
	const port = userConfig.port || 8080;

	app.use('/assets', express.static('assets'));
	app.use(magicRoutes());

	app.listen(port);
	console.log(`Server listening on http://localhost:${port}/`);
}

module.exports = {
	start
};