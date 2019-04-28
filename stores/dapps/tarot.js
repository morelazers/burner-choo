const abi = require('../../contracts/TAROT.abi')

const ethers = require('ethers')

module.exports = function (state, emitter) {
  state.dapps.tarot = {
    read: false,
    reading: false,
    activeCard: -1,
    CONTRACT_ADDRESS: '0xf1515292a439ce23fc177e966db109d6b008cef5',
    price: 1000,
    cards: [
      'The Fool',
      'The Magician',
      'The High Priestess',
      'The Empress',
      'The Emperor',
      'The Hierophant',
      'The Lovers',
      'The Chariot',
      'Justice',
      'The Hermit',
      'Wheel of Fortune',
      'Strength',
      'The Hanged Man',
      'Death',
      'Temperance',
      'The Devil',
      'The Tower',
      'The Star',
      'The Moon',
      'The Sun',
      'Judgement',
      'The World'
    ],
    images: [
      'fool',
      'magician',
      'priestess',
      'empress',
      'emperor',
      'hierophant',
      'lovers',
      'chariot',
      'justice',
      'hermit',
      'fortune',
      'strength',
      'hangman',
      'death',
      'temperance',
      'devil',
      'tower',
      'star',
      'moon',
      'sun',
      'judgement',
      'theworld'
    ],
    readings: [
      `The beginning of a new journey, with no baggage and everything you need. "The spirit in search of experience"`,
      `The beginning of a new journey, with no baggage and everything you need. "The spirit in search of experience"`,
      `The beginning of a new journey, with no baggage and everything you need. "The spirit in search of experience"`,
      `The beginning of a new journey, with no baggage and everything you need. "The spirit in search of experience"`,
      `The beginning of a new journey, with no baggage and everything you need. "The spirit in search of experience"`,
      `The beginning of a new journey, with no baggage and everything you need. "The spirit in search of experience"`,
      `The beginning of a new journey, with no baggage and everything you need. "The spirit in search of experience"`,
      `The beginning of a new journey, with no baggage and everything you need. "The spirit in search of experience"`,
      `The beginning of a new journey, with no baggage and everything you need. "The spirit in search of experience"`,
      `The beginning of a new journey, with no baggage and everything you need. "The spirit in search of experience"`,
      `The beginning of a new journey, with no baggage and everything you need. "The spirit in search of experience"`,
      `The beginning of a new journey, with no baggage and everything you need. "The spirit in search of experience"`,
      `The beginning of a new journey, with no baggage and everything you need. "The spirit in search of experience"`,
      `The beginning of a new journey, with no baggage and everything you need. "The spirit in search of experience"`,
      `The beginning of a new journey, with no baggage and everything you need. "The spirit in search of experience"`,
      `The beginning of a new journey, with no baggage and everything you need. "The spirit in search of experience"`,
      `The beginning of a new journey, with no baggage and everything you need. "The spirit in search of experience"`,
      `The beginning of a new journey, with no baggage and everything you need. "The spirit in search of experience"`,
      `The beginning of a new journey, with no baggage and everything you need. "The spirit in search of experience"`,
      `The beginning of a new journey, with no baggage and everything you need. "The spirit in search of experience"`,
      `The beginning of a new journey, with no baggage and everything you need. "The spirit in search of experience"`,
      `The beginning of a new journey, with no baggage and everything you need. "The spirit in search of experience"`,
    ],
    myReading: [],
    eras: ['Past', 'Present', 'Future']
  }

  // an address i know has a reading
  // 0x9f3ae1d603320980Bd7FD79EB6dF981d8A2A0e24

  const address = state.wallet.address
  // const address = '0x9f3ae1d603320980Bd7FD79EB6dF981d8A2A0e24'

  // create your contract instance
  state.dapps.tarot.contract = new ethers.Contract(state.dapps.tarot.CONTRACT_ADDRESS, abi, state.provider)
  state.dapps.tarot.contract = state.dapps.tarot.contract.connect(state.wallet.burner)

  // bind event listenerd
  state.dapps.tarot.contract.on(state.dapps.tarot.contract.filters.Reading(null, null), (soul, card1, card2, card3) => {
    if (address.toLowerCase() === soul.toLowerCase()) {
      // state.assist.notify('txConfirmedClient', () => `Moon Maths Complete!`)
      state.dapps.tarot.read = true
      state.dapps.tarot.reading = [card1, card2, card3]
    }
  })

  getReading()

  emitter.on('tarot.pay', () => {
    state.dapps.tarot.reading = true
    emitter.emit('render') // re-render so we can show the loading animation
  })

  emitter.on('tarot.read', () => {
    state.dapps.tarot.read = true
    emitter.emit('tarot.activeCard', 0)
    emitter.emit('render')
  })

  emitter.on('tarot.activeCard', (num) => {
    state.dapps.tarot.activeCard = num
    emitter.emit('render')
  })

  emitter.on('tarot.getReading', () => {
    getReading()
  })

  async function getReading () {
    const hasReading = await state.dapps.tarot.contract.read(address)
    if (hasReading) {
      const c1 = await state.dapps.tarot.contract.card1(address)
      const c2 = await state.dapps.tarot.contract.card2(address)
      const c3 = await state.dapps.tarot.contract.card3(address)
      state.dapps.tarot.myReading = [c1, c2, c3]
      emitter.emit('tarot.read')
    }
  }


}