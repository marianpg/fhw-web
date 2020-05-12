Zugriff auf Session
-------------------

Auf die Werte der Session lassen sich sowohl im Templating wie auch im Controller zugreifen. Darüber hinaus lassen sich im Controller Session-Daten auch verändern. Die Zugriffsweise ist dabei unterschiedlich.


Im Templating
^^^^^^^^^^^^^

Der ausschließliche lesende Zugriff ist nur auf die Session-Daten, also auf das Schlüsselwort ``data`` möglich. Dies geschieht über den globalen Kontext ``session`` (statt bisher ``page``).

Beispiel:

    .. code-block:: handlebars

        <ul>
            <li>{{ session.author }}</li>
            <li>{{ session.text }}</li>
        </ul>


Im Controller
^^^^^^^^^^^^^

Der ausschließlich lesende Zugriff ist auf alle Session-Informationen möglich; also sowohl auf die ID, die Meta-Daten wie auch auf die Session-Daten. Für den schreibenden Zugriff ist eine Prozedur ``save(data)`` aufzurufen. Der Parameter, der der Prozedur übergeben wird, sind die zu übernehmenden Session-Daten.

Beispiel:

    .. code-block:: js

        const mySessionFunction = (data) => {
            /* lesender Zugriff */
            const sessionId = data.session.getId();
            const sessionMeta = data.session.getMeta();
            let sessionData = data.session.getData();

            /* sessionData Objekt kann bearbeitet werden, z.B. wie folgt: */
            sessionData.author = 'Max';

            /* schreibender Zugriff */
            data.session.save(sessionData);

            /* ... weiterer Controller-Code ... */
        }
