module.exports = store

const html = require('choo/html')
const ethers = require('ethers')

// @todo - we should create an alias so this doesn't have to be nested ../../
const abi = require('../../contracts/VIP_PASS.abi')

function store(state, emitter) {
  // Some initial explainer text
  const DEFAULT_BOTTOM_TEXT = html`
    <div class="tc">
      <p>Select one of these nerds to replace them as a VIP.</p>
      <p>You'll receive a grace period of 15 minutes in the VIP_ZONE.</p>
    </div>
  `

  // the initial config for your dapp
  state.vip = {
    CONTRACT_ADDRESS: '0xea8896caf3eb20c37eea22c8c6218c7c4ee6496a', // XDAI
    // CONTRACT_ADDRESS: '0xec2e3eaee6f179eb66834f76b05f94dde4bb38db', // GOERLI
    list: [],
    selected: null,
    bottomText: DEFAULT_BOTTOM_TEXT,
    timeout: null,
    meVip: false,
    meIndex: -1
  }

  let vip = state.vip

  const { provider } = state
  const { burner, address } = state.wallet

  // create your contract instance
  vip.contract = getVipContract(vip.CONTRACT_ADDRESS, abi, provider, burner)

  // bind event listeners
  setupEventNotifications(vip.contract, state)

  // get our initial dapp status
  getVipStatus(vip, address)

  // add your "state refresh" function (we refresh the wallet on certain events)
  emitter.emit('wallet.addRefreshFunc', () => getVipStatus(vip, address))

  function getVipContract(address, abi, provider, signer) {
    const contract = new ethers.Contract(address, abi, provider)
    return contract.connect(signer)
  }

  function setupEventNotifications(
    contract,
    { wallet, assist, CURRENCY_SYMBOL }
  ) {
    contract.on(
      contract.filters.NewVip(),
      (oldVip, newVip, oldPrice, newPrice) => {
        // add some notifications when an event happens
        if (oldVip.toLowerCase() === wallet.address.toLowerCase()) {
          assist.notify('error', `VIP STATUS REVOKED`)
        } else if (newVip.toLowerCase() !== wallet.address.toLowerCase()) {
          assist.notify(
            'success',
            `New VIP for ${CURRENCY_SYMBOL}${newPrice.toLocaleString()}`
          )
        }

        // refresh the wallet on an event happening (get our new token balance)
        wallet.refresh()
      }
    )
  }

  // set up a function which consumes the state to set more state
  // could be prettier sure but this is a slapdash dapp
  async function getVipStatus(vipState, address) {
    for (let i = 0; i < 5; i++) {
      let v = await vipState.contract.VIPS(i)
      if (v.price.toNumber() === 0) continue
      vipState.list[i] = {}
      vipState.list[i].id = i
      vipState.list[i].price = v.price.toNumber()
      vipState.list[i].holder = v.owner.toLowerCase()
      vipState.list[i].protectedUntil = v.protectedUntil.toNumber()
      if (vipState.list[i].holder.toLowerCase() === address.toLowerCase()) {
        vipState.meIndex = i
      }
    }
    vipState.list = vipState.list.sort((a, b) => a.price - b.price)
    vipState.meVip = await vipState.contract.isVip(state.wallet.address)

    // rerender the dapp on refresh
    emitter.emit('render')
  }

  // store some state when a VIP is selected
  emitter.on('vipSelected', id => {
    vip.selected = id
  })

  // @todo this should use the name of the currency instead of hardcoded value
  emitter.on('vip.notEnoughBalance', () => {
    vip.bottomText = "You don't have enough FLEXBUXX to replace that person"
    emitter.emit('render')
    resetTextLater()
  })

  emitter.on('vip.onCooldown', (v, t) => {
    const secondsToWait = v - t
    vip.bottomText = `This VIP still has at least ${Math.ceil(
      secondsToWait
    )} seconds in the VIP area`
    emitter.emit('render')
    resetTextLater()
  })

  function resetTextLater() {
    clearTimeout(vip.timeout)
    vip.timeout = setTimeout(() => {
      vip.bottomText = DEFAULT_BOTTOM_TEXT
      emitter.emit('render')
    }, 3000)
  }
}
