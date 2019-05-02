const html = require('choo/html')
const css = require('sheetify')


const TITLE = 'PONY'

module.exports = (state, emit) => {
  if (state.title !== TITLE) emit(state.events.DOMTITLECHANGE, TITLE)

  const container = css`
  .push-button {
    width: 100%;
    border-radius: 5px;
  }

  .push-button.glow {
    animation: pulse 1s infinite alternate;
  }

  .push-button.glow.slow {
    animation: pulse-slow 2s infinite alternate;
  }

  .push-button-text {
    font-size: 2.25rem;
  }

  .push-button-text.active {
    color: #2A333E;
    background: #A7E4AE;
  }

  .push-button-text.pending {
    color: #A7E4AE;
    background: transparent;
  }

  .era-buttons .active {
    background: #A7E4AE;
    color: #2A333E;
  }

  @keyframes pulse {
    from { box-shadow: 0px 0px 20px 5px #A7E4AE; }
    to { box-shadow: 0px 0px 40px 20px #A7E4AE; }
  }

  @keyframes pulse-slow {
    from { box-shadow: 0px 0px 10px 5px #A7E4AE; }
    to { box-shadow: 0px 0px 20px 10px #A7E4AE; }
  }
  `

  if (state.dapps.pony.pony) {
    return ponyView(state, emit)      
  } else {
    if (state.dapps.pony.waiting) {
      return waitingView(state, emit)
    } else {
      return initialView(state, emit)
    }
  } 
}



function initialView (state, emit) {

  return html`
  <section class="flex flex-column justify-around items-center pa5">
  <div class="f1">P O N Y</div>
  <div class="actions">
    <button
      class="push-button-text active"
      onclick=${handleNew}
    >
      FIRST PONY FOR ${state.CURRENCY_SYMBOL}${state.dapps.pony.price.toLocaleString()}
    </button>
  </div>
</section>
  `

  function handleNew() {
    emit('pony.pay')
  }
}

function waitingView (state, emit) {

  return html`
  <section class="flex flex-column justify-around items-center pa5">
  <div class="f1">P O N Y</div>
  <div class="f2">
  Waiting for a new pony
  </div>
</section>
  `

}

function ponyView (state, emit) {

  const colours = [
    "AliceBlue",
    "AntiqueWhite",
    "Aqua"
  ]

  

  let unicornColour = "White"
  let wingsColour = "White"
  let shoes = "Black"
  let body = colours[state.dapps.pony.body]
  let mane = colours[state.dapps.pony.mane]
  let tail = mane
  let eye = "Blue"

  let unicorn;
  let wings;
  if (typeof unicornColour !== 'undefined') {
      unicorn = html `    
      <g id="unicorn" style="stroke:${unicornColour};">
          <line x1="27" y1="9" x2="28" y2="9" />
          <line x1="28" y1="8" x2="29" y2="8" />
          <line x1="29" y1="7" x2="30" y2="7" />
          <line x1="30" y1="6" x2="31" y2="6" />
      </g>`
  }

  if (typeof wingsColour !== 'undefined') {
      wings = html `    
      <g id="wings" style="stroke:${wingsColour};">
          <line x1="15" y1="16" x2="17" y2="16" />
          <line x1="14" y1="15" x2="16" y2="15" />
          <line x1="14" y1="14" x2="16" y2="14" />
          <line x1="11" y1="13" x2="16" y2="13" />
          <line x1="10" y1="12" x2="16" y2="12" />
          <line x1="9" y1="11" x2="15" y2="11" />
          <line x1="7" y1="10" x2="15" y2="10" />
          <line x1="6" y1="9" x2="14" y2="9" />
          <line x1="5" y1="8" x2="13" y2="8" />
          <line x1="4" y1="7" x2="5" y2="7" />
          <line x1="6" y1="7" x2="12" y2="7" />
          <line x1="5" y1="6" x2="11" y2="6" />
          <line x1="4" y1="5" x2="5" y2="5" />
          <line x1="6" y1="5" x2="10" y2="5" />
          <line x1="5" y1="4" x2="8" y2="4" />
          <line x1="4" y1="3" x2="5" y2="3" />
          <line x1="6" y1="3" x2="7" y2="3" />
      </g>`
  }
  

  return html 
    `
  <section class="flex flex-column justify-around items-center pa5">
  <div class="f1">P O N Y</div>
  
  
  <svg xmlns="http://www.w3.org/2000/svg" height="256" width="256" viewBox="0 0 32 32" xmlns:xlink="http://www.w3.org/1999/xlink">
  
  <g id="shoes" style="stroke:${shoes};">
      <line x1="7" y1="28" x2="9" y2="28" />
      <line x1="18" y1="28" x2="20" y2="28" />
  </g>
  <g id="horse" style="stroke:${body};">
      <g id="backleg">
          <line x1="7" y1="27" x2="9" y2="27" />
          <line x1="7" y1="26" x2="9" y2="26" />
          <line x1="7" y1="25" x2="9" y2="25" />
          <line x1="7" y1="24" x2="9" y2="24" />
          <line x1="6" y1="23" x2="10" y2="23" />
      </g>
      <g id="frontleg">
          <line x1="18" y1="27" x2="20" y2="27" />
          <line x1="18" y1="26" x2="20" y2="26" />
          <line x1="18" y1="25" x2="20" y2="25" />
          <line x1="18" y1="24" x2="20" y2="24" />
          <line x1="17" y1="23" x2="21" y2="23" />
      </g>
      <g id="core">
          <line x1="6" y1="22" x2="21" y2="22" />
          <line x1="5" y1="21" x2="22" y2="21" />
          <line x1="5" y1="20" x2="22" y2="20" />
          <line x1="5" y1="19" x2="22" y2="19" />
          <line x1="5" y1="18" x2="22" y2="18" />
          <line x1="5" y1="17" x2="22" y2="17" />
          <line x1="6" y1="16" x2="23" y2="16" />
          <line x1="8" y1="15" x2="24" y2="15" />
          <line x1="20" y1="14" x2="25" y2="14" />
      </g>
      <g id="head">
          <line x1="28" y1="15" x2="30" y2="15" />
          <line x1="27" y1="14" x2="31" y2="14" />
          <line x1="21" y1="13" x2="31" y2="13" />
          <line x1="22" y1="12" x2="30" y2="12" />
          <line x1="23" y1="11" x2="29" y2="11" />
          <line x1="23" y1="10" x2="28" y2="10" />
          <line x1="25" y1="9" x2="27" y2="9" />
      </g>
      <g id="ear">
          <line x1="22" y1="9" x2="24" y2="9" />
          <line x1="22" y1="8" x2="23" y2="8" />
      </g>
  </g>
  <g id="eye" style="stroke:${eye};">
      <line x1="26" y1="11" x2="27" y2="11" />
  </g>
  
  <g id="tail" style="stroke:${tail};">
      <line x1="1" y1="23" x2="2" y2="23" />
      <line x1="0" y1="22" x2="2" y2="22" />
      <line x1="0" y1="21" x2="3" y2="21" />
      <line x1="1" y1="20" x2="3" y2="20" />
      <line x1="1" y1="19" x2="4" y2="19" />
      <line x1="2" y1="18" x2="4" y2="18" />
      <line x1="2" y1="17" x2="4" y2="17" />
      <line x1="3" y1="16" x2="6" y2="16" />
      <line x1="3" y1="15" x2="7" y2="15" />
      <line x1="4" y1="14" x2="6" y2="14" />
  </g>
  <g id="mane" style="stroke:${mane};">
      <line x1="18" y1="15" x2="19" y2="15" />
      <line x1="17" y1="14" x2="20" y2="14" />
      <line x1="18" y1="13" x2="21" y2="13" />
      <line x1="19" y1="12" x2="22" y2="12" />
      <line x1="20" y1="11" x2="23" y2="11" />
      <line x1="21" y1="10" x2="23" y2="10" />
      <line x1="25" y1="10" x2="28" y2="10" />
      <line x1="24" y1="9" x2="27" y2="9" />
      <line x1="24" y1="8" x2="26" y2="8" />
  </g>
  ${unicorn}
  ${wings}
</svg>
  <div class="actions">
    <button
      class="push-button-text active"
      onclick=${handleNew}
    >
      CHANGE PONY FOR ${state.CURRENCY_SYMBOL}${state.dapps.pony.price.toLocaleString()}
    </button>
  </div>
</section>
  `

  function handleNew() {
    emit('pony.pay')
  }
}