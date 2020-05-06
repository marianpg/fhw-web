'use strict'

import { PaddedCounter, isDefined, replaceAt } from '../helper'

import { NuValidation, Validation, ValidationTypeMeaning, ValidationResult } from './types'


export const DEFAULT_LINE_DELIMITER = '| '

export class TransformValidation {

    constructor(
        private lineDelimiter?: string
    ) {
        this.lineDelimiter = isDefined(lineDelimiter)
            ? lineDelimiter
            : DEFAULT_LINE_DELIMITER
    }

    addLineNumbers(documentLines: string[]): [string[], number] {
        const amountOfLines = documentLines.length
        const paddedCounter = new PaddedCounter(1, amountOfLines - 1)

        const documentWithLineNumbers = documentLines.map(
            line => `${paddedCounter.next()}${this.lineDelimiter}${line}`
        )

        return [documentWithLineNumbers, paddedCounter.getMaxLength()]
    }

    determineColumnsToMark(
        y: number,
        numerationPad: number,
        lineLength: number,
        firstLine: number,
        lastLine: number,
        firstColumn: number,
        lastColumn: number
    ): [number, number] {
        let from = numerationPad + 1
        let to = lineLength - 1

        if ((y === firstLine) && (y === lastLine)) { //only one line
            from = numerationPad + firstColumn - 1
            to = numerationPad + lastColumn - 1
        } else if (y === firstLine) { //but multiline
            from = numerationPad + firstColumn - 1
            to = lineLength - 1
        } else if (y === lastLine) { //but multiline
            from = numerationPad + 1
            to = numerationPad + lastColumn - 1
        }

        return [from, to]
    }

    map(
        nuValidation: NuValidation,
        numerationPad: number,
        htmlWithLineNumbers: string[],
        onTransformed: (line: number, transformed: string) => void
    ): ValidationResult {
        const {
            type, subtype, message, extract,
            firstLine: _firstline, firstColumn: _firstColumn, lastLine, lastColumn,
            hiliteStart, hiliteLength
        } = nuValidation

        const firstLine = !isDefined(_firstline) ? lastLine : _firstline
        const firstColumn = !isDefined(_firstColumn) ? lastColumn : _firstColumn
        const lines: string[] = []

        for (let y = firstLine; y <= lastLine; ++y) {
            const loi = htmlWithLineNumbers[y - 1]
            let cleared = loi.split('\t').map(l => ' '.repeat(l.length)).join('\t')

            const [from, to] = this.determineColumnsToMark(
                y, numerationPad, loi.length,
                firstLine, lastLine,
                firstColumn, lastColumn
            )

            for (let x = from; x <= to; ++x) {
                if (cleared.charCodeAt(x) > 31) {
                    cleared = replaceAt(cleared, x, '^')
                }
            }

            lines.push(loi)
            lines.push(cleared)
            onTransformed(y - 1, cleared)
        }

        return {
            type,
            typeMeaning: ValidationTypeMeaning[type],
            message,
            extract: lines
        }
    }

    transform(nuValidation: NuValidation[], html: string): Validation {
        const documentLines = html.split('\n')
        const [htmlWithLineNumbers, counterLength] = this.addLineNumbers(documentLines)

        const numerationPad = counterLength + this.lineDelimiter.length
        const htmlWithExtraction = htmlWithLineNumbers.map(str => str) // copy string-array

        const results = nuValidation.map(nv => (
            this.map(
                nv,
                numerationPad,
                htmlWithLineNumbers,
                (line, transformed) => htmlWithExtraction[line] = `${htmlWithLineNumbers[line]}\n${transformed}`
            ))
        )

        return {
            results,
            html: htmlWithExtraction.join('\n')

        }
    }
}