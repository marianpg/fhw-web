import fs from 'fs';
import path from 'path';

const projectPath = process.cwd();

export function exists(pathToFile) {
	return fs.existsSync(pathToFile);
}

// prüft, ob ein Ordner eine bestimmte Datei enthält
export function contains(directory, entry) {
	const pathToDir = path.join(projectPath, directory);
	const fileList = fs.readdirSync(pathToDir);
	const found = fileList
		.map( aEntry => aEntry === entry )
		.reduce( (val, cur) => val || cur, false );

	return found
}


// Entfernt Anker
// Entfernt Query-Parameter
// Ergänzt Ordnerpfade um ein 'index.hbs'
// Ergänzt fehlende Dateierweiterung um '.hbs'
export function convert(url) {
	let result = url === '' ? '/' : url;

	result = result.match(/([\/\.0-9a-zA-Z-]+)(?=[\?#])?/g)[0] || result;

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
	const pathToFile = path.join(projectPath, directory, filename);

	return fs.existsSync(pathToFile)
		? JSON.parse(fs.readFileSync(pathToFile, 'utf8'))
		: undefined;
}


export function loadDynamicModule(name, directory = '/') {
	console.log("load dynamic module", name, directory);
	if (contains(directory, name + ".js")) {
		return require(path.join(projectPath, directory, name));
	} else {
		throw new Error("no Module found");
	}
}

export function resolveRessource(url, route) {
	// TODO: Implement
	return url;
}