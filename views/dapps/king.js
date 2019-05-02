const html = require('choo/html')
const css = require('sheetify')

const TITLE = 'KING'

module.exports = (state, emit) => {
  if (state.title !== TITLE) emit(state.events.DOMTITLECHANGE, TITLE)

  const container = css`
  .push-button {
    width: 50%;
    image-rendering: pixelated;
    border-radius: 15px;
  }

  .push-button.glow {
    animation: pulse 1s infinite alternate;
  }

  .push-button.glow.slow {
    animation: pulse-slow 2s infinite alternate;
  }

  .push-button-text {
    font-size: 2.25rem;
  }

  .push-button-text.active {
    color: #2A333E;
    background: #A7E4AE;
  }

  .push-button-text.pending {
    color: #A7E4AE;
    background: transparent;
  }

  .era-buttons .active {
    background: #A7E4AE;
    color: #2A333E;
  }

  @keyframes pulse {
    from { box-shadow: 0px 0px 20px 5px #A7E4AE; }
    to { box-shadow: 0px 0px 40px 20px #A7E4AE; }
  }

  @keyframes pulse-slow {
    from { box-shadow: 0px 0px 10px 5px #A7E4AE; }
    to { box-shadow: 0px 0px 20px 10px #A7E4AE; }
  }
  `

  if (state.dapps.king.requested) {
    if (state.dapps.king.waiting) {
      return waitingView(state, emit)
    } else {
      return resultsView(state, emit)
    }
  } else {
    return initialView(state, emit)
  }
}



function initialView (state, emit) {

  return html`
  <section class="flex flex-column justify-around items-center pa5">
  <div class="f1">Chain of Thrones</div>
  <div>
  Claim the throne and hold it for 30 minutes.
  If no one else tries to claim the throne then the prize is yours.
  </div>
  
  <div>
    Prize: ${state.CURRENCY_SYMBOL}${state.dapps.king.prize.toLocaleString()}
  </div>
  <img class="push-button" src="/assets/dapps/king/throne.png" onclick=${handleButtonPush} />
  <div class="actions">
    <button
      class="push-button-text active"
      onclick=${handleButtonPush}
    >
      CLAIM THE THRONE FOR ${state.CURRENCY_SYMBOL}${state.dapps.king.price.toLocaleString()}
    </button>
  </div>
</section>
  `

  function handleButtonPush() {
    emit('king.pay')
  }
}

function waitingView (state, emit) {

  return html`
  <section class="flex flex-column justify-around items-center pa5">
  <div class="f1">Chain of Thrones</div>
  <img class="push-button glow" src="/assets/dapps/king/throne.png" />
  <div class="actions">
    <button
      class="push-button-text pending"
    >
      CLAIMING
    </button>
  </div>
</section>
  `

}

function resultsView (state, emit) {

  return html`
  <section class="flex flex-column justify-around items-center pa5">
  <div class="f1">Chain of Thrones</div>
  <img class="push-button glow slow" src="/assets/dapps/king/throne.png" />
  <div class="actions">
    <button
      class="push-button-text pending"
    >
      CLAIMED
    </button>
  </div>
</section>
  `

}