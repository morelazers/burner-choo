/**
 * This file could probably be broken up
 *
 * It would make sense to be able to launch the QR scanner from anywhere in the
 * wallet, and then set the state.afterScan variable from that point.
 *
 * It currently doesn't make sense to only start the scanner if the title of
 * your page is SCAN
 */

const html = require('choo/html')
const css = require('sheetify')

const TITLE = 'SEND'

module.exports = (state, emit) => {
  // Set up the chain of events which should occur after scanning a QR code with
  // your browser from this page
  state.afterScan = (addr) => {
    state.afterCalculate = (amount) => {
      state.calculate.input = ''
      state.calculate.formattedInput = ''
      state.wallet.afterConfirm = () => {
        console.log('After confirm')
        emit('wallet.sendTokens', addr, amount)
        emit('pushState', '/')
      }
      emit('pushState', '/confirm')
    }
    emit('pushState', '/calculate')
  }
  if (state.title !== TITLE) emit(state.events.DOMTITLECHANGE, TITLE)

  const style = css`
    .video {
      object-fit: cover;
    }
    .absolute-center {
      position: fixed;
      width: 75%;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
    }
    .action-overlay {
      position: fixed;
      bottom: 2rem;
      left: 50%;
      transform: translate(-50%, -50%);
    }
    .action-overlay a {
      background: transparent !important;
    }
    .action-overlay a::hover,
    .action-overlay a::active {
      background: #A7E4AE !important;
    }
  `

  console.log('-- PRINTING THE SCANNER VIEW --')
  return html`
    <section class="flex">
      <div id="qr-preview">
        <canvas id="canvas" hidden></canvas>
        <video id="video" class="video h-100 w-100 position-absolute"></video>
        <div class="actions action-overlay">
          <a class="pa2" onclick=${() => emit('replaceState', '/')}>BACK</a>
        </div>
        <img class="absolute-center" src="/assets/qr-overlay.png" />
      </div>
    </section>
  `
}