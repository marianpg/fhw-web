Controller
==========

Ein Controller ermöglicht bei Requests einen Verarbeitungszwischenschritt.
So wird nicht gleich eine Seite zurückgegeben, sondern zunächst eine bestimmte
Funktion aufgerufen.

Dabei ist es möglich, dass der Controller Daten aus einer *Datenbank* lädt und speichert
und andere Verarbeitsungsschritte unternimmt.


Controllerdefinition
^^^^^^^^^^^^^^^^^^^^

Der Controller muss im Ordner *"Projektordner/controller/"* als Javascript-Datei (*.js)
abgelegt sein. In dieser können beliebig viele benannte Funktionen definiert werden.


Rückgabewert
""""""""""""

Das Resultat einer Funktion muss dabei einem der folgenden definierten entsprechen::

    | Return            ::= <pageResult> | <jsonResult> | <contentResult>
    |
    | <pageResult>      ::= { <statusCode>, <page>, <data> }
    | <jsonResult>      ::= { <statusCode>, <json>, <redirect>? }
    | <contentResult>   ::= { <statusCode>, <content>, <redirect>? }
    |
    | <statusCode>      ::= <integer> // entspricht dem HTTP-Status-Code
    | <page>            ::= <string> // Dateiname der page, enthalten im page-Ordner
    | <data>            ::= <object> // zusätzliche Daten, die im Frontmatter über ein request-Objekt sichtbar sind
    | <json>            ::= <jsonString> // Resultat im json-Format, welches direkt an den Browser zurückgegeben wird
    | <content>         ::= <content>
    | <redirect>?       ::= <string> // optional: eine URL, auf die der Browser nach der Verarbeitung permanent weitergeleitet werden soll


Dateiinhalt
"""""""""""

Am Ende der Datei jedoch müssen die Funktionen, die nach außen hin sichtbar sein sollen, exportiet werden.
Exemplarisch sähe das wie folgt aus::

    // *file controller/guestbook.js*
    function addData(entries) {
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

    function add(data) {
        var guestbookEntries = loadJson('guestbook');
        var author = data.request.post.author;
        var text = data.request.post.text;

        guestbookEntries.push({
            author: author,
            text: text
        });

        saveJson('guestbook', guestbookEntries);

        /* more implementation */
    }