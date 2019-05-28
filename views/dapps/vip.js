const html = require('choo/html')
const css = require('sheetify')

const TITLE = 'VIP'

module.exports = view

function view(state, emit) {
  if (state.title !== TITLE) emit(state.events.DOMTITLECHANGE, TITLE)

  const styles = css`
    .bad:active,
    .bad:hover,
    .bad:active span .status-icon,
    .bad:hover span .status-icon {
      background: red;
      color: #2a333e;
    }

    .status-icon {
      font-size: 1rem;
      text-align: center;
      width: 20px;
      height: auto;
      background-image: none !important;
      color: #a7e4ae;
    }

    .status-icon.loading::after {
      content: '⋮';
      animation: loading 1s infinite;
      position: relative;
      display: inherit;
    }

    .status-icon.ready::after {
      content: '✓';
      position: relative;
      display: inherit;
    }

    @keyframes loading {
      0% {
        content: '⋮';
      }
      25% {
        content: '⋰';
      }
      50% {
        content: '⋯';
      }
      75% {
        content: '⋱';
      }
    }
  `

  if (state.vip.meVip) {
    return vipView(state, emit)
  }

  return html`
    <section class="flex flex-column justify-between pa0">
      <div class="flex flex-column justify-start">
        ${state.vip.list.map(vip => {
          if (vip.owner === state.wallet.address) return
          return html`
            <button
              class="flex flex-row pa1 justify-between f2 pv3 ph4 ${vip.bad
                ? 'bad'
                : ''}"
              onclick=${() => {
                if (vip.protectedUntil > Date.now() / 1000) {
                  vip.bad = true
                  emit('render')
                  emit('vip.onCooldown', vip.protectedUntil, Date.now() / 1000)
                } else if (state.wallet.tokenBalance < vip.price) {
                  // maybe make it go red or something
                  vip.bad = true
                  emit('render')
                  emit('vip.notEnoughBalance')
                } else {
                  emit('vipSelected', vip.id)
                  emit('nextTx.setBeforeParams', "You're paying")
                  emit('nextTx.setPrice', vip.price)
                  emit('nextTx.setJoiningStatement', 'to replace')
                  emit('nextTx.setParam', 'VIP_' + vip.id + ',') // argh nested backticks !
                  emit('nextTx.setAfterParams', 'how rude of you.')
                  state.wallet.afterConfirm = () => {
                    emit(
                      'wallet.sendTokens',
                      state.vip.CONTRACT_ADDRESS,
                      vip.price,
                      '0x' + vip.id,
                      {
                        txSent: () => {
                          return (
                            'Buying VIP_PASS for ' +
                            state.CURRENCY_SYMBOL +
                            vip.price.toLocaleString()
                          )
                        },
                        txConfirmed: () => {
                          state.wallet.refresh()
                          return 'Welcome to the VIP_ZONE'
                        }
                      }
                    )
                    emit('pushState', '/')
                  }
                  emit('pushState', '/confirm')
                }
              }}
            >
              <span class="flex flex-row justify-center items-center">
                <span
                  class="mr3 status-icon${vip.protectedUntil > Date.now() / 1000
                    ? ' loading'
                    : ' ready'}${vip.bad ? ' bad' : ''}"
                ></span>
                <span class="">VIP_${vip.id}</span>
              </span>
              <span class=""
                >${state.CURRENCY_SYMBOL}${vip.price.toLocaleString()}</span
              >
            </button>
          `
        })}
      </div>
      <div class="flex flex-column w-100 items-center">
        <div class="f3 tc pa4">
          ${state.vip.bottomText}
        </div>
        <div class="actions tc">
          <a onclick=${() => emit('replaceState', '/dapps')}>BACK</a>
        </div>
      </div>
    </section>
  `
}

function vipView(state, emit) {
  return html`
    <section class="flex flex-column justify-around pa0">
      <div>
        <div class="f3 tc">Welcome VIP_${state.vip.meIndex} it's time to</div>
        <div class="f2 tc">F L E X</div>
      </div>
      <img class="bdg w-100" src="/assets/dapps/vip/bdg.gif" />
      <div class="flex flex-column w-100 items-center">
        <p class="tc">Show this to the VIP_ZONE patron to enter</p>
        <div class="actions tc">
          <a onclick=${() => emit('replaceState', '/')}>BACK</a>
        </div>
      </div>
    </section>
  `
}
