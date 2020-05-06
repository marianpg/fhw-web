'use strict'

module.exports = {
    empty: (data, db) => {
        return {
            status: 200
        }
    },
    text: (data, db) => {
        return {
            status: 200,
            text: 'yay'
        }
    },
    json: (data, db) => {
        return {
            status: 200,
            json: {
                message: 'all righty!'
            }
        }
    },
    redirect: (data, db) => {
        return {
            status: 307,
            redirect: 'https://www.reddit.com/r/funny/'
        }
    },
    page: (data, db) => {
        return {
            status: 200,
            page: 'index',
            frontmatter: {
                data: 'Controller are Awesome!'
            }
        }
    },
    fragment: (data, db) => {
        return {
            status: 200,
            fragment: 'snippet',
            frontmatter: {
                data: 'Controller are Awesome!'
            }
        }
    },
    promise: (data, db) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve({
                    status: 200,
                    text: 'promises are working!'
                })
            }, 2500)
        })
    },
    "promise-2": async (data, db) => {
        const wait = new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve()
            }, 2500)
        })

        await wait

        return {
            status: 200,
            text: 'promises-2 are working!'
        }
    },
}