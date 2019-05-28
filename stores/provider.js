module.exports = store

const ethers = require('ethers')

function store(state, emitter) {
  state.provider = new ethers.providers.JsonRpcProvider(state.JSON_RPC_URL)
}
