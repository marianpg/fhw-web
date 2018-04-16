'use strict';

import fs from 'fs';
import path from 'path';
import yamlToJson from 'js-yaml'; //TODO: JSON only!
import handlebars from 'handlebars';
const { FileNotFoundError } = require('./customError');

import { exists, contains, convert } from './ressource-utils';



/**
 * Calculates a meaningfully indented version of the
 * current context.
 */

function registerGlobalHelpers(handlebarsEnv) {
	handlebarsEnv.registerHelper('debugJson', function(context, options) {
		const pageData = context.data.root;
		const toReturn = `<pre>${JSON.stringify(pageData, null, 2)}</pre>`;
		return (new handlebars.SafeString(toReturn));
	});
}

function createHandlebarsEnv() {
    const handlebarsEnv = handlebars.create();
    registerGlobalHelpers(handlebarsEnv);

    return handlebarsEnv;
}

// kein 'precompile' von Handlebars!
function prepareCompile(url, startDir, frontmatter) {
	const preparedUrl = convert(url);
	const filename = path.basename(preparedUrl);
	const directory = path.join(startDir, path.dirname(preparedUrl));

	if (exists(directory) && contains(directory, filename)) {

		const file = fs.readFileSync(path.join(directory, filename), 'utf8');
		const fileSplitted = file.split('---');

		const yaml = fileSplitted.length > 1 ? fileSplitted[0] : '' ;
		const hbs = fileSplitted.length > 1 ? fileSplitted[1] : fileSplitted[0] ;

		const frontmatterLocal = yamlToJson.safeLoad(yaml) || {};
		const page = Object.assign({}, frontmatter.page, frontmatterLocal);
		const frontmatterCombined = Object.assign({}, { page: page }, { global: frontmatter.global });

		console.log(`Output for       : ${url}`);
		console.log(`Frontmatter JSON : ${JSON.stringify(frontmatterLocal)}`);
		console.log(`Complete JSON    : ${JSON.stringify(frontmatterCombined)}`);
		console.log('\n');

		return { hbs, frontmatterCombined}
	} else {
	    throw FileNotFoundError(`File ${filename} not found in Directory ${directory}`);
    }
}


export default function compile(url, frontmatter = {}, dir = 'pages', contentHtml = '') {
    const { hbs, frontmatterCombined } = prepareCompile(url, dir, frontmatter);
    const handlebarsEnv = createHandlebarsEnv();

	handlebarsEnv.registerHelper('content', function() {
		return new handlebarsEnv.SafeString(contentHtml);
	});


	handlebarsEnv.registerHelper('include', function(fname) {
		const html = compile(fname, frontmatterCombined, 'templates');
		return new handlebarsEnv.SafeString(html);
    });

	let templateName = '';
	if ('template' in frontmatterCombined['page']) {
		templateName = frontmatterCombined['page']['template'];
		delete frontmatterCombined['page']['template'];
	}

	const template = handlebarsEnv.compile(hbs);
	let htmlCompiled = template(frontmatterCombined);

	if (templateName !== '') {
		htmlCompiled = compile(templateName, frontmatterCombined, 'templates', htmlCompiled);
	}

	return htmlCompiled.trim();
}