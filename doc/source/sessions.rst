Sessions
========

Jeder Seitenaufruf bewirkt das Eröffnen einer bereits existierenden oder einer neuen Session.
Identifiziert werden die Sessions über die *session-id* und werden als solche benannt
als json-Dateien im Ordner <Projektordner>/sessions abgelegt.
Eine Session ist dabei solange gültig, bis der Browser geschlossen wird.

Die Session wird automatisch mit den übergebenen GET- und POST-Daten gefüllt.
Sollten GET-Parameter und POST-Parameter gleichbenannt sein, überwiegt der POST-Parameter,
sodass der von GET Definierte in der Session überdeckt wird.


Dateiinhalt
^^^^^^^^^^^

Eine exemplarische Session-Datei ist wie folgt aufgebaut::

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

Bei den Angaben *id*, *createdAt* sowie *lastAccess* handelt es sich um Meta-Daten, die während der Entwicklung
als hilfreiche Debug-Information gedacht sind. Auf diese Information lässt sich nicht in einer page oder einem
controller zugreifen. Die zugreifbaren Daten sind im Objekt "data" enthalten.

*Sonderfall session-id:* Nichtsdestotrotz kann es hilfreich sein seitens einer page oder einem controller Zugriff auf
die session-id zu haben. Diese wird automatisch in das data-Objekt gepackt, wodurch ein Auslesen der session-id möglich ist.


Verwendung
^^^^^^^^^^

Der Zugriff auf die Session erfolgt im Handlebars-Quelltext über das session-Objekt::

    <!-- pages/example-session.hbs -->
    {
    }
    ---
    <!-- Liefert die Session-Id aus: -->
    <p>Session-Id: {{session.session-id}}</p>

    <!-- Sofern der Website ein "name" per GET oder POST übergeben wurde. -->
    <!-- Ansonsten enthält diese Variable keine Daten: -->
    <p>Name: {{session.name}}</p>


Analog erfolgt im Controller der Zugriff auf die Session wie folgt::

    /* Eine Controller-Funktion */
    function printSession(data) {
        console.log(data.session['session-id']); // gibt den Inhalt der Variable "session-id" der Session
        console.log(data.session.name); // gibt den Inhalt der Variable "name" der Session
    }

*Hinweis:* Die Zeichenkette "session-id" stellt aufgrund des Bindestrichs keinen gültigen Javascript-Bezeichner dar.
Deswegen erfolgt der Zugriff auf den Wert von *session-id* nicht mit der *Punktnotation* sondern per *Klammernotation*.
Näheres dazu unter `Property Accessors
<https://developer.mozilla.org/de/docs/Web/JavaScript/Reference/Operators/Property_Accessors/>`_.


Schreibender Zugriff
""""""""""""""""""""

Im Controller ist es möglich die Daten einer Session zu bearbeiten. Änderungen an diesem Objekt werden automatisch
übernommen und gespeichert. Folgender Beispiel-Controller zählt bei jedem Seitenaufruf einen Zähler hoch

- routes.json:: 

    [{
      "url": "/example-session-write",
      "controller": {
        "file": "example-session-write",
        "function": "renderWelcomePage"
      }
    }]


- controller/example-session-write.js::

    function renderWelcomePage(data) {
        if (typeof data.session.aufrufe === 'undefined') {
            data.session.aufrufe = 0;
        }
        data.session.aufrufe += 1;

        return {
            status: 200,
            page: 'example-session-write'
        }
    }
    module.exports = {
        renderWelcomePage: welcomePage
    };


- pages/example-session-write.hbs::

    {
        "template": "full-html",
        "title": "Meine Hobbies"
    }
    ---
    <h1>Willkommen auf meiner Seite</h1>
    <p>Du hast die Seite während einer Sitzung bereits {{session.aufrufe}} Mal aufgerufen.</p>

