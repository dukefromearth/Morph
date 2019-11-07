'use strict'

import chai from 'chai'
import assert from 'assert'
import Ability from '../src/ability.mjs'

const expect = chai.expect

const name = "matt"
const max = 100
const x = 5
const y = 6
describe('Ability class add(x)', function(){

	const ability = new Ability(name, max)

	
	before(function () {
        ability.add(x)
    });

	it('check name', (done) => {

		expect(ability.name).to.not.be.empty
		done()
			
	})

	it('add(x) check accumulator', (done) => {
		
		expect(ability.accumulator).to.equal(100)
		done()
			
	})

	it('add(x) check threshhold', (done) => {
	
		expect(ability.threshhold).to.equal(100)
		done()
			
	})


	
})

describe('Ability class sub(x)', function(){

	const ability = new Ability(name, max)

	
	before(function () {
        ability.sub(y)
    });

	it('check name', (done) => {

		expect(ability.name).to.not.be.empty
		done()
			
	})

	it('sub(x) check accumulator', (done) => {
		
		expect(ability.accumulator).to.equal(94)
		done()
			
	})

	it('sub(x) check threshhold', (done) => {
	
		expect(ability.threshhold).to.equal(100)
		done()
			
	})
})