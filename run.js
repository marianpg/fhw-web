'use strict';

const fhWeb = require('./index.js');

// TODO: Readme: do not do this on a productive machine, this is a learning environment

fhWeb.start({
	port: 8089,
	validator: {
		html: true,
		css: true
	}
});