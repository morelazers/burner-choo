const html = require('choo/html')
const css = require('sheetify')

const TITLE = 'DAPPS'

module.exports = view

function view (state, emit) {
  if (state.title !== TITLE) emit(state.events.DOMTITLECHANGE, TITLE)

  const styles = css`
  `

  return html`
    <section class="flex flex-row flex-wrap justify-around content-start pa4">
      ${state.dapps.list.map(dapp => {
        return html`
          <a class="w4 h-25 flex flex-column justify-center mb5" href=/dapps/${dapp.link}>
            <div class="flex flex-column justify-center items-center">
              <img class="dapp-img w-100 ba" src="${dapp.icon}" />
              <div class="tc">${dapp.name}</div>
            </div>
          </a>
        `
      })}
    </section>
  `
}

/**
 *
 */