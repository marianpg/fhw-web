'use strict'

module.exports = {
    list: async (global, request, session, database) => {
        const persons = await database.executeSql('SELECT * FROM persons;')

        return {
            status: 200,
            page: 'index',
            frontmatter: {
                'ctrl-persons': persons
            }
        }
    },
    add: async (global, request, session, database) => {
        const firstname = request.query.firstname || 'Max'
        const lastname = request.query.lastname || 'Von Controller'
        await database.executeSql(`INSERT INTO persons (firstname, lastname) VALUES ('${firstname}', '${lastname}');`)
        const persons = await database.executeSql('SELECT * FROM persons;')
        
        return {
            status: 200,
            page: 'index',
            frontmatter: {
                'ctrl-persons': persons
            }
        }
    },
    delete: async (global, request, session, database) => {
        await database.executeSql(`DELETE FROM persons;`)
        const persons = await database.executeSql('SELECT * FROM persons;')
        
        return {
            status: 200,
            page: 'index',
            frontmatter: {
                'ctrl-persons': persons
            }
        }
    }
}