# Minimum Viable Extensible Burner Wallet

This wallet was built by [Flex Dapps](https://flexdapps.com) for their AGM (house party) and as an experiment into how easy we could make spending crypto.

[There's a blog post on the wallet and party here](https://medium.com/flex-dapps/we-used-a-burner-wallet-to-create-a-micro-economy-for-drunk-people-at-our-house-party-and-it-was-812b2d9f7a35). I recommend you read it to get a little background on why we made this and some of the design decisions involved.

## Prerequisites

You'll need `node`, and I recommend using `yarn`.

Run `yarn` to install deps, than `yarn start` to run the app.

I recommend opening it up in a tab with the mobile UI simulator on, otherwise the notifications will look pretty janky as they rely on the detection of a mobile user agent to modify their UI.

## Considerations

There's still some hardcoded work in this repo which should be abstracted out pretty quickly, and as yet there's not a super-clean way to add burner dapps. I would love to make the burner dapp process really simple, and if possible contained to a single file which holds both the view and the state management.

## Tech

We've used choojs as the "framework" for the app, which gives us some pretty lightweight state and UI management capabilities.

We're using [Blocknative Assist](https://blocknative.com) for the transaction notifications, though we don't use their backend service as it doesn't currently support xDAI. `Ethers.js` support was not present in Assist at the time of building this app, so we are handling all notifications with manual calls to `assist.notify`. It should be noted that I don't think I've handled all transaction failure cases yet.

## Contributing

No real guidelines, do as you feel, if you want to make a PR I'll be incredibly excited.

## Contact

Telegram: [@tomnash](https://t.me/tomnash)
Twitter: [@tomnashflex](https://twitter.com/tomnashflex)


## Commands
Command                | Description                                      |
-----------------------|--------------------------------------------------|
`$ yarn`               | Install dependencies
`$ yarn start`         | Start the development server
`$ yarn build`         | Compile progressive web app into `/dist`