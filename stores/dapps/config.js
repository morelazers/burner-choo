module.exports = store

function store (state, emitter) {

  // the initial config for your dapp

  state.dapps = {
    list: [
      {
        name: 'VIP_ZONE',
        link: 'vip',
        icon: '/assets/dapps/vip/icon.png'
      },
      {
        name: 'Regatta',
        link: 'regatta',
        icon: '/assets/dapps/regatta/icon.png'
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
        name: 'Poop Noise',
        link: 'poop',
        icon: '/assets/dapps/poop/icon.png'
      },
      {
        name: 'Chain of Thrones',
        link: 'king',
        icon: '/assets/dapps/tarot/icon.png'
      },
      {
        name: 'Button',
        link: 'button',
        icon: '/assets/dapps/poop/icon.png'
      }
    ]
  }
}