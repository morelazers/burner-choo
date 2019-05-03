module.exports = store

const ethers = require('ethers')
const fart = require('fart')

const abi = require('../../contracts/poop.abi')

const DEFAULT_STATE = {
  CONTRACT_ADDRESS: '0x2f5b407ad9c079bc61e49a06d8af1dcb1e53dd96',
  price: 10,
  farting: false
}

function store (state, emitter) {

  state.dapps.poop = DEFAULT_STATE
  let poop = state.dapps.poop
  poop.contract = new ethers.Contract(poop.CONTRACT_ADDRESS, abi, state.provider)
  poop.contract.on(poop.contract.filters.DoFart(), (culprit) => {
    if (culprit.toLowerCase() !== state.wallet.address.toLowerCase()) {
      fart()
    }
    poop.farting = false
    emitter.emit('render')
  })

  emitter.on('poop.noise', () => {
    // do the tx
    poop.farting = true
    emitter.emit('render')
    emitter.emit(
      'wallet.sendTokens',
      poop.CONTRACT_ADDRESS,
      poop.price,
      '0x0',
      {
        txSent: () => `Cracking one out`,
        txConfirmed: () => {
          poop.farting = false
          emitter.emit('render')
          return `You cheeky sod`
        }
      }
    )
  })

}