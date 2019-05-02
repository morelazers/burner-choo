module.exports = store

const ethers = require('ethers')

const abi = require('../../contracts/BUTTON.abi')

const DEFAULT_STATE = {
  CONTRACT_ADDRESS: '0x9f0C0acDfD8225Ee6188617122CeF1b16f3EFE6B',
  price: 230,
  pushed: false,
  waiting: false
}

function store (state, emitter) {

  // set up the initial state of our dapp
  state.dapps.button = DEFAULT_STATE

  let button = state.dapps.button
  button.contract = new ethers.Contract(button.CONTRACT_ADDRESS, abi, state.provider)

  // bind event listenerd
  button.contract.on(button.contract.filters.Pushed(), (pusher, boom) => {
    if (state.wallet.address.toLowerCase() === pusher.toLowerCase()) {
      
      console.log(`Boom: ${boom}`)
      button.boom = boom;
      button.waiting = false;
      emitter.emit('render')
    }
  })

  emitter.on('button.pay', () => {
    button.pushed = true
    button.waiting = true
    emitter.emit('render')

    emitter.emit(
      'wallet.sendTokens',
      button.CONTRACT_ADDRESS,
      button.price,
      "0x0",
      {
        txSent: () => `Pushing the button`,
        txConfirmedClient: () => {
          return `Button was pushed`
        }
      }
      ) 
    })

  emitter.on('button.reset', () => {
    button.pushed = false
    button.waiting = false
  })

}