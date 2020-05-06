'use strict'

export type CSS = string

export type MediaQuery = string

export type ReferencedCss = {
    name: string
    source: string
    media?: MediaQuery
    content: CSS
}

export type ValidationType = 'info' | 'error' | 'non-document-error'
export const ValidationTypeMeaning: Record<ValidationType, string> = {
    'info': 'The type "info" means an informational message or warning that does not affect the validity of the document being checked.',
    'error': 'The type "error" signifies a problem that causes the validation/checking to fail.',
    'non-document-error': 'The type "non-document-error" signifies an error that causes the checking to end in an indeterminate state because the document being validated could not be examined to the end. Examples of such errors include broken schemas, bugs in the validator and IO errors. (Note that when a schema has parse errors, they are first reported as errors and then a catch-all non-document-error is also emitted.).'
}

export type NuValidation = {
    type: ValidationType
    subtype: string //TODO can be omitted eventually
    message: string
    extract: string
    firstLine?: number
    firstColumn: number
    lastLine: number
    lastColumn: number
    hiliteStart: number
    hiliteLength: number
}

export type ValidationResult = {
    type: ValidationType
    typeMeaning: string
    message: string
    extract: string[]
}

export type Validation = {
    results: ValidationResult[]
    html: string
}