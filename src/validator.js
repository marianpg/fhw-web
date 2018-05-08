'use strict';

import htmlValidator from 'html-validator';
import cssValidator from 'w3c-css';


import { exists, openFile } from './ressource-utils';
import { isDefined } from './helper';

const { HtmlValidationError, CssValidationError, FileNotFoundError, isConnectionError } = require('./customError.js');


export function validateHtml(result) {
	const options = { format: 'text', data: result.html };

	return htmlValidator(options)
		.then(evaluation => {

			if (isDefined(evaluation) && (evaluation.includes('Error:') || evaluation.includes('Warning:'))) {
				throw HtmlValidationError(evaluation, result.html);
			} else {
				return Promise.resolve(result);
			}
		}).catch(error => {
			if (isDefined(error)) {
				if (isConnectionError(error)) {
					console.log("Warning (HTML): could not establish internet connection to the html validator: validation skipped.");
				} else {
					throw HtmlValidationError(error, result.html);
				}
			}
			return Promise.resolve(result);
		});
}

export function validateCss(result) {
	const regex = /(<link.*href=\")(.*.css)(\")/g;
	let match = regex.exec(result.html);
	let queue = Promise.resolve(result.html);

	while (match != null) {
		const pathToFile = match[2].startsWith('/') ? match[2].substr(1) : match[2];

		if (!pathToFile.includes('http')) {
			if (exists(pathToFile)) {
				const file = openFile(pathToFile);
				const cssValidatorOptions = {
					text: file,
					profile: "css3"
				};

				queue = queue.then(_  => new Promise((resolve, reject) => {
					cssValidator.validate(cssValidatorOptions, (error, evaluation) => {
						if (isDefined(error)) {
							if (isConnectionError(error)) {
								console.log("Warning (CSS): could not establish internet connection to the css validator: validation skipped.");
								resolve(result);
							} else {
								reject(CssValidationError(error, result.html));
							}

						} else if (isDefined(evaluation) && isDefined(evaluation.errors) && evaluation.errors.length > 0) {
							const msg = evaluation.errors.map(err => `${err.message.trim()} (in line ${err.line})`).join('\n');
							reject(CssValidationError(msg, result.html, file));

						} else if (isDefined(evaluation) && isDefined(evaluation.warnings) && evaluation.warnings.length > 0) {
							// TODO: render Warning Page
							const msg = evaluation.warnings.map(err => `${err.message.trim()} (in line ${err.line})`).join('\n');
							reject(CssValidationError(msg, result.html, file));

						} else {
							resolve(result);
						}
					});
				}));

			} else {
				return Promise.reject(FileNotFoundError(`Could not find Stylesheet ${pathToFile}`));
			}
		}

		match = regex.exec(result.html);
	}

	return queue;
}