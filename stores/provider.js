module.exports = store

const ethers = require('ethers')
require('dotenv').config

const { JSON_RPC_URL } = process.env

function store (state, emitter) {
  state.provider = new ethers.providers.JsonRpcProvider(JSON_RPC_URL)
}