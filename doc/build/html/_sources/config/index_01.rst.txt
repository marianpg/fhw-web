-------------
Konfiguration
-------------

Beim Erstellen eines Servers ist es möglich ein Konfigurationsobjekt zu übergeben. Bei fehlender oder nicht vollständig definierter Konfiguration werden Standardwerte übernommen. Das Konfigurationsobjekt sollte für diese Aufgabe wie folgt definiert sein:

.. code-block:: js

    const config = {
        routing: {
            magic: true
        }
    }

    const app = new Server(config);


Der Wert ``true`` bei der Deklaration ``routing`` gibt an, ob eine Routen-Definitionsdatei angegeben wird oder ob mittels 'magisches Routing' http-Anfragen verarbeitet werden sollen.