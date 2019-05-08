const html = require('choo/html')
const raw = require('choo/html/raw')
const css = require('sheetify')

const TITLE = 'PICTURE-WALL'

module.exports = (state, emit) => {
  if (state.title !== TITLE) {
    emit(state.events.DOMTITLECHANGE, TITLE)
    emit('pictureWall.navigate')
  }

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
      clip-path: inset(0px 0px 0px 0px);
    }

    #footer {
      background: #2A333E;
      padding: 0 1rem;
      bottom: 0;
      width: 100%;
    }

    #footer a {
      background: none;
    }
  `

  if (pictureWall.posting) {
    return addImage()
  } else {
    return viewImages()
  }


  function addImage () {
    return html`
      <section class="flex flex-column justify-around items-center pa4">
        <div>
          <h1 class='f1'>PICTURE WALL</h1>
          <h1>Buy and sell pictures of limited supply.</h1>
          <p class='f3'>Every image can only be purchased 3 times, so take incriminating photos of your fellow partygoers and they'll have to pay you to make them disappear.</p>
        </div>
        <input class='f3 underline tc' type="file" id="picture-input" accept="image/*" onchange="${getFile}" />
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

      const mePurchased = (img.buyers.indexOf(state.wallet.address.toLowerCase()) !== -1 || img.seller.toLowerCase() === state.wallet.address.toLowerCase())

      const purchase = () => {
        if (mePurchased) {
          return
        }
        emit('pictureWall.purchase', el)
      }

      return html`
        <div class="mb5 ba w-100" onclick="${() => purchase()}">
          <div class='bb pa1 f3 tc'>
            ${mePurchased ? `ALREADY OWNED` : raw(`PURCHASE FOR ${state.CURRENCY_SYMBOL}100 - ${3 - sales} remaining`)}
          </div>
          <img id='image-buy' src="https://ipfs.enzypt.io/ipfs/${el}" class="${mePurchased ? '' : 'blur'} w-100" />
        </div>
      `
    })

    return html`
      <section class="flex flex-column items-center pa4 h-100 overflow-scroll pb6 pt5">
        <div>
          <div class="f1">PICTURE WALL</div>
          <p>Buy and sell pictures of limited supply for ${state.CURRENCY_SYMBOL}${pictureWall.IMAGE_PRICE}.</p>
          <p>Everything you see here can only be purchased 3 times, and anything you sell has the same restriction.</p>
        </div>
        ${elements}
          <div id='footer' class="bt actions fixed">
            <a class="pa2" onclick=${() => emit('replaceState', '/')}>BACK</a>
            </div>
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
