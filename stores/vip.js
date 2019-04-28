module.exports = store

/**
 * Load some dapp-specific information in this file like the ABI, address
 */

const ethers = require('ethers')

// @todo - we should create an alias so this doesn't have to be nested ../../
const abi = require('../contracts/VIP_PASS.abi')

const DEFAULT_BOTTOM_TEXT = 'Select one of these nerds to replace them as a VIP'

function store (state, emitter) {

  // the initial config for your dapp

  state.vip = {
    // CONTRACT_ADDRESS: '0x401F73858c0D1dEfFeB94328952Ec412AC37ED64', // XDAI
    CONTRACT_ADDRESS: '0x24dfd3d315261364833c47a5b984bfa6b62c92cd', // GOERLI
    // CONTRACT_ADDRESS: '0x842E889a5c4F9B018157f857bA0c3953Cf3f00BF', // LOCAL
    list: [],
    selected: null,
    bottomText: DEFAULT_BOTTOM_TEXT,
    timeout: null,
    meVip: false,
    meIndex: -1
  }

  // add your "state refresh" function (we refresh the wallet on certain events)
  state.wallet.refreshFuncs.push(getVipStatus)

  // create your contract instance
  state.vip.contract = new ethers.Contract(state.vip.CONTRACT_ADDRESS, abi, state.provider)
  state.vip.contract = state.vip.contract.connect(state.wallet.burner)

  // bind event listenerd
  state.vip.contract.on(state.vip.contract.filters.NewVip(null, null), (oldVip, newVip, oldPrice, newPrice) => {
    console.log({oldVip})
    console.log({newPrice})

    // add some notifications when an event happens
    if (oldVip.toLowerCase() === state.wallet.address.toLowerCase()) {
      state.assist.notify('txFailed', () => `VIP STATUS REVOKED.`)
    } else {
      state.assist.notify('txConfirmedClient', () => `New VIP for ${state.CURRENCY_SYMBOL}${newPrice}`)
    }

    // refresh the wallet on an event happening
    state.wallet.refresh()
  })

  // get our initial dapp status
  getVipStatus()

  // set up a function which consumes the state to set more state
  // could be prettier sure but this is a slapdash dapp
  async function getVipStatus () {
    for (let i = 0; i < 5; i++) {
      let vip = await state.vip.contract.VIPS(i)
      if (vip.price.toNumber() === 0) continue
      state.vip.list[i] = {}
      state.vip.list[i].id = i
      state.vip.list[i].price = vip.price.toNumber()
      state.vip.list[i].holder = vip.owner.toLowerCase()
      if (state.vip.list[i].holder.toLowerCase() === state.wallet.address.toLowerCase()) {
        state.vip.meIndex = i
      }
    }
    state.vip.list = state.vip.list.sort((a, b) => a.price - b.price)
    const meVip = await state.vip.contract.isVip(state.wallet.address)
    state.vip.meVip = meVip

    // rerender the dapp on refresh
    emitter.emit('render')
  }

  // store some state when a VIP is selected
  emitter.on('vipSelected', id => {
    state.vip.selected = id
  })

  emitter.on('vip.notEnoughBalance', () => {
    state.vip.bottomText = "You don't have enough FLEXBUXX to replace that nerd"
    emitter.emit('render')
    clearTimeout(state.timeout)
    state.timeout = setTimeout(() => {
      state.vip.bottomText = DEFAULT_BOTTOM_TEXT
      emitter.emit('render')
    }, 3000)
  })
}