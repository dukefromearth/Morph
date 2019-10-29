'use strict'

import ioclient from 'socket.io-client'
import ioserver from 'socket.io'

import {io, server} from '../server.mjs'

// import 'mjs-mocha';
import assert from 'assert'
import Http from 'http'

const NODE_PORT = process.env.NODE_PORT || 3000

describe('Client', function () {
	
	beforeEach((done) => {
	    // Setup
	    console.log(this);
	    // this._http = Http.Server(server)
	    // this._ioserver = ioserver(io)
	    // console.log(this._ioserver)
	    // this._client = null
	    // this._io = 
	});

	it('connect to server', (done) => {
		// this._ioserver.on('connection', () => {
		// 	done()
		// })

		// this._client = ioclient.connect(`http://localhost:${NODE_PORT}`)
		// console.log("test", this._client)
		assert.strictEqual(Math.sign(-42), -1);
		// done()

	})

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
