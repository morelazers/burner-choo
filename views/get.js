const html = require('choo/html')
const css = require('sheetify')

const QRCode = require('qrcode')

const TITLE = 'PEASANT'

module.exports = (state, emit) => {
  if (state.title !== TITLE) emit(state.events.DOMTITLECHANGE, TITLE)

  // console.log(localStorage)

  const container = css`
    img {
      width: 70vw;
      height: auto;
    }
  `

  QRCode.toDataURL(state.wallet.signingKey.address, {
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
    <body class="flex flex-column justify-around">
      <img src=${state.wallet.qr} />
      <div class="actions flex flex-column tc">
        <a href="/">Back</a>
      </div>
    </body>
  `
}

/**
 *
 */