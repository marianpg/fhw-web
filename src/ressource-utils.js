import fs from 'fs';
import path from 'path';

const projectPath = process.cwd();

// TODO: use properly
function toAbsolutePath(p) {
	return path.isAbsolute(p)
		? p
		: path.join(projectPath, p);
}

export function exists(pathToFile) {
	return fs.existsSync(pathToFile);
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

export function resolveRessource(url, dir = '/') {

	return path.join(projectPath, dir, url);
}