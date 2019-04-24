module.exports = store

/**
 * Load some dapp-specific information in this file like the ABI, address
 */

const DEFAULT_BOTTOM_TEXT = 'Select one of these nerds to replace them as a VIP'

function store (state, emitter) {
  state.vip = {
    list: [
      {
        id: 1,
        price: 183
      },
      {
        id: 3,
        price: 5871
      },
      {
        id: 2,
        price: 18381
      }
    ],
    selected: null,
    bottomText: DEFAULT_BOTTOM_TEXT,
    timeout: null
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