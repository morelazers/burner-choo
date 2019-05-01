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
  requestEth() // @todo this is hardcoded, remove later

  // -- PARITY-based nodes
  state.web3.eth.personal.newParityAccount(state.wallet.burner.signingKey.privateKey, 'have_fun_kids_______8')

  // -- GETH-based nodes (how annoying is this)
  // some other web3 call goes here

  state.wallet.refresh = () => {
    for (let refreshFunc of state.wallet.refreshFuncs) {
      refreshFunc()
    }
  }



  // @todo - rewrite this to use web3 and get rid of the ethers.js stuff
  state.wallet.tokenContract = new state.web3.eth.Contract(abi, state.TOKEN_ADDRESS)
  state.wallet.tokenContractEthers = new ethers.Contract(state.TOKEN_ADDRESS, abi, state.provider)
  state.wallet.tokenContractEthers = state.wallet.tokenContractEthers.connect(state.wallet.burner)
  state.wallet.tokenContractEthers.on(state.wallet.tokenContractEthers.filters.Transfer(null, null), (f, t, v) => {
    if (t.toLowerCase() === state.wallet.address.toLowerCase()) {
      state.assist.notify('success', `Received ${state.CURRENCY_SYMBOL}${v.toNumber().toLocaleString()}!`)
    } else if (f.toLowerCase === state.wallet.address.toLowerCase()) {
      // we were the person who sent the money
      state.assist.notify('success', `Sent ${state.CURRENCY_SYMBOL}${v.toNumber().toLocaleString()}!`)
    }
    state.wallet.refresh()
  })
  setTokenBalance()



  // a whole bunch of events for you to configure the 'confirm' screen in the
  // wallet. YOU DON'T HAVE TO USE THE CONFIRM SCREEN, this is just a handy little
  // set of helpers if you do
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
    const hash = sendTokenTransaction(t, v, b, m)
    console.log({hash})
    emitter.emit('nextTx.sent')
  })

  state.wallet.refreshFuncs.push(setTokenBalance, getEthbalance)

  emitter.on('DOMContentLoaded', function() {
    console.log('--DOM LOADED--')
    // connectToSocket()
  })

  // function which gets the balance of the user in a token (currently hardcoded)
  // then renders an update
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
    const c = state.assist.Contract(state.wallet.tokenContract)
    console.log(`Sending ${value} tokens to ${to}`)
    console.log('Unlocking account')
    await unlockAccount()
    console.log('Account unlocked, wrapping contract')
    return c.methods['transfer(address,uint256,bytes)'](to, value, bytes).send({
      from: state.wallet.address,
      gasPrice: ethers.utils.parseUnits('1', 'gwei'),
      gas: '500000'
    }, {
      messages: txMessages
    })
  }

  // unlocks the account for a single transaction
  async function unlockAccount() {
    return state.web3.eth.personal.unlockAccount(state.wallet.address, 'have_fun_kids_______8', '0x1')
  }

  // gets the default token sending messages (should allow tokens to set a
  // symbol or something like that)
  function getDefaultTokenMessages(value) {
    return {
      txSent: () => `Sending ${state.CURRENCY_SYMBOL}${value.toLocaleString()}`,
      txConfirmed: () => `Sent ${state.CURRENCY_SYMBOL}${value.toLocaleString()}`,
      txStall: () => `Something's wrong...`,
      txConfirmedClient: () => `Sent ${state.CURRENCY_SYMBOL}${value.toLocaleString()}`
    }
  }

  async function requestEth () {
    await getEthbalance()
    if (state.wallet.ethBalance === '0.0') {
      fetch(`https://us-central1-stone-botany-238814.cloudfunctions.net/givememoney?address=${state.wallet.address}`, {
        mode: 'no-cors'
      }).then((e, res) => {
        const killPending = state.assist.notify('pending', `Setting you up`, -1)
        state.provider.on(state.wallet.address, (b) => {
          if (b.toNumber() !== 0) {
            killPending()
            state.assist.notify('success', `Good to go`)
            state.wallet.refresh()
            state.provider.removeListener(state.wallet.address)
          }
        })
        console.log(e, res)
        return res
      })
    } else {
      state.assist.notify('success', `Welcome back`)
    }
  }

  async function getEthbalance () {
    state.wallet.ethBalance = ethers.utils.formatEther(await state.provider.getBalance(state.wallet.address))
  }

  // function connectToSocket () {
  //   // LET'S TRY SOME FUNKY SHIT
  //   const connection = new WebSocket(state.EVENT_SERVER)
  //   connection.onopen = () => {
  //     connection.send(state.wallet.address)
  //   }
  //   connection.onmessage = m => {
  //     const msg = JSON.parse(m.data)
  //     console.log('-- NEW EVENT SERVER MESSAGE --')
  //     console.log(msg)
  //     if (msg.type === 'BALANCE_UPDATE') {
  //       if (msg.value > state.wallet.tokenBalance) {
  //         // balance is greater now than before
  //         const sent = msg.value - state.wallet.tokenBalance
  //         state.assist.notify('txConfirmedClient', () => `Received ${state.CURRENCY_SYMBOL}${sent.toLocaleString()}`)
  //       }
  //       // we already have a 'sent' notification, so there's no need to add one here
  //       state.wallet.refresh()
  //     }
  //   }
  // }

}

// gets the balance of a given user on a given token contract
async function getTokenBalance (contract, address) {
  try {
    console.log('-- GETTING BALANCE --')
    const b = await contract.balanceOf(address)
    console.log(`-- BALANCE: ${b} --`)
    return b.toNumber()
  } catch (e) {
    console.log(e)
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
  console.log({w})
  return w
}