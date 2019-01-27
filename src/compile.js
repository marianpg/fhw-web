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

const Sequelize = require('sequelize');
const sequelize = new Sequelize('database', null, null, {
	dialect: 'sqlite',
	storage: 'data/database.db'
});

// TODO: legt eine sql-Datei im selben Ordner an
export function connectToDatabase() {
    return new Promise((resolve, reject) => {
		sequelize
			.authenticate()
			.then( _ => {
				console.log('Connected to database.');
				resolve(true);
			})
			.catch(error => {
				// fails, if connection is already established
				resolve(true);
		});
	})
}
export function disconectFromSQLDatabase() {
	return new Promise((resolve, reject) => {
		sequelize.close()
			.then(_ => {
				console.log('Database connection closed.'); //TODO
				resolve(true);
			})
			.catch(error => {
				// fails, if no connection is established
				resolve(true);
			});
	});
}

function executeSql(key, value) {
    return new Promise((resolve, reject) => {
        sqliteDB.all(value, [], (err, rows) => {
           if (err) {
               console.log('maybe sql error:', err);
               resolve({[key]: value});
           }
           resolve({[key]: rows});
        });
    });
}

function parseSql(maybeSql, requestParams) {
    const regex = /\$(get|post|path).([\w]+)/g;
    let match, httpMethod, key;

    while (match = regex.exec(maybeSql))
    {
        httpMethod = match[1];
        key = match[2];
        maybeSql = maybeSql.replace(match[0], requestParams[httpMethod][key]);
    }

    return maybeSql;
}

function runSql(key, maybeSql, params) {
	console.log(maybeSql, params);
	return new Promise((resolve, reject) => {
		sequelize.query(maybeSql,
			{ replacements: params }
		).then(result => {
			resolve({[key]: result[0]});
		})
		.catch(error => {
			resolve({[key]: unpackSqlResult(maybeSql)});
		})
	});
}

// TODO: Zurzeit wird eine "/data/database.sql" Datei erwartet. Mehrere Dateien erlauben? Wie sinnvoll verknüpfen?
function parseAndExecuteSql(frontmatter, requestParams) {
    return new Promise((resolve, reject) => {
        let promises = Object.keys(frontmatter).map(key => {
        	console.log("runSql", key, frontmatter[key]);
            return runSql(key, frontmatter[key], mergeObjects(requestParams.path, requestParams.get, requestParams.post));
        });

        Promise.all(promises).then(values => {
            resolve(objectFlatMap(values));
        });
    });
}

// Todo: global configuration "onlyJson"/"onlyYaml"/"both"
export function parseFrontmatter(frontmatter, filename, requestParams) {
	let result = {};

	if (isJson(frontmatter)) {
        result= parseJson(frontmatter, filename);
	} else if (isYaml(frontmatter)) {
        result = parseYaml(frontmatter, filename);
	} else {
        throw WrongFiletypeError(`Wrong filestructure in file ${filename}. It neither contains well-formed json or yaml.`);
	}

	result = parseAndExecuteSql(result, requestParams);

	return result;
}

// kein 'precompile' von Handlebars!
function prepareCompile(url, startDir, frontmatter) {
	const preparedUrl = convert(url);
	const filename = path.basename(preparedUrl);
	const directory = path.join(startDir, path.dirname(preparedUrl));

	console.log(`Going to compile file ${filename} from directory ${directory}`);

	if (exists(directory) && contains(directory, filename)) {

		const file = fs.readFileSync(path.join(directory, filename), 'utf8');
		const fileSplitted = file.split('---');

		const fmatter = fileSplitted.length > 1 ? fileSplitted[0] : '{}';
		const hbs = fileSplitted.length > 1 ? fileSplitted[1] : fileSplitted[0] ;

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
