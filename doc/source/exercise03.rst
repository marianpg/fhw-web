Aufgabe 03
==========

Für die dritte Aufgabe werden die zuvor vorgestellten Konzepte ergänzt.


Controller
^^^^^^^^^^

Controller werden um folgende Rückgabewerte erweitert:

- json::

    const testJson = function(data) {
        return {
            status: 200,
            json: {
                "text": "Everything okay",
                "time": new Date().toLocaleString()
            }
        }
    };

- text::

    const testText = function(data) {
        return {
            status: 200,
            text: "Hier gibt der Server einen Satz zurück."
        }
    };

- fragment
Hiermit ist es möglich HTML-Fragmente ("Schnippsel") zu liefern.
Diese unvollständigen HTML Fragmente werden ohne HTML-Validierung ausgeliefert.::

    const testFragment = function(data) {
        return {
            status: 200,
            fragment: "footer"
        }
    };

- promise::

    const testPromise = function(data) {

        return new Promise((resolve, reject) => {
            const url = `https://jsonplaceholder.typicode.com/posts`;

            axios.get(url)
                .then(response => {
                    resolve({
                        status: 200,
                        json: response.data
                    })
                })
                .catch(error => {
                    reject(error);
                })
        });
    };

Abschließend folgt natürlich der export der jeweiligen Controller-Funktionen::

    module.exports = {
        json: testJson,
        text: testText,
        fragment: testFragment,
        promise: testPromise
    };

Sowie eine entsprechende Routerdefinition::

    {
        "url": "/fragment",
        "controller": {
            "file": "test",
            "function": "fragment"
        }
    }, {
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
        "url": "/promise",
        "controller": {
            "file": "test",
            "function": "promise"
        }
    }