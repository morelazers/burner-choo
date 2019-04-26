module.exports = store

/**
 * Load some dapp-specific information in this file like the ABI, address
 */

const ethers = require('ethers')

const abi = require('../contracts/VIP_PASS.abi')

const DEFAULT_BOTTOM_TEXT = 'Select one of these nerds to replace them as a VIP'

function store (state, emitter) {
  state.vip = {
    CONTRACT_ADDRESS: '0x401F73858c0D1dEfFeB94328952Ec412AC37ED64',
    list: [],
    selected: null,
    bottomText: DEFAULT_BOTTOM_TEXT,
    timeout: null,
    meVip: false
  }

  state.vip.contract = new ethers.Contract(state.vip.CONTRACT_ADDRESS, abi, state.provider)
  state.vip.contract = state.vip.contract.connect(state.wallet.burner)
  state.vip.contract.on(state.vip.contract.filters.NewVip(null, null), async (newVip) => {
    if (newVip.toLowerCase() === state.wallet.address.toLowerCase()) {
      state.assist.notify('txConfirmedClient', () => `You're now a VIP!`)
    }
    getVipStatus()
  })
  getVipStatus()

  async function getVipStatus () {
    for (let i = 0; i < 5; i++) {
      let vip = await state.vip.contract.VIPS(i)
      if (vip.price.toNumber() === 0) continue
      state.vip.list[i] = {}
      state.vip.list[i].id = i
      state.vip.list[i].price = vip.price.toNumber()
      state.vip.list[i].holder = vip.owner.toLowerCase()
    }
    state.vip.list = state.vip.list.sort((a, b) => a.price - b.price)
    const meVip = await state.vip.contract.isVip(state.wallet.address)
    state.vip.meVip = meVip
    emitter.emit('render')
  }

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