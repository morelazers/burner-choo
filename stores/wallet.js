module.exports = store

const ethers = require('ethers')

// const token = require()

const DEFAULT_STATE = {
  qr: null,
  signingKey: {
    address: null,
    privateKey: null
  },
  sendTokenTransaction: (to, value) => {
    /**
     * token.transfer(to, value).then(tx => {})
     */
  }
}

function store (state, emitter) {
  if (!localStorage) {
    state.wallet = DEFAULT_STATE
  } else {
    state.wallet = getWallet(state)
  }
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