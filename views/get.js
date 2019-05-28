const html = require('choo/html')
const css = require('sheetify')

const QRCode = require('qrcode')

const TITLE = 'RECEIVE'

module.exports = (state, emit) => {
  if (state.title !== TITLE) emit(state.events.DOMTITLECHANGE, TITLE)

  QRCode.toDataURL(
    state.wallet.address,
    {
      margin: 1,
      color: {
        light: '#A7E4AE',
        dark: '#2A333E'
      },
      scale: 10
    },
    (err, url) => {
      state.wallet.qr = url
    }
  )

  return html`
    <section class="flex flex-column justify-around items-center pa4">
      <img class="w-100" src=${state.wallet.qr} />
      <div class="actions flex flex-column tc w-100">
        <a href="/">Back</a>
      </div>
    </section>
  `
}
