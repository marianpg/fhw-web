'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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
	_inherits(ExtendableError, _Error);

	function ExtendableError(message) {
		var status = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 500;
		var extract = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : '';

		_classCallCheck(this, ExtendableError);

		var _this = _possibleConstructorReturn(this, (ExtendableError.__proto__ || Object.getPrototypeOf(ExtendableError)).call(this, message));

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
	_inherits(FileNotFoundError, _ExtendableError);

	function FileNotFoundError() {
		_classCallCheck(this, FileNotFoundError);

		return _possibleConstructorReturn(this, (FileNotFoundError.__proto__ || Object.getPrototypeOf(FileNotFoundError)).apply(this, arguments));
	}

	return FileNotFoundError;
}(ExtendableError);

var _HtmlValidationError = function (_ExtendableError2) {
	_inherits(HtmlValidationError, _ExtendableError2);

	function HtmlValidationError() {
		_classCallCheck(this, HtmlValidationError);

		return _possibleConstructorReturn(this, (HtmlValidationError.__proto__ || Object.getPrototypeOf(HtmlValidationError)).apply(this, arguments));
	}

	return HtmlValidationError;
}(ExtendableError);

var _CssValidationError = function (_ExtendableError3) {
	_inherits(CssValidationError, _ExtendableError3);

	function CssValidationError() {
		_classCallCheck(this, CssValidationError);

		return _possibleConstructorReturn(this, (CssValidationError.__proto__ || Object.getPrototypeOf(CssValidationError)).apply(this, arguments));
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