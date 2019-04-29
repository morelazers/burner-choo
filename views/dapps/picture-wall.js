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
      <div>
        <div class="f1">PICTURE WALL</div>
        <p>Buy and sell pictures of limited supply.</p>
        <p>Everything you see here can only be purchased 5 times, and anything you sell has the same restriction.</p>
      </div>
      <input type="file" id="picture-input" accept="image/*" onchange="${getFile}" />
      <div class="actions">
        <a class="post-file" onclick=${uploadFile}>POST</a>
      </div>
    </section>
  `

  function getFile () {
    state.dapps.pictureWall.selectedImg = document.getElementById('picture-input').files[0]
  }

  function uploadFile () {
    const file = state.dapps.pictureWall.selectedImg
    if (!file) return
    fetch('https://ipfs.enzypt.io/ipfs/', {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      body: file,
      redirect: 'follow',
      mode: 'cors'
    }).then(res => {
      const hash = res.headers.get('Ipfs-Hash')
    })
  }
}
