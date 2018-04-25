Erste Schritte
==============

Erstmaliges Einrichten
^^^^^^^^^^^^^^^^^^^^^^

Lege zunächst einen leeren Projektordner an.
In diesem erstellst du eine `package.json` und eine `server.js` Datei an.

package.json
""""""""""""
Hier werden diverse Informationen über das Projekt gespeichert. Es können bspw. Informationen über den Projektnamen,
Versionsnummer, den Autoren, der Lizenz, etc., angegeben werden. Außerdem wird hier das fhw-web Framework mit einer
bestimmten Versionsnummer als Abhängigkeit beschrieben.
Das heißt, dass das Projekt Funktionalitäten eines Moduls namens "fhw-web" benötigt.

Für die erste Übung sollte sollte diese folgendem Inhalt entsprechen::

    {
      "name": "web-uebung-01",
      "version": "1.0.0",
      "description": "Web-Anwendungen - Übung 01",
      "main": "server.js",
      "scripts": {

      },
      "keywords": [],
      "author": "",
      "license": "ISC",
      "dependencies": {
        "fhw-web": "0.6.3"
      }
    }


server.js
"""""""""
Dies ist das Startskript, also das Skript, welches zum Starten des Servers ausgeführt wird.
Zunächst wird das fhw-web Framework in das Skript eingebunden, sodass dessen Funktionen verwendet werden können.

Zum Starten des Servers wird die bereitgestellte Funktion `start` aufgerufen. Dieser Funktion kann optional ein
Konfigurations-Objekt übergeben werden. Aktuell sind folgende Optionen möglich::

    {
        "port": <Integer> // default 8080
        "validator": {
            "html": <Boolean>, // default true
            "css": <Boolean>   // default true
        }
    }


Für die erste Übung sollte sollte diese folgendem Inhalt entsprechen::

    'use strict';
    var fhWeb = require('fhw-web');

    fhWeb.start({
        port: 8080
    });


Framework installieren
^^^^^^^^^^^^^^^^^^^^^^
Zum erstmaligen Herunterladen und Installieren des Frameworks führe über das Terminal folgenden Befehl aus::

    $ npm install


Framework aktualisieren (Update)
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Im Verlauf der nächsten Übungen kann es vorkommen, dass Aktualisierungen während der Übungsbearbeitung, installiert werden
müssen. Sollte dies nötig werden, wird das an alle Übungsteilnehmer-innen kommuniziert.
Die aktuell genutzte Version des Frameworks lässt sich aus der `package.json` Zeile in der Zeile `fhw-web` rauslesen.
Dort ist die gewünschte Versionsnummer einzutragen. Anschließend muss folgender Befehl im Projektordner ausgeführt werden::

    $ npm update


Server starten
^^^^^^^^^^^^^^

Um den Server zu starten muss im Projektordner folgender Befehl ausgeführt werden::

    $ npm start

Es werden ansonsten keine weiteren Aktionen über das Terminal ausgeführt.
Dennoch ist es aus Debug-Gründen eine interessante Anlaufstelle.
Jeder Aufruf einer Seite über den Webbrowser, also jede Anfrage an den Server, wird über das Terminal protokolliert.




Wesentliche Elemente
^^^^^^^^^^^^^^^^^^^^

Für die Bearbeitung der Aufgabe 01 sollten die Kapitel eins bis fünf der Veranstaltung
`Webanwendungen <https://webanwendungen.fh-wedel.de/>`_ studiert werden.
Dabei werden drei wesentliche Aspekte im Framework umgesetzt:

- Frontmatter und "Handlebars-Expression"

  Die Trennung der Daten von ihrer Repräsentation und die Verwendung der "Handlebars-Expression":
  `siehe VL#frontmatter <https://webanwendungen.fh-wedel.de/lectures/03-templating.html#angabe-von-daten-im-frontmatter>`_


- Mehrstufige Template-Logik

  Das Einsetzen spezieller, wiederkehrender Fragmente (Stichwort {{include}}) bzw. Referenzieren eines Templates
  (Stichworte template und {{content}}).

  - include

    Wiederkehrende Elemente sind dabei logisch voneinander trennbare Inhalte bzw. in sich geschlossene Fragmente.
    Dies wäre beispielsweise bei einem Header oder Footer der Fall.
    `siehe VL#templating-include <https://webanwendungen.fh-wedel.de/lectures/03-templating.html#einbindung-mit-include>`_

  - template und content

    An anderer Stelle sind wiederkehrende Elemente *nicht* in sich geschlossen. Vielmehr verhalten sich diese wie ein `Gerüst`.
    Dies geschieht bereits bei vollständigen und validen HTML Dokumenten. Die üblichen vollständigen Auszeichnungen
    (Doctype, head- und-body tag, meta Angaben im head-block) sind meist in allen HTML Dokumenten gleich.
    Der eigentliche Inhalt, der die einzelnen Seiten charakterisiert, befindet sich im body-block.
    Hier ist es ratsam, dieses wiederkehrende `HTML-Gerüst` als template auszulagern und den eigentlichen Inhalt
    an der gewünschten Stelle einzuspeisen.
    `siehe VL#templating-template-and-content <https://webanwendungen.fh-wedel.de/lectures/03-templating.html#einbindung-mit-template-und-content>`_

    Hinweis: Das `HTML-Gerüst` ist dabei im Ordner `templates`, der eigentliche Inhalt, der das template
    referenziert, im Ordner `pages` unterzubringen.


- Organisation der Daten

  Jede hbs-Datei kann ein Frontmatter enthalten. Diese werden von der eigentlichen HTML Auszeichnung durch eine
  Trennzeile "- - -" (drei aufeinanderfolgende Minuszeichen) voneinander getrennt.

  Dabei werden die Daten, die innerhalb einer page-Datei definiert sind, in ein page Objekt gepackt.
  Globale Daten aus der global.json werden in ein global Objekt gepackt::

    {
        "name": "Marcus"
    }
    ---
    {{include "navigation"}}
    <p>{{global.salut}} {{page.name}}</p>


  Frontmatter-Daten, die in einer page-Datei definiert werden, sind auch für die inkludierten templates sichtbar,
  umgekehrt jedoch nicht.
  Das heißt, das inkludierte Template "navigation" hat Einsicht auf das `page.name`. Sollte die "navigation" selbst
  Frontmatter-Daten definieren, sind diese für die page-Datei, die die navigation einbindet, nicht sichtbar.

  Dabei können Namenskonflikte entstehen. Dies wäre der Fall, sobald die eingebundene "navigation" ebenfalls im
  Frontmatter ein "name" Attribut definiert.
  Bei Namenskonflikten gewinnt das zuletzt spezifizierte Feld; es "gewinnt" somit "das letzte include".


Projekt-/Ordnerstruktur
^^^^^^^^^^^^^^^^^^^^^^^

Für die Aufgabe 01 werden Routen `magisch` bereitgestellt. Routing-Angaben enthalten im Wesentlichen Informationen
darüber, welche Ressourcen

- der Server generell bereitstellt

  Bspw. ist eine auferufene URL erlaubt bzw. gültig?

- mit welcher Abfrage erreicht werden können

  Bspw. eine Ressource ist nur mit get-Anfragen erreichbar oder erwartet einen post-Parameter

- wie vom Server bereitgestellt werden

  Bspw. es soll eine statische Datei ("asset") oder eine page geliefert werden


In der ersten Aufgabe sollen keine Routing-Informationen verfasst werden. Diese wird vom Server anhand der Request-Url
hergeleitet. Die angeforderte page wird dann auf dem Dateisystem entsprechend gesucht.
Bspw. ein Aufruf der Seite `http:\\localhost:8080/impressum` führt dazu, dass der Server im Ordner `pages` nach einer
`impressum.hbs` sucht und im Erfolgsfall diese auch liefert.

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
  lässt sich dann über den Pfad assets/**Dateiname** aufrufen.
  Folgendes Beispiel bindet die statische Ressource `header.css` aus dem Ordner `assets` ein::

    <link rel="stylesheet" type="text/css" href="assets/header.css">


- global.json

  Globale Daten, verfasst im json-Dateiformat, die für alle pages gelten und verfügbar sein sollen,
  gehören in diese Datei.


Fehlerfälle
^^^^^^^^^^^

Das Framework überprüft bei jedem Seitenaufruf, ob das erzeugte HTML-Dokument vollständig und valide ist.
Eingebundene Stylesheets werden ebenso überprüft.

Bei Verletzung der jeweiligen Definitionen werden `Fehlerseiten` automatisch generiert.
Diese zeichnen sich dadurch aus, dass die Hintergrundfarbe der Seite auf ein "dunkelrot" gesetzt wird.
Eine genauere Fehlerbeschreibung findet sich im HTML-Quelltext.

In Fällen, in denen das erzeugte HTML-Dokument grundlegende Fehler in der Unterteilung des head- und body-Bereichs
hat, schlägt die Einfärbung fehl. Stattdessen wird auf der Seite an einer Stelle ein `style="background-color: #b30000;"`
ausgegeben. Dies dient hier ebenfalls als Fehlerindikator.

Um diesen einzusehen empfiehlt es sich die jeweiligen `Developer Tools` der verschiedenen Webbrowser zu verwenden.
Je nach Webbrowser werden die unterschiedlich betitelt. Meist lassen dich sich im Kontext-Menü unter dem Namen
"Entwickler-Werkzeuge", "Developer-Tools", etc. finden.
Hier möchten wir den `Inspector` verwenden und kriegen damit eine interaktive Ansicht zum dargestellten HTML-Quelltext.

Vor bzw. nach dem Body-Tag findet sich ein "Error Description" betitelter, versteckter Div-Tag.
Mit einem Doppelklick auf das style-Attribut lässt sich dieser bearbeiten und entfernen, sodass die Fehlernachricht
angezeigt wird. Alternativ lässt sich die Fehlerbeschreibung auch im Inspector untersuchen.

Bspw. erzeugt ein Aufruf, einer nicht vorhandenen page `http://localhost:8080/invalid` folgenden HTML-Quelltext::

    <!-- Error Description in hidden div below -->
    <html>
      <head>
      </head>
      <body style="background-color: #b30000;">
        <div title="Error Description" style="display: none;">
          <h1>An Error occured:</h1>
          <code name="stacktrace">Error: File invalid.hbs not found in Directory pages/</code>
          <pre name="extract"></pre>
          <div name="raw-extract" style="display: hidden";></div>
        </div>
      </body>
    </html>


Minimales Beispiel
^^^^^^^^^^^^^^^^^^
Das folgende minimale Beispiel enthält eine Website eines Headhunters. Dieser möchte über seine Startseite zu zwei Personen
ihre Lebensläufe präsentieren.

Folgende Dateien liegen im Projektordner zusätzlich zu der oben beschriebenen `package.json` und `server.js` vor::

    - global.json
    - assets/
      - main.css
    - pages/
      - index.hbs
      - karl-e.hbs
      - tine-m.hbs
    - templates/
      - full-html.hbs
      - lebenslauf.hbs
      - navigation.hbs


global.json
"""""""""""
  ::

    {
      "title": "Headhunter",
      "style": "assets/main.css",
      "links": [
        { "name": "Startseite", "ressource": "/" },
        { "name": "Tine M.", "ressource": "tine-m" },
        { "name": "Karl E.", "ressource": "karl-e" }
      ]
    }

assets/main.css
"""""""""""""""
  ::

    body {
        background-color: silver;
    }


pages/index.hbs
"""""""""""""""
  ::

    {
        "title": "Startseite",
        "template": "full-html"
    }
    ---
    <h1>Willkommen auf meiner Seite</h1>
    <p>Hier finden Sie Lebensläufe zu interessanten Personen</p>


pages/karl-e.hbs
""""""""""""""""
  ::

    {
        "title": "Lebenslauf von Karl E.",
        "template": "full-html",
        "name": "Karl E.",
        "age": 22,
        "place": "Wedel"
    }
    ---
    {{include "lebenslauf"}}


pages/tine-m.hbs
""""""""""""""""
  ::

    {
        "title": "Lebenslauf von Tine M.",
        "template": "full-html",
        "name": "Tine M.",
        "age": 23,
        "place": "Hamburg"
    }
    ---
    {{include "lebenslauf"}}


templates/full-html.hbs
"""""""""""""""""""""""
  ::

    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>{{ global.title }}: {{ page.title }}</title>
        <link rel="stylesheet" type="text/css" href="{{global.style}}">
    </head>
    <body>
        {{ content }}
        {{include "navigation" }}
    </body>
    </html>


templates/lebenslauf.hbs
""""""""""""""""""""""""
  ::

    <h2>Lebenslauf</h2>
    <ul>
        <li>Name: {{page.name}}</li>
        <li>Alter: {{page.age}}</li>
        <li>Wohnort: {{page.place}}</li>
    </ul>


templates/navigation.hbs
""""""""""""""""""""""""
  ::

    <h2>Navigation</h2>
    <ul>
        {{#each global.links}}
        <li>
            <a href="{{this.ressource}}">{{this.name}}</a>
        </li>
        {{/each}}
    </ul>




