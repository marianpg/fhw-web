'use strict'

module.exports = {
    empty: (data, database) => {
        const status = data.request.path.status;

        return {
            status
        }
    },
    text: (data, database) => {
        const status = data.request.path.status;

        return {
            status,
            text: 'yay'
        }
    },
    json: (data, database) => {
        const status = data.request.path.status;

        return {
            status,
            json: {
                message: 'all righty!'
            }
        }
    },
    redirect: (data, database) => {
        const status = data.request.path.status;

        return {
            status,
            redirect: 'https://www.reddit.com/r/funny/'
        }
    },
    page: (data, database) => {
        const status = data.request.path.status;

        return {
            status,
            page: 'index',
            frontmatter: {
                data: 'Controller are Awesome!'
            }
        }
    },
    fragment: (data, database) => {
        const status = data.request.path.status;

        return {
            status,
            fragment: 'snippet',
            frontmatter: {
                data: 'Controller are Awesome!'
            }
        }
    },
    promise: (data, database) => {
        const status = data.request.path.status;

        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve({
                    status,
                    text: 'promises are working!'
                })
            }, 2500)
        })
    },
    "promise-2": async (data, database) => {
        const status = data.request.path.status;
        
        const wait = new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve()
            }, 2500)
        })

        await wait

        return {
            status,
            text: 'promises-2 are working!'
        }
    },
}