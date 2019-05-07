const abi = require('../../contracts/TAROT.abi')

const ethers = require('ethers')

module.exports = function (state, emitter) {
  state.dapps.tarot = {
    read: false,
    reading: false,
    activeCard: -1,
    CONTRACT_ADDRESS: '0x30a0cbdaafa186fe94db1cdfa1faa28a43f507a3',
    price: 2000,
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
      `The Cipher card. Oblivious to prey and his surroundings, the Fool takes in the simple joy of living. Spirit of chaos and innocence. Regain perspective amidst the mesmerising mysteries of life. It is your path to rule.`,
      `The Magician signifies the Divine Unity, of existing on each individual plane. Display confidence in your talents, capabilities and initiative. Do not restrain your full potential, your Divine Motive. Accept guidance from your core or your catalyst. Alternatively, reassess those you trust.`,
      `She is the Secret Tradition, held to represent the Divine Law. Logic and instinct intersect. A secret or truth is to be unveiled, should you be perceptive to it. `,
      `Creation of Life. You are being offered a foundation of abundance, security and protection. A business, idea, love or activity has germinated.  This is your foundation to future progress, positive change and productivity.`,
      `An influential man who naturally balances wisdom and domination. Beware of irresistible arrogance. The Emperor may represent a powerful figure in your life with whom you should consult about your query.`,
      `The Heirophant represents the Moral Law across divine, intellectual and physical realms. Consult with a wise advisor capable of forgiveness. Consciously decide whether you wish to obey or disobey.`,
      `The inevitable pull of the illogical Heart. Power of attraction and addictive proximity. Signifies an irreversible decision. Consult with your heart. `,
      `Gallop towards progress in a chariot drawn by sphinxes. You will be victorious owing to the celestial forces beyond you. Travel or impulsive adventures may be ahead. Utilise your new power with discipline and care. `,
      `Justice grips gilded scales representing mercy and punishment. While the judicial system can be fooled, divine justice can never be escaped. Harmonious interactions with the legal system may be bestowed upon you. Alternatively, the opposite.`,
      `The Sage of solitude. His lantern navigates his narrow, dark path through the Unknown. He seeks enlightenment as he does not know his way yet. Be patient. Listen to your elders. Reevaluate your ignorance and utilise your past experiences.`,
      `Cyclic inevitability of destiny and chance. Prepare for a change in your circumstances. Know the wheel will keep turning, despite anything you do.`,
      `Strength as a signifier of mastery. In principle, your force and energy reserves can counter any attack, pain or danger. Determination, skill and reliability is required.`,
      `Surrender to your newfound, perhaps subversive perspective or change in circumstances. Contemplate your sacrifice. Care for your body. `,
      `Transformation is inevitable. A harsh outcome may await you. No one is immune. What is durable will last longest, what is lost is cleared for new beginnings.`,
      `Alchemical control of volatile factors results in a successful conclusion. Restore your self-control and adaptability. Alternatively, corruption and undesirable combinations of events.`,
      `Seduced by the Devil’s hands, you grip for physical and material pleasures. Consistent hedonism may result in destruction. Alternatively, release from fear, restraint and temptation.`,
      `Unstoppable destruction and chaos emerge unexpectedly. Rebuild and refocus.`,
      `In your own reverie, you look up towards a sparkling outcome. Hope fulfils you, and you keep dreaming. Consciousness and unconsciousness are poured into this dream.`,
      `Illusion absorbs you, and you cannot help but believe what you see. Do not be deceived, you are warned.`,
      `Friendship, happiness and salient rays. Positive outcomes to your struggles are promised. Your conscious mind and golden light heals the situation.`,
      `Evolution, the last judgment. Renewal is signified. An absolute end can only invoke a tremendous beginning. If in doubt, look at your history for clarity.`,
      `Joy attained in the body, of the soul's intoxication in the Earthly paradise. The World represents what is truly desired. An end to a cycle has occurred. Fulfilment and success of relations, projects. Alternatively, delayed plans and stagnation. `,
    ],
    myReading: [],
    eras: ['Past', 'Present', 'Future']
  }

  const address = state.wallet.address

  // create your contract instance
  state.dapps.tarot.contract = new ethers.Contract(state.dapps.tarot.CONTRACT_ADDRESS, abi, state.provider)
  state.dapps.tarot.contract = state.dapps.tarot.contract.connect(state.wallet.burner)

  // bind event listeners
  state.dapps.tarot.contract.on(state.dapps.tarot.contract.filters.Reading(null, null), (soul, card1, card2, card3) => {
    if (address.toLowerCase() === soul.toLowerCase()) {
      state.dapps.tarot.read = true
      state.dapps.tarot.reading = [card1, card2, card3]
    }
  })

  getReading()

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

  emitter.on('tarot.pay', () => {
    if (state.wallet.tokenBalance >= state.dapps.tarot.price) {
      state.dapps.tarot.reading = true
      emitter.emit('render') // re-render so we can show the loading animation
      emitter.emit(
        'wallet.sendTokens',
        state.dapps.tarot.CONTRACT_ADDRESS,
        state.dapps.tarot.price,
        "0x0",
        {
          txSent: () => `Focus on your query...`,
          txConfirmed: () => {
            emit('tarot.getReading')
            return `Celestially Aligned`
          }
        }
      )
    } else {
      state.assist.notify('error', `The future ain't free`)
    }
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