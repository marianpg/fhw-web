'use strict'

import axios from 'axios'
import url = require('url') //see https://stackoverflow.com/a/34520891

import { isDefined } from '../helper'
import { Logging } from '../logging'

import { NuValidation } from '../validator'
import { ServerConfig } from '../../public/config'


export class Request {
    constructor(
        private config: ServerConfig,
        private logging: Logging
    ) { }

    async sendNuChecker(html: string): Promise<NuValidation[]> {
        try {
            const { data } = await axios.post('https://validator.w3.org/nu/?out=json', html, {
                headers: {
                    "Content-Type": "text/html",
                    "charset": "utf-8"
                }
            })
            if (!isDefined(data.messages)) {
                throw new Error(`Invalid or unexpected Validation-Response: ${data}`)
            }
            return data.messages
        } catch (e) {
            this.logging.error(`Could not reach the validation service. Received following error: ${e}`)
            return []
        }
    }

    async getStylesheet(path: string): Promise<string> {
        try {
            const port = this.config.port
            const _url = url.resolve(`http://localhost:${port}/`, path)
            const { data } = await axios.get(_url, {
                headers: {
                    "Content-Type": "text/css",
                    "charset": "utf-8",
                    "User-Agent": "fhw-web/1.0.0 (Internal Call to fetch Stylesheet)"
                }
            })
            return data
        } catch (_) {
            this.logging.error(`Could not fetch stylesheet "${path}" for validating`)
            return ''
        }
    }
}