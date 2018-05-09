'use strict';

import { isDefined } from './helper';
const htmlEscape = require('html-escape');
const errorColor = '#b30000';

function wrapInBody(innerHtml = '') {
	return `<body style="background-color: ${errorColor};">\n${innerHtml}\n</body>`
}

function styleBody(top, tail) {
	return `${top} style="background-color: ${errorColor};" ${tail}`;
}

function renderError(html, shouldBeHidden) {
	const style = shouldBeHidden ? 'style="display: none;"' : '';

	return `<!-- Error Description in hidden div below -->\n
			<div title="Error Description" ${style}>${html}</div>`
}

function generateErrorPage(error) {
	let html = error.html ? error.html : '';

	const rawExtract = error.extract ? error.extract : '';
	const extract = rawExtract.length === 0 ? rawExtract : rawExtract.split('\n').map((line, index) => {
		const lineNo = index + 1;
		const p = `${lineNo} ${htmlEscape(line)}`;

		return p;
	}).join('\n');

	let stacktrace = error.stack ? error.stack : '';
	stacktrace = htmlEscape(stacktrace).split('\n').join('<br>');

	const regex = /(<body)([\s\S]*)/g;
	const match = regex.exec(html);

	if (isDefined(match) && isDefined(match[1]) && isDefined(match[2])) {
		html = styleBody(match[1], match[2]);
	} else {
		html = wrapInBody(html);
	}

	const shouldBeHidden = isDefined(error.html) && error.html.length > 0;

	const description = renderError(` 
		<h1>An ${error.name} occured:</h1>\n 
		<code name="stacktrace" style="white-space: pre-line">${stacktrace}</code>\n
		<pre name="extract">${extract}</pre>\n
		<div name="raw-extract" style="display: none;">${htmlEscape(rawExtract)}</div>
	`, shouldBeHidden);

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
class RessourceNotFoundError extends ExtendableError {}
class FileNotFoundError extends ExtendableError {}
class FunctionNotFoundError extends ExtendableError {}
class HtmlValidationError extends ExtendableError {}
class CssValidationError extends ExtendableError {}
class RouteDefinitionError extends ExtendableError {}
class JsonParseError extends ExtendableError {}
class SessionSaveError extends ExtendableError {}


export function isConnectionError(error) {
	return (error.code === 'ENOTFOUND') && (error.syscall === 'getaddrinfo');
}

module.exports = {
	// Für "übersehene Fehler" - also nicht behandelte bzw. nicht beachtete Fehlerfälle.
	generateErrorPage,
	isConnectionError,
	NotImplementedError(message) { return new NotImplementedError(message, 500); },
	FileNotFoundError(message) { return new FileNotFoundError(message, 404); },
	FunctionNotFoundError(message) { return new FunctionNotFoundError(message, 500); },
	RessourceNotFoundError(message) { return new RessourceNotFoundError(message, 404); },
	HtmlValidationError(message, html, extract = html) { return new HtmlValidationError(message, 500, html, extract); },
	CssValidationError(message, html, extract) { return new CssValidationError(message, 500, html, extract); },
	RouteDefinitionError(message) { return new RouteDefinitionError(message, 500); },
	JsonParseError(message) { return new JsonParseError(message, 500); },
	SessionSaveError(message) { return new SessionSaveError(message, 500); },
};

