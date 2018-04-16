'use strict';

const htmlEscape = require('html-escape');

function wrapInBody(innerHtml = '') {
	return `<body style="background-color: red;">\n${innerHtml}\n</body>`
}

function styleBody(body) {
	const regex = /(<body)([\s\S]*)/g;
	const match = regex.exec(body);
	const top = match[1];
	const tail = match[2];
	return `${top} style="background-color: red;" ${tail}`;
}

function renderError(html) {
	//return `<!--${htmlEscape(html)}-->`
	return `<div style="display: none;">${html}</div>`
}

function generateErrorPage(error) {
	let html = error.html ? error.html : '';
	let extract = error.extract ? error.extract : '';
	extract = htmlEscape(extract.split('\n').map((line, index) => (index+1).toString() + '\t' + line).join('\n'));
	let stacktrace = error.stack ? error.stack : '';
	stacktrace = htmlEscape(stacktrace).split('\n').join('<br>');

	if (!html.includes('body')) {
		html = wrapInBody(html);
	} else {
		html = styleBody(html);
	}

	const description = renderError(`<h1>An ${error.name} occured:</h1>\n<p>${stacktrace}</p>\n<code>${extract}</code>\n`);

	return `${description}${html}`;
}

// based on https://stackoverflow.com/a/32749533
class ExtendableError extends Error {
	constructor(message, status = 500, html = '', extract = '') {
		super(message);
		this.name = this.constructor.name;
		this.status = status;
		this.html = html;
		this.extract = extract;

		if (typeof Error.captureStackTrace === 'function') {
			Error.captureStackTrace(this, this.constructor);
		} else {
			this.stack = (new Error(message)).stack;
		}
	}
}


class NotImplementedError extends ExtendableError {}
class FileNotFoundError extends ExtendableError {}
class HtmlValidationError extends ExtendableError {}
class CssValidationError extends ExtendableError {}
class RouteDefinitionError extends ExtendableError {}



module.exports = {
	// Für "übersehene Fehler" - also nicht behandelte bzw. nicht beachtete Fehlerfälle.
	generateErrorPage,
	NotImplementedError(message) { return new NotImplementedError(message, 500); },
	FileNotFoundError(message) { return new FileNotFoundError(message, 404); },
	HtmlValidationError(message, html, extract = html) { return new HtmlValidationError(message, 500, html, extract); },
	CssValidationError(message, html, extract) { return new CssValidationError(message, 500, html, extract); },
	RouteDefinitionError(message) { return new RouteDefinitionError(message, 500); },
};

