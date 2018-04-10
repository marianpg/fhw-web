'use strict';

var fs = require('fs');
var path = require('path');
var htmlValidator = require('html-validator');
var cssValidator = require('css-validator');

var _require = require('./customError.js'),
    HtmlValidationError = _require.HtmlValidationError,
    CssValidationError = _require.CssValidationError;

async function validateHtml(html) {
	var options = { format: 'text', data: html };

	return htmlValidator(options).then(function (result) {
		if (result.includes('Error:')) {
			throw HtmlValidationError(result, html);
		}
	});
}

async function validateCss(cssFilename) {
	var fname = cssFilename.includes('.css') ? cssFilename : cssFilename + '.css';
	var file = fs.readFileSync(path.join(process.cwd(), 'assets', fname), 'utf8');

	cssValidator(file, function (error, result) {
		if (error) {
			throw CssValidationError(error);
		}
		if (!result.validity) {
			var message = result.errors.map(function (err) {
				return err.message;
			}).join('\n');
			console.log("mar", message);
			throw CssValidationError(message, file);
		}
	});
}

module.exports = {
	html: validateHtml,
	css: validateCss
};