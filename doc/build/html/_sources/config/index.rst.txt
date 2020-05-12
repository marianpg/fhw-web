-------------
Konfiguration
-------------

Beim Erstellen eines Servers ist es möglich ein Konfigurationsobjekt zu übergeben. Bei fehlender oder nicht vollständig definierter Konfiguration werden Standardwerte übernommen. Das Konfigurationsobjekt mitsamt angenommenen Standardwerten ist wie folgt definiert:

.. code-block:: js

    const DefaultConfig = {
        rootPath: process.cwd(),
        language: 'de',
        loggingActive: ['info', 'data', 'warn', 'error', 'debug'], // alle möglichen Werte hier angegeben
        server: {
            host: 'localhost',
            port: 8080,
            logging: true
        },
        routing: {
            magic: false,
            fileName: 'routes',
            fileExtension: 'json', // mögliche Werte 'json', 'ts'
            reloadOnEveryRequest: true,
            logging: true
        },
        templating: {
            validation: true,
            paths: {
                pages: 'pages',
                templates: 'templates',
                helpers: 'helpers',
                controller: 'controller'
            },
            allowedExtensions: ['html', 'hbs'],
            frontmatterFormat: 'json', // mögliche Werte 'json', 'yaml'
            helpers: {
                reloadOnEveryRequest: true,
            },
            logging: true
        },
        sessions: {
            active: false,
            path: 'sessions',
            logging: true
        },
        database: {
            globalData: {
                active: true,
                reloadOnEveryRequest: true,
                pathToFile: './global.json',
                format: 'json', // mögliche Werte 'json', 'yaml'
                logging: true
            },
            fileData: {
                active: false,
                reloadOnEveryRequest: true,
                path: './data',
                format: 'json', // mögliche Werte 'json', 'yaml'
                logging: true
            },
            sqliteData: {
                active: false,
                reloadOnEveryRequest: true,
                pathToFile: './data/sqlite.db',
                logging: true
            }
        }
    }

    const app = new Server(DefaultConfig);