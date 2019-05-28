module.exports = store

function store(state) {
  state.dapps = {
    list: [
      {
        name: 'VIP_ZONE',
        link: 'vip',
        icon: '/assets/dapps/vip/icon.png'
      },
      {
        name: 'Chain of Thrones',
        link: 'king',
        icon: '/assets/dapps/king/icon.png'
      }
    ]
  }
}
