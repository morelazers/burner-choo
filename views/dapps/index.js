const html = require('choo/html')
const css = require('sheetify')

const TITLE = 'DAPPS'

module.exports = view

function view (state, emit) {
  if (state.title !== TITLE) emit(state.events.DOMTITLECHANGE, TITLE)

  const styles = css`
  `

  return html`
    <section class="flex flex-column justify-around pa5">
      ${state.dapps.list.map(dapp => {
        return html`
          <a href=/dapps/${dapp.link}>${dapp.name}</a>
        `
      })}
    </section>
  `
}

/**
 *
 */