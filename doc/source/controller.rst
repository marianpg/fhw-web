Controller
==========

Ein Controller ermöglicht bei Requests einen Verarbeitungszwischenschritt.
So wird nicht gleich eine Seite zurückgegeben, sondern zunächst eine bestimmte
Funktion aufgerufen.

Dabei ist es möglich, dass der Controller Daten aus einer *Datenbank* lädt und speichert
und andere Verarbeitsungsschritte unternimmt.


Controllerdefinition
^^^^^^^^^^^^^^^^^^^^

Der Controller muss im Ordner *"<Projektordner>/controller/"* als Javascript-Datei (\*.js)
abgelegt sein. In dieser können beliebig viele benannte Funktionen definiert werden.

Eingabewert
"""""""""""
Jede Controller-Funktion erhält als ersten Parameter ein Objekt, welches die Daten aus den Request-Parametern,
der Session und der global.json enthält. Im Request-Objekt selbst befinden sich die GET, POST und PATH Parameter
(benannte Pfad-Segmente). Bezüglich des vorzufindenden *Session*-Objekts erfolgt eine nähere Erläuterung im nächsten
Kapitel.

Auf die verschiedenen Parameter lassen sich dann wie auf gewohnte js-Objekte zugreifen::

    /* Eine Controller-Funktion */
    function printParams(data) {
        console.log(data.request.get.name); // gibt den Inhalt der Variable "name" der GET-Parameter
        console.log(data.request.post.name); // gibt den Inhalt der Variable "name" der POST-Parameter
        console.log(data.request.path.name); // gibt den Inhalt der Variable "name" der PATH-Parameter
        console.log(data.session.name); // gibt den Inhalt der Variable "name" der Session
        console.log(data.global.name); // gibt den Inhalt der Variable "name" aus der global.json
    }


Das Schreiben auf die *data.request* sowie auf *data.global* hat keine Auswirkungen nach außen hin. Das heißt, Änderungen
sind für die *page* nicht sichtbar.

Rückgabewert
""""""""""""

Das Resultat einer Funktion muss dabei einem der folgenden definierten entsprechen::

    | Return            ::= <pageResult> | <redirectResult>
    |
    | <pageResult>      ::= { <status>, <page>, <data> } // liefert direkt eine Seite <page> aus mit evtl. zusätzlichen <data> Daten
    | <redirectResult>  ::= { <status>, <redirect> }
    |
    | <status>          ::= <integer> // entspricht dem HTTP-Status-Code, insb. wichtig bei der Weiterleitung
    | <page>            ::= <string> // Dateiname der page, enthalten im page-Ordner
    | <redirect>        ::= <string> // eine URL,  auf die der Browser nach der Verarbeitung weitergeleitet werden soll
    | <data>            ::= <object> // zusätzliche Daten, die im Frontmatter über das page-Objekt sichtbar sind


Dateiinhalt
"""""""""""

Am Ende der Datei jedoch müssen die Funktionen, die nach außen hin sichtbar sein sollen, exportiet werden.
Exemplarisch sähe das wie folgt aus::

    // file controller/guestbook.js
    function addData(data) {
        /* some implementation */
        return {
            status: 303,
            redirect: "/success"
        }
    }

    function listAll() {
        /* some implementation */
        let allEntries = []; // should contain all guestbook entries

        return {
            status: 200,
            page: "guestbook",
            data: {
                entries: allEntries
            }
        }
    }

    module.exports = {
        add: addData,
        get: listAll
    };


Datenbank
^^^^^^^^^

Wir arbeiten hier mit einer einfachen Form einer "Datenbank". Dies wird durch eine Sammlung von
json-Dokumenten im Ordner *data* dargestellt.
Die einzigen Funktionen unserer Datenbank sind *loadJson* und *saveJson*.

Die Funktion *loadJson* erwartet als einzigen Parameter den Dateinamen. Die Prozedur *saveJson* benötigt
zusätzlich zum Dateinamen einen zweiten Parameter, nämlich das Objekt, welches gespeichert werden soll.

Exemplarisch sähe dies wie folgt aus::

    var fhWeb = require('fhw-web');
    var loadJson = fhWeb.loadJson;
    var saveJson = fhWeb.saveJson;

    function add(data) {
        var guestbookEntries = loadJson('guestbook') || [];
        var author = data.request.post.author;
        var text = data.request.post.text;

        guestbookEntries.push({
            author: author,
            text: text
        });

        saveJson('guestbook', guestbookEntries);

        return {
            status: 303,
            redirect: "/success"
        }
    }

    module.exports = {
        add: addData
    };