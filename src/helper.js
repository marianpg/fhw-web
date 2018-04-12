// TODO: produces a (invalid)
// Warning - unhandled Promise Rejection
// if used in a promise chain
export function conditionalPromise(expression, promise) {
	if (expression) {
		return Promise.resolve(promise);
	} else {
		return Promise.resolve(true);
	}
}

export function isObject(obj) {
	return typeof obj === 'object';
}

export function isUndefined(obj) {
	return typeof obj === 'undefined';
}