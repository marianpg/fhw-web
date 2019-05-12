'use strict';

import fs from 'fs';
import path from 'path';
import promisedHandlebars from 'promised-handlebars';
import handlebars from 'handlebars';
import { FileNotFoundError, HelperAlreadyDeclared, WrongFiletypeError } from './customError';

import { exists, contains, convert, listFiles, loadDynamicModule, toAbsolutePath } from './ressource-utils';
import { objectFlatMap, isJson, isYaml, parseJson, parseYaml, mergeObjects, unpackSqlResult } from './helper';


function registerCustomHelpers(handlebarsEnv) {
	const helpersDirectory = 'helpers';
	const regex = /(.+)(.js)/; // only *.js files with at least one character filenames

	if (exists(helpersDirectory)) {
        let allHelpers = []; // element := { modulename, funcname }
		listFiles(helpersDirectory).forEach(filename => {
			const match = regex.exec(filename);

			if (match) {
				const modulename = match[1];
				const module = loadDynamicModule(modulename, helpersDirectory);
				if (module instanceof Error) {
					throw module;
				}

				Object.keys(module).forEach(funcname => {
                    const newHelper = {modulename, funcname};

                    allHelpers.forEach(cur => {
                        if (cur.funcname === newHelper.funcname) {
                            throw HelperAlreadyDeclared(`Helper "${newHelper.funcname}" declared in "${newHelper.modulename}.js" already declared in "${cur.modulename}.js"`);
                        }
                    });
                    allHelpers.push(newHelper);

                    handlebarsEnv.registerHelper(funcname, function() {
                        const args = [...arguments];
                        args.pop(); // last argument contains an options object, we do not need it here
                        return module[funcname](...args);
                    });
				});

			}
		})
	}
}


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
    //const handlebarsEnv = handlebars.create();
    const handlebarsEnv = promisedHandlebars(handlebars);

    registerGlobalHelpers(handlebarsEnv);
    registerCustomHelpers(handlebarsEnv);

    return handlebarsEnv;
}
/*
const Sequelize = require('sequelize');
const sequelize = new Sequelize('database', null, null, {
	dialect: 'sqlite',
	storage: 'data/database.db'
});
sequelize
	.authenticate()
	.then( _ => {
		console.log('Connected to database.');
	});
*/
// TODO: figure out how to reload database only if database is for a page/fragment request needed. Otherwise t
export function reloadDatabase() {
    return new Promise((resolve, reject) => {
		resolve(true);
	})
}
/*
function runSql(key, maybeSql, params) {
	return new Promise((resolve, reject) => {
		sequelize.query(maybeSql,
			{ replacements: params }
		).then(result => {
			resolve({[key]: unpackSqlResult(result[0])});
		})
		.catch(error => {
			resolve({[key]: maybeSql});
		})
	});
}

// TODO: Zurzeit wird eine "/data/database.sql" Datei erwartet. Mehrere Dateien erlauben? Wie sinnvoll verknüpfen?
function parseAndExecuteSql(frontmatter, requestParams) {
	const params = mergeObjects(requestParams.path, requestParams.get, requestParams.post);

    return new Promise((resolve, reject) => {
        let promises = Object.keys(frontmatter).map(key => {
            return runSql(key, frontmatter[key], params);
        });

        Promise.all(promises).then(values => {
            resolve(objectFlatMap(values));
        });
    });
}
*/
// Todo: global configuration "onlyJson"/"onlyYaml"/"both"
export function parseFrontmatter(frontmatter, filename, requestParams) {
	let result = {};
	/*
	if (isJson(frontmatter)) {
        result= parseJson(frontmatter, filename);
	} else if (isYaml(frontmatter)) {
        result = parseYaml(frontmatter, filename);
	} else {
        throw WrongFiletypeError(`Wrong filestructure in file ${filename}. It neither contains well-formed json or yaml.`);
	}
	*/
	if (isJson(frontmatter)) {
		result= parseJson(frontmatter, filename);
	} else {
		throw WrongFiletypeError(`Wrong filestructure in file ${filename}. It does not contain well-formed json.`);
	}

	/*result = parseAndExecuteSql(result, requestParams);*/

	return new Promise((resolve, reject) => {
		resolve(result);
	});
}

// kein 'precompile' von Handlebars!
function prepareCompile(url, startDir, frontmatter) {
	console.log('prepareCompile', url);
	const preparedUrl = convert(url);
	const filename = path.basename(preparedUrl);
	const directory = path.join(startDir, path.dirname(preparedUrl));

	console.log(`Going to compile file ${filename} from directory ${directory}`);

	if (exists(directory) && contains(directory, filename)) {

		const file = fs.readFileSync(path.join(directory, filename), 'utf8');
		const fileSplitted = file.split('---');

		let fmatter = fileSplitted.length > 1 ? fileSplitted[0] : '{}';
		let hbs = fileSplitted.length > 1 ? fileSplitted[1] : fileSplitted[0];

		if (fileSplitted.length > 2 && fileSplitted[0].length == 0) {
			fmatter = fileSplitted[1];
			hbs = fileSplitted[2];
		}

		return parseFrontmatter(fmatter, filename, frontmatter.request).then(frontmatterLocal => {
            const page = Object.assign({}, frontmatter.page, frontmatterLocal);
            const frontmatterCombined = Object.assign({}, { page: page }, { global: frontmatter.global }, { request: frontmatter.request }, { session: frontmatter.session });

            console.log(`Output for       : ${url}`);
            console.log(`Frontmatter JSON : ${JSON.stringify(frontmatterLocal)}`);
            console.log(`Complete JSON    : ${JSON.stringify(frontmatterCombined)}`);
            console.log('\n');

            return Promise.resolve({hbs, frontmatterCombined});
        });
	} else {
	    throw FileNotFoundError(`File ${filename} not found in Directory ${directory}`);
    }
}

export function compile(url, frontmatter = {}, dir = 'pages', contentHtml = '') {
    return prepareCompile(url, dir, frontmatter)
		.then(compiled => {
			const { hbs, frontmatterCombined} = compiled;

            const handlebarsEnv = createHandlebarsEnv();

            handlebarsEnv.registerHelper('content', function() {
                return new handlebarsEnv.SafeString(contentHtml);
            });

            handlebarsEnv.registerHelper('include', function(fname) {
                return compile(fname, frontmatterCombined, 'templates')
                    .then(html => new handlebarsEnv.SafeString(html))
            });

            let templateName = '';
            if ('template' in frontmatterCombined['page']) {
                templateName = frontmatterCombined['page']['template'];
                delete frontmatterCombined['page']['template'];
            }

            const template = handlebarsEnv.compile(hbs);
            return template(frontmatterCombined).then(htmlCompiled => {
                if (templateName !== '') {
                    return compile(templateName, frontmatterCombined, 'templates', htmlCompiled);
                } else {
                    return Promise.resolve(htmlCompiled);
                }
            }).then(htmlCompiled => {
                return Promise.resolve(htmlCompiled.length === 0 ? " " : htmlCompiled.trim());
            });
		});
}
