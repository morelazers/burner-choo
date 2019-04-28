module.exports = store

function store (state, emitter) {

  // the initial config for your dapp

  state.dapps = {
    list: [{
      name: 'Regatta',
      link: 'regatta'
    }, {
      name: 'Picture Wall',
      link: 'picture-wall'
    }, {
      name: 'Tarot',
      link: 'tarot'
    }]
  }
}