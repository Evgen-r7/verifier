'use strict'
import url from 'url'
import http from 'http'
import {StringDecoder} from 'string_decoder'
import {getSignature, isVerified} from './crypto.js'
import program from 'commander'
program.option('-port, --PORT <type>', 'add http server port', 3000);
program.parse(process.argv);

/************ http ************/
const server = http.createServer((req, res) => {
  const pathname = url.parse(req.url).pathname
  const decoder = new StringDecoder('utf-8')

  let payload = ''
  req.on('data', (data) => {
    payload += decoder.write(data)
  })
  req.on('end', () => {
    payload += decoder.end()

    try {
      payload = JSON.parse(payload)
      if ('data' in payload) payload.data = payload.data.toString() || ""
      if ('sign' in payload) payload.sign = payload.sign.toString() || ""
    } catch(err) {
      console.error(`Error JSON.parse(${payload})`, err)

      res.writeHead(400, { 'Content-Type': 'application/json' })
      res.write(JSON.stringify({success: false, error: `Error JSON.parse(${payload})`}))
      return res.end()
    }

    try {
      if (pathname === '/sign') {
        if (!payload.data) throw 'The data parameter is missing'

        const result = getSignature(payload.data)
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.write(JSON.stringify({ success: true, data: result }))
        res.end()
      } else if (pathname === '/verify') {
        if (!payload.data) throw 'The data parameter is missing'
        if (!payload.sign) throw 'The sign parameter is missing'
  
        const result = isVerified(payload.data, payload.sign)
        res.writeHead(200, { 'Content-Type': 'application/json' })
        res.write(JSON.stringify({ success: true, data: result }))
        res.end()
      } else {
        throw `The pathname ${pathname} is missing`
      }
    } catch (err) {
      console.error('err', err)
      res.writeHead(400, { 'Content-Type': 'application/json' })
      res.write(JSON.stringify({success: false, error: err}))
      res.end()
    }
  })
})

server.listen(program.PORT, (err) => {
  if (err) {
      return console.error('Error starting the server', err)
  }
  console.log(`The server is running on the port ${program.PORT}`)
})