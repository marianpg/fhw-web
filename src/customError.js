'use strict';

const htmlEscape = require('html-escape');

function generateErrorPage(error) {
	let extract = error.extract ? error.extract : '';
	extract = extract.split('\n').map((line, index) => (index+1).toString() + '\t' + line).join('\n');

	return `<h1> An ${error.name} occured:</h1>` +
		`<code style="white-space: pre-line">${error.stack}</code>` +
		`<pre style="background-color: lightgrey;">${htmlEscape(extract)}</pre>`;
}

// based on https://stackoverflow.com/a/32749533
class ExtendableError extends Error {
	constructor(message, status = 500, extract = '') {
		super(message);
		this.name = this.constructor.name;
		this.status = status;
		this.extract = extract;

		if (typeof Error.captureStackTrace === 'function') {
			Error.captureStackTrace(this, this.constructor);
		} else {
			this.stack = (new Error(message)).stack;
		}
	}
}


class FileNotFoundError extends ExtendableError {}
class HtmlValidationError extends ExtendableError {}
class CssValidationError extends ExtendableError {}



module.exports = {
	// Für "übersehene Fehler" - also nicht behandelte bzw. nicht beachtete Fehlerfälle.
	generateErrorPage,
	FileNotFoundError(message) { return new FileNotFoundError(message, 404); },
	HtmlValidationError(message, extract) { return new HtmlValidationError(message, 500, extract); },
	CssValidationError(message, extract) { return new CssValidationError(message, 500, extract); }
};

