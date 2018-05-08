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
		'data': {
			'session-id': id
		}
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

	console.log(`Opened session with id "${id}".`);

	return session;
}

function saveSession(session, path, get, post) {
	const data = Object.assign({}, session.data, get, post, { 'session-id': session.id });
	const toSave = copy(session);

	toSave.id = session.id;
	toSave.createdAt = session.createdAt;
	toSave.lastAccess = {
		timestamp: dateNow(),
		url: path
	};
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
	const url = req.path;
	let params = {
		path: {},
		get: {},
		post: {},
		session: {}
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

	// Extracting Session from Set-Cookies' session-id
	// If no session-id is provided, a new session will be opened
	 params.session = parseCookie(req, res, params.get, params.post);

	// Output
	// url			::= /item/.*/.*
	// params		::=	{ path: {"id": "id42}, get: {"currency": "euro"}, post: {} }
	console.log(`Parsed request parameters are: ${JSON.stringify(params)}`);
	console.log("Consider to define a <params> object in your route if expected parameters are missing. See full description here: http://fhw-web.readthedocs.io/de/latest/routes.html#parameter");
	return params;
}