const html = require('choo/html')
const raw = require('choo/html/raw')
const css = require('sheetify')

const QRCode = require('qrcode')

const TITLE = 'PEASANT'

module.exports = (state, emit) => {
  if (state.title !== TITLE) emit(state.events.DOMTITLECHANGE, TITLE)

  let pictureWall = state.dapps.pictureWall

  const container = css`
    .add-img {
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      width: 75px;
      height: 75px;
      border-radius: 37.5px;
      background: #A7E4AE;
      color: #2A333E;
      font-size: 4rem;
      line-height: 75px;
    }
  `

  console.log({pictureWall})

  if (pictureWall.posting) {
    return addImage()
  } else {
    return viewImages()
  }


  function addImage () {
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
  }

  function viewImages () {
    return html`
      <section class="flex flex-column items-center pa4 h-100 overflow-scroll pb5">
        ${raw(Object.keys(pictureWall.images).map((el) => {
          const sales = pictureWall.images[el]
          return '<img src="https://ipfs.enzypt.io/ipfs/' + el + '" />'
        }))}
        <button class="fixed add-img" onclick=${() => {
          pictureWall.posting = true
          emit('render')
        }}>+</button>
      </section>
    `
  }

  function getFile () {
    state.dapps.pictureWall.selectedImg = document.getElementById('picture-input').files[0]
  }

  function uploadFile () {
    pictureWall.posting = false
    const file = pictureWall.selectedImg
    if (!file) return
    emit('pictureWall.upload', file)
    emit('render')
  }
}
