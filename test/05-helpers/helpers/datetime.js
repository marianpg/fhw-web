'use strict'

module.exports = {
    now: () => new Date(),
    nextDay: (timestamp) => `${timestamp}, but just the day after`
}