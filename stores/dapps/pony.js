module.exports = store

const ethers = require('ethers')

const abi = require('../../contracts/PONY.abi')

const DEFAULT_STATE = {
  CONTRACT_ADDRESS: '0xc4De55D1d5c20fDf40c9A0D41CfC8A9245040d9b',
  price: 758,
  waiting: false,
  pony: false
}

function store (state, emitter) {

  // set up the initial state of our dapp
  state.dapps.pony = DEFAULT_STATE

  let pony = state.dapps.pony
  pony.contract = new ethers.Contract(pony.CONTRACT_ADDRESS, abi, state.provider)

  // bind event listenerd
  pony.contract.on(pony.contract.filters.NewPony(), (friend, body, mane, ponyType) => {

    if (state.wallet.address.toLowerCase() === friend.toLowerCase()) {
      pony.pony = true;
      pony.body = body.toNumber();
      pony.mane = mane.toNumber();
      pony.ponyType = ponyType;
      pony.waiting = false;
      console.log(`pony.body ${pony.body}; pony.mane ${pony.mane}; pony.ponyType ${pony.ponyType}`)
      emitter.emit('render');
    }
  })

  getInfo()

  emitter.on('pony.pay', () => {
    pony.waiting = true
    emitter.emit('render')

    emitter.emit(
      'wallet.sendTokens',
      pony.CONTRACT_ADDRESS,
      pony.price,
      "0x0",
      {
        txSent: () => `Requesting a pony`,
        txConfirmedClient: () => {
          return `Pony was delivered`
        }
      }
      ) 
    })

  async function getInfo () {
    var data = await pony.contract.getPony();

    console.log(`body: ${data}`)
    // button.pushes = pushes.toNumber();    
    // console.log(`pushes ${button.pushes}`)
  }  
}