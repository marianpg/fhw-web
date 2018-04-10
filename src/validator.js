'use strict';

const fs = require('fs');
const path = require('path');
const htmlValidator = require('html-validator');
const cssValidator = require('css-validator');

const { HtmlValidationError, CssValidationError } = require('./customError.js');


async function validateHtml(html) {
	const options = { format: 'text', data: html };

	return htmlValidator(options)
		.then(result => {
			if (result.includes('Error:')) {
				throw HtmlValidationError(result, html);
			}
		});
}

async function validateCss(cssFilename) {
	const fname = cssFilename.includes('.css') ? cssFilename : cssFilename + '.css';
	const file = fs.readFileSync(path.join(process.cwd(), 'assets', fname), 'utf8');

	cssValidator(file, (error, result) => {
		if (error) {
			throw CssValidationError(error);
		}
		if (!result.validity) {
			const message = result.errors.map(err => err.message).join('\n');
			console.log("mar", message);
			throw CssValidationError(message, file);
		}
	});
}

module.exports = {
	html: validateHtml,
	css: validateCss
};