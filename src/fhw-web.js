'use strict';

const express = require('express');
const compile = require('./compile');
const fs = require('fs');
const path = require('path');
const { generateErrorPage } = require('./customError');
const validator = require('./validator');

const config = {
	validator: {
		html: false
	}
};

const app = express();

app.use('/assets', express.static('assets'));
app.use('/docs', express.static('docs/_build/html'));


function loadGlobalFrontmatter() {
	return fs.existsSync(path.join(process.cwd(), 'global.json'))
		? { global: JSON.parse(fs.readFileSync('global.json', 'utf8')) }
		: {};
}


// request handler
app.use(async function(req, res) {
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
});

const host = 'localhost';
const port = 8080;
app.listen(port);

console.log(`Server listening on http://${host}:${port}/`);