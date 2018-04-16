'use strict';

import htmlValidator from 'html-validator';
import cssValidator from 'css-validator';

import { exists, openFile } from './ressource-utils';

const { HtmlValidationError, CssValidationError, FileNotFoundError } = require('./customError.js');


export function validateHtml(html) {
	const options = { format: 'text', data: html };

	return htmlValidator(options)
		.then(result => {
			if (result.includes('Error:')) {
				throw HtmlValidationError(result, html);
			} else {
				return Promise.resolve(html);
			}
		});
}

export function validateCss(html) {
	const regex = /(<link.*href=\")(.*.css)(\")/g;
	let match = regex.exec(html);
	let queue = Promise.resolve(html);

	while (match != null) {
		const pathToFile = match[2];

		if (exists(pathToFile)) {
			const file = openFile(pathToFile);

			queue = queue.then(_  => new Promise((resolve, reject) => {
				cssValidator(file, (error, result) => {
					if (error) {
						reject(CssValidationError(error, html));
					}
					if (!result.validity) {
						const message = result.errors.map(err => err.message).join('\n');
						reject(CssValidationError(message, html, file));
					}
					resolve(html);
				});
			}));

		} else {
			return Promise.reject(FileNotFoundError(`Could not find Stylesheet ${pathToFile}`));
		}

		match = regex.exec(html);
	}

	return queue;
}