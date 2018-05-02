'use strict';

import htmlValidator from './html-validator';
import cssValidator from 'css-validator';


import { exists, openFile } from './ressource-utils';
import { isDefined } from './helper';

const { HtmlValidationError, CssValidationError, FileNotFoundError, isConnectionError } = require('./customError.js');


export function validateHtml(html) {
	const options = { format: 'text', data: html };

	return htmlValidator(options)
		.then(result => {
			console.log(result);
			if (isDefined(result) && result.includes('Error:')) {
				throw HtmlValidationError(result, html);
			} else {
				return Promise.resolve(html);
			}
		}).catch(error => {
			if (isDefined(error)) {
				if (isConnectionError(error)) {
					console.log("Warning (HTML): could not establish internet connection to the html validator: validation skipped.");
				} else {
					throw HtmlValidationError(error, html);
				}
			}
			return Promise.resolve(html);
		});
}

export function validateCss(html) {
	const regex = /(<link.*href=\")(.*.css)(\")/g;
	let match = regex.exec(html);
	let queue = Promise.resolve(html);

	while (match != null) {
		const pathToFile = match[2];

		if (!pathToFile.includes('http')) {
			if (exists(pathToFile)) {
				const file = openFile(pathToFile);

				queue = queue.then(_  => new Promise((resolve, reject) => {
					cssValidator(file, (error, result) => {
						if (isDefined(error) && !isConnectionError(error)) {
							if (isConnectionError(error)) {
								console.log("Warning (CSS): could not establish internet connection to the css validator: validation skipped.");
								resolve(html);
							} else {
								reject(CssValidationError(error, html));
							}
						} else if (isDefined(result) && !result.validity) {
							const msg = result.errors.map(err => `${err.message.trim()} in line ${err.line}.`).join('\n');
							reject(CssValidationError(msg, html, file));
						} else {
							resolve(html);
						}
					});
				}));

			} else {
				return Promise.reject(FileNotFoundError(`Could not find Stylesheet ${pathToFile}`));
			}
		}

		match = regex.exec(html);
	}

	return queue;
}