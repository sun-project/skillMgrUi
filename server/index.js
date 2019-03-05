const express = require('express')
const consola = require('consola')
const { Nuxt, Builder } = require('nuxt')
const app = express()

// Import and Set Nuxt.js options
const config = require('../nuxt.config.js')
config.dev = !(process.env.NODE_ENV === 'production')

async function start() {
  // Init Nuxt.js
  const nuxt = new Nuxt(config)

  const {
    host = process.env.HOST || '127.0.0.1',
    port = process.env.PORT || 3000
  } = nuxt.options.server

  // Build only in dev mode
  if (config.dev) {
    const builder = new Builder(nuxt)
    await builder.build()
  } else {
    await nuxt.ready()
  }

  // Repond info data
  app.get(config.info.path, (req, res) => {
    res.send(config.info.data)
  })

  // Give nuxt middleware to express
  app.use(nuxt.render)

  // Listen the server
  const server = app.listen(port, host)
  consola.ready({
    message: `Server listening on http://${host}:${port}`,
    badge: true
  })

  // destroyメソッドで接続すべて切るようにする
  wireUpServer(server)

  // 停止用コールバック
  const shutdown = async () => {
    await nuxt.close()
    server.destroy(() => {
      process.exit()
    })
  }

  // シグナルハンドラ指定
  process.on('SIGTERM', shutdown)
  process.on('SIGINT', shutdown)
}

// see: https://qiita.com/waterada/items/baafa41c262712defc34
function wireUpServer(server) {
  const connections = {}
  server.on('connection', function(conn) {
    const key = conn.remoteAddress + ':' + conn.remotePort
    connections[key] = conn
    conn.on('close', function() {
      delete connections[key]
    })
  })

  server.destroy = function(cb) {
    server.close(cb)
    for (const key in connections) {
      connections[key].destroy()
    }
  }
}

start()
