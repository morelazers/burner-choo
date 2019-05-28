module.exports = store

function store(state, emitter) {
  state.events = {
    DOMTITLECHANGE: 'DOMTITLECHANGE'
  }

  emitter.on(state.events.DOMTITLECHANGE, t => {
    state.title = t
  })
}
