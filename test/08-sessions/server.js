'use strict'

const BuzzyServer = require('buzzy')

const config = {
    routing: {
        magic: false
    },
    sessions: {
        active: true
    },
    templating: {
        validation: false
    }
}

const server = new BuzzyServer(config)

server.start()