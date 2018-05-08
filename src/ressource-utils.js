import fs from 'fs';
import path from 'path';

import { zip } from './helper';


const projectPath = process.cwd();

export function toAbsolutePath(p) {
	return p.includes(projectPath)
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

// prüft, ob ein Ordner eine bestimmte Datei enthält
export function contains(directory, entry) {
	const pathToDir = toAbsolutePath(directory);
	const fileList = fs.readdirSync(pathToDir);

	const found = fileList
		.map( aEntry => aEntry === entry )
		.reduce( (val, cur) => val || cur, false );

	return found
}

export function listFiles(directory) {
	const pathToDir = toAbsolutePath(directory);

	return exists(pathToDir)
		? fs.readdirSync(pathToDir)
		: [];
}


// TODO: Weitere Dateierweiterungen
// TODO: Andere Zeichen erlauben (bspw. "_")
// Entfernt Anker
// Entfernt Query-Parameter
// Ergänzt Ordnerpfade um ein 'index.hbs'
// Ergänzt fehlende Dateierweiterung um '.hbs'
export function convert(url) {
	let result = url === '' ? '/' : url;

	result = result.match(/([\/\.0-9a-zA-Z-_]+)(?=[\?#])?/g)[0] || result;

	if (result.slice(-1) === '/') {
		result += 'index.hbs';
	}

	if (result.indexOf('.hbs') === -1) {
		result += '.hbs';
	}

	return result;
}

export function openFile(pathToFile, encoding = 'utf8') {
	return fs.readFileSync(pathToFile, encoding);
}


export function loadJson(filename, directory = '/') {
	const fname = filename.split(".")[0] + '.json';
	const pathToFile = path.join(projectPath, directory, fname);

	return fs.existsSync(pathToFile)
		? JSON.parse(fs.readFileSync(pathToFile, 'utf8'))
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
	return loadJson('global.json') || {};
}


export function loadDynamicModule(name, dir = '/') {
	const filename = name.extname === 'js'
		? name
		: name + '.js';
	const directory = toAbsolutePath(dir);

	if (contains(directory, filename)) {
		return require(toAbsolutePath(path.join(directory, filename)));
	} else {
		throw new Error(`Module ${name} not found.`);
	}
}

// TODO: Sonderfall 'pages'
/*

 */
export function resolveRessource(calledUrl, location = '/') {
	// skip leading '/' if present
	const relUrl = calledUrl.startsWith('/') ? calledUrl.substr(1) : calledUrl;
	const relLocation = location.startsWith('/') ? location.substr(1) : location;

	const parsedLocation = path.parse(relLocation);
	const ext = '.hbs';
	let dir = parsedLocation.dir;
	let file = parsedLocation.base.includes('.hbs') ? parsedLocation.base : `${parsedLocation.base}${ext}`;

	if (file.length > ext.length ) {
		if (!contains(path.join('pages', dir), file)) {
			dir = `${dir}/${file}`;
		}
	} else {
		file = 'index.hbs';
	}

	const pathToFile = path.join(dir, file);


	return pathToFile;
}