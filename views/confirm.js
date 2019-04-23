const html = require('choo/html')
const css = require('sheetify')

const TITLE = 'CONFIRM'

module.exports = (state, emit) => {
  if (state.title !== TITLE) emit(state.events.DOMTITLECHANGE, TITLE)

  console.log(state)

  return html`
    <body class="flex flex-column justify-between pa4">
      <div class="wallet-status">
        <h1>${state.CURRENCY_SYMBOL}${state.calculate.input}</h1>
      </div>
      <div class="action">
        Go
      </div>
    </body>
  `
}
