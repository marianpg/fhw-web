'use strict'

module.exports = {
    empty: (global, request, session, database) => {
        return {
            status: 200
        }
    },
    text: (global, request, session, database) => {
        return {
            status: 200,
            text: 'yay'
        }
    },
    json: (global, request, session, database) => {
        return {
            status: 200,
            json: {
                message: 'all righty!'
            }
        }
    },
    redirect: (global, request, session, database) => {
        return {
            status: 307,
            redirect: 'https://www.reddit.com/r/funny/'
        }
    },
    page: (global, request, session, database) => {
        return {
            status: 200,
            page: 'index',
            frontmatter: {
                data: 'Controller are Awesome!'
            }
        }
    },
    fragment: (global, request, session, database) => {
        return {
            status: 200,
            fragment: 'snippet',
            frontmatter: {
                data: 'Controller are Awesome!'
            }
        }
    },
    promise: (global, request, session, database) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve({
                    status: 200,
                    text: 'promises are working!'
                })
            }, 2500)
        })
    },
    "promise-2": async (global, request, session, database) => {
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