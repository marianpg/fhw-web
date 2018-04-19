var fhWeb = require('../index.js');
var loadJson = fhWeb.loadJson;
var saveJson = fhWeb.saveJson;

function add(data) {
	var guestbookEntries = loadJson('guestbook');
	var author = data.request.post.author;
	var text = data.request.post.text;

	guestbookEntries.push({
		author: author,
		text: text
	});

	saveJson('guestbook', guestbookEntries);
	data.request.post.guestbookEntries = guestbookEntries;

	return {
		status: 200,
		page: "guestbook",
		data
	}
}

function get(data) {
	var guestbookEntries = loadJson('guestbook');
	console.log("###get", data);
	data.request.post.guestbookEntries = guestbookEntries;

	return {
		status: 200,
		page: "guestbook",
		data: data
	}
}

module.exports = {
	add: add,
	get: get
};