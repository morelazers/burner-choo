const abi = require('../../contracts/KING.abi')

const ethers = require('ethers')


module.exports = store

function store (state, emitter) {

  // set up the initial state of our dapp
  state.dapps.king = {
    CONTRACT_ADDRESS: '0x9f0C0acDfD8225Ee6188617122CeF1b16f3EFE6B',
    price: 758,
    requested: false,
    waiting: false,
    prize: 0
  }

  const address = state.wallet.address

  // create your contract instance
  state.dapps.king.contract = new ethers.Contract(state.dapps.king.CONTRACT_ADDRESS, abi, state.provider)
  state.dapps.king.contract = state.dapps.king.contract.connect(state.wallet.burner)

  updateInfo()

  emitter.on('king.pay', () => {
    state.dapps.king.requested = true
    state.dapps.king.waiting = true
    emitter.emit('render')
  })

  emitter.on('king.crowned', () => {
    state.dapps.king.waiting = false
    emitter.emit('render')
  })

  async function updateInfo () {
    state.dapps.king.prize = await state.dapps.king.contract.prize()
    console.log(`prize: ${state.dapps.king.prize}`)
    state.dapps.king.prize

    //TODO Ask Tom
  }

}