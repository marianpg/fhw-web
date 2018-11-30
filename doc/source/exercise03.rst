Aufgabe 03
==========

Für die dritte Aufgabe werden die zuvor vorgestellten Konzepte ergänzt.

Clientseitiges Javascript
^^^^^^^^^^^^^^^^^^^^^^^^^

Diese Aufgabe beschäftigt sich im Kern um

- clientseitiges Javascript

  `siehe Kapitel 09 "Javascript im Browser" <https://webanwendungen.fh-wedel.de/lectures/09-javascript-client.html>`_

- CSS Animationen

  `siehe Kapitel 10 "CSS-Animationen" <https://webanwendungen.fh-wedel.de/lectures/10-css-animationen.html>`_



Controller
^^^^^^^^^^

Controller werden um folgende Rückgabewerte erweitert:

*Hinweis*: die folgenden Code-Schnippsel zu den Rückgabewerten sind Teil einer Controller-Datei.

*Hinweis II*: nicht alle hier vorgestellten Methoden müssen zwingend für die Aufgabe 03 verwendet werden. Diese sollen
lediglich eine Vielfalt von möglichen Lösungen erlauben.

- json

Hiermit ist es möglich clientseitig eine AJAX-Request an den Server zu senden, wodurch die Seite nicht mehr neu lädt.
Der Server kann dann mit einem json-Objekt darauf antworten. Dieses JSON-Objekt kann der Client wiederum zu weiteren
Verarbeitung verwenden.::

    const testJson = function(data) {
        return {
            status: 200,
            json: {
                "info": "Everything okay",
                "time": new Date().toLocaleString()
            }
        }
    };

- text

Analog zum json-Rückgabe-Wert ist es auch möglich einfachen Text zur weiteren Verarbeitung auszuliefern::

    const testText = function(data) {
        return {
            status: 200,
            text: "Hier gibt der Server einen Satz zurück."
        }
    };

- fragment

Hiermit ist es möglich HTML-Fragmente ("Schnippsel" bzw. "Templates") auszuliefern.
Diese unvollständigen HTML Fragmente, die sich im *templates*-Ordner befinden müssen, werden ohne HTML-Validierung
ausgeliefert.::

    const testFragment = function(data) {
        return {
            status: 200,
            fragment: "footer"
        }
    };

- promise

Mit Promises lassen sich Verarbeitungsschritte asynchron ausführen. So würde eine Server-Anfrage, die asynchron
verarbeitet wird, darauffolgende andere Server-Anfragen nicht blockieren.

Konkrete Anwendungsfälle wären Operationen auf einer Datenbank (bspw. öffnen, bearbeiten und speichern einer json-Datei)
oder das Ansprechen einer anderen, entfernten Datenquelle.

Das folgende Beispiel implementiert eine Funktion, die in 10% der Fälle die ankommenden Anfragen nicht akzeptieren.
Ansonsten erfolgt eine Text-Antwort "Alles in Ordnung"::

    const testPromise = function(data) {

        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Zufallszahl zwischen 0 und 9
                let zufallszahl = Math.floor(Math.random() * 10) % 10;
                if (zufallszahl === 0)
                    reject("Der Server möchte nicht");
                else
                    resolve({
                        status: 200,
                        text: "Alles in Ordnung"
                    });
            }, 10 * 1000); // Ausführung erst nach 10 Sekunden "Wartezeit"
        });
    };

Abschließend folgt natürlich der export der jeweiligen Controller-Funktionen::

    module.exports = {
        json: testJson,
        text: testText,
        fragment: testFragment,
        promise: testPromise
    };

Sowie eine entsprechende Routerdefinition in der routes.json::

    [{
        "url": "/json",
        "controller": {
            "file": "test",
            "function": "json"
        }
    }, {
        "url": "/text",
        "controller": {
            "file": "test",
            "function": "text"
        }
    }, {
        "url": "/fragment",
        "controller": {
            "file": "test",
            "function": "fragment"
        }
    }, {
        "url": "/promise",
        "controller": {
            "file": "test",
            "function": "promise"
        }
    }]