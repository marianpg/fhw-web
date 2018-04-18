// data ::= { <global>, <path>, <get>, <post> }
// <global> contains data from global.json
// <path>, <get>, <post> contain data from equivalent request parameters
function validate(data) {

	return {
		page: 'index',
		data
	};
}


module.exports = {
	validate: validate
};