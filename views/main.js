const html = require('choo/html')
const css = require('sheetify')

const TITLE = 'FLEXBUXX'

module.exports = view

function view(state, emit) {
  if (state.title !== TITLE) emit(state.events.DOMTITLECHANGE, TITLE)

  const styles = css`
    .wallet-status {
      text-align: center;
    }

    .vip-status {
      font-size: 2rem;
    }

    .actions a {
      font-size: 5rem;
      color: #a7e4ae;
    }

    .disabled {
      opacity: 0.5;
    }
    .disabled:hover,
    .disabled:active {
      background: unset;
      color: unset;
    }
  `

  return html`
    <section class="flex flex-column justify-between pa4 pt5">
      <div class="wallet-status">
        <div class="f-subheadline">
          =${state.CURRENCY_SYMBOL}${state.wallet.tokenBalance.toLocaleString() ||
            0}=
        </div>
        <div class="vip-status">
          VIP${state.vip.meVip ? '_' + state.vip.meIndex : ''}=${state.vip.meVip
            ? 'TRUE'
            : 'FALSE'}
        </div>
        <div class="vip-status">
          DEBUG_BAL=${Number(state.wallet.ethBalance)
            ? Number(state.wallet.ethBalance).toFixed(5)
            : 0}
        </div>
      </div>
      <div class="actions flex flex-column tc">
        <a href="/get">GET</a>
        <a href="/send">SEND</a>
        <a href="/dapps">APPS</a>
      </div>
    </section>
  `
}

/**
 *
 */
