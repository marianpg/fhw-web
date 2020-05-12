Sofern über die Konfiguration die Option ``sessions.active`` mit dem Wert ``true`` belegt ist, sind die im Folgenden Beschriebenen Verarbeitsungsschritte mit *Sessions* möglich.

Jeder Seitenaufruf bewirkt das Öffnen einer bereits existierenden oder das Eröffnen einer neuen Session. Identifiziert werden die Sessions über die *session\-id* und werden als solche benannt als json-Dateien im Ordner *<Projektordner>/sessions* abgelegt. Eine Session ist dabei solange gültig, bis der Browser geschlossen wird.

.. note::

    Aus Übersichtsgründen, erhalten die Session-IDs zusätzlich einen Zähler vorangestellt. So kann schnell die zuletzt eröffnete Session ermittelt werden.

Neben den *session\-id* existieren Meta-Daten. Dort sind einmal als ``createdAt`` ein Wert abgelegt, wann die Session eröffnet wurde und als ``lastAccess`` wann und auf welche Seite der letzte Zugriff erfolgte.

Den Hauptteil der Session werden von den Session-Daten eingenommen.
Implizit werden automatisch Session-Daten mit den aufgerufenen Request-Daten befüllt. Beachtet werden hierbei die übergebenen PATH-, GET- und POST-Daten. Sollten Parameter gleichbenannt sein, überwiegt der zuletzt in dieser Aufzählung genannte, sodass doppelt belegte Parameternamen in der Session überdeckt werden.

*Beispiel*: Wird eine Seite mit dem GET-Parameter ``?author=Max`` und gleichzeitig dem POST-Parameter ``{ "author": "Tina" }`` aufgerufen, so wird in der Session der Wert ``{ "author": "Tina" }`` hinterlegt.

Ferner lassen sich Session-Daten auch in *Controller*-Funktionen selbst erstellen bzw. verwalten.