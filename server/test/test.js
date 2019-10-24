'use strict'

const Express = require('express')
const Http = require('http')
const ioserver = require('socket.io')
const ioclient = require('socket.io-client')

const NODE_PORT = process.env.NODE_PORT || 3000

describe('Client', function () {
	beforeEach(() => {
		const express = new Express()
		this._http = Http.Server(express)
		this._ioserver = ioserver(this._http)
		this._http.listen(NODE_PORT)
		this._client = null
	})

	it('connect to server', (done) => {
		this._ioserver.on('connection', () => {
			done()
		})

		this._client = ioclient.connect(`http://localhost:${NODE_PORT}`)
	})

	it('disconnect server', (done) => {
		this._ioserver.use((socket, next) => {
			return next()
		})

		this._client = ioclient.connect(`http://localhost:${NODE_PORT}`)

		// if we wait for the server and kill the server socket,
		// the client will try to reconnect and won't be killed
		// by mocha.
		this._client.on('connect', () => {
			done()
		})
	})

	afterEach(() => {
		// this last call forces the client to stop connecting
		// even if tests failed
		this._client.close()

		this._ioserver.close()
		this._http.close()
	})
})
