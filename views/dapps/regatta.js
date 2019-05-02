const html = require('choo/html')
const raw = require('choo/html/raw')
const css = require('sheetify')
const TITLE = 'REGATTA'

module.exports = (state, emit) => {
  if (state.title !== TITLE) {
    emit(state.events.DOMTITLECHANGE, TITLE)
  }

  let regatta = state.dapps.regatta

  const container = css`
    .hidden {
      display: none;
    }
    .pixelate {
      image-rendering: pixelated;
    }

    .my-boat {
      width: 80%;
    }
  `

  const canEnter = (regatta.status === 'waiting' || regatta.status === 'starting' || regatta.status === 'finished')

  if (regatta.enterRace === -1) {
    return enterRace()
  } else if (regatta.chosenBoat === -1) {
    return chooseBoat()
  } else if (regatta.chosenWeather === -1) {
    return chooseWeather()
  } else if (regatta.squidRepellent === -1) {
    return chooseSquidRepellent()
  } else {
    // there's a race on !
    return race()
  }

  function enterRace () {
    return html`
      <section class="flex flex-column justify-around items-center pa4 pt5">
      <div class='flex items-center flex-column'>
        <h1>Welcome to Crypto Regatta</h1>
        <h2>A Blockchain Game by Andrew <i>Danger</i> Parker</h2>
      </div>
        <h1>${regatta.niceStatus}</h1>
        <div class="actions flex flex-column tc w-100">
          <a onclick=${() => {
            if (canEnter) emit('regatta.enter')
          }}>${canEnter ? 'ENTER' : 'LOADING'}</a>
          <a onclick=${() => emit('replaceState', '/dapps')}>BACK</a>
        </div>
      </section>
    `
  }

  function chooseBoat () {
    return html`
      <section class="flex flex-column items-center pa4 pt5">
        <h2>Crypto Regatta</h2>
        <div class="flex flex-column justify-around items-center w-100 h-100">
          <h1>Pick your boat!</h1>
          <div class="flex flex-row w-100 justify-around items-center">
            <button onclick=${() => emit('regatta.boatSelection', -1)} class="pt1 f3">◀</button>
            ${regatta.boatNames.map((name, i) => {
              return html`
                <div class="flex flex-column items-center tc ma3${regatta.selectedBoat !== i ? ' hidden' : ''}">
                  <h2>${state.CURRENCY_SYMBOL}${regatta.boatPrices[i]}</h2>
                  <img class="ba pa1 pa3 ma2 pixelate" src="/assets/dapps/regatta/boat-${regatta.boatSlugs[i]}-sun.png" />
                  <h2>${name}</h2>
                </div>
              `
            })}
            <button onclick=${() => emit('regatta.boatSelection', +1)} class="pt1 f3">▶</button>
          </div>
          <div class="actions w-100 flex flex-column justify-start items-center">
            <a onclick=${() => emit('regatta.selectBoat', regatta.selectedBoat)}>SELECT</a>
            <a onclick=${() => emit('regatta.cancel')}>BACK</a>
          </div>
        </div>
      </section>
    `
  }

  function chooseWeather () {
    return html`
      <section class="flex flex-column justify-around items-center pa4 pt5">
        <h1>${regatta.boatNames[regatta.chosenBoat]}</h1>
        <div class="flex flex-column justify-around items-center w-100 h-100">
          <h2>What's your sailing style?</h2>
          <div class="flex flex-row w-100 justify-around items-center">
            <button onclick=${() => emit('regatta.weatherSelection', -1)} class="pt1 f3">◀</button>
            ${regatta.weatherNames.map((name, i) => {
              return html`
                <div class="flex flex-column items-center tc ma3${regatta.selectedWeather !== i ? ' hidden' : ''}">
                  <h2>${name}</h2>
                  <img class="ba pa1 pa3 ma2 pixelate" src="/assets/dapps/regatta/boat-${regatta.boatSlugs[regatta.chosenBoat]}-${regatta.weatherSlugs[i]}.png" />
                  <h2>${regatta.weatherDescriptions[i]}</h2>
                </div>
              `
            })}
            <button onclick=${() => emit('regatta.weatherSelection', +1)} class="pt1 f3">▶</button>
          </div>
          <div class="actions w-100 flex flex-column justify-start items-center">
            <a onclick=${() => emit('regatta.selectWeather', regatta.selectedWeather)}>SELECT</a>
            <a onclick=${() => emit('regatta.cancel')}>BACK</a>
          </div>
        </div>
      </section>
    `
  }

  function chooseSquidRepellent () {
    return html`
      <section class="flex flex-column justify-around items-center pa4 pt5">
        <div class="f2"><span class="underline">${regatta.boatNames[regatta.chosenBoat]}</span> with <span class="underline">${regatta.weatherNames[regatta.chosenWeather]}</span>.</div>
        <div class="flex flex-column justify-around items-center w-100 h-100">
          <h2>Would you like squid repellent?</h2>
          <div class="actions flex flex-column justify-center">
            <a onclick=${() => emit('regatta.getRepellent', true)} class="">Yes (${state.CURRENCY_SYMBOL}${regatta.repellentPrice})</a>
            <a onclick=${() => emit('regatta.getRepellent', false)} class="">No</a>
            <a onclick=${() => emit('regatta.cancel')}>CANCEL</a>
          </div>
          <h3>You might need it...</h3>
        </div>
      </section>
    `
  }

  function race () {

    const cheerOn = raw(`<div class="f2">Nice work, time to cheer on your <span class="underline">${regatta.boatNames[regatta.chosenBoat]}</span> with <span class="underline">${regatta.weatherNames[regatta.chosenWeather]}</span>, ${regatta.myName}</div>`)
    const raceOver = raw(`<div class="f2">Wow, that was a close one!</div>`)

    return html`
      <section class="flex flex-column justify-around items-center pa4 pt5">
        ${cheerOn}
        <img class="pixelate my-boat" src="/assets/dapps/regatta/boat-${regatta.boatSlugs[regatta.chosenBoat]}-${regatta.weatherSlugs[regatta.chosenWeather]}.png" />
        <p>If you win, you'll receive winnings automatically a bit later, it's safe to exit the app</p>
        <div class="actions">
          <a onclick=${() => emit('regatta.cancel')}>BACK</a>
        </div>
      </section>
    `
  }

}