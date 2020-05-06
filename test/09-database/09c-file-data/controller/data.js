'use strict'

module.exports = {
    list: (data, db) => {
        const persons = db.loadJson('persons.json') || []
        
        return {
            status: 200,
            page: 'index',
            frontmatter: {
                persons
            }
        }
    },
    add: (data, db) => {
        const persons = db.loadJson('persons') || []
        const person = {
            firstname: "Marie",
            lastname: "Schmidt"
        }

        persons.push(person)
        db.saveJson('persons', persons)

        return {
            status: 200,
            page: 'index',
            frontmatter: {
                persons
            }
        }
    }
}