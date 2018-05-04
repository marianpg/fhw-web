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
Jede Controller-Funktion erhält als ersten Parameter ein Objekt, welches die GET, POST, PATH
und Session Daten enthält. Eine nähere Erläuterung zu der *Session* erfolgt in einem späteren
Kapitel.
Auf die verschiedenen Parameter lassen sich dann wie auf gewohnte js-Objekte zugreifen::

    /* Eine Controller-Funktion */
    function printParams(params) {
        console.log(params.get.name); // gibt den Inhalt der Variable "name" der GET-Parameter
        console.log(params.post.name); // gibt den Inhalt der Variable "name" der POST-Parameter
        console.log(params.path.name); // gibt den Inhalt der Variable "name" der PATH-Parameter
        console.log(params.session.name); // gibt den Inhalt der Variable "name" der Session
    }


Rückgabewert
""""""""""""

Das Resultat einer Funktion muss dabei einem der folgenden definierten entsprechen::

    | Return            ::= <pageResult> | <redirect>
    |
    | <pageResult>      ::= { <statusCode>, <page>, <data> } // liefert direkt eine Seite <page> aus mit evtl. zusätzlichen <data> Daten
    | <redirect>        ::= { <statusCode>, <page> } // eine URL bzw. Seite, auf die der Browser nach der Verarbeitung weitergeleitet werden soll
    |
    | <statusCode>      ::= <integer> // entspricht dem HTTP-Status-Code, insb. wichtig bei der Weiterleitung
    | <page>            ::= <string> // Dateiname der page, enthalten im page-Ordner
    | <data>            ::= <object> // zusätzliche Daten, die im Frontmatter über das page-Objekt sichtbar sind


Dateiinhalt
"""""""""""

Am Ende der Datei jedoch müssen die Funktionen, die nach außen hin sichtbar sein sollen, exportiet werden.
Exemplarisch sähe das wie folgt aus::

    // file controller/guestbook.js
    function addData(params) {
        /* some implementation */
        return {
            status: 200,
            page: "success"
        }
    }

    function listAll() {
        /* some implementation */
        return {
            status: 200,
            page: "guestbook",
            data: entries
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

Die Funktion *loadJson* erwartet als einzigen Parameter den Dateinamen. Die Funktion *saveJson* benötigt
zusätzlich zum Dateinamen einen zweiten Parameter, nämlich das Objekt, welches gespeichert werden soll.

Exemplarisch sähe dies wie folgt aus::

    var fhWeb = require('fhw-web');
    var loadJson = fhWeb.loadJson;
    var saveJson = fhWeb.saveJson;

    function add(params) {
        var guestbookEntries = loadJson('guestbook');
        var author = params.post.author;
        var text = params.post.text;

        guestbookEntries.push({
            author: author,
            text: text
        });

        saveJson('guestbook', guestbookEntries);

        /* more implementation */
    }