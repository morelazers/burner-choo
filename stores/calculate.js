module.exports = store

function store(state, emitter) {
  state.calculate = {
    input: '',
    formattedInput: ''
  }
  emitter.on('numPress', function(arg) {
    if (arg === 'DEL') {
      state.calculate.input = state.calculate.input.slice(
        0,
        state.calculate.input.length - 1
      )
    } else if (arg === '.' && state.calculate.input.indexOf('.') !== -1) {
      return
    } else if (state.calculate.input.length > 5) {
      return
    } else {
      state.calculate.input += arg
    }
    state.calculate.formattedInput = Number(
      state.calculate.input
    ).toLocaleString()
    emitter.emit('render')
  })
}
