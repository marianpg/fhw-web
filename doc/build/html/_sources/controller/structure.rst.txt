Struktur
--------

Der Controller muss im Ordner *<Projektordner>/controller/* als Javascript-Datei (\*.js) abgelegt sein. In dieser können beliebig viele benannte Funktionen definiert werden.
Ähnlich wie bei den Helpern ist dies sinnvoll, um thematisch gleichartige Routinen zusammenzufassen.

Eine Javascript-Datei exportiert dann ein Objekt mit benannten Funktionen: *<Projektordner>/controller/<Dateiname>.js*

Beispiel:

Datei: *<Projektordner>/controller/persons.js*

    .. code-block:: js

        function listPersons(data, db) {
            /* Der Aufbau von Controller-Funktionen
            werden in den nächsten Abschnitten detailiert erläutert */
        }

        module.exports = {
            "listPersons": listPersons
        }

Daraufhin kann eine *<controllerRoute>* in der Routing-Datei auf die Controller-Funktionen über den Dateinamen und der benannten Funktion eindeutig zugreifen.

Beispiel:

Datei: *<Projektordner>/routes.json*

    .. code-block:: json

        [
            {
                "url": "/show-persons/",
                "controller": {
                    "file": "persons",
                    "function": "listPersons"
                }
            }
        ]
