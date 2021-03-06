const pkg = require('./package')

const contextPath = process.env.CONTEXT_PATH || ''

module.exports = {
  /*
   ** Headers of the page
   */
  head: {
    title: pkg.name,
    meta: [
      {
        charset: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        hid: 'description',
        name: 'description',
        content: pkg.description,
      },
    ],
    link: [
      {
        rel: 'icon',
        type: 'image/x-icon',
        href: '/favicon.ico',
      },
    ],
  },

  /*
   ** Customize the progress-bar color
   */
  loading: {
    color: '#fff',
  },

  /*
   ** Global CSS
   */
  css: ['@/assets/styles/buefy.scss'],

  /*
   ** Plugins to load before mounting the App
   */
  plugins: [],

  /*
   ** Nuxt.js modules
   */
  modules: [
    // Doc: https://axios.nuxtjs.org/usage
    '@nuxtjs/axios',
    '@nuxtjs/auth',
    '@nuxtjs/pwa',
    'nuxt-buefy',
  ],
  /*
   ** Axios module configuration
   */
  axios: {
    // See https://github.com/nuxt-community/axios-module#options
    proxy: true,
  },

  /*
   ** Proxy module configuration
   */
  proxy: {
    '/skillmgr/api/': {
      target: process.env.PROXY_URL || 'http://localhost:8081',
      onProxyReq(proxyReq) {
        if (!process.env.PROXY_URL) {
          proxyReq.setHeader('X_GATEWAY_USER_ID', 'tmiyajima')
        }
      },
    },
  },

  /*
   ** Auth module configuration
   */
  auth: {
    redirect: {
      login: `/login`,
      logout: `/`,
      callback: `${contextPath}/login-callback`,
      home: `${contextPath}/`,
    },
    strategies: {
      local: false,
      keycloak: {
        _scheme: 'oauth2',
        authorization_endpoint:
          'https://keycloak.giraffe.mydns.jp/auth/realms/dev.app.sunarch.co.jp/protocol/openid-connect/auth',
        access_token_endpoint:
          'https://keycloak.giraffe.mydns.jp/auth/realms/dev.app.sunarch.co.jp/protocol/openid-connect/token',
        userinfo_endpoint:
          'https://keycloak.giraffe.mydns.jp/auth/realms/dev.app.sunarch.co.jp/protocol/openid-connect/userinfo',
        response_type: 'code',
        grant_type: 'authorization_code',
        scope: ['openid', 'profile', 'email'],
        client_id: 'skill-mgr-ui',
        token_key: 'access_token',
      },
    },
  },
  /*
   ** Buefy module configuration
   */
  buefy: {
    css: false,
  },

  /*
   ** Router configuration
   */
  router: {
    base: `${contextPath}/`,
    middleware: ['auth'],
  },

  /*
   ** Build configuration
   */
  build: {
    /*
     ** You can extend webpack config here
     */
    extend(config, ctx) {
      // Run ESLint on save
      if (ctx.isDev && ctx.isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/,
        })
      }
    },
  },
}
