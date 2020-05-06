'use strict'

import { expect } from 'chai'
import 'mocha'
import { xor, isDefined } from '.'

describe('Helper Functions', () => {

    describe('isDefined', () => {
        it('should evaluate a null value to false', () => {
            expect(isDefined(null)).to.be.false
        })
        it('should evaluate a undefined value to false', () => {
            let a
            expect(isDefined(a)).to.be.false
        })
        it('should evaluate no passed value to false', () => {
            expect(isDefined()).to.be.false
        })
        it('should evaluate an empty string to true', () => {
            expect(isDefined('')).to.be.true
        })
        it('should evaluate a number of zero to true', () => {
            expect(isDefined(0)).to.be.true
        })
        it('should evaluate an empty object to true', () => {
            expect(isDefined({})).to.be.true
        })
        it('should evaluate a boolean of false to true', () => {
            expect(isDefined(false)).to.be.true
        })
    })

    describe('xor', () => {
        it('true XOR true should be false', () => {
            expect(xor(true, true)).to.be.false
        })
        it('false XOR false should be false', () => {
            expect(xor(false, false)).to.be.false
        })
        it('true XOR false should be true', () => {
            expect(xor(true, false)).to.be.true
        })
        it('false XOR true should be true', () => {
            expect(xor(false, true)).to.be.true
        })
    })
})