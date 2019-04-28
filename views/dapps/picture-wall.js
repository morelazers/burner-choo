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
      <input type="file" id="picture-input" accept="image/*" onchange="${getFile}">
      <div class="actions">
        <button class="post-file" onclick=${uploadFile}>POST</button>
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
      console.log(res.headers)
      console.log(res.headers.values())
      console.log(res.headers.get('Ipfs-Hash'))
    }).then(rr => {
      // console.log(rr)
    })
  }
}
