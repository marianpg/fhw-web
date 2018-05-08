Routen
======

Die Routendefinitionen werden in einer Datei `routes.json` beschrieben. Diese Datei muss ggf.
erst im Projektordner angelegt werden. Existiert keine, verwendet das Framework automatisch
*magische Routen*.


Magische Routen
^^^^^^^^^^^^^^^

Diese Konfiguration definiert, dass ankommende GET-Requests als Resultat eine Seite
erwarten. Die Seiten befinden sich im Ordner *pages*; der Dateiname wird automatisch
aus der aufgerufenen URL herausgelesen. Befindet sich eine derart benannte Datei nicht, wird eine
Fehlerseite erzeugt.

Andere HTTP-Methoden sowie Request-Parameter werden dabei ignoriert.

Statische Dateien befinden sich im Ordner *assets*.

Die Konfiguration entspricht dabei einer folgenden routes.json::

    [
        {
            "url": "/assets/*",
            "static": "assets/*"
        }, {
            "url": "/*",
            "method": ["get"],
            "page": "*"
        }
    ]


Routendefinition
^^^^^^^^^^^^^^^^

Die *routes.json* erwartet eine Liste von Routen-Objekten, wobei drei verschiedene
Routen-Objekte verwendet werden können:


- statische Inhalte

  Wird im wesentlichen benötigt, sobald Seiten zusätzliche Dateien, bspw. Stylesheets,
  Bilder oder Javascript, einbinden.


- Seiten

  Liefert die Seiten aus, die im Webbrowser angezeigt werden.

- Controller

  Ruft bei einer Request eine bestimmte Funktion auf, sodass eine individuelle
  Verarbeitung gesendeter Daten möglich ist; bspw. Validierung, Speichern der Daten, Laden zusätzlicher
  Daten.
  Ein Controller kann selbst wieder eine Seite oder Json zurückgeben. Näheres dazu im Abschnitt *Controller*.



Datenstruktur
^^^^^^^^^^^^^
    ::

    | routes.json         ::= [<route>]
    |
    | <route>             ::= <staticRoute> | <pageRoute> | <controllerRoute>
    |
    | <staticRoute>       ::= {<url>, <static>}
    | <pageRoute>         ::= {<url>, <page>, <method>, <params>}
    | <controllerRoute>   ::= {<url>, <controller>, <method>, <params>}
    |
    | <url>               ::= <string> // die aufrufende URL
    | <static>            ::= <string> // relativer Ordnerpfad ab "Projektordner/"
    | <page>              ::= <string> // relativer Ordnerpfad ab "Projektordner/pages/"
    |
    | <controller>        ::= {<file>, <function>}
    | <file>              ::= <string> // Dateiname des Controllers im Ordner "/Projektordner/controller"
    | <function>          ::= <string> // Funktionsbezeichnung, die der Controller *exportiert*
    |
    | <method>            ::= [<httpMethod>]
    | <httpMethod>        ::= "get" | "post" | "put" | "patch" | "delete"
    |
    | <params>            ::= {<pathParams>, <getParams>, <postParams>}
    | <pathParams>        ::= [<string>]
    | <getParams>         ::= [<string>]
    | <postParams>        ::= [<string>]


URL
"""

Bei `<url>` wird angegeben, auf welche URL eine Route-Definition gilt. Im einfachsten Fall ist das
eine bestimmte Route, bspw. */impressum*. Darüber hinaus ist es auch möglich einer Vielzahl von
URLs zu entsprechen. Mit der Verwendung eines *\** werden beliebig viele, verschiedene gültige Zeichen
bei der Zuordnung berücksichtigt (whitelist). Bspw. */\** oder */2018-04-\**. Ersteres kommt bei den
magischen Routen zum Einsatz; Letzteres würde URLs entsprechen, die mit "/2018-04-" beginnen.

Zusätzlich lassen sich *Pfadparameter* angeben. Bspw. enthält die URL-Definition
*/guestbook_entries/:year/:month/* zwei Pfadparameter "year" und "month".
Eine konkrete aufrufende URL könnte wie folgt aussehen *http:localhost:8080/guestbook_entries/2018/04*.
Durch die Angabe der Pfadparameter in der URL-Definition werden die Variablen "year" und "month"
mit den jeweiligen Werten "2018" und "04" im Frontmatter zugreifbar.
Eine weitere Beschreibung zu Parametern findet sich unten im Abschnitt *Parameter*.


Static und Page Route
"""""""""""""""""""""

`<static>` und `<page>` geben an, welche Dateien geliefert werden sollen. Auch hier ist es möglich,
ähnlich der URL-Angabe, mit einem *\** eine whitelist zu definieren.


Controller Route
""""""""""""""""
::

    {
        "url": "guestbook",
        "method": ["get"],
        "controller": {
            "file": "guestbook",
            "function": "listAll"
        }
    }

Soll auf eine Route nicht gleich eine Seite geliefert, sondern erst eine Funktion aufgerufen werden,
wird diese Controller Definition verwendet.
Diese setzt sich aus der Angabe des Dateinamens sowie des Funktionsnamens zusammen, wobei die Datei im Ordner
*controller* enthalten sein muss.

Im Abschnitt *Controller* werden diese näher beschrieben.


HTTP Methoden
"""""""""""""

Es ist möglich eine oder mehrere HTTP-Methoden bei einem Routen-Objekt zu definieren.


Parameter
"""""""""

Für POST und GET Parameter ist eine Deklaration notwendig, welche Parameterbezeichner erwartet werden.
Dies geschieht in der `<params>` Angabe und stellt somit eine whitelist von erlaubten Parametern dar.
Anders benannte werden verworfen.
PATH Parameter sind von der Whitelist ausgenommen. Diese werden durch einen korrekten Aufruf implizit als
existierende Parameter gefordert.

Die ausgelesenen Parameter werden in das Frontmatter eingespeist. Dort sind die dann
nicht über das page, sondern über das *request*-Objekt zugreifbar. Bspw. ließe
sich ein per Post-Request übergebener Name wie folgt auslesen::


    <p>Hallo {{request.post.name}}</p>