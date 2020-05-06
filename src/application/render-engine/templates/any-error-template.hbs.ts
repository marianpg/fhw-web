'use strict'

export const AnyErrorTemplate = `
<h1>{{ global.error.name }} - {{ global.error.message }}</h1>
<pre>{{ global.error.stacktrace }}</pre>
`