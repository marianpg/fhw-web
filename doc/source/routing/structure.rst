Struktur
========

Die _routes.json_ erwartet eine Liste von Routen-Objekten, wobei drei verschiedene Routen-Objekte verwendet werden können:

- statische Inhalte
  Wird im wesentlichen benötigt, sobald Seiten zusätzliche, statische Dateien, bspw. Stylesheets, Bilder oder Javascript, einbinden.
    
- Seiten
  Liefert die Seiten aus, die im Webbrowser angezeigt werden sollen. Templating wird dabei beachtet und ausgeführt.
    
- Controller
  Ruft bei einer Request eine bestimmte Funktion auf, sodass eine individuelle Verarbeitung gesendeter Daten möglich ist; bspw. Validierung, Speichern der Daten, Laden zusätzlicher Daten. Ein Controller kann selbst wieder unter anderem eine Seite zurückgeben. Näheres dazu im Abschnitt _Controller_.


.. code-block::

    | routes.json         ::= [<route>]
    |
    | <route>             ::= <staticRoute> | <pageRoute> | <controllerRoute>
    |
    | <staticRoute>       ::= {<url>, <static>}
    | <pageRoute>         ::= {<url>, <page>, <method>, <params>}
    | <controllerRoute>   ::= {<url>, <controller>, <method>, <params>}
    |
    | <url>               ::= <string> // die aufgerufene URL
    | <static>            ::= <string> // relativer Ordnerpfad ab "<Projektordner>/"
    | <page>              ::= <string> // relativer Ordnerpfad ab "<Projektordner>/pages/"
    |
    | <controller>        ::= {<file>, <function>}
    | <file>              ::= <string> // Dateiname des Controllers im Ordner "/<Projektordner>/controller"
    | <function>          ::= <string> // Funktionsbezeichnung, die der Controller *exportiert*
    |
    | <method>            ::= [<httpMethod>]
    | <httpMethod>        ::= "get" | "post" | "put" | "patch" | "delete"


<url>
-----

Bei **<url>** wird angegeben, auf welche URL eine Route-Definition gilt. Im einfachsten Fall ist das eine bestimmte Route, bspw. */impressum*. Darüber hinaus ist es auch möglich einer Vielzahl von URLs zu entsprechen. Mit der Verwendung eines *\** werden beliebig viele, verschiedene gültige Zeichen bei der Zuordnung berücksichtigt (whitelist). Bspw. */\** oder */2020-04-\**. Ersteres kommt bei den magischen Routen zum Einsatz; letzteres würde URLs entsprechen, die mit "/2020-04-" beginnen.

Zusätzlich lassen sich *benannte Pfad-Segmente* bzw. Pfadparameter angeben. Bspw. enthält die URL-Definition */guestbook_entries/:year/:month/* zwei benannte Pfad-Segmente "year" und "month". Eine konkrete aufrufende URL könnte wie folgt aussehen *http:localhost:8080/guestbook_entries/2020/04*. Durch die Angabe der Pfadparameter in der URL-Definition werden die Variablen "year" und "month" mit den jeweiligen Werten "2020" und "04" im Frontmatter zugreifbar.


<staticRoute> und <pageRoute>
-----------------------------

*\<staticRoute>* und *\<page>* geben entweder einen Ordner oder eine konkrete Datei an, welche ausgeliefert werden soll. Wird ein Ordner angegeben, wird der Dateiname aus der URL hergeleitet.

Ordnerangaben müssen als solches mit einem abschließenden */\** gekennzeichnet werden. Nachstehend verdeutlichen zwei Beispiele diese Regel:

Folgender Pfad führt zu einem Ordner: ``"static": "/assets/*"``

Folgender Pfad führt zu einer Datei: ``"page": "impressum"``


<controllerRoute>
-----------------

Soll auf eine Route nicht gleich eine Seite ausgeliefert, sondern erst eine Funktion aufgerufen werden, wird eine Controller-Definition verwendet. Diese setzt sich aus der Angabe des Dateinamens sowie des Funktionsnamens zusammen, wobei die Datei im Ordner controller enthalten sein muss.

Beispiel:

.. code-block:: json

    {
        "url": "guestbook",
        "method": ["get"],
        "controller": {
            "file": "guestbook",
            "function": "listAll"
        }
    }

Im Abschnitt *Controller* werden die Controller-Funktionen näher beschrieben.


<httpMethod>
------------

Es ist möglich eine oder mehrere HTTP-Methoden bzw. HTTP-Verben bei einem Routen-Objekt zu definieren.


