Helper
======

Helper sind ein von Handlebars zur Verfügung gestellte Erweiterung, womit es möglich ist, wiederverwendbare Funktionen zu definieren. Diese lassen sich dann im Templating-Quelltext verwenden.

Konkret lassen sich damit

1.  Inhalte zusammenstellen, die sich nicht direkt aus dem HTML und Frontmatter Kontext ergeben oder herleiten lassen
2.  Werte formatieren
3.  Ausdrücke in if-Bedingungen auswerten

Zu diesen drei Szenarien stellen die untenstehenden *Anwendungsbeispiele* exemplarisch Codeausschnitte dar. Zunächst aber die Definition.


Helper anlegen
--------------

Um Helper zu definieren, müssen gleichartige Helper in einem Modul zusammengefasst werden. Diese Module sind dann als Javascript-Dateien (\*.js) im Ordner *<Projektordner>/helpers/* anzulegen. Es können mehrere Helper je Datei definiert werden. Dies ist sinnvoll, um thematisch gleichartige Routinen zusammenzufassen. Bspw. würden Helper, die mathematische Ausdrücke auswerten, in einer Datei *math.js*, wohingegen Routinen, die Zeit- und Datumsangaben bereitstellen, in einer Datei *datetime.js* hinterlegt werden.

Eine solche Javascript-Datei exportiert dann ein Objekt mit benannten Funktionen:
*<Projektordner>/helpers/logic.js*

.. code-block:: js

    function and(condOne, condTwo) {
        return condOne && condTwo;
    }

    function or(condOne, condTwo) {
        return condOne || condTwo;
    }

    module.exports = {
        "logic-and": and,
        "logic-or": or
    }

An diesem Beispiel wird deutlich, dass der Funktionsname in einem Modul nicht mit der Helper-Bezeichnung übereinstimmen muss, die letzten Endes nach außen hin exportiert wird.


Helper verwenden
----------------

Die eigens definierten Helper-Funktionen können dann in der üblichen Handlebars Schreibweise in geschweiften Klammern mit Parametern aufgerufen werden. Parameter werden dabei durch Leerzeichen nacheinander aufgeschrieben:

.. code-block::

    ---
    {
        "conditionOne": true,
        "conditionTwo:" false
    }
    ---


.. code-block:: handlebars

    <p>Die Und-Verknüpfung ist: {{ and page.conditionOne page.conditionTwo }}

Es können auch Helper definiert werdne, die keine Parameter erwarten. Entsprechend parameterlos erfolgt der Aufruf:

.. code-block:: handlebars

    <p>Uhrzeit: {{print-current-time}}</p>



Anwendungsbeispiele
-------------------

Die hier vorgestellten Anwendungsbeispiele sollen vorab eine Vorstellung über Anwendungs- und Umsetzungsszenarien liefern. Dabei wird auf die darauffolgend vorgestellte Definitionsbeschreibung vorgefriffen.


1. Beispiel
^^^^^^^^^^^

Datei: *<Projektordner>/pages/helper-example-current-time.hbs*

    .. code-block::

        ---
        {
        }
        ---

    .. code-block:: handlebars

        <p>Uhrzeit: {{print-current-time}}</p>


Datei: *<Projektordner>/helpers/time.js*

    .. code-block:: js

        function current() {
            const date = new Date();
            return date.toLocaleTimeString();
        }

        module.exports = {
            "print-current-time": current
        }


2. Beispiel
^^^^^^^^^^^

Datei: *<Projektordner>/pages/helper-example-format.hbs*

    .. code-block::

        ---
        {
            "name": "Marcus"
        }
        ---

    .. code-block:: handlebars

        <p>Hallo {{to-uppercase page.name}}</p>

Datei: *<Projektordner>/helpers/string.js*

    .. code-block:: js

        function toUpperCase(str) {
            return str.toUpperCase();
        }

        module.exports = {
            "to-uppercase": toUpperCase
        }


3. Beispiel
^^^^^^^^^^^

Datei: *<Projektordner>/pages/helper-example-if-expression.hbs*

    .. code-block::

        ---
        {
            "conditionOne": true,
            "conditionTwo": false
        }
        ---

    .. code-block:: handlebars

        {{#if (logic-and page.conditionOne page.conditionTwo)}}
        <p>Wahr</p>
        {{else}}
        <p>Falsch</p>
        {{/if}}

Datei: *<Projektordner>/helpers/logic.js*

    .. code-block::

        function and(conditionOne, conditionTwo) {
            return conditionOne && conditionTwo;
        }

        module.exports = {
            "logic-and": and
        }



Schachteln von Helpern
----------------------

Es lassen sich ebenfalls Helper-Funktionen schachteln. Das heißt, der Ergebniswert eines *inneren* Helpers wird als Eingabewert für einen *äußeren* Helper verwendet. Die Besonderheit hier ist, dass der innere Aufruf, also die Auswertung des inneren Konstrukts, in *runden Klammern* erfolgt.:

Datei: *<Projektordner>_/pages/example-min-max.hbs*

    .. code-block::

        ---
        {
            "number": -3
        }
        ---

    .. code-block::

        <p>Zahl zwischen 0 und 100: {{min 100 (max page.number 0)}}</p>

Datei: *<Projektordner>_/helpers/math.js*

    .. code-block::

        module.exports = {
            "min": function(numOne, numTwo) {
                let result = numOne;
                
                if (result > numTwo) {
                    result = numTwo;
                }
                
                return result;
            },
            "max": function(numOne, numTwo) {
                let result = numOne;
                
                if (result < numTwo) {
                    result = numTwo;
                }
                
                return result;
            }
        }


Auswertung von Ausdrücken
-------------------------

Ähnlich dem Schachteln von Helpern, lassen sich so auch in if-Bedingungen Ausdrücke formulieren, die durch einen Helper ausgewertet werden. Beispiel 3) hat bereits die Funktionsweise dargestellt.

.. code-block:: handlebars

    {{#if (logic-and page.conditionOne page.conditionTwo)}}

Zu beachten gilt aber, dass auch hier die Auswertung des Helpers in *runden Klammern* erfolgt, sodass das if seinen Rückgabewert auswerten kann. Tatsächlich handelt es sich bei dem verwendeten if um einen von Handlebars vordefinierten Helper, weswegen hier die Logik der Helperschachtelung greift.
