Server
======

Alle nachfolgenden Befehle sind im Terminal auszuführen. Das Terminal muss dabei im Projektordner navigiert sein.


Framework installieren
----------------------

Damit wird das ``fhw-web`` Framework dem Projekt als Abhängigkeit hinzufgefügt und auch direkt heruntergeladen bzw. installiert. Die Abhängigkeiten werden dann im ``node_modules`` Ordner abgelegt.
Die Abhängigkeit lässt sich in der ``package.json`` unterm Schlüsselwort ``dependencies`` nachlesen. Dort ist auch die jeweils installierte Versionsnummer angegeben.

``npm install --save fhw-web``


Abhängigkeiten nachträglich installieren
----------------------------------------

Sobald der ``node_modules`` Ordner fehlt, dann lässt sich dieser mit folgendem Befehl erzeugen:

``npm install``


Framework updaten
-----------------

Neue Framework-Versionen lassen sich mit folgendem Befehl nachträglich installieren:

``npm update``


Server starten
--------------

``npm start``


Server beenden
--------------

Mit der Tastenkombination ctrl c, sprich “Controll und C” bzw. “Steuerung und C” lässt sich ein im Terminal gestarteter Prozess, in diesem Fall also unser Server, beenden.