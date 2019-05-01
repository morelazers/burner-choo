const css = require('sheetify')
const choo = require('choo')
const bnc = require('bnc-assist')
const Web3 = require('web3')
require('babel-polyfill')
require('dotenv').config()

const { JSON_RPC_URL, CURRENCY_SYMBOL, TOKEN_ADDRESS } = process.env

const dapps = require('./config')

css('tachyons')
css('./assets/main.css')

const app = choo()
if (process.env.NODE_ENV !== 'production') {
  app.use(require('choo-devtools')())
} else {
  app.use(require('choo-service-worker')())
}

app.use((state, emitter) => {
  console.log(process.env)
//needs more whitespace
  // -- XDAI TEST CONTRACTS --
  // state.JSON_RPC_URL = JSON_RPC_URL || 'https://xdai.flexdapps.com/'
  // state.EVENT_SERVER = 'ws://10.2.47.201:9009/'
  // state.TOKEN_ADDRESS = TOKEN_ADDRESS || '0xB7A4375BF67BF865CA8e2336C50fc77B393375fd'
  // state.NETWORK_ID = 100

  // -- KOVAN CONTRACTS --
  // state.JSON_RPC_URL = 'https://xdai.flexdapps.com/'
  // state.EVENT_SERVER = 'ws://10.2.47.201:9009/'
  // state.TOKEN_ADDRESS = '0x6692df992562c701e7eb51255084715cce7bfe59'
  // state.NETWORK_ID = 42


  // -- GOERLI CONTRACTS --
  state.JSON_RPC_URL = 'https://xdai.flexdapps.com/'
  // state.EVENT_SERVER = 'wss://10.2.47.201:9009/'
  state.EVENT_SERVER = 'wss://events.flexdapps.com:9009/'
  state.TOKEN_ADDRESS = '0xe0728a9d55ebd03bfcc6e9faa59e6dfe96741636'
  state.NETWORK_ID = 10

  // -- LOCAL TEST CONTRACTS
  // state.JSON_RPC_URL = 'https://localhost:9009'
  // state.TOKEN_ADDRESS = '0xDBA081ff3cc5921a784A788Cf5a49Dd7A8F9B83F'
  // state.NETWORK_ID = 5777

  state.CURRENCY_SYMBOL = CURRENCY_SYMBOL || '៛'

  state.web3 = new Web3(state.JSON_RPC_URL)
  state.web3.eth.extend({
    property: 'personal',
    methods: [{
      name: 'newParityAccount',
      call: 'parity_newAccountFromSecret',
      params: 2
    }]
  })
  emitter.on('DOMContentLoaded', () => {
    state.assist = bnc.init({
      dappId: '6981d7c2-9e6f-420f-9772-228a8c0d4534',
      networkId: state.NETWORK_ID,
      web3: state.web3,
      mobileBlocked: false,
      style: {
        darkMode: true,
        notificationsPosition: 'top',
        css: `
          @font-face {
            font-family: 'VT323';
            src: url('/assets/VT323-Regular.ttf') format('truetype');
          }
          p {
            font-family: 'VT323';
            color: #A7E4AE;
            letter-spacing: 0.1rem;
            font-size: 1.5rem;
          }
          #blocknative-notifications {
            padding: 0;
          }
          .bn-notifications {
            height: 3.5rem;
            justify-content: flex-end;
          }
          .bn-notification {
            background: #2A333E;
            padding: 5px;
            margin: 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
            height: 3.5rem;
          }
          .bn-notification span,
          .bn-notification div,
          .bn-notification a {
            margin: 0 5px !important;
          }
          .bn-notification-meta {
            display: none;
          }
          #bn-transaction-branding {
            position: relative !important;
            background-size: 66px 22px !important;
            bottom: unset !important;
            right: unset !important;
            align-self: unset !important;
          }
          a#bn-transaction-branding {
            align-self: unset !important;
          }

          .bn-status-icon {
            text-align: center;
            width: 20px;
            height: auto;
            background-image: none !important;
          }

          .bn-progress .bn-status-icon::after {
            color: #A7E4AE;
            content: "⋮";
            animation: loading 0.5s infinite;
            position: relative;
            display: inherit;
          }

          .bn-complete .bn-status-icon::after {
            color: #A7E4AE;
            content: "✓";
            position: relative;
            display: inherit;
          }

          .bn-failed .bn-status-icon::after {
            color: red;
            content: "✕";
            position: relative;
            display: inherit;
          }

          @keyframes loading {
            0% {
              content: "⋮";
            }
            25% {
              content: "⋰";
            }
            50% {
              content: "⋯";
            }
            75% {
              content: "⋱";
            }
          }
        `
      }
    })
  })
})
//animation: loading 5s infinite;
app.use(require('./stores/events'))
app.use(require('./stores/provider'))
app.use(require('./stores/wallet'))
app.use(require('./stores/calculate'))
app.use(require('./stores/scanner'))


// should glob the dapps folder
app.use(require('./stores/dapps/config'))

// @todo fix
// for (let dapp of dapps) {
  //   const path = './stores/dapps/' + dapp
  //   app.use(require(path))
  // }
app.use(require('./stores/dapps/vip'))
app.use(require('./stores/dapps/regatta'))
app.use(require('./stores/dapps/picture-wall'))
app.use(require('./stores/dapps/tarot'))
app.use(require('./stores/dapps/poop'))
app.use(require('./stores/dapps/button'))
app.use(require('./stores/dapps/king'))

app.route('/', require('./views/main'))
app.route('/get', require('./views/get'))
app.route('/send', require('./views/send'))
app.route('/confirm', require('./views/confirm'))
app.route('/calculate', require('./views/calculate'))

// @todo remove this when we release the non-specific version

// there needs to be something here which globs the `dapps` folder to grab
// all the extra files - it should probably have a subroute too like /dapps/my-dapp
// remove these lines if you don't want to have any custom dapps
app.route('/dapps', require('./views/dapps/index'))

// for some reason this does not work
// for (let dapp of dapps) {
  // const path = './views/dapps/' + dapp
  // app.route(`/${dapp}`, require(path))
// }

app.route('/dapps/vip', require('./views/dapps/vip'))
app.route('/dapps/regatta', require('./views/dapps/regatta'))
app.route('/dapps/picture-wall', require('./views/dapps/picture-wall'))
app.route('/dapps/tarot', require('./views/dapps/tarot'))
app.route('/dapps/poop', require('./views/dapps/poop'))
app.route('/dapps/button', require('./views/dapps/button'))
app.route('/dapps/king', require('./views/dapps/king'))

const element = app.start()
document.body.appendChild(element)

// console.log(element)

// module.exports = app.mount('section')