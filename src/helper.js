import YAML from 'yaml';
import { JsonParseError, YamlParseError } from './customError';


export function isObject(obj) {
	return (typeof obj === 'object') && (!Array.isArray(obj));
}

export function isUndefined(obj) {
	return obj == null;
}

export function isDefined(obj) {
	return !isUndefined(obj);
}

export function isArray(obj) {
	return Array.isArray(obj);
}

export function isString(obj) {
	return typeof obj === "string";
}

export function isFunction(obj) {
	return typeof obj === 'function';
}

// lists ::= [aList, aList]
// aList ::= [object]
// @return like python's zip function
// shortest length
// from https://stackoverflow.com/a/10284006
export const zip = rows=>rows[0].map((_,c)=>rows.map(row=>row[c]));

export function parseJson(str, filename) {
	try {
		return JSON.parse(str);
	} catch(error) {
		throw JsonParseError(filename, error.message);
	}
}

export function parseYaml(str, filename) {
    try {
        return YAML.parse(str);
    } catch(error) {
        throw YamlParseError(filename, error.message);
    }
}

export function isJson(str) {
	try {
		JSON.parse(str);
	} catch(error) {
		return false;
	}

	return true;
}

export function isYaml(str) {
    try {
        YAML.parse(str);
    } catch(error) {
        return false;
    }

    return true;
}


export function copy(obj) {
	return JSON.parse(JSON.stringify(obj));
}

/*
	Merges an array of objects of the following style
	[{key: value}]
	into one object of all containing keys.
	notice: no key-collision handling included
 */
export function objectFlatMap(arrOfObjects) {
	return arrOfObjects.reduce((result, anObject) => {
		let key = Object.keys(anObject)[0];
		result[key] = anObject[key];
		return result;
	}, {});
}

/*
 * merges a list of object
 * uses last occurrence whenever keys overlap
 *
 */
export function mergeObjects(...objects) {

	return objects.reduce((obj, val) => Object.assign(obj, val), {})
}

export function unpackSqlResult(result) {
	if (result.length === 1) {
		return unpackSqlResult(result[0]);
	}

	if (Object.keys(result).length === 1) {
		return Object.values(result)[0];
	}

	return result;
}
