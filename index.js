const css = require('sheetify')
const choo = require('choo')
const bnc = require('bnc-assist')
require('babel-polyfill')

css('tachyons')
css('./assets/main.css')

const app = choo()
if (process.env.NODE_ENV !== 'production') {
  app.use(require('choo-devtools')())
} else {
  app.use(require('choo-service-worker')())
}

app.use((state, emitter) => {
  // -- XDAI TEST CONTRACTS --
  state.JSON_RPC_URL = 'https://dai.poa.network/'
  state.TOKEN_ADDRESS = '0x5eb7e67ec2ce404ebabafed0a79bab10d030c58a'
  state.NETWORK_ID = 100

  // -- GOERLI CONTRACTS --
  // state.JSON_RPC_URL = 'https://xdai.flexdapps.com:7361/'
  // state.TOKEN_ADDRESS = '0xe0728a9d55ebd03bfcc6e9faa59e6dfe96741636'
  // state.NETWORK_ID = 10

  // -- LOCAL TEST CONTRACTS
  // state.JSON_RPC_URL = 'https://localhost:9009'
  // state.TOKEN_ADDRESS = '0xDBA081ff3cc5921a784A788Cf5a49Dd7A8F9B83F'
  // state.NETWORK_ID = 5777

  state.CURRENCY_SYMBOL = '៛'
  emitter.on('DOMContentLoaded', () => {
    state.assist = bnc.init({
      dappId: '6981d7c2-9e6f-420f-9772-228a8c0d4534',
      networkId: state.NETWORK_ID,
      mobileBlocked: false,
      style: {
        darkMode: true,
        notificationsPosition: 'top',
        // you would think i enjoy using !important but i don't, promise
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
            margin: 0 !important;
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
            margin: 0 !important;
          }
          a#bn-transaction-branding {
            align-self: unset !important;
            height: 30px !important;
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
app.use(require('./stores/dapps/king'))

app.route('/', require('./views/main'))
app.route('/get', require('./views/get'))
app.route('/send', require('./views/send'))
app.route('/confirm', require('./views/confirm'))
app.route('/calculate', require('./views/calculate'))

// there needs to be something here which globs the `dapps` folder to grab
// all the extra files - it should probably have a subroute too like /dapps/my-dapp
// remove these lines if you don't want to have any custom dapps
app.route('/dapps', require('./views/dapps/index'))
app.route('/dapps/vip', require('./views/dapps/vip'))
app.route('/dapps/king', require('./views/dapps/king'))

const element = app.start()
document.body.appendChild(element)
