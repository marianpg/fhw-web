'use strict';

import fs from 'fs';
import path from 'path';
import htmlValidator from 'html-validator';
import cssValidator from 'css-validator';

const { HtmlValidationError, CssValidationError } = require('./customError.js');


export function html(htmlStr) {
	const options = { format: 'text', data: htmlStr };

	return htmlValidator(options)
		.then(result => {
			if (result.includes('Error:')) {
				throw HtmlValidationError(result, htmlStr);
			}
		});
}

export function css(cssFilename) {
	const fname = cssFilename.includes('.css') ? cssFilename : cssFilename + '.css';
	const file = fs.readFileSync(path.join(process.cwd(), 'assets', fname), 'utf8');

	cssValidator(file, (error, result) => {
		if (error) {
			throw CssValidationError(error);
		}
		if (!result.validity) {
			const message = result.errors.map(err => err.message).join('\n');
			throw CssValidationError(message, file);
		}
	});
}