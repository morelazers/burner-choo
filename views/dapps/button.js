const html = require('choo/html')
const css = require('sheetify')

const TITLE = 'BUTTON'

module.exports = (state, emit) => {
  if (state.title !== TITLE) emit(state.events.DOMTITLECHANGE, TITLE)

  const container = css`
  .push-button {
    width: 100%;
    border-radius: 5px;
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

  if (state.dapps.button.pushed) {
    if (state.dapps.button.waiting) {
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
  <div class="f1">B U T T O N</div>
  <img class="push-button" src="/assets/dapps/button/red_button.png" onclick=${handleButtonPush} />
  <div class="actions">
    <button
      class="push-button-text active"
      onclick=${handleButtonPush}
    >
      PUSH FOR ${state.CURRENCY_SYMBOL}${state.dapps.button.price.toLocaleString()}
    </button>
  </div>
</section>
  `

  function handleButtonPush() {
    emit('button.pay')
  }
}

function waitingView (state, emit) {

  return html`
  <section class="flex flex-column justify-around items-center pa5">
  <div class="f1">B U T T O N</div>
  <div class="f3">
  ${state.dapps.button.pushes} button pushes
  </div>
  <div class="actions">
    <button
      class="push-button-text pending"
    >
      PUSHING
    </button>
  </div>
</section>
  `

}

function resultsView (state, emit) {
 return html 
    `
  <section class="flex flex-column justify-around items-center pa5">
  <div class="f1">B U T T O N</div>
  <img src="/assets/dapps/button/boom.png" />
  <div class="actions">
    <button
      class="push-button-text active"
      onclick=${handleButtonPush}
    >
      PUSH AGAIN FOR ${state.CURRENCY_SYMBOL}${state.dapps.button.price.toLocaleString()}
    </button>
  </div>
</section>
  `
 
  function handleButtonPush() {
    emit('button.pay')
  }
}