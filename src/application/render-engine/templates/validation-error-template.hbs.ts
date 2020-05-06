export const ValidationErrorTemplate = `
{{#each global.validation.results}}
	<h1>Validation incident of type "{{this.type}}"</h1>
	<p>{{this.message}}</p>
	<pre>
	{{#each this.extract}}
{{this}}
	{{/each}}		
	</pre>
{{/each}}

<hr>
<h1>Complete validated HTML - incidents are marked</h1>
<p>note: For the validation all linked or imported css have been commented out and have been injected in the html by the framework automatically. Your stylesheets declarations have been commented out.</p>
<pre>
{{global.validation.html}}
</pre>
`