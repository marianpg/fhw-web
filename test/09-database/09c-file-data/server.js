'use strict'

const BuzzyServer = require('buzzy')

const config = {
    routing: {
        magic: false
    },
    templating: {
        validation: false
    },
    database: {
        sqliteData: {
            active: true
        },
        fileData: {
            active: true
        }
    }
}

const server = new BuzzyServer(config)

server.start()