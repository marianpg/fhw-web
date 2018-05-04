Helper
======

Helper sind ein von Handlebars zur Verfügung gestelltes Konstrukt, womit es möglich ist,
wiederverwendbare Funktionen zu definieren. Diese lassen sich dann im Handlebars-Quelltext verwenden.

Konkret lassen sich damit

1. Inhalte zusammenstellen, die sich nicht direkt aus dem HTML und Frontmatter Kontext ergeben oder herleiten lassen
2. Ausdrücke in if-Bedingungen auswerten
3. Eingaben formatieren


Anwendungsbeispiele
^^^^^^^^^^^^^^^^^^^

Die hier vorgestellten Anwendungsbeispiele sollen vorab eine Vorstellung über Anwendungs- und Umsetzungsszenarien liefern.
Dabei wird auf die darauffolgend vorgestellte Definitionsbeschreibung vorgefriffen.

Beispiel zu 1)
""""""""""""""
::

    <!-- pages/helper-example-current-time.hbs -->
    {
    }
    ---
    <p>Uhrzeit: {{print-current-time}}</p>

    <!-- helpers/print-current-time.js -->
    module.exports = function() {
        var date = new Date();
        return date.toLocaleTimeString();
    };


Beispiel zu 2)
""""""""""""""
::

    <!-- pages/helper-example-if-expression.hbs -->
    {
        "conditionOne": true,
        "conditionTwo": false
    }
    ---
    {{#if (logic-and page.conditionOne page.conditionTwo)}}
        <p>Wahr</p>
    {{else}}
        <p>Falsch</p>
    {{/if}}

    <!-- helpers/logic-and.js -->
    module.exports = function(condOne, condTwo) {
	    return condOne && condTwo;
    };


Beispiel zu 3)
""""""""""""""
::

    <!-- pages/helper-example-format -->
    {
        "name": "Marcus"
    }
    ---
    <p>Hallo {{to-uppercase page.name}}</p>

    <!-- helpers/to-uppercase.js -->
    module.exports = function(str) {
        return str.toUpperCase();
    };


Helperdefinition
^^^^^^^^^^^^^^^^

Helper anlegen
""""""""""""""
Ein Helper muss im Ordner *"<Projektordner>/helpers/"* als Javascript-Datei (\*.js)
abgelegt sein. In diesem Ordner können beliebig viele Helper definiert werden.
Es kann nur ein Helper je Datei hinterlegt sein.
Diese Javascript-Datei exportiert dann eine Funktion::

    <!-- helpers/logic-and.js -->
    module.exports = function(condOne, condTwo) {
        return condOne && condTwo;
    };


Helper verwenden
""""""""""""""""
Die eigens definierten Helper-Funktionen können dann in der üblichen Handlebars Schreibweise in geschweiften
Klammern mit Parametern aufgerufen werden.
Parameter werden dabei durch Leerzeichen nacheinander aufgeschrieben::

    <p>Hallo {{to-uppercase page.name}}</p>

Es können auch Helper definiert werdne, die keine Parameter erwarten. Entsprechend parameterlos erfolgt der Aufruf::

    <p>Uhrzeit: {{print-current-time}}</p>


Schachteln von Helpern
""""""""""""""""""""""
Es lassen sich ebenfalls Helper-Funktionen schachteln. Das heißt, der Ergebniswert
eines *inneren* Helpers wird als Eingabewert für einen *äußeren* Helper verwendet.
Die Besonderheit hier ist, dass der innere Aufruf, also die Auswertung des inneren Konstrukts,
in *runden Klammern* erfolgt.::

    <!-- pages/example-min-max.hbs -->
    {
        "number": -3
    }
    ---
    <p>Zahl zwischen 0 und 100: {{min 100 (max page.number 0)}}</p>

    <!-- helpers/min.js -->
    modmodule.exports = function(numOne, numTwo) {
        return Math.min(numOne, numTwo);
    };

    <!-- helpers/max.js -->
    module.exports = function(numOne, numTwo) {
        return Math.max(numOne, numTwo);
    };


Auswertung von Ausdrücken
"""""""""""""""""""""""""
Ähnlich dem Schachteln von Helpern, lassen sich so auch in if-Bedingungen Ausdrücke formulieren, die durch
einen Helper ausgewertet werden.
Beispiel 1) hat bereits die Funktionsweise beschrieben und ist an dieser Stelle nochmals dargestellt.
Zu beachten gilt aber, dass auch hier die Auswertung des Helpers in *runden Klammern* erfolgt, sodass
das if seinen Rückgabewert auswerten kann.
Tatsächlich handelt es sich bei dem verwendeten if um einen von Handlebars vordefinierten Helper, weswegen
hier die Logik der Helperschachtelung greift::

    <!-- pages/helper-example-if-expression -->
    {
        "conditionOne": true,
        "conditionTwo": false
    }
    ---
    {{#if (logic-and page.conditionOne page.conditionTwo)}}
        <p>Wahr</p>
    {{else}}
        <p>Falsch</p>
    {{/if}}

    <!-- helpers/logic-and.js -->
    module.exports = function(condOne, condTwo) {
        return condOne && condTwo;
    };