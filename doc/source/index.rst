..  FHW Web documentation master file, created by
    sphinx-quickstart on Tue Apr 10 19:25:46 2018.
    You can adapt this file completely to your liking, but it should at least
    contain the root `toctree` directive.

FHW Web Dokumentation
=====================

Erste Schritte
==============

Projekteinrichtung
^^^^^^^^^^^^^^^^^^
Folgende Befehle müssen erstmalig im Projektordner ausgeführt werden::

    $ npm init #alle Rückfragen mit 'y' bzw. 'j' für yes/ja bestätigen
    $ npm install --save fhw-web

Lege dann eine Datei index.js mit folgendem Inhalt an::

    'use strict';
    var fhWeb = require('fhw-web');

    fhWeb.start({
        port: 8080
    });

Anschließend lässt sich der Server wie folgt starten::

    $ npm start


Wesentliche Elemente
^^^^^^^^^^^^^^^^^^^^

Für die Verwendung des Frameworks sollten zum Stand des 26.03.2018 die Kapitel eins bis vier der Veranstaltung
`Webanwendungen <https://webanwendungen.fh-wedel.de/>`_ studiert werden.
Dabei werden drei wesentliche Aspekte im Framework umgesetzt:

- Frontmatter und "Handlebars-Expression"

  Die Trennung der Daten von ihrer Repräsentation und die Verwendung der "Handlebars-Expression":
  `siehe VL#Frontmatter <https://webanwendungen.fh-wedel.de/lectures/03-templating.html#angabe-von-daten-im-frontmatter>`_

- Mehrstufige Template-Logik

  Das Einsetzen spezieller, wiederkehrender Fragmente (Stichwort {{include}}) bzw. Referenzieren eines Templates
  (Stichworte template und {{content}}).
  `siehe VL#Templating <https://webanwendungen.fh-wedel.de/lectures/03-templating.html#mehrstufige-templating-logik>`_

  Wiederkehrende Elemente sind dabei logisch voneinander trennbare Inhalte.
  Dies wäre beispielsweise bei einem Header oder Footer der Fall.

  Referenzierte Templates hingegen enthalten ein für den Inhalt nicht weiter relevantes (Html-) Gerüst und rendern den
  eigentlichen content an einer explizit ausgewiesenen Stelle.
  `siehe VL#Templating`_

- Organisation der Daten

  Jede hbs-Datei kann ein Frontmatter enthalten. Frontmatter-Daten, die in einer page, also einem Einstiegspunkt
  einer Request, angegeben werden, sind auch für die inkludierten templates sichtbar, umgekehrt jedoch nicht.

  Dabei werden die Daten, die innerhalb einer page definiert sind, in ein page Objekt gepackt. Globale Daten aus der
  global.json werden in ein global Objekt gepackt::

    {
        "name": "Marcus"
    }

     <p>{global.salut} {page.name}</p>

  Bei Namenskonflikten gewinnt das zuletzt spezifizierte Feld; es "gewinnt" somit "das letzte include".


Projektstruktur
^^^^^^^^^^^^^^^

Für die Aufgaben der SchülerUni sowie für die erste Aufgabe für die Studierenden werden die Routen magisch
bereitgestellt; es ist keine Routendefinition notwendig. Diese wird vom Server anhand der Request-Url hergeleitet.
Die angeforderte page wird auf dem Dateisystem entsprechend gesucht.

- pages/

  Hier werden die hbs-Dokumente erstellt, die sich über den Webbrowser aufrufen lassen. Der Aufruf der Website
  entspricht dabei folgendem Schema::

    http://localhost:8080/**Dateiname**

  Wird kein Dateiname angegeben, wird implizit nach einer index.hbs gesucht. Die Dateierweiterung "hbs" kann im
  Webbrowser ausgelassen werden.

  *Hinweis*: Aufgrund der statischen Ressource 'assets' können keine pages mit diesen Namen sinnvoll angelegt werden.


- templates/

  Hier werden die hbs-Dokumente erstellt, die für die
  `mehrstufige Template-Logik <https://webanwendungen.fh-wedel.de/lectures/03-templating.html#mehrstufige-templating-logik>`_
  verwendet werden sollen.

- assets/

  Hierhin gehören sämtliche statische Ressourcen, wie beispielsweise Bilder oder Stylesheets. Eine derartige Ressource
  lässt sich dann über den Pfad /assets/**Dateiname** aufrufen.


- global.json

  Globale Daten, die für alle pages gelten und verfügbar sein sollen, gehören in diese Datei.

..  toctree::
    :maxdepth: 2


Indices and tables
==================

*   :ref:`genindex`
*   :ref:`modindex`
*   :ref:`search`
