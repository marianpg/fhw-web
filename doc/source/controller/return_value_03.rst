Rückgabewert
------------

Nachdem eine Controller-Funktionen alle nötigen Verarbeitungen erledigt hat, ist das Responseverhalten zu klären; also was ist die Antwort auf die Anfrage des Clients bzw. Browsers?

Das Responseverhalten wird über den Rückgabewert der Controller-Funktion gesteuert. Folgende Verhalten sind mit dem *fhw-web*-Framework möglich:


Weiterleitung
    <redirectResult>

    Der Client erhält eine URL, auf die er weitergeleitet werden soll. Mit dem Http-Status-Code wird die Art der Weiterleitung gesteuert. Weitere Informationen siehe: `Http-Status-Code 3xx <https://www.sistrix.de/frag-sistrix/onpage-optimierung/http-statuscode/3xx-redirection/>`_, `Http-Status-Code 301 vs. 302 <https://de.ryte.com/wiki/HTTP_Status_Code#Status_Code_3xx_-_Umleitung>`_ und `SEO Tipps bei Http-Status-Code 3xx <https://www.seokratie.de/http-statuscodes/#300>`_


Page Antwort
    <pageResult>

    Zusätzlich zum Http-Status-Code wird eine *page* angegeben, die mittels Templating und einem zusätzlich angegebenen *frontmatter* vom Server generiert werden soll. Es können also zum Templating weitere Daten geladen werden.


Fragment Antwort
    <fragmentResult>

    Ähnliches Verhalten wie bei <pageResult>, allerdings wird hier ein Fragment aus dem *templates* Ordner angegeben. Eignet sich dazu, um clientseitig HTML-Fragmente zur Laufzeit auszutauschen, ohne dass eine Seite neugeladen werden soll.


Syntaxbeschreibung
^^^^^^^^^^^^^^^^^^

Eine abstrakte Syntaxbeschreibung des Rückgabeobjekts *return* ist wie folgt:

    .. code-block::

        | <return>          ::=     <redirectResult>
        |                       |   <pageResult>
        |                       |   <fragmentResult>
        |
        | <redirectResult>  ::= { <status>, <redirect> }
        | <pageResult>      ::= { <status>, <frontmatter>, <page> }
        | <fragmentResult>  ::= { <status>, <frontmatter>, <fragment> }
        |
        | <status>          ::= <integer> // entspricht dem HTTP-Status-Code, insb. wichtig bei der Weiterleitung
        | <redirect>        ::= <string>  // eine URL, auf die der Browser nach der Verarbeitung weitergeleitet werden soll
        | <frontmatter>     ::= <object>  // zusätzliche Daten, die im Frontmatter über das page-Objekt sichtbar sind
        | <page>            ::= <string>  // Dateiname der page, enthalten im page-Ordner
        | <fragment>        ::= <string> // Dateiname des fragments, enthalten im templates-Ordner


Beispiele
^^^^^^^^^


**<redirectResult>**

    .. code-block:: js

        return {
            status: 307, // HTTP-Status-Code
            redirect: 'https://www.reddit.com/r/funny/' // URL, auf die der Client bzw. der Browser temporär, also vorübergehend, weitergeleitet werden soll
        }


**<pageResult>**

    .. code-block:: js

        return {
            status: 200, // HTTP-Status-Code
            page: 'persons', // es gibt also eine Datei /pages/persons.hbs
            frontmatter: { // die Templating-Datei enthält irgendwo im Quelltext folgende Ausdrücke: {{ page.firstname }} {{ page.lastname }}
                firstname: "Tina",
                lastname: "Meier"
            }
        }


**<fragmentResult>**

    .. code-block:: js

        return {
            status: 200, // HTTP-Status-Code
            fragment: 'grid-item', // es gibt also eine Datei /templates/grid-item.hbs
            frontmatter: { // die Templating-Datei enthält irgendwo im Quelltext folgende Ausdrücke: {{ page.caption }} {{ page.highlight }}
                caption: "Awesome Product",
                highlight: true
            }
        }
