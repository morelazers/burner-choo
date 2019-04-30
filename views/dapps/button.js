const html = require('choo/html')
const css = require('sheetify')

const TITLE = 'BUTTON'

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

  return html`
  <section class="flex flex-column justify-around items-center pa5">
  <div class="f1">B U T T O N</div>
  <img class="push-button glow slow" src="/assets/dapps/button/red_button.png" onclick=${handleButtonPress} />
  <div class="actions">
    <button
      class="push-button-text active"
      onclick=${handleButtonPress(state, emit)}
    >
      PUSH FOR ${state.CURRENCY_SYMBOL}${state.dapps.button.price.toLocaleString()}
    </button>
  </div>
</section>
  `
}

function handleButtonPress(state, emit) {
  emit('button.pay')
  emit(
      'wallet.sendTokens',
        state.dapps.button.CONTRACT_ADDRESS,
        state.dapps.button.price,
        "0x0",
        {
          txSent: () => `Pushing the button...`,
          txConfirmedClient: () => {
            //emit('tarot.getReading')
            return `Click`
          }
        }
      )
}