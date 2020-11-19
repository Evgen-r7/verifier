'use strict';

import fs from 'fs'
import crypto from 'crypto'

const publicKey = fs.readFileSync('cert/cert.pem', 'utf-8')
const privateKey = fs.readFileSync('cert/key.pem', 'utf-8')

export function getSignature(data) {
  // Signing
  const signer = crypto.createSign('RSA-SHA256')
  signer.write(data)
  signer.end()

  // Returns the signature in output_format which can be 'binary', 'hex' or 'base64'
  const sign = signer.sign(privateKey, 'hex')
  console.log(`\n\r***** getSignature *****`)
  console.log(`data: [${data}]`)
  console.log(`sign: [${sign}]`)
  return sign
}

export function isVerified(data, sign) {
  // Signing
  const verifier = crypto.createVerify('RSA-SHA256')
  verifier.write(data)
  verifier.end()

  // Verify file signature ( support formats 'binary', 'hex' or 'base64')
  const result = verifier.verify(publicKey, sign, 'hex')
  console.log(`\n\r***** isVerified *****`)
  console.log(`data: [${data}]`)
  console.log(`sign: [${sign}]`)
  console.log('isVerified:', result)
  return result 
}