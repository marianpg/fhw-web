-------------
Konfiguration
-------------

Beim Erstellen eines Servers ist es möglich ein Konfigurationsobjekt zu übergeben. Bei fehlender oder nicht vollständig definierter Konfiguration werden Standardwerte übernommen. Das Konfigurationsobjekt sollte für diese Aufgabe wie folgt definiert sein:

.. code-block:: js

    const config = {
        server: {
            host: 'localhost',
            port: 8080
        },
        routing: {
            magic: false,
            fileExtension: 'json', // mögliche Werte 'json', 'ts'
        },
        templating: {
            validation: true,
            allowedExtensions: ['html', 'hbs']
        },
        sessions: {
            active: true
        },
        database: {
            fileData: {
                active: true
            }
        }
    }

    const app = new Server(config);