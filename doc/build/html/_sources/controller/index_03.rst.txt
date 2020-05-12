----------
Controller
----------

Ein Controller ermöglicht bei Requests einen Verarbeitungszwischenschritt. So wird nicht gleich eine Response ausgeliefert, sondern zunächst eine bestimmte Funktion aufgerufen.

Sofern über die Konfiguration die Option ``database.fileData.active`` mit dem Wert ``true`` belegt ist, ist es möglich, dass der Controller Daten aus einer *Datenbank* lädt und speichert und andere Verarbeitsungsschritte unternimmt.


.. include:: structure.rst

.. include:: arguments.rst

.. include:: return_value_03.rst
