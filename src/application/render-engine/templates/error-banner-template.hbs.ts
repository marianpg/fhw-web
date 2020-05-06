'use strict'

export const ErrorBannerTemplate = `
<template id="fhw-web-error">
	<style>
		* {
			line-height: 1.6;
			box-sizing: border-box;
            font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
		}
		#banner {
			top: 0;
			left: 0;
			width: 100%;
			height: 40px;
			padding: 0 8px;
			display: flex;
			justify-content: space-between;
			align-items: center;
			font-size: 11pt;
			position: fixed;
			color: white;
			background-color: #dc3546ad;
		}
		#banner span {
			font-weight: bold;
		}
		#display-error {
            font-size: 11pt;
            color: black;
			background-color: white;
			padding: 16px;
			margin-top: 40px;
			border: 4px dashed #dc3546ad;
		}
		#display-error h1 {
			margin: 0;
			font-size: 16pt;
			font-weight: bold;
		}
		#display-error pre {
		font-family: monospace;
			white-space: break-spaces;
		}
	</style>
	<div id="banner">
		<span>There are Errors you should resolve.</span>
		<button id="toggle-error"></button>
	</div>
	<div id="display-error">
		{{{ global.errorHtml }}}
	</div>
</template>
<fhw-web-error></fhw-web-error>
<script defer>
	customElements.define('fhw-web-error',
		class extends HTMLElement {
		constructor() {
			super()

			let template = document.querySelector('#fhw-web-error')
			let templateContent = template.content
			this.attachShadow({mode: 'open'}).appendChild(templateContent.cloneNode(true))
			
			function setupErrorButton(elem, container) {
				const visibility = (function() {
					return {
						is: () => localStorage.getItem('show-errors') == 'true',
						set: (visible) => localStorage.setItem('show-errors', ''+visible)
					}
				})()

				const show = () => {
					visibility.set(true)
					elem.textContent = 'hide errors'
					container.style.display = 'block'
				}
				const hide = () => {
					visibility.set(false)
					elem.textContent = 'show errors'
					container.style.display = 'none'
				}
				elem.onclick = () => visibility.is() ? hide() : show()

				if (visibility.is()) {
					show()
				} else {
					hide()
				}
			}
			const errorToggle = this.shadowRoot.querySelector('#toggle-error')
			const errorDisplay = this.shadowRoot.querySelector('#display-error')
			setupErrorButton(errorToggle, errorDisplay)
		}
	})
</script>
`