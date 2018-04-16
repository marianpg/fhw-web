// TODO: produces a (invalid)
// Warning - unhandled Promise Rejection
// if used in a promise chain

export function isObject(obj) {
	return (typeof obj === 'object') && (!Array.isArray(obj));
}

export function isUndefined(obj) {
	return typeof obj === 'undefined';
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