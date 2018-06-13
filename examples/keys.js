#!/usr/bin/env node
/*
 * ISC License (ISC)
 * Copyright 2018 aeternity developers
 *
 *  Permission to use, copy, modify, and/or distribute this software for any
 *  purpose with or without fee is hereby granted, provided that the above
 *  copyright notice and this permission notice appear in all copies.
 *
 *  THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
 *  REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
 *  AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
 *  INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
 *  LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
 *  OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
 *  PERFORMANCE OF THIS SOFTWARE.
 */

'use strict'

const program = require('commander')
const prompt = require('prompt')
const fs = require('fs')
const { Crypto } = require('../dist/aepp-sdk')
const path = require('path')

let promptSchema = {
  properties: {
    password: {
      type: 'string',
      description: 'Enter your password',
      hidden: true,
      required: true,
      replace: '*',
      conform: function (value) {
        return true;
      }
    }
  }
}

// Here we read the keys from the on-disk structure, decrypting if necessary.
const extractReadableKeys = (dir, options) => {
  let pwd = options.input
  prompt.start()
  prompt.get(promptSchema, function (err, result) {
    let password = result.password

    let key = fs.readFileSync(path.join(pwd, dir, 'sign_key'))
    let pubKey = fs.readFileSync(path.join(pwd, dir, 'sign_key.pub'))

    let decrypted = Crypto.decryptPrivateKey(password, key)

    let privateHex = Buffer.from(decrypted).toString('hex')
    let decryptedPub = Crypto.decryptPubKey(password, pubKey)

    console.log(`Private key (hex): ${privateHex}`)
    console.log(`Public key (base check): ak\$${Crypto.encodeBase58Check(decryptedPub)}`)
    console.log(`Public key (hex): ${decryptedPub.toString('hex')}`)
  })
}

// This is the method by which we make a new key pair. The æternity key pairs are
// [Ed25519 keys](https://en.wikipedia.org/wiki/EdDSA).
function generateKeyPair (name, { output }) {
  const { pub, priv } = Crypto.generateKeyPair()

  // The parser doesn't like it if we use this literally, i.e. without binding to `data`
  const data = [[path.join(output, name), priv],
                [path.join(output, `${name}.pub`), pub]]

  data.forEach(([path, data]) => {
     fs.writeFileSync(path, data)
     console.log(`Wrote ${path}`)
  })
}

program.version('0.1.0')

program
  .command('decrypt <directory>')
  .description('Decrypts public and private key to readable formats for testing purposes')
  .option('-i, --input [directory]', 'Directory where to look for keys', '.')
  .action(extractReadableKeys)

program
  .command('genkey <keyname>')
  .description('Generate keypair')
  .option('-o, --output [directory]', 'Output directory for the keys', '.')
  .action(generateKeyPair)

program.parse(process.argv)
if (program.args.length === 0) program.help()
