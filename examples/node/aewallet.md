


# Simple AE Token Spending Script

This script shows how to use the `Wallet` module from the SDK to send AE to
other addresses.


We'll need the main client module `Ae` in the `Universal` flavor from the SDK.


```js
const { Universal: Ae, Node } = require('@aeternity/aepp-sdk')
const program = require('commander')

async function spend (receiver, amount, { host, debug }) {
```

This code is relatively simple: We create the Ae client asynchronously and
invoke the spend method on it. Passing in `process` from nodejs will make
the implementation grab the key pair from the `WALLET_PRIV` and
`WALLET_PUB` environment variables, respectively.


```js
  const node = await Node({ url: host })
  Ae({ nodes: [{ name: 'local', instance: node }], debug, process })
    .then(ae => ae.spend(parseInt(amount), receiver))
    .then(tx => console.log('Transaction mined', tx))
    .catch(e => console.log(e.message))
}
```

## Command Line Interface

The `commander` library provides maximum command line parsing convenience.


```js
program.version('0.1.0')

program
  .command('spend <receiver> <amount>')
  .option('-H, --host [hostname]', 'Node to connect to', 'http://localhost:3013')
  .option('--debug', 'Switch on debugging')
  .action(spend)

program.parse(process.argv)
if (program.args.length === 0) program.help()
```

