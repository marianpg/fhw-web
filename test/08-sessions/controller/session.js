'use strict'

module.exports = {
    list: (global, request, session, database) => {
        return {
            status: 200,
            json: {
                id: session.getId(),
                meta: session.getMeta(),
                data: session.getData()
            }
        }
    },
    add: (global, request, session, database) => {
        const data = session.getData()
        data.randoms = data.randoms ? data.randoms : []
        data.randoms.push(Math.random())

        session.save(data)

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