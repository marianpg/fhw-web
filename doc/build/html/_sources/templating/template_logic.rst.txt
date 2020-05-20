Mehrstufige Template-Logik
==========================

Damit ist das Einsetzen spezieller, wiederkehrender Fragmente (Stichwort ``{{include}}``) bzw. Referenzieren eines Templates (Stichworte ``"template": ""`` im Frontmatter und ``{{content}}`` im Markup) gemeint. Beide Arten von Templates sind im Ordner *templates* abzulegen.

include
    Wiederkehrende Elemente sind dabei logisch voneinander trennbare Inhalte bzw. in sich geschlossene Fragmente. Dies wäre beispielsweise bei einem Header oder einem Footer der Fall.

template und content
    Hier sind wiederkehrende Elemente nicht in sich geschlossen. Vielmehr verhalten sich diese wie ein “Gerüst”. Die üblichen vollständigen Auszeichnungen (Doctype, head- und-body tag, meta Angaben im head-block) sind meist in allen HTML Dokumenten gleich. Der eigentliche Inhalt, der die einzelnen Seiten charakterisiert, befindet sich im body-block. Hier ist es ratsam, dieses wiederkehrende HTML-Gerüst als template auszulagern und den eigentlichen Inhalt an der gewünschten Stelle einzuspeisen.

Folgendes Beispiel wird das HTML-Gerüst in die Datei *templates/full-html.hbs* ausgelagert. Zusätzlich wird eine Datei *templates/heading.hbs* angelegt, um den Titel als in sich geschlossenes Element auszulagern. Der eigentliche Inhalt wird in der Datei *pages/index.hbs* geschrieben.

Datei: *pages/index.hbs*

    .. code-block::

        ---
        {
            "title": "Welcome",
            "template": "full-html"
        }
        ---

    .. code-block:: handlebars

        <p>Oh Hi Visitor!</p>

Datei: *templates/full-html.hbs*

    .. code-block:: handlebars

        <!DOCTYPE  html>
        <html  lang="de">
        <head>
            <meta  charset="UTF-8">
            <meta  name="viewport"  content="width=device-width, initial-scale=1.0">
            <title>{{page.title}}</title>
        </head>
        <body>
            {{include 'heading'}}
            <main>{{content}}</main>
        </body>
        </html>

Datei: *templates/title.hbs*

    .. code-block:: handlebars

        <h1>{{page.title}}</h1>


.. note::

    Ein per ``include`` einzubeziehendes Fragment wird mittels Templating erzeugt; dabei wird automatisch der *global* und *page* Kontext berücksichtigt, jedoch nicht der Kontext, der bspw. über eine Iteration zusätzlich entsteht.

Damit ein Schleifenkontext beim ``include`` dennoch berücksichtigt wird, ist dieser als *zweites Argument* dem ``include`` zu übergeben:

    Datei: *<Projektordner>/pages/personen.hbs*

        .. code-block::
        
            ---
            {
                "persons": [
                    { "firstname": "Tina", "music": "The Smiths" },
                    { "firstname": "Max", "music": "Piano" }
                ]
            }
            ---

        .. code-block:: handlebars

            <h1>Alle Personen:</h1>
            {{#each page.persons}}
            {{ include 'karte' this }}
            {{/each}}


    Datei: *<Projektordner>/templates/karte.hbs*

        .. code-block:: handlebars

            <article>
                <h1>{{ page.firstname }}</h1>
                <p>{{ page.music }}</p>
            </article>
