Eingabewerte
------------

Jede Controller-Funktion erhält zwei Parameter:

Erster Parameter: Daten
^^^^^^^^^^^^^^^^^^^^^^^

Der erste Parameter ist ein Datenobjekt, auf dem wiederum folgende Daten per Punktnotation zugreifbar sind:

global
    Globale-Daten

    Hier befinden sich die Daten aus der *global.json*

request
    Request-Daten

    Hier befinden sich die GET, POST und PATH-Parameter.

session
    Session-Objekt

    Hiermit lässt sich die aktuelle Session verwalten. Näheres dazu im Abschnitt *Session*.


Zweiter Parameter: Datenbank
^^^^^^^^^^^^^^^^^^^^^^^^^^^^
  
Wir arbeiten hier mit einer einfachen Form einer "Datenbank". Dies wird durch eine Sammlung von json-Dokumenten im Ordner *data* dargestellt. Über den zweiten Parameter der Controller-Funktion sind dann folgende Funktionen bzw. Prozeduren aufrufbar:

loadJson(documentName): jsonObjekt
    Funktion, womit ein JSON-Dokument gelesen wird. Der Rückgabewert dieser Funktion entsprich dem eingelesenen Datenobjekt aus der JSON-Datei.

saveJson(documentName, jsonObjekt)
    Prozedur, womit ein jsonObjekt in einer als documentName benannten Datei abgespeichert wird.


Beispiel
^^^^^^^^


Folgender Code-Ausschnitt zeigt die Verwendungsmöglichkeiten der Eingabeparameter:

    .. code-block:: js

        function printParams(data, db) {
            console.log(data.global.name); // gibt den Inhalt der Variable "name" aus der global.json
            console.log(data.request.get.name); // gibt den Inhalt der Variable "name" der GET-Parameter
            console.log(data.request.post.name); // gibt den Inhalt der Variable "name" der POST-Parameter
            console.log(data.request.path.name); // gibt den Inhalt der Variable "name" der PATH-Parameter
            // data.session wird im späteren Abschnitt behandelt
            
            // Datenbankdatei "/data/persons" laden
            const persons = db.loadJson('persons.json')
            // Das ".json" am Ende des Dateinamens ist optional
            // const persons = db.loadJson('persons')
            
            // Datenbankdatei "/data/persons" mit dem Inhalt der Variablen "persons" überschreiben und speichern
            db.saveJson('persons.json', persons)
            // Das ".json" am Ende des Dateinamens ist optional
            // db.saveJson('persons', persons)
            
            /* Rückgabewert wird als nächstes erläutert
            return {
                // .. more code
            }
            */  
        }

