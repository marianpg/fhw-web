'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var express = require('express');
var compile = require('./compile');
var fs = require('fs');
var path = require('path');

var _require = require('./customError'),
    generateErrorPage = _require.generateErrorPage;

var validator = require('./validator');

var app = express();

var config = {
	validator: {
		html: false
	}
};

function loadGlobalFrontmatter() {
	return fs.existsSync(path.join(process.cwd(), 'global.json')) ? { global: JSON.parse(fs.readFileSync('global.json', 'utf8')) } : {};
}

// request handler
function magicRoutes() {
	return function () {
		var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(req, res) {
			var html, status, frontmatterGlobal;
			return _regenerator2.default.wrap(function _callee$(_context) {
				while (1) {
					switch (_context.prev = _context.next) {
						case 0:
							html = '';
							status = 200;
							_context.prev = 2;

							// TODO: json validation
							frontmatterGlobal = loadGlobalFrontmatter();
							_context.next = 6;
							return compile(req.originalUrl, frontmatterGlobal);

						case 6:
							html = _context.sent;

							if (!config.validator.html) {
								_context.next = 10;
								break;
							}

							_context.next = 10;
							return validator.html(html);

						case 10:
							_context.next = 16;
							break;

						case 12:
							_context.prev = 12;
							_context.t0 = _context['catch'](2);

							html = generateErrorPage(_context.t0);
							status = _context.t0.status || 500;

						case 16:
							_context.prev = 16;

							res.status(status);
							res.send(html);
							return _context.finish(16);

						case 20:
						case 'end':
							return _context.stop();
					}
				}
			}, _callee, this, [[2, 12, 16, 20]]);
		}));

		return function (_x, _x2) {
			return _ref.apply(this, arguments);
		};
	}();
}

/*
	userConfig ::= { <port> }

	port ::= <Integer>
 */
function start(userConfig) {
	var port = userConfig.port || 8080;

	app.use('/assets', express.static('assets'));
	app.use(magicRoutes());

	app.listen(port);
	console.log('Server listening on http://localhost:' + port + '/');
}

module.exports = {
	start: start
};