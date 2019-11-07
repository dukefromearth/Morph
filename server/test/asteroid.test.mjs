'use strict'

import chai from 'chai'
import assert from 'assert'
import Asteroid from '../src/asteroid.mjs'

const expect = chai.expect

const x = 50
const y = 60
const angle = 90
describe('Ability class add(x)', function(){

	const asteroid = new Asteroid(x,y,angle)

	it('Asteroid size', (done) => {

		expect(asteroid.size).to.equal(5)
		done()
			
	})

	it('Asteroid speed', (done) => {
		
		expect(asteroid.speed).to.equal(2)
		done()
			
	})
	
})