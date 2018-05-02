import { isDefined, isUndefined, zip, copy } from "./helper";
import { saveJson, loadJson, contains } from './ressource-utils';

const resDir = 'sessions';


function generateId() {
	return '_' + Math.random().toString(36).substr(2);
}

function dateNow() {
	return new Date().toLocaleString('de-DE');
}

function openSession(id) {
	const now = dateNow();
	let session = {
		'id': id,
		'createdAt': now,
		'lastAccess': {
			'timestamp': now,
			'url': ''
		},
		'data': {}
	};

	const loadedSession = loadJson(id, resDir);
	if (isDefined(loadedSession)) {
		session.createdAt = loadedSession.createdAt || session.createdAt;
		session.data = loadedSession.data || session.data;
		if (isDefined(loadedSession.lastAccess)) {
			session.lastAccess.timestamp = loadedSession.lastAccess.timestamp;
			session.lastAccess.url = loadedSession.lastAccess.url;
		}
	}

	console.log("open session-id", id, session);

	return session;
}

function saveSession(session, path, get, post) {
	const data = Object.assign({}, session.data, get, post);
	const toSave = copy(session);

	toSave.lastAccess.timestamp = dateNow();
	toSave.lastAccess.url = path;
	toSave.data = data;

	saveJson(toSave.id, toSave, resDir);
}

function parseCookie(req, res, get, post) {
	let sessionId = '';

	if (isDefined(req.cookies) && isDefined(req.cookies['session-id'])) {
		sessionId = req.cookies['session-id'];
	} else {
		sessionId = generateId();
		res.setHeader('Set-Cookie', `session-id=${sessionId}`);
	}

	const session = openSession(sessionId);
	saveSession(session, req.path, get, post);

	return session.data;
}

// TODO: Klären: url "/item/:id/price" würde ohne controller eine Suche nach einer page "/pages/item/id42/price" auslösen.
export function parseParams(req, route, res) {
	let url = req.originalUrl;
	let params = {
		path: {},
		get: {},
		post: {},
		cookies: {}
	};

	// Input
	// url			::= /item/id42/price?currency=euro
	// route.url	::= /item/:id/*
	// route.params ::= { path: ["id"], get: [], post: [] }

	// Extracting Path Parameters
	const combined = zip([route.url.split('/'), url.split('/')]);
	combined.forEach(([key, value]) => {
		if (key.startsWith(':')) {
			const k = key.substr(1);
			if (route.params.path.includes(k)) {
				params.path[k] = value;
			}
		}
	});

	// Extracting Get Parameters
	// TODO: Array vs. String ("/item/id42/price?currency=euro&sortBy=price&groupBy[]=name&groupBy[]=country")
	Object.keys(req.query).forEach(key => {
		if (route.params.get.includes(key) && isDefined(req.query[key])) {
			params.get[key] = req.query[key];
		}
	});

	// Extracting Post Parameters
	Object.keys(req.body).forEach(key => {
		if (route.params.post.includes(key) && isDefined(req.body[key])) {
			params.post[key] = req.body[key];
		}
	});

	// Extract Cookies
	// disabled until version 0.7.0
	// const session = parseCookie(req, res, params.get, params.post);
	// params.cookies = session;


	// Output
	// url			::= /item/.*/.*
	// params		::=	{ path: {"id": "id42}, get: {"currency": "euro"}, post: {} }
	console.log(`Parsed request parameters are: ${JSON.stringify(params)}`);
	return params;
}