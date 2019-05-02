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
    .image-center {
      z-index: 999;
    }
    .blur {
      -webkit-filter: blur(15px); /* Safari 6.0 - 9.0 */
      filter: blur(15px);
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
          <p>Everything you see here can only be purchased 3 times, and anything you sell has the same restriction.</p>
        </div>
        <input type="file" id="picture-input" accept="image/*" onchange="${getFile}" />
        <div class="actions flex flex-column items-center">
          <a class="post-file" onclick=${uploadFile}>POST</a>
          <a onclick=${() => emit('pictureWall.posting', false)}>CANCEL</a>
        </div>
      </section>
    `
  }

  function viewImages () {
    const elements = Object.keys(pictureWall.images).reverse().map((el) => {
      const img = pictureWall.images[el]
      const sales = img.buyers.length
      console.log(img.buyers)
      const mePurchased = (img.buyers.indexOf(state.wallet.address.toLowerCase()) !== -1 || img.seller.toLowerCase() === state.wallet.address.toLowerCase())
      const purchaseButton = html`<div class="" onclick=${() => emit('pictureWall.purchase', el) }>PURCHASE FOR ${state.CURRENCY_SYMBOL}${pictureWall.IMAGE_PRICE}</div>`
      return html`
        <div class="h-100 w-100">
          <div class="image-center f1">
            ${3 - sales} Remaining
          </div>
          ${mePurchased ? '' : purchaseButton}
          <img src="https://ipfs.enzypt.io/ipfs/${el}" class="${mePurchased ? '' : 'blur'}" />
        </div>
      `
    })

    return html`
      <section class="flex flex-column items-center pa4 h-100 overflow-scroll pb5">
        ${elements}
        <button class="fixed add-img" onclick=${() => {
          emit('pictureWall.posting', true)
        }}>+</button>
      </section>
    `
  }

  function getFile () {
    state.dapps.pictureWall.selectedImg = document.getElementById('picture-input').files[0]
  }

  function uploadFile () {
    emit('pictureWall.posting', false)
    const file = pictureWall.selectedImg
    if (!file) return
    emit('pictureWall.upload', file)
    emit('render')
  }
}
