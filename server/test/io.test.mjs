'use strict'

import client from 'socket.io-client'
import ioserver from 'socket.io'

import app from '../server.mjs'

// import 'mjs-mocha';
import assert from 'assert'
import Http from 'http'
// import mocha from 'mocha'
import chai from 'chai'
// let describe = mocha.describe

let io = ioserver(app.io)
let server = app.server
const NODE_PORT = process.env.NODE_PORT || 5000

describe('Client', function(){
	
	// this.timeout(5000)
	let socket = client.connect(`http://localhost:${NODE_PORT}`,{'forceNew':true })
	// beforeEach(function(done){
		
	// })
	
	
	// socket.connect()
	// console.log(socket.connected)
	before((done) => {
		// server.start()
		io = ioserver(app.io)
		socket = client.connect(`http://localhost:${NODE_PORT}`,{'forceNew':true })
		done()
	})

	after((done) => {
		// this last call forces the client to stop connecting
		// even if tests failed
		
		
		socket.disconnect()
		// server.close()
		done()
	})

	it('connect to server', (done) => {
		socket.on('connect', () => {
			console.log("test if connected",socket.connected)
			done()
		})

	})

	it('new player', (done) => {

		socket.emit('new player');
		done()


		// expect(io).to.throw(Error);
	})

	it('disconnect server', (done) => {
		io.close()
			socket.on('disconnect', () => {
			console.log("test if disconnected",socket.connected)
		  done()
		});
		
	})



	

	// it('new player', (done) => {
	// 	// socket.emit('bullets-update')

	// 	socket.on('connect', () => {
	// 		socket.emit('new player')
	// 		done()
	// 	})

	// })

	// it('shoot-bullet', (done) => {
	// 	socket.emit('bullets-update')
	// 	io.on('connection', function(client) {
	// 		socket.emit('bullets-update')

	// 		client.on('bullets-update', function(data) {
	// 		    done()
	// 		});

	// 		socket.emit('bullets-update')
	// 				// assert.throws(() => { throw new Error("Error thrown") }, Error, "Error thrown");

	// 	})
	// 	socket.emit('bullets-update')

	// 	// expect(io).to.throw(Error);
	// })

	// it('state', (done) => {
	// 	socket.emit('bullets-update')
	// 	io.on('connection', function(client) {
	// 		socket.emit('bullets-update')

	// 		client.on('bullets-update', function(data) {
	// 		    done()
	// 		});

	// 		socket.emit('bullets-update')
	// 				// assert.throws(() => { throw new Error("Error thrown") }, Error, "Error thrown");

	// 	})
	// 	socket.emit('bullets-update')

	// 	// expect(io).to.throw(Error);
	// })

	// it('bullets update', (done) => {
	// 	socket.emit('bullets-update')
	// 	io.on('connection', function(client) {
	// 		socket.emit('bullets-update')

	// 		client.on('bullets-update', function(data) {
	// 		    done()
	// 		});

	// 		socket.emit('bullets-update')
	// 				// assert.throws(() => { throw new Error("Error thrown") }, Error, "Error thrown");

	// 	})
	// 	socket.emit('bullets-update')

	// 	// expect(io).to.throw(Error);
	// })

	// it('disconnect server', (done) => {
	// 	this._ioserver.use((socket, next) => {
	// 		return next()
	// 	})

	// 	this._client = ioclient.connect(`http://localhost:${NODE_PORT}`)

	// 	// if we wait for the server and kill the server socket,
	// 	// the client will try to reconnect and won't be killed
	// 	// by mocha.
	// 	this._client.on('connect', () => {
	// 		done()
	// 	})
	// })


	
})
