'use strict'

module.exports = {
    list: (data, database) => {
        const persons = database.loadJson('persons.json') || []
        const alphabet = database.loadJson('sub/alphabet.json') || []
        const numbers = database.loadJson('more/subfolder/numbers.json') || []

        return {
            status: 200,
            page: 'index',
            frontmatter: {
                data: [ persons, alphabet, numbers ]
            }
        }
    },
    add: (data, database) => {
        const persons = database.loadJson('persons') || []
        const person = {
            firstname: "Marie",
            lastname: "Schmidt"
        }

        persons.push(person)
        database.saveJson('persons', persons)

        return {
            status: 200,
            page: 'index',
            frontmatter: {
                data: persons
            }
        }
    },
    'alphabet-add': (data, database) => {
        const checkLoader = [
            database.loadJson('sub/alphabet'),
            database.loadJson('sub/alphabet.json'),
            database.loadJson('/sub/alphabet'),
            database.loadJson('/sub/alphabet.json')
        ]
        
        if (checkLoader.filter(dbFile => dbFile != null).length === 0) {
            return {
                status: 500,
                text: 'Loading datafile failed'
            }
        }
        const alphabet = database.loadJson('sub/alphabet')
        
        alphabet.push(
            String.fromCharCode(alphabet.slice(-1)[0].charCodeAt(0) + 1).toUpperCase() <= 'Z'
            ? String.fromCharCode(alphabet.slice(-1)[0].charCodeAt(0) + 1).toUpperCase()
            : 'A'
        )

        database.saveJson('sub/alphabet', alphabet)
        //database.saveJson('sub/alphabet.json', alphabet)
        //database.saveJson('/sub/alphabet', alphabet)
        //database.saveJson('/sub/alphabet.json', alphabet)

        return {
            status: 200,
            page: 'index',
            frontmatter: {
                data: alphabet
            }
        }
    },
    'number-add': (data, database) => {
        const checkLoader = [
            database.loadJson('more/subfolder/numbers'),
            database.loadJson('more/subfolder/numbers.json'),
            database.loadJson('/more/subfolder/numbers'),
            database.loadJson('/more/subfolder/numbers.json')
        ]
        if (checkLoader.filter(dbFile => dbFile != null).length === 0) {
            return {
                status: 500,
                text: 'Loading datafile failed'
            }
        }
        const numbers = database.loadJson('more/subfolder/numbers')

        numbers.push(
            numbers.slice(-1)[0] + 1
        )

        database.saveJson('more/subfolder/numbers', numbers)
        //database.saveJson('more/subfolder/numbers.json', numbers)
        //database.saveJson('/more/subfolder/numbers', numbers)
        //database.saveJson('/more/subfolder/numbers.json', numbers)

        return {
            status: 200,
            page: 'index',
            frontmatter: {
                data: numbers
            }
        }
    }
}