module.exports = store

const DEFAULT_STATE = {
  selectedImg: null,
  hashes: []
}

function store (state, emitter) {

  // set up the initial state of our dapp
  state.dapps.pictureWall = DEFAULT_STATE

  let pictureWall = state.dapps.pictureWall

  setInterval(getImages, 1000)

  emitter.on('pictureWall.clear', () => {
    pictureWall = DEFAULT_STATE
  })

  emitter.on('pictureWall.upload', file => {
    emitter.emit('pictureWall.clear')
    state.assist.notify('pending', `Uploading...`)
    fetch('https://ipfs.enzypt.io/ipfs/', {
      method: 'POST',
      headers: { 'Content-Type': 'multipart/form-data' },
      body: file,
      redirect: 'follow',
      mode: 'cors'
    }).then(res => {
      const hash = res.headers.get('Ipfs-Hash')
      emitter.emit('pictureWall.uploaded', hash)
    })
  })

  emitter.on('pictureWall.uploaded', hash => {
    state.assist.notify('success', `Uploaded`)
    // send the file to a server or some shit
    fetch(`https://xdai-ipfs.flexdapps.com/${hash}`).then(res => {
      console.log(res)
    })
  })

  async function getImages () {
    const images = fetch('https://xdai-ipfs.flexdapps.com')
      .then(res => res.json())
      .then(items => {
        pictureWall.images = images
      })
  }

}