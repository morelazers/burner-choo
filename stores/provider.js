module.exports = store

const ethers = require('ethers')

function store (state, emitter) {
  console.log(state.JSON_RPC_URL)
  state.provider = new ethers.providers.JsonRpcProvider(state.JSON_RPC_URL)
}