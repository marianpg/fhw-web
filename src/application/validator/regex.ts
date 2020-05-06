'use strict'

export class Regex {
    static readonly INLINE_CSS = /(?:<style[\s\S]*?>)([\s\S]*?)(?:<\/style>)/g
    static readonly LINKED_CSS = /(?:<link[\s\S]*?href[\s\S]*?=[\s\S]*?")(.*\.css)(?:[\s\S]*?"[\s\S]*?>)/g
    static readonly IMPORTED_CSS = /(?:@import[\s\S]*?(?:url\()?["'])(.*)(?:["'](?:\))?[\s\S]*?)([\w\W^;]*?)(?:;)/g
    static readonly CLOSING_HEAD_TAG = /<\/head[\s\S^]?>/g
}