--------------
Erste Schritte
--------------

Im Kurs ist eine Installation- und Erste Schritte-Anleitung zu finden. Diese vermittelt neben Grundlagen auch die Werkzeuge, die zunächst installiert werden sollten:

- nodejs und npm installieren
- Visual Studio Code installieren
- Im Visual Studio Code unter “Erweiterungen” bzw. “Extensions” die Erweiterung handlebars von “André Junges” suchen und finden und installieren.


Ordner- und Dateienstruktur
===========================

Nachdem du dein SVN-Repository ausgecheckt hast, solltest du eine folgende Ordner- und Dateienstruktur in deinem Projektordner vorfinden:

.. code-block::

    - pages/
    - templates/
    - package.json
    - server.js

Sollte diese fehlen, so lege diese bitte in einem leeren Projektordner an.


Der Inhalt der Datei ```package.json``` entspricht dem folgenden:

.. code-block:: json

    {
        "name": "web-anwendungen-technologien",
        "version": "1.0.0",
        "description": "Übung Web-Anwendungen und Web-Technologien an der Fachhochschule Wedel im Sommersemester 2020",
        "main": "server.js",
        "scripts": { },
        "keywords": [],
        "author": "web_###",
        "license": "MIT",
        "dependencies": {
            "fhw-web": "^1.0.4"
        }
    }

Wobei als “author” die jeweilige im Moodle vergebene Gruppennummer einzutragen ist.

Der Inhalt der Datei ```server.js``` entspricht dem folgenden:

.. code-block:: js

    'use strict';

    const  Server = require('fhw-web');

    const  config = {
        routing: {
            magic:  true
        }
    }

    const  app = new  Server(config);
    app.start();

Zur Übung 01 muss ein magisches routen eingeschaltet werden, da wir erst mit der Übung 02 das Routing lernen und selbst definieren.


.. include:: server.rst


Eine erste Website ausliefern
=============================

Hierzu muss im pages Ordner eine Datei erstellt werden, die der Server an den Web-Browser ausliefern kann. Im einfachsten Fall ist es eine Datei ohne Templating.

Lege dazu eine ``index.html`` Datei im ``pages`` Ordner mit folgendem Inhalt an:

.. code-block:: html

    <!DOCTYPE  html>
    <html  lang="de">
    <head>
        <meta  charset="UTF-8">
        <meta  name="viewport"  content="width=device-width, initial-scale=1.0">
        <title>Web-Anwendungen und -Technologien</title>
    </head>
    <body>
    </body>
    </html>

Nachdem der Server gestartet wurde lässt sich das Dokument im Web-Browser über folgende URL aufrufen:

- localhost:8080
- localhost:8080/index
- localhost:8080/index.html
