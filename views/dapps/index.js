const html = require('choo/html')
const raw = require('choo/html/raw')
const css = require('sheetify')

const TITLE = 'DAPPS'

module.exports = view

function view (state, emit) {
  if (state.title !== TITLE) emit(state.events.DOMTITLECHANGE, TITLE)

  const styles = css`
  `

  return html`
    <section class="flex flex-column items-center pa3 pt5">
      <div class="flex flex-row flex-wrap justify-around content-start">
        ${state.dapps.list.map((dapp, i) => {
          return html`
            ${i % 2 == 0 ? raw`<div class="flex flex-row w-100">` : ''}
              <a class="w4 pa1 ba flex flex-column justify-between items-center mb5" href=/dapps/${dapp.link}>
                  <img class="dapp-img w-100" src="${dapp.icon}" />
                  <div class="tc">${dapp.name}</div>
              </a>
            ${i % 2 == 0 ? raw`</div>` : ''}
          `
        })}
      </div>
      <div class="actions">
        <a onclick=${() => emit('replaceState', '/')}>BACK</a>
      </div>
    </section>
  `
}

/**
 *
 */