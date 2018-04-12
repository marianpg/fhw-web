import { loadJson, loadDynamicModule } from "./file-utils";
import bodyParser from 'body-parser';


function jsonParse() {
	const parse = bodyParser.json();
	return function (req, res, next) {
		req.headers['content-type'] = 'application/json';
		parse(req, res, next)
	}
}
const jsonParser = jsonParse();
const skip = (req, res, next) => next();

function finishWithController(controllerName) {
	console.log("apply controller", controllerName);
	return function(req, res, next) {
		const controller = loadDynamicModule(controllerName, 'controller');
		controller(); //TODO: inject ressources and forward return value as body
		res.status(200);
		res.send();
	}
}

function finish(req, res, next) {
	console.log("no controller, finish");
	res.status(200);
	res.send();
}

export default function(app, config) {
	const routeDefinitions = loadJson('routes.json');

	routeDefinitions.forEach((route) => {
		app[route.method](
			route.url,
			route.params.body.length > 0 ? jsonParser : skip,
			route.controller.length > 0 ? finishWithController(route.controller) : skip,
			finish
		)
	});
}