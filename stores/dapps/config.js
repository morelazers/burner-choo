module.exports = store

function store (state, emitter) {

  // the initial config for your dapp

  state.dapps = {
    list: [
      {
        name: 'Regatta',
        link: 'regatta',
        icon: '/assets/dapps/tarot/icon.png'
      },
      {
        name: 'Tarot',
        link: 'tarot',
        icon: '/assets/dapps/tarot/icon.png'
      },
      {
        name: 'Picture Wall',
        link: 'picture-wall',
        icon: '/assets/dapps/tarot/icon.png'
      },
      {
        name: 'Button',
        link: 'button',
        icon: '/assets/dapps/tarot/icon.png'
      }
    ]
  }
}