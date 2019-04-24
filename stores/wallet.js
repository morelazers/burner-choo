module.exports = store

const ethers = require('ethers')

const abi = require('../contracts/FLEXBUXX.abi')

const DEFAULT_STATE = {
  qr: null,
  tokenContract: null,
  tokenBalance: 0,
  address: "0x0000000000000000000000000000000000000000",
  burner: {
    signingKey: {
      privateKey: "0x0000000000000000000000000000000000000000"
    },
  },
  nextTx: {
    beforeParams: `You're sending`,
    price: '0',
    joiningStatement: '',
    param: '',
    afterParams: ``,
    cta: `Swipe to confirm`
  },
  afterConfirm: () => {}
}

async function store (state, emitter) {
  state.wallet = Object.assign({}, DEFAULT_STATE)
  state.wallet.burner = getWallet(state.provider)
  state.wallet.address = state.wallet.burner.signingKey.address // for convenience

  state.wallet.tokenContract = new ethers.Contract(state.TOKEN_ADDRESS, abi, state.provider)
  state.wallet.tokenContract = state.wallet.tokenContract.connect(state.wallet.burner)
  state.wallet.tokenContract.on(state.wallet.tokenContract.filters.Transfer(null, null), async (f, t, v) => {
    console.log(f, t, v)
    setBalance()
  })
  setBalance()

  emitter.on('nextTx.setBeforeParams', (s) => state.wallet.nextTx.beforeParams = s)
  emitter.on('nextTx.setPrice', (s) => state.wallet.nextTx.price = s)
  emitter.on('nextTx.setJoiningStatement', (s) => state.wallet.nextTx.joiningStatement = s)
  emitter.on('nextTx.setParam', (s) => state.wallet.nextTx.param = s)
  emitter.on('nextTx.setAfterParams', (s) => state.wallet.nextTx.afterParams = s)
  emitter.on('nextTx.setCta', (s) => state.wallet.nextTx.cta = s)
  emitter.on('nextTx.confirm', () => state.wallet.afterConfirm())

  emitter.on('wallet.sendTokens', async (t, v) => {
    const tx = await sendTokenTransaction(t, v)
    console.log(tx)
    emitter.emit('pushState', '/')
  })


  async function setBalance () {
    state.wallet.tokenBalance = await getBalance(state.wallet.tokenContract, state.wallet.address)
    emitter.emit('render')
  }

  function sendTokenTransaction (to, value) {
    console.log(`Sending ${value} tokens to ${to}`)
    return state.wallet.tokenContract['transfer(address,uint256,bytes)'](to, value, "0x")
  }

}

async function getBalance (contract, address) {
  const b = await contract.balanceOf(address)
  return b.toNumber()
}

function getWallet (provider) {
  let w = localStorage.getItem('wallet')
  if (w) {
    w = new ethers.Wallet(JSON.parse(w).signingKey.privateKey, provider)
  } else  {
    w = ethers.Wallet.createRandom()
    localStorage.setItem('wallet', JSON.stringify(w))
  }
  console.log(w)
  return w
}