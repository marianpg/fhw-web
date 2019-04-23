Routen
======

Die Routendefinitionen werden in einer Datei `routes.json` beschrieben. Diese Datei muss erst im Projektordner angelegt werden.
Alternativ können in der server.js "magicRoutes" also *magische Routen* aktivieren.


Relative Pfade <> Absolute Pfade
^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^

Vorweg ist das Verständnis von `relativen und absoluten Pfadangaben
<https://webanwendungen.fh-wedel.de/lectures/01-grundlagen.html#relative-und-absolute-angaben>`_
vorausgesetzt. Folgender `Artikel
<https://medium.com/creative-web/absolute-vs-relative-pfade-889b962d32e5>`_
beschäftigt sich tiefergehend mit dem Thema.

Das Framework erlaubt in den Pfadangaben keine *".."*.
Das heißt, ein *nach oben navigieren* ist an dieser Stelle nicht möglich.

Nichtsdestotrotz können absolute und relative Pfade in Referenzen im HTML
Quellcode verwendet werden. Empfehlenswert ist die relative Pfadangabe, die
von der Wurzel der Pfadhierarchie aus, also vom Projektordner, geht.

Beispiel für einen relativen Pfad::

    <link rel="stylesheet" href="assets/style.css">

Beispiel für einen relativen Pfad, der relativ zum Wurzelknoten steht::

    <link rel="stylesheet" href="/assets/style.css">


Wären beide Beispiele Bestandteil einer *pages/categories/crime.hbs* würde das
erste Beispiel versuchen *<Projektordner>/categories/assets/style.css* auszuliefern (da relativ zur pages-Datei),
während das zweite Beispiel die *<Projektordner>/assets/style.css* ausliefern würde.

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

  Wird im wesentlichen benötigt, sobald Seiten zusätzliche, statische Dateien, bspw. Stylesheets,
  Bilder oder Javascript, einbinden.


- Seiten

  Liefert die Seiten aus, die im Webbrowser angezeigt werden.

- Controller

  Ruft bei einer Request eine bestimmte Funktion auf, sodass eine individuelle
  Verarbeitung gesendeter Daten möglich ist; bspw. Validierung, Speichern der Daten, Laden zusätzlicher
  Daten.
  Ein Controller kann selbst wieder unter anderem eine Seite zurückgeben. Näheres dazu im Abschnitt *Controller*.



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
    | <url>               ::= <string> // die aufgerufene URL
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
    | <params>            ::= {<get>, <post>}
    | <get>               ::= [<string>] // Eine Liste von erlaubten bzw. erwarteten GET-Parametern
    | <post>              ::= [<string>] // Eine Liste von erlaubten bzw. erwarteten POST-Parametern


URL
"""

Bei `<url>` wird angegeben, auf welche URL eine Route-Definition gilt. Im einfachsten Fall ist das
eine bestimmte Route, bspw. */impressum*. Darüber hinaus ist es auch möglich einer Vielzahl von
URLs zu entsprechen. Mit der Verwendung eines *\** werden beliebig viele, verschiedene gültige Zeichen
bei der Zuordnung berücksichtigt (whitelist). Bspw. */\** oder */2018-04-\**. Ersteres kommt bei den
magischen Routen zum Einsatz; Letzteres würde URLs entsprechen, die mit "/2018-04-" beginnen.

Zusätzlich lassen sich *benannte Pfad-Segmente* bzw. Pfadparameter angeben. Bspw. enthält die URL-Definition
*/guestbook_entries/:year/:month/* zwei benannte Pfad-Segmente "year" und "month".
Eine konkrete aufrufende URL könnte wie folgt aussehen *http:localhost:8080/guestbook_entries/2018/04*.
Durch die Angabe der Pfadparameter in der URL-Definition werden die Variablen "year" und "month"
mit den jeweiligen Werten "2018" und "04" im Frontmatter zugreifbar.
Eine weitere Beschreibung zu Parametern findet sich unten im Abschnitt *Parameter*.


Static und Page Route
"""""""""""""""""""""

`<static>` und `<page>` geben entweder einen Ordner oder eine konkrete Datei an,
welche ausgeliefert werden soll. Wird ein Ordner angegeben, wird der Dateiname aus
der URL hergeleitet.

Ordnerangaben müssen als solches mit einem abschließenden */\** gekennzeichnet werden.
Nachstehend verdeutlichen zwei Beispiele diese Regel:

Folgender Pfad führt zu einem *Ordner*::

    "page": "pages/*"

Folgender Pfad führt zu einer *Datei*::

    "page": "pages/impressum"


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

Soll auf eine Route nicht gleich eine Seite ausgeliefert, sondern erst eine Funktion aufgerufen werden,
wird diese Controller-Definition verwendet.
Diese setzt sich aus der Angabe des Dateinamens sowie des Funktionsnamens zusammen, wobei die Datei im Ordner
*controller* enthalten sein muss.

Im Abschnitt *Controller* werden diese näher beschrieben.


HTTP Methoden
"""""""""""""

Es ist möglich eine oder mehrere HTTP-Methoden bzw. HTTP-Verben bei einem Routen-Objekt zu definieren.


Parameter
"""""""""

Für POST und GET Parameter ist eine Deklaration der erwarteten Parameterbezeichner möglich.
Mit dieser (freiwilligen) zentralen Definition soll die Konzeptentwicklung und die Fehlersuche unterstützt werden.

Die Definition geschieht in der `<params>` Angabe und stellt somit eine whitelist von erlaubten Parametern dar.
Anders benannte werden dann verworfen.
Wird die "params" Angabe ausgelassen, werden alle Parameter akzeptiert.

Benannte Pfad-Segmente (PATH Parameter) sind von der Whitelist ausgenommen.
Diese werden durch einen korrekten Aufruf implizit als existierende Parameter gefordert.::

    [
        {
            "url": "/guestbook/entry/add",
            "method": ["put"],
            "params": {
                "post": ["author", "email", "text"]
            }, "controller": {
                "file": "guestbook",
                "function": "addEntry"
            }
        }, {
            "url": "/guestbook/entry/:id",
            "method": ["get"],
            "controller": {
                "file": "guestbook",
                "function": "getEntry"
            }
        }, {
            "url": "/guestbook/entry/:id/change",
            "method": ["post"],
            "params": {
                "post": ["author", "email", "text"]
            }, "controller": {
                "file": "guestbook",
                "function": "changeEntry"
            }
        }
    ]

Am obigen Beispiel lässt sich ebenfalls die Auswertungsreihenfolge der Routendefinitionen diskutieren.
So *muss* die Route */guestbook/entry/add* vor der */guestbook/entry/:id* definiert sein.
Bei einer umgekehrten Reihenfolge würde ein Aufruf der URL mit */add* auf die Definition mit *:id*
zutreffen.

Die ausgelesenen Parameter werden in das Frontmatter eingespeist. Dort sind die dann
nicht über das page, sondern über das *request*-Objekt zugreifbar. Bspw. ließe
sich ein per Post-Request übergebene E-Mail wie folgt auslesen::


    <p>Hallo {{request.post.email}}</p>

Wie Controller auf die Parameter zugreifen wird im folgenden Abschnitt *Controller* beschrieben.