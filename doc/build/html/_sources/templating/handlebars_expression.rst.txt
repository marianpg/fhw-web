Handlebars-Expression
=====================

Für den Übungsverlauf genügt es sich mit den Ausdrücken für Abzweigungen und Schleifen anzuvertrauen; eine vollständige Auflistung aller in Handlebars möglichen Ausdrücke sind in der `offiziellen Dokumentation <https://handlebarsjs.com/guide/builtin-helpers.html>`_ zu finden.

Beispiel mit Abzweigungen
-------------------------

    .. code-block::

        ---
        {
            "person": {
                "firstname": "Nadine",
                "lastname": "Schmidt",
                "is-student": true
            }
        }
        ---

    .. code-block:: handlebars

        {{#if page.person}}
            <p>Folgende Person gefunden:</p>
            <ul>
                <li>Vorname: {{page.firstname}}</li>
                <li>Nachname: {{page.lastname}}</li>
                {{#if page.person.is-student}}
                <li>studiert</li>
                {{/if}}
            </ul>
        {{/if}}
        {{else}}
            <p>Keine Person gefunden</p>
        {{/if}}


Beispiel mit Schleifen
----------------------

    .. code-block::

        ---
        {
            "fruits": [
                "apple", "banana", "chery", "dragonfruit" 
            ],
            "persons": [
                { "firstname": "Pasquale", "lastname": "Schmidt" },
                { "firstname": "Tina", "lastname": "Meier" }
            ]
        }
        ---

    .. code-block:: handlebars

        <ul>
            {{#each page.fruits}}
            <li></li>
            {{/each}}
        </ul>
        <ul>
            {{#each page.persons}}
            <li>{{this.firstname}} {{this.lastname}}</li>
            {{/each}}
        </ul>
