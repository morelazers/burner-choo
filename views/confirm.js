const html = require('choo/html')
const css = require('sheetify')

const TITLE = 'CONFIRM'

module.exports = (state, emit) => {
  if (state.title !== TITLE) emit(state.events.DOMTITLECHANGE, TITLE)

  return html`
    <section class="flex flex-column justify-between">
      <div class="wallet-status pa4">
        <p class="f3 pa3">${state.wallet.nextTx.beforeParams}</p>
        <div class="f-subheadline pa3">${state.CURRENCY_SYMBOL}${state.wallet.nextTx.price.toLocaleString()}</div>
        <p class="f3 pa3">${state.wallet.nextTx.joiningStatement}</p>
        <div class="f-subheadline pa3">${state.wallet.nextTx.param}</div>
        <p class="f3 pa3">${state.wallet.nextTx.afterParams}</p>
      </div>
      <div class="actions flex justify-between">
        <button class="action f2 w-50 h3" onclick=${() => emit('pushState', '/')}>
          CANCEL
        </button>
        <button class="action f2 w-50 h3" onclick=${() => emit('nextTx.confirm')}>
          SEND
        </button>
      </div>
    </section>
  `
}
