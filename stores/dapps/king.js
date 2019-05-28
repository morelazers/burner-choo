module.exports = store

const ethers = require('ethers')

const abi = require('../../contracts/KING.abi')

const DEFAULT_STATE = {
  CONTRACT_ADDRESS: '0xC3dE6a71F473aF8F850A465b7E7dAFC6aB6fB24a',
  price: 758,
  waiting: false,
  prize: 0,
  coronation: 0
}

function store(state, emitter) {
  // set up the initial state of our dapp
  state.dapps.king = Object.assign({}, DEFAULT_STATE)
  let king = state.dapps.king

  refreshContracts()
  getInfo()

  // bind event listenerd
  king.contract.on(king.contract.filters.NewKing(), newKing => {
    king.king = newKing
    king.vacant = false

    if (state.wallet.address.toLowerCase() === newKing.toLowerCase()) {
      king.waiting = false
      // don't notify here since we do it as part of the txConfirmed event
    } else {
      state.assist.notify('success', `New Chain of Thrones King`)
    }
    getInfo()
    emitter.emit('king.navigate')
  })

  secondsUntilPrize()

  king.interval = setInterval(secondsUntilPrize, 1000)

  emitter.on('king.pay', () => {
    // if (king.price > state.wallet.tokenBalance) {
    // state.assist.notify('error', 'Balance too low')
    // return
    // }
    king.waiting = true
    emitter.emit('render')
    // probably need to be able to specify a failure callback here because it
    // currently breaks if you have no balance and you can't go back :D
    emitter.emit(
      'wallet.sendTokens',
      king.CONTRACT_ADDRESS,
      king.price,
      '0x0',
      {
        txSent: () => `Claiming the throne`,
        txConfirmed: () => `You are the new King`
      },
      () => {
        king.waiting = false
        emitter.emit('render')
      }
    )
  })

  emitter.emit('king.navigate', () => {
    clearInterval(king.interval)
    getInfo()
    king.interval = setInterval(secondsUntilPrize, 1000)
  })

  emitter.on('king.clear', () => {
    clearInterval(king.interval)
  })

  async function getInfo() {
    const prize = await king.contract.prize()
    king.prize = prize.toNumber()
    const coronation = await king.contract.coronation()
    king.king = await king.contract.king()
    king.coronation = coronation.toNumber()
    emitter.emit('render')
  }

  function secondsUntilPrize() {
    var remaining = Math.floor(Date.now() / 1000) - (king.coronation + 5 * 60)
    if (remaining > 0) {
      remaining = 0
      king.vacant = true
    } else {
      king.vacant = false
    }
    king.remainingSeconds = remaining
    emitter.emit('render')
  }

  function refreshContracts() {
    king.contract = new ethers.Contract(
      king.CONTRACT_ADDRESS,
      abi,
      state.provider
    )
  }
}
