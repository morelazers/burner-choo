const html = require('choo/html')
const css = require('sheetify')

const TITLE = 'KING'

module.exports = (state, emit) => {
  if (state.title !== TITLE) {
    emit(state.events.DOMTITLECHANGE, TITLE)
    emit('king.navigate')
  }
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
      color: #2a333e;
      background: #a7e4ae;
    }

    .push-button-text.pending {
      color: #a7e4ae;
      background: transparent;
    }

    .era-buttons .active {
      background: #a7e4ae;
      color: #2a333e;
    }

    @keyframes pulse {
      from {
        box-shadow: 0px 0px 20px 5px #a7e4ae;
      }
      to {
        box-shadow: 0px 0px 40px 20px #a7e4ae;
      }
    }

    @keyframes pulse-slow {
      from {
        box-shadow: 0px 0px 10px 5px #a7e4ae;
      }
      to {
        box-shadow: 0px 0px 20px 10px #a7e4ae;
      }
    }
  `

  if (state.dapps.king.waiting) {
    return waitingView(state, emit)
  } else {
    if (!state.dapps.king.vacant && state.dapps.king.king) {
      if (
        state.wallet.address.toLowerCase() ===
        state.dapps.king.king.toLowerCase()
      ) {
        return kingResultsView(state, emit)
      } else {
        return nonKingResultsView(state, emit)
      }
    } else {
      return initialView(state, emit)
    }
  }
}

function initialView(state, emit) {
  return html`
    <section class="flex flex-column justify-around items-center pa5">
      <div class="f1">Chain of Thrones</div>
      <div class="f3">
        The throne is empty, hold it for 300 seconds to claim the prize.
      </div>

      <img
        class="push-button"
        src="/assets/dapps/king/throne.png"
        onclick=${handleButtonPush}
      />
      <div class="actions flex flex-column items-center justify-center">
        <button class="push-button-text active" onclick=${handleButtonPush}>
          CLAIM THRONE
          (${state.CURRENCY_SYMBOL}${state.dapps.king.price.toLocaleString()})
        </button>
        <a
          onclick=${() => {
            emit('king.clear')
            emit('replaceState', '/dapps')
          }}
        >
          BACK
        </a>
      </div>
    </section>
  `

  function handleButtonPush() {
    emit('king.pay')
  }
}

function waitingView(state, emit) {
  return html`
    <section class="flex flex-column justify-around items-center pa5">
      <div class="f1">Chain of Thrones</div>
      <div class="f2">Claiming the throne</div>
      <img class="push-button" src="/assets/dapps/king/throne.png" />
    </section>
  `
}

function kingResultsView(state, emit) {
  return html`
    <section class="flex flex-column justify-around items-center pa5">
      <div class="f1">Chain of Thrones</div>
      <div class="f3">You sit in the Chain of Thrones</div>
      <div class="f3">
        Hold for ${Math.abs(state.dapps.king.remainingSeconds)} seconds to win
      </div>
      <div class="f3">
        Prize:
        ${state.CURRENCY_SYMBOL}${state.dapps.king.prize.toLocaleString()}
      </div>
      <img class="push-button" src="/assets/dapps/king/throne.png" />
      <div class="actions">
        <a href="/dapps">BACK</a>
      </div>
    </section>
  `
}

function nonKingResultsView(state, emit) {
  return html`
    <section class="flex flex-column justify-around items-center pa5">
      <div class="f1">Chain of Thrones</div>
      <div class="f2">Someone else sits in the Chain of Thrones</div>
      <div class="f2">
        They win in ${Math.abs(state.dapps.king.remainingSeconds)}
      </div>
      <div class="f2">
        Prize:
        ${state.CURRENCY_SYMBOL}${state.dapps.king.prize.toLocaleString()}
      </div>
      <img class="push-button" src="/assets/dapps/king/throne.png" />
      <div class="actions flex flex-column items-center justify-center">
        <button class="push-button-text active" onclick=${handleButtonPush}>
          CLAIM THE THRONE FOR
          ${state.CURRENCY_SYMBOL}${state.dapps.king.price.toLocaleString()}
        </button>
        <button
          class="push-button-text"
          onclick=${() => {
            emit('king.clear')
            emit('replaceState', '/dapps')
          }}
        >
          BACK
        </button>
      </div>
    </section>
  `

  function handleButtonPush() {
    emit('king.pay')
  }
}
