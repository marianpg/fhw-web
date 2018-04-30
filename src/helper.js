const { JsonParseError } = require('./customError');


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
		throw JsonParseError(`Could not parse JSON in ${filename}. Further error description below:\n ${error.message}`);
	}
}