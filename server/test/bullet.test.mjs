'use strict'

import chai from 'chai'
import assert from 'assert'
import Bullet from '../src/bullet.mjs'

const expect = chai.expect

const x = 5
const y = 6
const angle = 90
const id = 9001
describe('Bullet class', function(){

	const bullet = new Bullet(x,y,angle,id)

	it('Bullet decay', (done) => {

		expect(bullet.decay).to.equal(3000)
		done()
			
	})
})
