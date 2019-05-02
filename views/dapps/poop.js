const html = require('choo/html')
const css = require('sheetify')

const TITLE = 'POOP'

module.exports = (state, emit) => {
  if (state.title !== TITLE) emit(state.events.DOMTITLECHANGE, TITLE)

  const container = css`
  `

  let poop = state.dapps.poop

  return html`
    <section class="flex flex-column justify-around items-center pa4">
      <div class="w-100 tc">
        <div class="f1">F A R T   N O I S E</div>
        <img class="" src="/assets/dapps/poop/icon.png" />
        <div class="f3">Pay ${state.CURRENCY_SYMBOL}${poop.price} to make everyone else's phone fart (might only work if they have the wallet open don't @me).</div>
      </div>
      <div class="actions flex flex-column items-center">
        <a class="post-file" onclick=${fart}>${poop.farting ? 'NICE' : 'DO IT'}</a>
        <a onclick=${() => emit('replaceState', '/dapps')}>BACK</a>
      </div>
    </section>
  `

  function fart () {
    if (!poop.farting) {
      emit('poop.noise')
    }
  }
}
