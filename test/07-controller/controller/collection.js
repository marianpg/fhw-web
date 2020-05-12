'use strict'

module.exports = {
    empty: (data, database) => {
        return {
            status: 200
        }
    },
    text: (data, database) => {
        return {
            status: 200,
            text: 'yay'
        }
    },
    json: (data, database) => {
        return {
            status: 200,
            json: {
                message: 'all righty!'
            }
        }
    },
    redirect: (data, database) => {
        return {
            status: 307,
            redirect: 'https://www.reddit.com/r/funny/'
        }
    },
    page: (data, database) => {
        return {
            status: 200,
            page: 'index',
            frontmatter: {
                data: 'Controller are Awesome!'
            }
        }
    },
    fragment: (data, database) => {
        return {
            status: 200,
            fragment: 'snippet',
            frontmatter: {
                data: 'Controller are Awesome!'
            }
        }
    },
    promise: (data, database) => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve({
                    status: 200,
                    text: 'promises are working!'
                })
            }, 2500)
        })
    },
    "promise-2": async (data, database) => {
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