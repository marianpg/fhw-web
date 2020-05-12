Frontmatter
===========

Dateien mit der Namenserweiterung *.hbs* werden vom Framework automatisch für das Templating erkannt. Jede *hbs*-Datei kann zwei Block-Bereiche enthalten:

- Frontmatter, also die Daten
- Markup, also die Auszeichnung/die Darstellung

Beides, Frontmatter und Markup, sind optionale Angaben.

Dabei steht das Frontmatter über dem Markup. Drei aufeinanderfolgende Striche leiten und schließen das Frontmatter ab.
Mit der Punktnotation wird auf strukturierte Daten zugegriffen.
Mit der Punktnotation stehen dann auf oberste Ebene zwei “globale Objekte” bereit:

**page**
    enthält die *Frontmatter*-Daten

**global**
    enthält Daten aus der *global.json*

Beispiel:

    .. code-block::

        ---
        {
            "title": "Kontaktbuch",
            "person": {
                "firstname": "Nadine",
                "lastname": "Schmidt"
            }
        }
        ---

    .. code-block:: handlebars

        <!DOCTYPE  html>
        <html  lang="en">
        <head>
            <meta  charset="UTF-8">
            <meta  name="viewport"  content="width=device-width, initial-scale=1.0">
            <link  rel="stylesheet"  href="/assets/{{style.css}}">
            <title>{{global.json}}</title>
        </head>
        <body>
            <h1>{{page.title}}</h1>
            <p>Vorname: {{page.person.firstname}}</p>
            <p>Nachname: {{page.person.lastname}}</p>
        </body>
        </html>

Beides, Frontmatter und Markup, sind jeweils optionale Angaben.
