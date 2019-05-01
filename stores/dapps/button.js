const abi = require('../../contracts/BUTTON.abi')

const ethers = require('ethers')


module.exports = store

function store (state, emitter) {

  // set up the initial state of our dapp
  state.dapps.button = {
    CONTRACT_ADDRESS: '0x9f0C0acDfD8225Ee6188617122CeF1b16f3EFE6B',
    price: 230,
    pushed: false,
    waiting: false
  }

  const address = state.wallet.address

  // create your contract instance
  state.dapps.button.contract = new ethers.Contract(state.dapps.button.CONTRACT_ADDRESS, abi, state.provider)
  state.dapps.button.contract = state.dapps.button.contract.connect(state.wallet.burner)

  // bind event listenerd
  state.dapps.button.contract.on(state.dapps.button.contract.filters.Pushed(null, null), (pusher, boom) => {
    if (address.toLowerCase() === pusher.toLowerCase()) {
      
      // TODO: Ask Tom as this gets called multiple times

      console.log(`Boom: ${boom}`)
      state.dapps.button.boom = boom;
    }
  })

  emitter.on('button.pay', () => {
    state.dapps.button.pushed = true
    state.dapps.button.waiting = true
    emitter.emit('render')
  })

  emitter.on('button.pushed', () => {
    state.dapps.button.waiting = false
    emitter.emit('render')
  })

}