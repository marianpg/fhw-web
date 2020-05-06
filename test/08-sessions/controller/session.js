'use strict'

module.exports = {
    list: (data, db) => {
        return {
            status: 200,
            json: {
                id: data.session.getId(),
                meta: data.session.getMeta(),
                data: data.session.getData()
            }
        }
    },
    add: (data, db) => {
        const session = data.session
        const sessionData = data.session.getData()
        sessionData.randoms = sessionData.randoms ? sessionData.randoms : []
        sessionData.randoms.push(Math.random())

        session.save(sessionData)

        return {
            status: 200,
            json: {
                id: session.getId(),
                meta: session.getMeta(),
                data: session.getData()
            }
        }
    }
}