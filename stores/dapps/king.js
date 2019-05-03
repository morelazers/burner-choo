module.exports = store

const ethers = require('ethers')

const abi = require('../../contracts/KING.abi')

const DEFAULT_STATE = {
  CONTRACT_ADDRESS: '0xC3dE6a71F473aF8F850A465b7E7dAFC6aB6fB24a',
  price: 758,
  waiting: false,
  prize: 0,
  coronation: 0,
  remainingSeconds: 0,
  vacant: true
}


function store (state, emitter) {

  // set up the initial state of our dapp
  state.dapps.king = DEFAULT_STATE

  let king = state.dapps.king;

  // create your contract instance
  king.contract = new ethers.Contract(king.CONTRACT_ADDRESS, abi, state.provider)
  
  getInfo();

  // bind event listenerd
  king.contract.on(king.contract.filters.NewKing(), (newKing) => {
    king.king = newKing;
    king.vacant = false;

    if (state.wallet.address.toLowerCase() === newKing.toLowerCase()) {
      king.waiting = false;
    }

    getInfo();
  })

  secondsUntilPrize()
  
  console.log(`set interval`)
  king.interval = setInterval(secondsUntilPrize, 1000)

  emitter.on('king.pay', () => {
    king.waiting = true
    emitter.emit('render')

    clearInterval(king.interval)
    king.interval = setInterval(secondsUntilPrize, 1000)

    emitter.emit(
      'wallet.sendTokens',
      king.CONTRACT_ADDRESS,
      king.price,
      "0x0",
      {
        txSent: () => `Claiming the throne`,
        txConfirmedClient: () => {
          return `Claimed`
        }
      }
      )
  })

  async function getInfo () {
    const prize = await king.contract.prize();
    king.prize = prize.toNumber();
    const coronation = await king.contract.coronation();
    king.coronation = coronation.toNumber();    
    console.log(`prize ${king.prize}; coronation ${king.coronation}`)
    emitter.emit('render')
  }

  function secondsUntilPrize() {
    var remaining = king.coronation + 5 * 60 - Math.floor(Date.now()/1000);
  
    if (remaining < 0) {
      remaining = 0;
      king.vacant = true;
      clearInterval(king.interval)
    }
    king.remainingSeconds = remaining;
    console.log(`secondsUntilPrize ${remaining}`)
    emitter.emit('render')
  }

}