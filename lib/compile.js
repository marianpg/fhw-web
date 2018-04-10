'use strict';

var path = require('path');
var fs = require('fs');
var yamlToJson = require('js-yaml');
var handlebars = require('handlebars');

var _require = require('./customError'),
    FileNotFoundError = _require.FileNotFoundError;

var validator = require('./validator');

function contains(directory, entry) {
	var fileList = fs.readdirSync(directory);
	var found = fileList.map(function (aEntry) {
		return aEntry === entry;
	}).reduce(function (val, cur) {
		return val || cur;
	}, false);

	return found;
}

// Entfernt Anker
// Entfernt Query-Parameter
// Ergänzt Ordnerpfade um ein 'index.html'
// Ergänzt fehlende Dateierweiterung um '.html'
function convert(url) {
	var result = url === '' ? '/' : url;

	result = result.match(/([\/\.0-9a-zA-Z-]+)(?=[\?#])?/g)[0] || result;

	if (result.slice(-1) === '/') {
		result += 'index.hbs';
	}

	if (result.indexOf('.hbs') === -1) {
		result += '.hbs';
	}

	return result;
}

/**
 * Calculates a meaningfully indented version of the
 * current context.
 */

function registerGlobalHelpers(handlebarsEnv) {
	handlebarsEnv.registerHelper('debugJson', function (context, options) {
		var pageData = context.data.root;
		var toReturn = '<pre>' + JSON.stringify(pageData, null, 2) + '</pre>';
		return new handlebars.SafeString(toReturn);
	});
}

function createHandlebarsEnv() {
	var handlebarsEnv = handlebars.create();
	registerGlobalHelpers(handlebarsEnv);

	return handlebarsEnv;
}

// kein 'precompile' von Handlebars!
function prepareCompile(url, startDir, frontmatter) {
	var preparedUrl = convert(url);
	var filename = path.basename(preparedUrl);
	var directory = path.join(process.cwd(), startDir, path.dirname(preparedUrl));

	if (fs.existsSync(directory) && contains(directory, filename)) {

		var file = fs.readFileSync(path.join(directory, filename), 'utf8');
		var fileSplitted = file.split('---');

		var yaml = fileSplitted.length > 1 ? fileSplitted[0] : '';
		var hbs = fileSplitted.length > 1 ? fileSplitted[1] : fileSplitted[0];

		var frontmatterLocal = yamlToJson.safeLoad(yaml) || {};
		var page = Object.assign({}, frontmatter.page, frontmatterLocal);
		var frontmatterCombined = Object.assign({}, { page: page }, { global: frontmatter.global });

		console.log('Output for       : ' + url);
		console.log('Frontmatter JSON : ' + JSON.stringify(frontmatterLocal));
		console.log('Complete JSON    : ' + JSON.stringify(frontmatterCombined));
		console.log('\n');

		return { hbs: hbs, frontmatterCombined: frontmatterCombined };
	} else {
		throw FileNotFoundError('File ' + filename + ' not found in Directory ' + directory);
	}
}

function compile(url) {
	var frontmatter = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
	var dir = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'pages';
	var contentHtml = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : '';

	var _prepareCompile = prepareCompile(url, dir, frontmatter),
	    hbs = _prepareCompile.hbs,
	    frontmatterCombined = _prepareCompile.frontmatterCombined;

	var handlebarsEnv = createHandlebarsEnv();

	handlebarsEnv.registerHelper('content', function () {
		return new handlebarsEnv.SafeString(contentHtml);
	});

	handlebarsEnv.registerHelper('include', function (fname) {
		var html = compile(fname, frontmatterCombined, 'templates');
		return new handlebarsEnv.SafeString(html);
	});

	/* css Validierung
 if ('styles' in frontmatterCombined['page']) {
 	frontmatterCombined['page']['styles'].forEach(fname => validator.css(fname));
 }*/

	var templateName = '';
	if ('template' in frontmatterCombined['page']) {
		templateName = frontmatterCombined['page']['template'];
		delete frontmatterCombined['page']['template'];
	}

	var template = handlebarsEnv.compile(hbs);
	var htmlCompiled = template(frontmatterCombined);

	if (templateName !== '') {
		htmlCompiled = compile(templateName, frontmatterCombined, 'templates', htmlCompiled);
	}

	return htmlCompiled.trim();
}

module.exports = compile;