const html = require('choo/html')
const css = require('sheetify')

const QRCode = require('qrcode')

const TITLE = 'PEASANT'

module.exports = (state, emit) => {
  if (state.title !== TITLE) emit(state.events.DOMTITLECHANGE, TITLE)

  const container = css`
    img {
      width: 70vw;
      height: auto;
    }
  `

  QRCode.toDataURL(state.wallet.address, {
    margin: 1,
    color: {
      light: '#A7E4AE',
      dark: '#2A333E'
    },
    scale: 10
  }, (err, url) => {
    state.wallet.qr = url
  })

  return html`
    <section class="flex flex-column justify-around">
      <img src=${state.wallet.qr} />
      <div class="actions flex flex-column tc">
        <a href="/">Back</a>
      </div>
    </section>
  `
}
