'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var validateHtml = function () {
	var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(html) {
		var options;
		return _regenerator2.default.wrap(function _callee$(_context) {
			while (1) {
				switch (_context.prev = _context.next) {
					case 0:
						options = { format: 'text', data: html };
						return _context.abrupt('return', htmlValidator(options).then(function (result) {
							if (result.includes('Error:')) {
								throw HtmlValidationError(result, html);
							}
						}));

					case 2:
					case 'end':
						return _context.stop();
				}
			}
		}, _callee, this);
	}));

	return function validateHtml(_x) {
		return _ref.apply(this, arguments);
	};
}();

var validateCss = function () {
	var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(cssFilename) {
		var fname, file;
		return _regenerator2.default.wrap(function _callee2$(_context2) {
			while (1) {
				switch (_context2.prev = _context2.next) {
					case 0:
						fname = cssFilename.includes('.css') ? cssFilename : cssFilename + '.css';
						file = fs.readFileSync(path.join(process.cwd(), 'assets', fname), 'utf8');


						cssValidator(file, function (error, result) {
							if (error) {
								throw CssValidationError(error);
							}
							if (!result.validity) {
								var message = result.errors.map(function (err) {
									return err.message;
								}).join('\n');
								console.log("mar", message);
								throw CssValidationError(message, file);
							}
						});

					case 3:
					case 'end':
						return _context2.stop();
				}
			}
		}, _callee2, this);
	}));

	return function validateCss(_x2) {
		return _ref2.apply(this, arguments);
	};
}();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var fs = require('fs');
var path = require('path');
var htmlValidator = require('html-validator');
var cssValidator = require('css-validator');

var _require = require('./customError.js'),
    HtmlValidationError = _require.HtmlValidationError,
    CssValidationError = _require.CssValidationError;

module.exports = {
	html: validateHtml,
	css: validateCss
};