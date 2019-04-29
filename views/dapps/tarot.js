const html = require('choo/html')
const css = require('sheetify')

const TITLE = 'TAROT'

module.exports = (state, emit) => {
  if (state.title !== TITLE) emit(state.events.DOMTITLECHANGE, TITLE)

  const container = css`
    .tarot-card {
      width: 50%;
      image-rendering: pixelated;
      border-radius: 15px;
    }

    .tarot-card.glow {
      animation: pulse 1s infinite alternate;
    }

    .tarot-card.glow.slow {
      animation: pulse-slow 2s infinite alternate;
    }

    .read-button {
      font-size: 2.25rem;
    }

    .read-button.active {
      color: #2A333E;
      background: #A7E4AE;
    }

    .read-button.pending {
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

  if (state.dapps.tarot.read) {
    return activeCard(state, emit, state.dapps.tarot.activeCard)
  } else if (state.dapps.tarot.reading) {
    return readingView(state, emit)
  } else {
    return initialView(state, emit)
  }
}

function initialView (state, emit) {
  return html`
    <section class="flex flex-column justify-around items-center pa5">
      <div class="f1">T A R O T</div>
      <img class="tarot-card" src="/assets/dapps/tarot/tarot__back.png" />
      <div class="actions">
        <button
          class="read-button active"
          onclick=${() => {
            emit('tarot.pay')
            emit(
              'wallet.sendTokens',
              state.dapps.tarot.CONTRACT_ADDRESS,
              state.dapps.tarot.price,
              "0x0",
              {
                txSent: () => `Focus on your query...`,
                txConfirmedClient: () => {
                  emit('tarot.getReading')
                  return `Celestially Aligned`
                }
              }
            )
          }}
        >
          READ FOR ${state.CURRENCY_SYMBOL}${state.dapps.tarot.price.toLocaleString()}
        </button>
      </div>
    </section>
  `
}

function readingView (state, emit) {
  return html`
    <section class="flex flex-column justify-around items-center pa5">
      <div class="f1">T A R O T</div>
      <img class="tarot-card glow" src="/assets/dapps/tarot/tarot__back.png" />
      <div class="actions">
        <button class="read-button pending"></button>
      </div>
    </section>
  `
}

function activeCard (state, emit, cardIndex) {
  const card = state.dapps.tarot.myReading[cardIndex]
  return html`
    <section class="flex flex-column justify-between items-center pl4 pr4 pt4 pb5">
    <div class="flex flex-column items-center justify-start h-75 w-100">
      <div class="flex flex-row justify-between w-100 era-buttons">
        <button class="f3 ${cardIndex === 0 ? 'active' : ''}" onclick=${() => emit('tarot.activeCard', 0)}>${state.dapps.tarot.eras[0]}</button>
        <button class="f3 ${cardIndex === 1 ? 'active' : ''}" onclick=${() => emit('tarot.activeCard', 1)}>${state.dapps.tarot.eras[1]}</button>
        <button class="f3 ${cardIndex === 2 ? 'active' : ''}" onclick=${() => emit('tarot.activeCard', 2)}>${state.dapps.tarot.eras[2]}</button>
      </div>
      <div class="h-100 w-100 flex flex-column justify-center items-center">
        <img class="tarot-card glow slow" src="/assets/dapps/tarot/tarot__${state.dapps.tarot.images[card]}.png" />
      </div>
    </div>
    <div>
      <div class="f2 underline">${state.dapps.tarot.cards[card]}</div>
      <div class="tj">
        ${state.dapps.tarot.readings[card]}
      </div>
    </div>
    </section>
  `
}