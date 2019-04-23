const html = require('choo/html')
const css = require('sheetify')

const TITLE = 'TI-83'

module.exports = (state, emit) => {
  if (state.title !== TITLE) emit(state.events.DOMTITLECHANGE, TITLE)

  console.log({state})

  // when tachyons doesn't pull through
  const style = css`
    .phat-caret {
      width: 1.5rem;
      height: 3rem;
      background: #A7E4AE;
    }

    .keypad div button,
    .keypad div span {
      height: 6rem;
    }

    .proceed {
      background: #A7E4AE80;
      color: #2A333E;
    }
  `

  return html`
    <body class="flex flex-column pa0 items-center tc justify-between">
      <div class="flex tc f-subheadline pa5 items-center">
        ${state.CURRENCY_SYMBOL}${state.calculate.input}
        <span class="phat-caret"></span>
      </div>
      <div class="keypad w-100 flex flex-column f1">
        <div class="flex flex-row">
          <button class="w-33" onclick=${() => emit('numPress', 1)}>1</button>
          <button class="w-33" onclick=${() => emit('numPress', 2)}>2</button>
          <button class="w-33" onclick=${() => emit('numPress', 3)}>3</button>
        </div>
        <div class="flex flex-row">
          <button class="w-33" onclick=${() => emit('numPress', 4)}>4</button>
          <button class="w-33" onclick=${() => emit('numPress', 5)}>5</button>
          <button class="w-33" onclick=${() => emit('numPress', 6)}>6</button>
        </div>
        <div class="flex flex-row">
          <button class="w-33" onclick=${() => emit('numPress', 7)}>7</button>
          <button class="w-33" onclick=${() => emit('numPress', 8)}>8</button>
          <button class="w-33" onclick=${() => emit('numPress', 9)}>9</button>
        </div>
        <div class="flex flex-row">
        <button class="w-33" onclick=${() => emit('numPress', 'DEL')}>DEL</button>
        <button class="w-33" onclick=${() => emit('numPress', '0')}>0</button>
        <button class="w-33" onclick=${() => emit('numPress', '.')}>.</button>
        </div>
        <div class="flex flex-row">
          <button class="w-33" onclick=${() => emit('pushState', '/')}>BACK</button>
          <span class="w-33"></span>
          <button class="w-33 proceed" onclick=${() => emit('pushState', '/confirm')}>GO</button>
        </div>
      </div>
    </body>
  `
}
