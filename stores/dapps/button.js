module.exports = store

function store (state, emitter) {

  // set up the initial state of our dapp
  state.dapps.button = {
    CONTRACT_ADDRESS: '0x9f0C0acDfD8225Ee6188617122CeF1b16f3EFE6B',
    price: 230,
    pushed: false,
    waiting: false
  }

  emitter.on('button.pay', () => {
    state.dapps.button.pushed = true
    state.dapps.button.waiting = true
    emitter.emit('render')
  })

  emitter.on('button.pushed', () => {
    state.dapps.button.waiting = false
    emitter.emit('render')
  })

}