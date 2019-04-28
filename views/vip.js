const html = require('choo/html')
const css = require('sheetify')

const TITLE = 'VIP'

module.exports = view

// #E03326

function view (state, emit) {
  if (state.title !== TITLE) emit(state.events.DOMTITLECHANGE, TITLE)

  const styles = css`
    .bad:active,
    .bad:hover {
      background: red;
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
              <button class="flex flex-row pa1 justify-between f2 pv3 ph4 ${vip.bad ? 'bad' : ''}" onclick=${() => {
                if (state.wallet.tokenBalance < vip.price) {
                  // maybe make it go red or something
                  vip.bad = true
                  emit('render')
                  emit('vip.notEnoughBalance')
                } else {
                  emit('vipSelected', vip.id)
                  emit('nextTx.setBeforeParams', "You're paying")
                  emit('nextTx.setPrice', vip.price)
                  emit('nextTx.setJoiningStatement', "to replace")
                  emit('nextTx.setParam', "VIP_" + vip.id) // argh nested backticks !
                  emit('nextTx.setAfterParams', "How rude of you.")
                  state.wallet.afterConfirm = () => {
                    emit(
                      'wallet.sendTokens',
                      state.vip.CONTRACT_ADDRESS,
                      vip.price,
                      ("0x" + vip.id),
                      {
                        txSent: () => {
                          return "Buying VIP_PASS for " +
                          state.CURRENCY_SYMBOL +
                          vip.price.toLocaleString()
                        },
                        txConfirmedClient: () => {
                          state.wallet.refresh()
                          return "Welcome to the VIP_ZONE"
                        }
                      }
                    )
                    emit('pushState', '/')
                  }
                  emit('pushState', '/confirm')
                }
              }}>
                <span class="">VIP_${vip.id}</span>
                <span class="">${state.CURRENCY_SYMBOL}${vip.price.toLocaleString()}</span>
              </button>
            `
          }
        )}
      </div>
      <div class="f2 tc pa4">
        ${state.vip.bottomText}
      </div>
    </section>
  `
}

function vipView (state, emit) {
  return html`
    <section class="flex flex-column justify-around pa0">
      <div>
        <div class="f3 tc">Welcome VIP_${state.vip.meIndex} it's time to</div>
        <div class="f2 tc">F L E X</div>
      </div>
      <img class="bdg w-100" src="/assets/dapps/vip/bdg.gif" />
      <p class="tc">Show this to the VIP_ZONE patron to enter</p>
    </section>
  `
}