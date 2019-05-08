module.exports = store

const ethers = require('ethers')

const abi = require('../contracts/FLEXBUXX.abi')

const DEFAULT_STATE = {
  qr: null,
  ethBalance: Number(-1),
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
    price: -1,
    joiningStatement: '',
    param: '',
    afterParams: ``,
    cta: `Swipe to confirm`
  },
  afterConfirm: () => {},
  afterSend: () => {},
  refreshFuncs: []
}

async function store (state, emitter) {
  state.wallet = Object.assign({}, DEFAULT_STATE)
  state.wallet.burner = getWallet(state.provider)
  state.wallet.address = state.wallet.burner.signingKey.address // for convenience

  // this is where you would stick some code that filled the user's wallet with
  // xDAI or whatever, if you were going to do it that way

  // set this such that other parts of our application can refresh the wallet UI
  state.wallet.refresh = () => {
    for (let refreshFunc of state.wallet.refreshFuncs) {
      refreshFunc()
    }
  }

  // @todo - rewrite this to use web3 and get rid of the ethers.js stuff
  state.wallet.tokenContractEthers = new ethers.Contract(state.TOKEN_ADDRESS, abi, state.provider)
  state.wallet.tokenContractEthers = state.wallet.tokenContractEthers.connect(state.wallet.burner)
  state.wallet.tokenContractEthers.on(state.wallet.tokenContractEthers.filters.Transfer(null, null), (f, t, v) => {
    if (t.toLowerCase() === state.wallet.address.toLowerCase()) {
      state.assist.notify('success', `Received ${state.CURRENCY_SYMBOL}${v.toNumber().toLocaleString()}!`)
    } else if (f.toLowerCase() === state.wallet.address.toLowerCase()) {
      // we were the person who sent the money but we get this notification already from send function
      // state.assist.notify('success', `Sent ${state.CURRENCY_SYMBOL}${v.toNumber().toLocaleString()}!`)
    }
    state.wallet.refresh()
  })
  setTokenBalance()



  // a whole bunch of events for you to configure the 'confirm' screen in the
  // wallet. YOU DON'T HAVE TO USE THE CONFIRM SCREEN, this is just a handy
  // little set of helpers if you do
  // @todo show how it looks when you set all these things
  emitter.on('nextTx.setBeforeParams', (s) => state.wallet.nextTx.beforeParams = s)
  emitter.on('nextTx.setPrice', (s) => state.wallet.nextTx.price = s)
  emitter.on('nextTx.setJoiningStatement', (s) => state.wallet.nextTx.joiningStatement = s)
  emitter.on('nextTx.setParam', (s) => state.wallet.nextTx.param = s)
  emitter.on('nextTx.setAfterParams', (s) => state.wallet.nextTx.afterParams = s)
  emitter.on('nextTx.setCta', (s) => state.wallet.nextTx.cta = s)
  emitter.on('nextTx.confirm', () => state.wallet.afterConfirm())
  emitter.on('nextTx.sent', () => state.wallet.afterSend())

  // send the wallet's tokens (this is hardcoded to an ERC223 at the moment)
  // we should probably make it a bit better and able to be configured
  // for example i think we should probably set:
  // state.wallet.tokens[token.address] = state.assist.Contract(token.contract)
  // this would allow us to send the token from anywhere in the wallet that we
  // had access to the address of the token
  emitter.on('wallet.sendTokens', async (t, v, b = "0x", m) => {
    // handle not enough cash here
    if (v > state.wallet.tokenBalance) {
      return state.assist.notify('error', `Balance too low`)
    }
    sendTokenTransaction(t, v, b, m)
    emitter.emit('nextTx.sent')
  })

  state.wallet.refreshFuncs.push(setTokenBalance, getEthbalance)

  // function which gets the balance of the user in a token then renders an update
  async function setTokenBalance () {
    try {
      state.wallet.tokenBalance = await getTokenBalance(state.wallet.tokenContractEthers, state.wallet.address)
      emitter.emit('render')
    } catch (e) {
      console.log(e)
    }
  }

  // sends a token transaction (currently hardcoded to a single wallet token)
  // uses the standard token tx messages unless you pass in something as messages
  async function sendTokenTransaction (to, value, bytes = '0x', messages = {}) {
    const txMessages = Object.assign(getDefaultTokenMessages(value), messages)
    const c = state.wallet.tokenContractEthers.connect(state.wallet.burner)
    const nonce = await state.provider.getTransactionCount(state.wallet.address)
    const tx = c['transfer(address,uint256,bytes)'](to, value, bytes, {
      gasPrice: ethers.utils.parseUnits('1', 'gwei'),
      gasLimit: ethers.utils.bigNumberify(500000).toHexString(),
      nonce: nonce
    })
    let dismiss = state.assist.notify('pending', txMessages.txSent(), -1)
    tx.then(async (r) => {
      await r.wait()
      dismiss()
      state.assist.notify('success', txMessages.txConfirmed())
    })
  }

  // gets the default token sending messages (should allow tokens to set a
  // symbol or something like that)
  function getDefaultTokenMessages(value) {
    return {
      txSent: () => `Sending ${state.CURRENCY_SYMBOL}${value.toLocaleString()}`,
      txConfirmed: () => `Sent ${state.CURRENCY_SYMBOL}${value.toLocaleString()}`,
      txStall: () => `Something's wrong...`,
      txConfirmed: () => `Sent ${state.CURRENCY_SYMBOL}${value.toLocaleString()}`
    }
  }

  async function getEthbalance () {
    state.wallet.ethBalance = ethers.utils.formatEther(await state.provider.getBalance(state.wallet.address))
  }

}

// gets the balance of a given user on a given token contract
async function getTokenBalance (contract, address) {
  try {
    const b = await contract.balanceOf(address)
    return b.toNumber()
  } catch (e) {
    return -1
  }
}

// gets the burner wallet from localstorage or else creates a new one
function getWallet (provider) {
  let w = localStorage.getItem('wallet')
  if (w) {
    w = new ethers.Wallet(JSON.parse(w).signingKey.privateKey, provider)
  } else  {
    w = ethers.Wallet.createRandom()
    localStorage.setItem('wallet', JSON.stringify(w))
    w = w.connect(provider)
  }
  return w
}