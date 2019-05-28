const html = require('choo/html')

const TITLE = 'CONFIRM'

module.exports = (state, emit) => {
  if (state.title !== TITLE) emit(state.events.DOMTITLECHANGE, TITLE)

  if (state.wallet.nextTx.price === -1) {
    emit('replaceState', '/')
  }

  return html`
    <section class="flex flex-column justify-between">
      <div class="wallet-status pa4">
        <div class="f3 pa3">${state.wallet.nextTx.beforeParams}</div>
        <div class="f-subheadline pa3">
          ${state.CURRENCY_SYMBOL}${Number(
            state.wallet.nextTx.price
          ).toLocaleString()}
        </div>
        <div class="f3 pa3">${state.wallet.nextTx.joiningStatement}</div>
        <div class="f-subheadline pa3">${state.wallet.nextTx.param}</div>
        <div class="f3 pa3">${state.wallet.nextTx.afterParams}</div>
      </div>
      <div class="actions flex justify-between">
        <button
          class="action f2 w-50 h3"
          onclick=${() => emit('replaceState', '/')}
        >
          CANCEL
        </button>
        <button
          class="action f2 w-50 h3"
          onclick=${() => emit('nextTx.confirm')}
        >
          SEND
        </button>
      </div>
    </section>
  `
}
