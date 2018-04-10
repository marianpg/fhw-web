Projekteinrichtung
==================
Während der Entwicklung wurden folgende npm und node Versionen verwendet:
```bash
$ npm --version
> 5.7.1
  
$ node --version
> v9.9.0
```

Anschließend müssen folgende Befehle im Projektordner ausgeführt werden:
```bash
$ npm install # lediglich beim erstmaligen Einrichten auszuführen
  
$ npm start   # zum Starten des Servers
```

Wesentliche Elemente
====================
Für die Verwendung des Frameworks sollten zum Stand des 26.03.2018
die Kapitel eins bis vier der Veranstaltung
[Webanwendungen](https://webanwendungen.fh-wedel.de/)
studiert werden.
Dabei werden drei wesentliche Aspekte im Framework umgesetzt:
  
  
* Frontmatter und "Handlebars-Expression"
  
  Die Trennung der Daten von ihrer Repräsentation
  und die Verwendung der "Handlebars-Expression":
  [siehe VL](https://webanwendungen.fh-wedel.de/lectures/03-templating.html#angabe-von-daten-im-frontmatter)
  
  
* Mehrstufige Template-Logik
  
  Das Einsetzen spezieller, wiederkehrender Fragmente
  (Stichwort *{{include}}*)
  bzw. Referenzieren eines Templates
  (Stichworte *template* und *{{content}}*).
  [siehe VL](https://webanwendungen.fh-wedel.de/lectures/03-templating.html#mehrstufige-templating-logik)
  
  Wiederkehrende Elemente sind dabei logisch voneinander trennbare Inhalte.
  Dies wäre beispielsweise bei einem Header oder Footer der Fall.
  
  Referenzierte Templates hingegen enthalten ein für den Inhalt nicht weiter
  relevantes (Html-) Gerüst und rendern den eigentlichen *content* an einer
  explizit ausgewiesenen Stelle.
  [siehe VL](https://webanwendungen.fh-wedel.de/lectures/03-templating.html#valides-html-dokument-mit-template-und-content)
  
  
* Organisation der Daten
  
  Jede hbs-Datei kann ein Frontmatter enthalten.
  Frontmatter-Daten, die in einer *page*, also einem Einstiegspunkt einer
  Request, angegeben werden, sind auch für die inkludierten templates
  sichtbar, umgekehrt jedoch nicht.
  
  Dabei werden die Daten, die innerhalb einer *page* definiert sind,
  in ein *page* Objekt gepackt. Globale Daten aus der *global.json*
  werden in ein *global* Objekt gepackt.
  
  ```json
  {
    "name": "Marcus"
  }
  ```
  ```html
    <p>{global.salut} {page.name}</p>
  ```
  
  Bei Namenskonflikten gewinnt das zuletzt spezifizierte Feld;
  es "gewinnt" somit "das letzte include".

Projektstruktur
===============
Für die Aufgaben der SchülerUni sowie für die erste Aufgabe für die
Studierenden werden die Routen *magisch* bereitgestellt; es ist keine
Routendefinition notwendig. Diese wird vom Server anhand der
Request-Url hergeleitet. Die angeforderte *page* wird auf dem
Dateisystem entsprechend gesucht.
 
 
* pages/
  
  Hier werden die hbs-Dokumente erstellt, die sich über den Webbrowser
  aufrufen lassen. Der Aufruf der Website entspricht dabei folgendem
  Schema:
  > http://localhost:8080/**Dateiname**
  
  Wird kein Dateiname angegeben, wird implizit nach einer index.hbs
  gesucht. Die Dateierweiterung "hbs" kann im Webbrowser ausgelassen
  werden.
  
  *Hinweis:* Aufgrund der statischen Ressourcen 'assets' sowie 'docs'
  können keine pages mit diesen Namen sinnvoll angelegt werden. 
  
  
* templates/
  
  Hier werden die hbs-Dokumente erstellt, die für die
  [mehrstufige Template-Logik](https://webanwendungen.fh-wedel.de/lectures/03-templating.html#mehrstufige-templating-logik)
  verwendet werden sollen.
  
  
* assets/
  
  Hierhin gehören sämtliche statische Ressourcen, wie beispielsweise
  Bilder oder Stylesheets.Eine derartige Ressource lässt sich dann über
  den Pfad /assets/**Dateiname** aufrufen.
  
  
* docs/
  
  Hier soll die Projekt-Dokumentation entstehen und über den Webbrowser
  > http://localhost:8080/docs
  
  > http://mpg.readthedocs.io
  
  aufgerufen werden können
  
  
* global.json
  
  Globale Daten, die für alle *pages* gelten und verfügbar sein sollen,
  gehören in diese Datei.
  