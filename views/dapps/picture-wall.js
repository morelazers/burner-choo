const html = require('choo/html')
const css = require('sheetify')

const QRCode = require('qrcode')

const TITLE = 'PEASANT'

module.exports = (state, emit) => {
  if (state.title !== TITLE) emit(state.events.DOMTITLECHANGE, TITLE)

  const container = css`
  `

  return html`
    <section class="flex flex-column justify-around items-center pa4">
      <div>Welcome to the Picture Wall!</div>
      <p>I will fill this out later</p>
      <div class="actions flex flex-column tc w-100">
        <a href="/">Back</a>
      </div>
    </section>
  `
}
