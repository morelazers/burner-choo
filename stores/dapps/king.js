module.exports = store

const ethers = require('ethers')

const abi = require('../../contracts/KING.abi')

const DEFAULT_STATE = {
  CONTRACT_ADDRESS: '0xA1c6F1c705C48847804436c7790bffbEe62E1733',
  price: 758,
  requested: false,
  waiting: false,
  prize: 0
}


function store (state, emitter) {

  // set up the initial state of our dapp
  state.dapps.king = DEFAULT_STATE

  let king = state.dapps.king;

  // create your contract instance
  king.contract = new ethers.Contract(king.CONTRACT_ADDRESS, abi, state.provider)
  
  // bind event listenerd
  king.contract.on(king.contract.filters.NewKing(), (newKing) => {
    king.king = newKing;

    if (state.wallet.address.toLowerCase() === newKing.toLowerCase()) {
      king.waiting = false;
    }
  })

  getInfo()

  emitter.on('king.pay', () => {
    king.requested = true
    king.waiting = true
    emitter.emit('render')

    emitter.emit(
      'wallet.sendTokens',
      king.CONTRACT_ADDRESS,
      king.price,
      "0x0",
      {
        txSent: () => `Claiming the throne`,
        txConfirmedClient: () => {
          emit('king.crowned')
          return `Crowned`
        }
      }
      )
  })

  emitter.on('king.crowned', () => {
    king.waiting = false
    emitter.emit('render')
  })

  async function getInfo () {
    const prize = await king.contract.prize();
    king.prize = prize.toNumber();    
    console.log(`prize ${king.prize}`)
  }

}