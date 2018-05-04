Sessions
========

Jeder Seitenaufruf bewirkt das Eröffnen eine bereits existierenden oder einer neuen Session.
Identifiziert werden die Sessions über die *session-id* und werden als solche benannt
als json-Dateien im Ordner <Projektordner>/sessions abgelegt.
Eine Session ist dabei solange gültig, bis der Browser geschlossen wird.

Die Session wird automatisch mit den übergebenen GET- und POST-Daten gefüllt.
Sollten GET-Parameter und POST-Parameter gleichbenannt sein, überwiegt der POST-Parameter,
sodass der von GET in der Session überdeckt wird.

Dateiinhalt
^^^^^^^^^^^

Eine Session-Datei ist wie folgt aufgebaut::

    <!-- sessions/_pfyod45zxn9.json -->
    {
        "id": "_pfyod45zxn9",
        "createdAt": "4.5.2018, 08:34:22",
        "lastAccess": {
            "timestamp": "4.5.2018, 09:29:00",
            "url": "/guestbook"
        },
        "data": {
            "id": "_pfyod45zxn9",
            "author": "Nina L.",
            "text": "Mir gefällt dieses Produkt sehr gut."
        }
    }


Verwendung
^^^^^^^^^^

Der Zugriff auf die Session erfolgt im Handlebars-Quelltext über das request-Objekt::

    <!-- pages/example-session.hbs -->
    {
    }
    ---
    <p>Session-Id: {{request.session.session-id}}</p>
    <!-- Sofern an irgendeiner Stelle auf der Website ein "name" per GET oder POST übergeben wurde. -->
    <!-- Ansonsten enthält diese Variable keine Daten: -->
    <p>Name: {{request.session.name}}</p>


Analog erfolgt im Controller der Zugriff auf die Session wie folgt::

    /* Eine Controller-Funktion */
    function printSession(params) {
        console.log(params.session.['session-id']); // gibt den Inhalt der Variable "session-id" der Session
        console.log(params.session.name); // gibt den Inhalt der Variable "name" der Session
    }

*Hinweis:* Die Zeichenkette "session-id" stellt aufgrund des Bindestrichs keinen gültigen Javascript-Bezeichner dar.
Deswegen erfolgt der Zugriff auf den Wert von "session-id" nicht mit der "Punktnotation" sondern per *Klammernotation*.
Näheres dazu unter `Property Accessors
<https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Operators/Property_Accessors/>`_.