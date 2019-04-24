const html = require('choo/html')
const css = require('sheetify')

const TITLE = 'CONFIRM'

module.exports = (state, emit) => {
  if (state.title !== TITLE) emit(state.events.DOMTITLECHANGE, TITLE)

  return html`
    <body class="flex flex-column justify-between pa4">
      <div class="wallet-status">
        <p class="f3 pa3">${state.wallet.nextTx.beforeParams}</p>
        <div class="f-subheadline pa3">${state.CURRENCY_SYMBOL}${state.wallet.nextTx.price}</div>
        <p class="f3 pa3">${state.wallet.nextTx.joiningStatement}</p>
        <div class="f-subheadline pa3">${state.wallet.nextTx.param}</div>
        <p class="f3 pa3">${state.wallet.nextTx.afterParams}</p>
      </div>
      <div class="actions flex justify-between">
        <button class="action" onclick=${() => emit('pushState', '/vip')}>
          VIP
        </button>
        <button class="action" onclick=${() => emit('nextTx.confirm')}>
          GO
        </button>
      </div>
    </body>
  `
}
