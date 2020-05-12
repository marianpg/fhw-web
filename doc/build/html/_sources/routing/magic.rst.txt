Magic Routes
============

Sind in der Konfiguration *magic routes* aktiviert, so wird die *routes.json* nicht benötigt und auch nicht beachtet. Stattdessen nutzt das Framework eine eigene Routing-Definition:

.. code-block:: json

    [
        {
            "url": "*",
            "method": ["get"],
            "static": "*"
        }, {
            "url": "*",
            "method": ["get"],
            "page": "*"
        }
    ]

Mit dieser Konfiguration werden Pfadangaben der ankommenden GET-Requests wie folgt untersucht:

* befindet sich lokal ein solcher Pfad, der zu einer *statischen Datei* führt?

    * Falls ja, Datei ausliefern. Routing beendet.
    * Falls nein, nächsten Routeneintrag prüfen

* befindet sich im *pages* Ordner eine Datei, sodass übers Templating eine HTML-Seite erzeugt werden soll?

    * Falls ja, Templating ausführen und HTML ausliefern. Routing beendet.
    * Falls nein, nächsten Routeneintrag prüfen

* Kein Routeneintrag mehr vorhanden. GET-Request kann nicht umgesetzt werden. Es wird eine Fehlermeldung ausgegeben. Routing beendet.

Andere HTTP-Methoden sowie Request-Parameter werden dabei ignoriert.