const html = require('choo/html')
const css = require('sheetify')

const TITLE = 'REGATTA'

module.exports = (state, emit) => {
  if (state.title !== TITLE) {
    emit(state.events.DOMTITLECHANGE, TITLE)
    emit('regatta.clear')
  }

  const regatta = state.dapps.regatta

  const container = css`
    .hidden {
      display: none;
    }
    .pixelate {
      image-rendering: pixelated;
    }
  `

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
        <div class="f2">R E G A T T A</div>

        <div>Something about how much money you have</div>
        <button>Withdraw ${state.CURRENCY_SYMBOL}${regatta.balance}</button>

        <div class="actions flex flex-column tc w-100">
          <button class="f2" onclick=${() => emit('regatta.enter')}>ENTER RACE</button>
        </div>
      </section>
    `
  }

  function chooseBoat () {
    return html`
      <section class="flex flex-column items-center pa4 pt5">
        <div class="f2">R E G A T T A</div>
        <div class="flex flex-column justify-around items-center w-100 h-100">
          <p class="f3">Pick your boat!</p>
          <div class="flex flex-row w-100 justify-around items-center">
            <button onclick=${() => emit('regatta.boatSelection', -1)} class="pt1 f3">◀</button>
            ${regatta.boatNames.map((name, i) => {
              return html`
                <div class="flex flex-column tc ma3${regatta.selectedBoat !== i ? ' hidden' : ''}">
                  <div class="f3">${state.CURRENCY_SYMBOL}${regatta.boatPrices[i]}</div>
                  <img class="ba pa1 pa3 ma2 pixelate" src="/assets/dapps/regatta/boat-${regatta.boatSlugs[i]}-sun.png" />
                  <div>${name}</div>
                </div>
              `
            })}
            <button onclick=${() => emit('regatta.boatSelection', +1)} class="pt1 f3">▶</button>
          </div>
          <div class="actions">
            <a onclick=${() => emit('regatta.selectBoat', regatta.selectedBoat)}>SELECT</a>
          </div>
        </div>
      </section>
    `
  }

  function chooseWeather () {
    return html`
      <section class="flex flex-column justify-around items-center pa4 pt5">
        <div class="f2">${regatta.boatNames[regatta.chosenBoat]}</div>
        <div class="flex flex-column justify-around items-center w-100 h-100">
          <p>What's your sailing style?</p>
          <div class="flex flex-row w-100 justify-around items-center">
            <button onclick=${() => emit('regatta.weatherSelection', -1)} class="pt1 f3">◀</button>
            ${regatta.weatherNames.map((name, i) => {
              return html`
                <div class="flex flex-column tc ma3${regatta.selectedWeather !== i ? ' hidden' : ''}">
                  <div class="f3">${name}</div>
                  <img class="ba pa1 pa3 ma2 pixelate" src="/assets/dapps/regatta/boat-${regatta.boatSlugs[regatta.chosenBoat]}-${regatta.weatherSlugs[i]}.png" />
                  <div>${regatta.weatherDescriptions[i]}</div>
                </div>
              `
            })}
            <button onclick=${() => emit('regatta.weatherSelection', +1)} class="pt1 f3">▶</button>
          </div>
          <div class="actions">
            <a onclick=${() => emit('regatta.selectWeather', regatta.selectedWeather)}>SELECT</a>
          </div>
        </div>
      </section>
    `
  }

  function chooseSquidRepellent () {
    return html`
      <section class="flex flex-column justify-around items-center pa4 pt5">
        <div class="f2">${regatta.boatNames[regatta.chosenBoat]} with ${regatta.weatherNames[regatta.chosenBoat]}.</div>
        <div class="flex flex-column justify-around items-center w-100 h-100">
          <p>Would you like squid repellent?</p>
          <div class="actions flex flex-column">
            <a onclick=${() => emit('regatta.getRepellent', true)} class="">Yes (${state.CURRENCY_SYMBOL}${regatta.repellentPrice})</a>
            <a onclick=${() => emit('regatta.getRepellent', false)} class="">No</a>
          </div>
          <p>You might need it...</p>
        </div>
      </section>
    `
  }

  function race () {
    return html`
      <section class="flex flex-column justify-around items-center pa4 pt5">
        <div class="f2">Nice work, time to cheer on your <span class="underline">${regatta.boatNames[regatta.chosenBoat]}</span> with <span class="underline">${regatta.weatherNames[regatta.chosenBoat]}</span>.</div>
        <img class="" src="/assets/dapps/regatta/boat-${regatta.boatSlugs[regatta.chosenBoat]}-${regatta.weatherSlugs[regatta.chosenBoat]}.png" />
        <div class="actions">
          <a href="/dapps">BACK</a>
        </div>
      </section>
    `
  }

}
