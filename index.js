const html = require('choo/html')
const devtools = require('choo-devtools')
const choo = require('choo')
const ethers = require('ethers')
const QRCode = require('qrcode')

const preview = require('./qr-preview')

require('dotenv').config()

const { JSON_RPC_URL } = process.env

const app = choo()
app.use(devtools())
app.use(providerStore)
app.use(walletStore)
app.use(balanceStore)
app.use(txStore)
app.route('/', mainView)
app.mount('body')

function mainView (state, emit) {
  return html`
    <body>
      <h1>Money: ${state.wallet.balance}</h1>
      <p>Private key: ${state.wallet.signingKey.privateKey}</p>
      <p>Address: ${state.wallet.signingKey.address}</p>
      <img src=${state.wallet.qr} />
      <button onclick=${sendEth}>Return 0.01 ETH</button>
      <button onclick=${scan}>Scan QR</button>
      ${preview.render()}
    </body>
  `
  function sendEth () {
    emit('sendEth', '0.01')
  }

  function scan () {
    console.log('scaning')
    preview.beginScan(res => {
      console.log(res)
      if (res.indexOf('ethereum:') !== -1) {
        preview.endScan()
      }
    })
    // const qrScanner = new QrScanner(document.getElementById('preview'), result => console.log('decoded qr code:', result));
  }
}

function providerStore (state, emitter) {
  state.provider = new ethers.providers.JsonRpcProvider(JSON_RPC_URL);
}

function walletStore (state, emitter) {
  state.wallet = getWallet(state.provider)
  QRCode.toDataURL(state.wallet.signingKey.address, (err, url) => {
    state.wallet.qr = url
  })
}

function balanceStore (state, emitter) {
  const { address } = state.wallet.signingKey

  const setBalance = (bal) => {
    const etherString = ethers.utils.formatEther(bal)
    state.wallet.balance = etherString
    emitter.emit('render')
  }

  state.provider.getBalance(address).then((b) => {
    setBalance(b)
  })
  state.provider.on(address, (b) => {
    setBalance(b)
  })
}

function txStore (state, emitter) {
  emitter.on('sendEth', (eth) => {
    const weiString = ethers.utils.parseEther(eth)
    const tx = {
      to: '0xdbb84cf59Acb7E4bE58FFCdE2e1D9b8819D1F27E',
      value: weiString
    }
    state.wallet.sendTransaction(tx).then(t => {
      console.log(t)
    })
  })
}

function getWallet (provider) {
  let w = localStorage.getItem('wallet')
  if (w) {
    w = new ethers.Wallet(JSON.parse(w).signingKey.privateKey, provider)
  } else  {
    w = ethers.Wallet.createRandom()
    localStorage.setItem('wallet', JSON.stringify(w))
  }
  console.log(w)
  return w
}