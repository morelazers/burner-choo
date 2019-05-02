module.exports = store

const ethers = require('ethers')
const abi = require('../../contracts/REGATTA.abi')

const nomenclature = {
  titles: [
      "HMS",
      "RMS",
      "SS",
      "Good Ship",
      "Mighty",
      "HMAS",
      "MS",
      "Old",
      "New",
      "Cursed",
      "Leaky",
      "Steamboat",
      "Princess",
      "Spirit of",
  ],
  names: [
      "Shippington",
      "Boater",
      "Sinky",
      "Floater",
      "Shiply",
      "Zoomyzoom",
      "Gofastplease",
      "Hope",
      "Shame",
      "Watermelon",
      "Fireman",
      "Sea-you-later",
      "Pirate",
      "Ahoy",
      "Cheeseburger",
      "Bananas",
      "Spoonboy",
      "Internet",
      "Ethereum",
      "Pun-name",
      "Time Traveller",
      "Bean Factory",
      "I am sad",
      "Hoot-hoot",
      "Jon Snow",
      "Bounty",
      "Endeavour",
      "Tony Abbott",
      "Spiderman",
      "Scissorhands",
      "Lizardfinger",
      "Iron Fish",
      "Sail Gently Into That Good Night",
      "Hank Scorpio",
      "Titanic",
      "Gary Dent",
      "Safety",
      "Avengers",
      "Sandbar",
      "Chocolate",
      "Orangey",
      "Disappointment",
      "Untitled",
      "Fingerbun",
      "Dingo",
      "Kangaroo",
      "Wallaby",
      "Wombat",
      "Rosella",
      "Tim-Tam",
      "Lamington",
      "Vegemite",
      "Pavlova",
      "Crikey!",
      "Saddlebags",
      "Emu",
      "Spoonfed",
      "Salsa",
      "Not-a-knife",
      "Speedy",
      "Scurvy",
      "Nemo",
      "Unsinkable",
      "Lizardbreath",
      "Buttercup",
      "Pinafore",
      "Foghorn",
      "Pontypool",
      "Anne",
      "MissingNo.",
      "Beagle",
      "Smeagol",
      "Adventure",
      "Problematic",
      "Arr Matey",
      "Queen Anne's Revenge",
      "Jazz Hands",
      "Misery",
      "Spirit",
      "Hope",
      "Hopeless",
      "Lightning",
      "Thunder",
      "Bouyancy",
      "Cymru",
      "Black Pearl",
      "Airbender",
      "Lifeboat",
      "Seafoam",
      "Waverunner",
      "Chastity",
      "Reason",
      "Charity",
      "Longing",
      "Mystery",
  ],
  list: [],
  generate(address){
    let index = Number(address)
    index = index % nomenclature.list.length
    return nomenclature.list[index]
  },
  init () {
    let titles = nomenclature.titles;
    let names = nomenclature.names;
    for (let t = 0; t < titles.length; t++) {
      for (let n = 0; n < names.length; n++) {
        nomenclature.list.push(titles[t]+" "+names[n])
      }
    }
  }
}

const DEFAULT_STATE = {
  CONTRACT_ADDRESS: '0xf275265a9fa4c1d254cdaa26a57a8153245b4eb3',
  COURSE_LENGTH: 50,
  balance: 0,
  enterRace: -1,
  selectedBoat: 1,
  selectedWeather: 1,
  chosenBoat: -1,
  chosenWeather: -1,
  squidRepellent: -1,
  boatNames: ['Cutter', 'Schooner', 'Galleon'],
  weatherNames: ['Covered Quarterdeck', 'Spinnaker', 'Clear Decks'],
  weatherDescriptions: ['Best in storms', 'Wind\'s your friend', 'Best in the sun'],
  boatPrices: [300, 500, 700],
  repellentPrice: -1,
  repellentPricePercent: 10,
  boatSlugs: ['small', 'med', 'big'],
  weatherSlugs: ['rain', 'wind', 'sun'],
  entryPrice: -1,
  contract: null
}

function store (state, emitter) {

  nomenclature.init()

  // set up the initial state of our dapp
  state.dapps.regatta = Object.assign({}, DEFAULT_STATE)

  let regatta = state.dapps.regatta
  regatta.myName = nomenclature.generate(state.wallet.address)
  bindListeners()
  getBalance()

  //race states:
  //     in frontend/js/Game.js, there is a function that parses times & progress to get these states, you might find it useful
  //    (from read_race_state(times,progress) )
  //
  //  waiting -> only one entrant atm, can enter
  //  starting -> can still enter,
  //  starting_now -> too late to enter
  //  running -> race in progress
  //  finished -> boat passed finish line, but no tx declaring finished
  //   declared, -> race finish has been declared, someone can declare new race
  //


  /**
   * just_enter_race requires block_finish from get_progress
   *
   * get_times, if (block_start > current block number), can enter
   *
   * // get_progress().block_finish != 0 ||
   * // get_times().block_start > get_times().block_current - 1
   *
   *
   *
   */

  emitter.on('regatta.cancel', () => {
    emitter.emit('regatta.clear')
    emitter.emit('replaceState', '/')
    emitter.emit('render')
  })

  emitter.on('regatta.clear', () => {
    clearInterval(regatta.refreshInterval)
    state.dapps.regatta = Object.assign({}, DEFAULT_STATE)
    regatta = state.dapps.regatta // reassign
    bindListeners()
  })

  emitter.on('regatta.enter', () => {
    regatta.enterRace = 1
    emitter.emit('render')
  })

  emitter.on('regatta.boatSelection', (num) => {
    if (num === -1 && regatta.selectedBoat === 0) {
      regatta.selectedBoat = 2
    } else if (num === 1 && regatta.selectedBoat === 2) {
      regatta.selectedBoat = 0
    } else {
      regatta.selectedBoat += num
    }
    emitter.emit('render')
  })

  emitter.on('regatta.selectBoat', n => {
    regatta.chosenBoat = n
    regatta.entryPrice = regatta.boatPrices[n]
    emitter.emit('render')
  })

  emitter.on('regatta.weatherSelection', (num) => {
    if (num === -1 && regatta.selectedWeather === 0) {
      regatta.selectedWeather = 2
    } else if (num === 1 && regatta.selectedWeather === 2) {
      regatta.selectedWeather = 0
    } else {
      regatta.selectedWeather += num
    }
    emitter.emit('render')
  })

  emitter.on('regatta.selectWeather', w => {
    regatta.chosenWeather = w
    regatta.repellentPrice = ((regatta.entryPrice / 100) * regatta.repellentPricePercent)
    emitter.emit('render')
  })

  emitter.on('regatta.getRepellent', y => {
    regatta.squidRepellent = y
    if (y) regatta.entryPrice += regatta.repellentPrice
    enterRace()
    emitter.emit('render')
  })

  async function enterRace () {
    const progress = await regatta.contract.get_progress()
    const bytes = ethers.utils.defaultAbiCoder.encode(
      ['uint256', 'uint8', 'uint8', 'bool'],
      [progress.block_finish, regatta.chosenBoat, regatta.chosenWeather, regatta.squidRepellent]
    )
    console.log(regatta.status)
    if (regatta.status === 'waiting' || regatta.status === 'starting' || regatta.status === 'finished') {
      emitter.emit(
        'wallet.sendTokens',
        regatta.CONTRACT_ADDRESS,
        regatta.entryPrice,
        bytes,
        {
          txSent: () => `Entering for ${state.CURRENCY_SYMBOL}${regatta.entryPrice}`,
          txConfirmed: () => `Let's go!`,
          txError: () => `Hm, wait for the next race`
        }
      )
    } else {
      state.assist.notify('error', 'Too slow, try the next race')
    }
  }

  async function getBalance () {
    const bal = await regatta.contract.get_balance()
    regatta.myBalance = bal.toNumber()
  }

  async function getProgress () {
    const times = await regatta.contract.get_times()
    const progress = await regatta.contract.get_progress()

    const status = getRaceState(times, progress)
    if (status !== regatta.status) {
      regatta.status = status
      emitter.emit('render')
    }
  }

  function getRaceState (times, progress) {
      times.block_start = Number(times.block_start);
      times.block_finish = Number(times.block_finish);
      times.block_current = Number(times.block_current);

      let winners = parseProgress(progress.progress);

      if(times.block_start == 0) {
        regatta.niceStatus = 'Waiting for entrants...'
        return "waiting"
      } else if (times.block_finish == times.block_start) {
        regatta.niceStatus = ''
        return "void"
      } else if (times.block_start > times.block_current - 1) {
        regatta.niceStatus = 'Next race starting soon'
        return "starting"
      } else if (times.block_start == times.block_current) {
        regatta.niceStatus = 'Next race starting now!'
        return "starting_now"
      } else if (times.block_finish  != "0") {
        regatta.niceStatus = ''
        return "declared"
      } else if (winners.length === 0) {
        regatta.niceStatus = 'There\'s a race happening now!'
        return "running"
      } else {
        regatta.niceStatus = 'Waiting for entrants...'
        return "finished"
      }
  }

  function parseProgress (progress) {
    let winners = []
    for (let boat = 0; boat < progress.length; boat++){
      if (progress[boat] >= regatta.COURSE_LENGTH) {
        winners.push(boat)
      }
    }
    return winners
  }

  async function plunder () {
    const tx = await regatta.contract.grab_gold()
    console.log(tx)
  }

  function bindListeners () {
    regatta.contract = new ethers.Contract(regatta.CONTRACT_ADDRESS, abi, state.provider)
    regatta.contract.on(regatta.contract.filters.CashOut(), (addr) => {
      if (addr.toLowerCase() === state.wallet.address.toLowerCase()) {
        state.assist.notify('success', `Regatta winnings claimed`)
      }
    })
    regatta.contract.on(regatta.contract.filters.Enter(), (_, addr) => {
      if (addr.toLowerCase() !== state.wallet.address.toLowerCase()) {
        state.assist.notify('success', `Someone entered the regatta`)
      }
    })
    regatta.refreshInterval = setInterval(() => getProgress(), 1000)
  }

}