'use strict'

import chai from 'chai'
import assert from 'assert'
import Game from '../src/game.mjs'

const expect = chai.expect


describe('Game class', function(){
	
	const game = new Game(800,600);
	const player_name = "test"


	before((done) => {

		done()

	})

	after((done) => {
		
		done()
	})

	it('Adding player', (done) => {
		
		game.new_player(player_name)
		expect(Object.keys(game.players).includes(player_name)).to.be.true
		done()
			
	})

	it('Removing player', (done) => {
		
		game.delete_player(player_name)
		expect(Object.keys(game.players).includes(player_name)).to.be.false
		done()
			
	})

	it('Reviving player', (done) => {
		
		game.revive_player(player_name)
		expect(Object.keys(game.players).includes(player_name)).to.be.true
		done()
			
	})

	



	// it()
	
})
