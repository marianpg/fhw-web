Session-Datei
-------------

Im folgenden ist ein Beispiel zu sehen, das die drei Informationsarten in einer Session-Datei darstellt.

- Die *session\-id* ist als Schlüsselwort ``id`` abgespeichert.
- Die Metadaten ``createdAt`` und ``lastAccess`` liegen als eben solche benannt vor.
- Daten selbst sind dann mit dem Schlüsselwort ``data`` abgespeichert.

Beispiel, Datei: *<Projektordner>/sessions/02-89a8546a-6966-4fef-be63-830d098be54a.json*

    .. code-block:: json

        {
            "id": "02-89a8546a-6966-4fef-be63-830d098be54a",
            "createdAt": "Mon May 11 2020 18:16:17 GMT+0200 (GMT+02:00)",
            "lastAccess": {
                "timestamp": "Mon May 11 2020 19:13:47 GMT+0200 (GMT+02:00)",
                "url": "/guestbook"
            },
            "data": {
                "author": "Tina",
                "text": "Mir gefällt dieses Produkt sehr gut."
            }
        }
