'use strict'

import client from 'socket.io-client'
import ioserver from 'socket.io'

import app from '../server.js'

import assert from 'assert'
import Http from 'http'
import chai from 'chai'

let io = ioserver(app.io)
let server = app.server
const expect = chai.expect
const NODE_PORT = process.env.NODE_PORT || 5000

describe('Client', function(){
	
	// this.timeout(5000)
	let socket = null

	before((done) => {

		io = ioserver(app.io)
		socket = client.connect(`http://localhost:${NODE_PORT}`,{'forceNew':true })
		done()

	})

	after((done) => {

		done()
	})

	it('connect to server', (done) => {
		socket.on('connect', () => {
			done()
		})

	})

	it('new player', (done) => {
		io.emit('state', "");

		// socket.emit('new player');
		socket.once('state', (message) => {
	      // Check that the message matches
	      expect(message).to.be.empty;
	      done();
	    });

	    io.on('connection', (socket) => {
		  expect(socket).to.not.be.null;
		});


		// expect(io).to.throw(Error);
	})

	it('disconnect server', (done) => {

		
		socket.on('disconnect', () => {
			done()
		});

		socket.disconnect()
		
	})
	
})
