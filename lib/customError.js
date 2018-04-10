'use strict';

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var htmlEscape = require('html-escape');

function generateErrorPage(error) {
	var extract = error.extract ? error.extract : '';
	extract = extract.split('\n').map(function (line, index) {
		return (index + 1).toString() + '\t' + line;
	}).join('\n');

	return '<h1> An ' + error.name + ' occured:</h1>' + ('<code style="white-space: pre-line">' + error.stack + '</code>') + ('<pre style="background-color: lightgrey;">' + htmlEscape(extract) + '</pre>');
}

// based on https://stackoverflow.com/a/32749533

var ExtendableError = function (_Error) {
	(0, _inherits3.default)(ExtendableError, _Error);

	function ExtendableError(message) {
		var status = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 500;
		var extract = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';
		(0, _classCallCheck3.default)(this, ExtendableError);

		var _this = (0, _possibleConstructorReturn3.default)(this, (ExtendableError.__proto__ || (0, _getPrototypeOf2.default)(ExtendableError)).call(this, message));

		_this.name = _this.constructor.name;
		_this.status = status;
		_this.extract = extract;

		if (typeof Error.captureStackTrace === 'function') {
			Error.captureStackTrace(_this, _this.constructor);
		} else {
			_this.stack = new Error(message).stack;
		}
		return _this;
	}

	return ExtendableError;
}(Error);

var _FileNotFoundError = function (_ExtendableError) {
	(0, _inherits3.default)(FileNotFoundError, _ExtendableError);

	function FileNotFoundError() {
		(0, _classCallCheck3.default)(this, FileNotFoundError);
		return (0, _possibleConstructorReturn3.default)(this, (FileNotFoundError.__proto__ || (0, _getPrototypeOf2.default)(FileNotFoundError)).apply(this, arguments));
	}

	return FileNotFoundError;
}(ExtendableError);

var _HtmlValidationError = function (_ExtendableError2) {
	(0, _inherits3.default)(HtmlValidationError, _ExtendableError2);

	function HtmlValidationError() {
		(0, _classCallCheck3.default)(this, HtmlValidationError);
		return (0, _possibleConstructorReturn3.default)(this, (HtmlValidationError.__proto__ || (0, _getPrototypeOf2.default)(HtmlValidationError)).apply(this, arguments));
	}

	return HtmlValidationError;
}(ExtendableError);

var _CssValidationError = function (_ExtendableError3) {
	(0, _inherits3.default)(CssValidationError, _ExtendableError3);

	function CssValidationError() {
		(0, _classCallCheck3.default)(this, CssValidationError);
		return (0, _possibleConstructorReturn3.default)(this, (CssValidationError.__proto__ || (0, _getPrototypeOf2.default)(CssValidationError)).apply(this, arguments));
	}

	return CssValidationError;
}(ExtendableError);

module.exports = {
	// Für "übersehene Fehler" - also nicht behandelte bzw. nicht beachtete Fehlerfälle.
	generateErrorPage: generateErrorPage,
	FileNotFoundError: function FileNotFoundError(message) {
		return new _FileNotFoundError(message, 404);
	},
	HtmlValidationError: function HtmlValidationError(message, extract) {
		return new _HtmlValidationError(message, 500, extract);
	},
	CssValidationError: function CssValidationError(message, extract) {
		return new _CssValidationError(message, 500, extract);
	}
};