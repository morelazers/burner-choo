const css = require('sheetify')
const choo = require('choo')
const bnc = require('bnc-assist')
const Web3 = require('web3')
require('babel-polyfill')
require('dotenv').config()

const { JSON_RPC_URL, CURRENCY_SYMBOL, TOKEN_ADDRESS } = process.env

css('tachyons')
css('./assets/main.css')

const app = choo()
if (process.env.NODE_ENV !== 'production') {
  app.use(require('choo-devtools')())
} else {
  app.use(require('choo-service-worker')())
}

app.use((state, emitter) => {
  state.JSON_RPC_URL = JSON_RPC_URL || 'http://localhost:8545'
  state.CURRENCY_SYMBOL = CURRENCY_SYMBOL || '៛'
  state.TOKEN_ADDRESS = TOKEN_ADDRESS || '0xDBA081ff3cc5921a784A788Cf5a49Dd7A8F9B83F'
  state.web3 = new Web3('ws://localhost:8545')
  console.log(state.web3)
  emitter.on('DOMContentLoaded', () => {
    state.assist = bnc.init({
      dappId: '6981d7c2-9e6f-420f-9772-228a8c0d4534',
      networkId: 5777,
      web3: state.web3
    })
  })
})
app.use(require('./stores/events'))
app.use(require('./stores/provider'))
app.use(require('./stores/wallet'))
app.use(require('./stores/calculate'))
app.use(require('./stores/scanner'))
app.use(require('./stores/vip'))

app.route('/', require('./views/main'))
app.route('/get', require('./views/get'))
app.route('/send', require('./views/send'))
app.route('/confirm', require('./views/confirm'))
app.route('/calculate', require('./views/calculate'))
app.route('/vip', require('./views/vip'))

const element = app.start()
document.body.appendChild(element)

// console.log(element)

// module.exports = app.mount('section')