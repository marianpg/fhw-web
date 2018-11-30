Aufgabe 04
==========

Für die vierte Aufgabe werden die zuvor vorgestellten Konzepte ergänzt.

Router
^^^^^^

Mit der gegenwärtigen Router-Implementierung sind folgende drei
-für die vierte Aufgabe sinnvoll anzuwendende-
Szenarien möglich.


Längere/Kürzere Pfade
"""""""""""""""""""""

Angefragte Ressource auf einen anderen, unter Umständen längeren oder kürzeren, Pfad umleiten::

    [{
        "url": "/assets/js/*,
        "static": "public/*"
    }, {
        "url": "/assets/css/*,
        "static": "public/styles/dark-theme/*"
    }]

Dies ist beispielsweise sinnvoll, wenn sich die Ordnerstruktur der statischen Dateien von der
URL-Struktur unterscheidet.
Dadurch werden beim Routing auch Unterordner berücksichtigt.


Bestimmte Dateien
"""""""""""""""""

Angefragte Ressource auf eine bestimmte Datei umleiten::

    [{
        "url": "/*",
        "static": "assets/contact.txt"
    }]

Dies ist beispielsweise sinnvoll, wenn eine bestimmte, statische Datei, unabhängig von der
geforderten Ressource, ausgeliefert werden soll.


Mehrere Routing-Objekte
"""""""""""""""""""""""

Angefragte Ressource über mehrere Routing-Objekte leiten::

    [{
        "url": "/",
        "page": "index.hbs"
    }, {
        "url": "/",
        "static": "assets/not-found.img"
    }, {
        "url": "/",
        "static": "public/contact.xt"
    }]

Dies ist beispielsweise sinnvoll, wenn es für eine angefragte Ressource mehrere
Verarbeitungsmöglichkeiten geben soll. Dabei wird diese ausgeführt, die als erstes
ein Ergebnis erzielt.

Anhand des Beispiels würde eine Anfrage *http://localhost:8080/* die Ressource */pages/index.hbs*
ausliefern, sofern diese vorhanden ist. Fehlt diese wird die Ressource */assets/not-found.img*
ausgeliefert. Fehlt auch wieder diese Datei, wird versucht die */public/contact.txt* auszuliefern.
Bei einem weiteren Misserfolg wird eine Fehlerseite derart *Could not find any matching route definition[..]*
generiert.
