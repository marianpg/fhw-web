import fs from 'fs';
import path from 'path';

import { FileNotFoundError, JsonParseError, ModuleNotFound } from './customError';


const projectPath = process.cwd();
const DEFAULTS = {
	get indexExtensions() {
		return ['hbs', 'html'];
	}
};

export function toAbsolutePath(p) {
	return p && p.includes(projectPath)
		? p
		: path.join(projectPath, p);
	/*
	return path.isAbsolute(p)
		? p
		: path.join(projectPath, p);
	*/
}

// https://stackoverflow.com/a/34509653
function ensureDirectoryExistence(filePath) {
	const dirname = path.dirname(filePath);
	if (fs.existsSync(dirname)) {
		return true;
	}
	ensureDirectoryExistence(dirname);
	fs.mkdirSync(dirname);
}

export function exists(anyPath) {
	return fs.existsSync(anyPath);
}

export function isFile(anyPath) {
	return exists(anyPath) && fs.lstatSync(toAbsolutePath(anyPath)).isFile();
}

// prüft, ob ein Ordner eine bestimmte Datei enthält
export function contains(directory, entry) {
	const pathToDir = toAbsolutePath(directory);
	const fileList = fs.readdirSync(pathToDir);

	const found = fileList
		.map( aEntry => aEntry === entry )
		.reduce( (val, cur) => val || cur, false );

	return found;
}

export function listFiles(directory) {
	const pathToDir = toAbsolutePath(directory);

	return exists(pathToDir)
		? fs.readdirSync(pathToDir)
		: [];
}


// TODO: Andere Zeichen erlauben (bspw. "_")
// TODO: mit 'resolvePage' zusammenführen
// Liefert eine Liste von infrage kommenden Dateien.
//
// Entfernt Anker
// Entfernt Query-Parameter
// Ergänzt Ordnerpfade um ein 'index', sofern keine Datei angegeben wurde
// Ergänzt fehlende Dateierweiterung um ['.html', '.hbs']
export function convert(url) {
	let result = url === '' ? '/' : url;

	result = result.match(/([\/\.\\0-9a-zA-Z-_]+)(?=[\?#])?/g)[0] || result;

	if (result.slice(-1) === '/') {
		result += 'index';
	}

	if (result.indexOf('.') === -1) {
		result += '.hbs';
	}

	return result;
}

export function openFile(pathToFile, encoding = 'utf8') {
	return fs.readFileSync(pathToFile, encoding);
}

// from https://gist.github.com/pbakondy/f5045eff725193dad9c7
function stripBOM (content) {
	content = content.toString();
	// Remove byte order marker. This catches EF BB BF (the UTF-8 BOM)
	// because the buffer-to-string conversion in `fs.readFileSync()`
	// translates it to FEFF, the UTF-16 BOM.
	if (content.charCodeAt(0) === 0xFEFF) {
		content = content.slice(1);
	}
	return content
}

export function loadJson(filename, directory = '/') {
	const fname = filename.split(".")[0] + '.json';
	const pathToFile = path.join(projectPath, directory, fname);

	return fs.existsSync(pathToFile)
		? JSON.parse(stripBOM(fs.readFileSync(pathToFile, 'utf8')))
		: undefined;
}

export function saveJson(filename, obj, directory = '/') {
	const fname = filename.split(".")[0] + '.json';
	const pathToFile = toAbsolutePath(path.join(directory, fname));
	const jsonStr = JSON.stringify(obj, null, '\t');

	ensureDirectoryExistence(pathToFile);
	fs.writeFileSync(pathToFile, jsonStr, 'utf8');
}

export function loadGlobalFrontmatter() {
	try {
        return loadJson('global.json') || {};
	} catch(error) {
        throw JsonParseError('global.json', error.message);
	}
}


export function loadDynamicModule(name, dir = '/') {
	const filename = name.extname === 'js'
		? name
		: name + '.js';
	const directory = toAbsolutePath(dir);

	if (contains(directory, filename)) {
		const modulePath = toAbsolutePath(path.join(directory, filename));
		delete require.cache[require.resolve(modulePath)];
		return require(modulePath);
	} else {
		return ModuleNotFound(`Module ${name} not found.`);
	}
}

export function resolvePage(calledUrl, routePath) {
	const parsedUrl = path.parse(calledUrl.startsWith('/') ? calledUrl.substr(1) : calledUrl);
	const parsedPath = path.parse(routePath.startsWith('/') ? routePath.substr(1) : routePath);

	let fname = parsedPath.base === '*'
		? parsedUrl.base
		: parsedPath.base;
	fname = fname.length === 0 ? 'index' : fname;

	let fileFound = false;
	let extensions = DEFAULTS.indexExtensions;
	let pathToFile = '';
	let ext = '';
	let dir = '';

	while (!fileFound && extensions.length > 0) {
		ext = extensions.pop();
		const qfname = fname.includes('.') ? fname : `${fname}.${ext}`;
		dir = parsedPath.dir;
		pathToFile = path.join(dir, qfname);
		fileFound = isFile(path.join('pages', pathToFile));
	}

	return fileFound ? pathToFile : FileNotFoundError(`Can not find file "${fname}" in directory "pages/${dir}"`);
}

export function resolveStatic(calledUrl, route, ignoreExistence) {
	let result = route.static; // default: serve specific file

	// if route is not a specific file, determine the correct path
	if (path.parse(route.static).ext.length === 0) {
		const urlPath = new RegExp(route.urlRegex).exec(calledUrl)[1];
		result = `${route.static.split('*')[0]}${urlPath}`;
	}
	
	if (!ignoreExistence && !isFile(toAbsolutePath(result))) {
		return FileNotFoundError(`Can not find static file "${result}".`);
	}

	return result;
}
