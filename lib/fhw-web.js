'use strict';

var express = require('express');
var compile = require('./compile');
var fs = require('fs');
var path = require('path');

var _require = require('./customError'),
    generateErrorPage = _require.generateErrorPage;

var validator = require('./validator');

var config = {
	validator: {
		html: false
	}
};

var app = express();

app.use('/assets', express.static('assets'));
app.use('/docs', express.static('docs/_build/html'));

function loadGlobalFrontmatter() {
	return fs.existsSync(path.join(process.cwd(), 'global.json')) ? { global: JSON.parse(fs.readFileSync('global.json', 'utf8')) } : {};
}

// request handler
app.use(async function (req, res) {
	var html = '';
	var status = 200;

	try {
		// TODO: json validation
		var frontmatterGlobal = loadGlobalFrontmatter();
		html = await compile(req.originalUrl, frontmatterGlobal);
		if (config.validator.html) {

			await validator.html(html);
		}
	} catch (error) {
		html = generateErrorPage(error);
		status = error.status || 500;
	} finally {
		res.status(status);
		res.send(html);
	}
});

var host = 'localhost';
var port = 8080;
app.listen(port);

console.log('Server listening on http://' + host + ':' + port + '/');