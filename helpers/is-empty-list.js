module.exports = function(list) {
	console.log("LIST", list, list && (typeof list !== 'string') && list.length > 0);
	return list && (typeof list !== 'string') && list.length > 0;
};