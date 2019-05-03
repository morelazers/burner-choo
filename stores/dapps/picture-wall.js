module.exports = store

const DEFAULT_STATE = {
  IMAGE_PRICE: 100,
  selectedImg: null,
  hashes: [],
  images: []
}

function store (state, emitter) {

  // set up the initial state of our dapp
  state.dapps.pictureWall = DEFAULT_STATE

  let pictureWall = state.dapps.pictureWall

  emitter.on('pictureWall.navigate', () => {
    pictureWall.interval = setInterval(getImages, 1000)
  })

  emitter.on('pictureWall.posting', y => {
    if (y) {
      clearInterval(pictureWall.interval)
    } else {
      clearInterval(pictureWall.interval)
      pictureWall.interval = setInterval(getImages, 1000)
    }
    pictureWall.posting = y
    emitter.emit('render')
  })

  emitter.on('pictureWall.clear', () => {
    pictureWall = DEFAULT_STATE
  })

  emitter.on('pictureWall.upload', file => {
    emitter.emit('pictureWall.clear')
    const done = state.assist.notify('pending', `Uploading...`)
    fetch('https://ipfs.enzypt.io/ipfs/', {
      method: 'POST',
      headers: { 'Content-Type': 'multipart/form-data' },
      body: file,
      redirect: 'follow',
      mode: 'cors'
    }).then(res => {
      done()
      const hash = res.headers.get('Ipfs-Hash')
      emitter.emit('pictureWall.uploaded', hash)
    })
  })

  emitter.on('pictureWall.uploaded', hash => {
    state.assist.notify('success', `Uploaded`)
    // send the file to a server or some shit
    fetch(`https://xdai-ipfs.flexdapps.com/${hash}/sell/${state.wallet.address.toLowerCase()}`).then(res => {
      console.log(res)
    })
  })

  emitter.on('pictureWall.purchase', hash => {
    if (pictureWall.images[hash].sales >= 3) {
      return state.assist.notify('error', `Purchased 3 times already`)
    }
    if (state.wallet.tokenBalance >= pictureWall.IMAGE_PRICE) {
      // cool we can purchase the image
      console.log(`Purchasing ${hash}`)
      const seller = pictureWall.images[hash].seller
      emitter.emit(
        'wallet.sendTokens',
        seller,
        pictureWall.IMAGE_PRICE,
        "0x0",
        {
          txSent: () => `Unlocking image...`,
          txConfirmed: () => {
            // the most insecure buying process ever
            fetch(`https://xdai-ipfs.flexdapps.com/${hash}/buy/${state.wallet.address.toLowerCase()}`).then(res => {
              console.log(res)
            })
            return `Unlocked!`
          }
        }
      )
    } else {
      state.assist.notify('error', `Not enough ${state.CURRENCY_SYMBOL}`)
    }
  })

  async function getImages () {
    fetch('https://xdai-ipfs.flexdapps.com')
      .then(res => res.json())
      .then(items => {
        pictureWall.images = items
        emitter.emit('render')
      })
  }

  async function purchaseImage () {
    if (state.wallet.tokenBalance >= pictureWall.IMAGE_PRICE) {

    }
  }

}