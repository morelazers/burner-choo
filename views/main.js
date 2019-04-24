const html = require('choo/html')
const css = require('sheetify')

const TITLE = 'FLEXBUXX'

module.exports = view

function view (state, emit) {
  if (state.title !== TITLE) emit(state.events.DOMTITLECHANGE, TITLE)

  const styles = css`
    .wallet-status {
      line-height: 1rem;
      text-align: center;
    }

    .vip-status {
      font-size: 2rem;
    }

    .actions a {
      font-size: 5rem;
      color: #A7E4AE;
    }
  `

  return html`
    <body class="flex flex-column justify-between pa4">
      <div class="wallet-status">
        <div class="f-subheadline pa3">
          =${state.CURRENCY_SYMBOL}${state.wallet.tokenBalance || 0}=
        </div>
        <p class="vip-status">VIP=FALSE</p>
      </div>
      <div class="actions flex flex-column tc">
        <a href="/get">GET</a>
        <a href="/send">SEND</a>
        <a href="/gamble">GAMBLE</a>
        <a href="/vip">VIP_ZONE</a>
      </div>
    </body>
  `
}

/**
 *
 */