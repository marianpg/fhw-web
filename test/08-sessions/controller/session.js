'use strict'

module.exports = {
    list: (data, database) => {
        return {
            status: 200,
            json: {
                id: data.session.getId(),
                meta: data.session.getMeta(),
                data: data.session.getData()
            }
        }
    },
    add: (data, database) => {
        const sessionData = data.session.getData()
        sessionData.randoms = sessionData.randoms ? sessionData.randoms : []
        sessionData.randoms.push(Math.random())

        data.session.save(sessionData)

        return {
            status: 200,
            json: {
                id: data.session.getId(),
                meta: data.session.getMeta(),
                data: data.session.getData()
            }
        }
    }
}