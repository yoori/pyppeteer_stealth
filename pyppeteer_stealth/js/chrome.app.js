// https://github.com/berstend/puppeteer-extra/blob/c44c8bb0224c6bba2554017bfb9d7a1d0119f92f/packages/puppeteer-extra-plugin-stealth/evasions/chrome.app/index.js

() => {
  if (!window.chrome) {
    // Use the exact property descriptor found in headful Chrome
    // fetch it via `Object.getOwnPropertyDescriptor(window, 'chrome')`
    Object.defineProperty(window, 'chrome', {
      writable: true,
      enumerable: true,
      configurable: false, // note!
      value: {} // We'll extend that later
    })
  }

  // That means we're running headful and don't need to mock anything
  if ('app' in window.chrome) {
    return // Nothing to do here
  }

  const makeError = {
    ErrorInInvocation: fn => {
      const err = new TypeError(`Error in invocation of app.${fn}()`)
      return utils.stripErrorWithAnchor(
        err,
        `at ${fn} (eval at <anonymous>`
      )
    }
  }

  // There's a some static data in that property which doesn't seem to change,
  // we should periodically check for updates: `JSON.stringify(window.app, null, 2)`
  const STATIC_DATA = JSON.parse(
    `
{
  "isInstalled": false,
  "InstallState": {
    "DISABLED": "disabled",
    "INSTALLED": "installed",
    "NOT_INSTALLED": "not_installed"
  },
  "RunningState": {
    "CANNOT_RUN": "cannot_run",
    "READY_TO_RUN": "ready_to_run",
    "RUNNING": "running"
  }
}
        `.trim()
  )

  window.chrome.app = {
    ...STATIC_DATA,

    get isInstalled() {
      return false
    },
    getDetails: function getDetails() {
      if (arguments.length) {
        throw makeError.ErrorInInvocation(`getDetails`)
      }
      return null
    },
    getIsInstalled: function getIsInstalled() {
      if (arguments.length) {
        throw makeError.ErrorInInvocation(`getIsInstalled`)
      }
      return false
    },
    installState: function installState(callback) {
      if (arguments.length != 1 || typeof arguments[0] !== 'function') {
        const err = new TypeError(`Error in invocation of app.installState(function callback)`)
        return utils.stripErrorWithAnchor(
          err,
          `at installState (eval at <anonymous>`
        )
      }
    },
    runningState: function runningState() {
      if (arguments.length) {
        throw makeError.ErrorInInvocation(`runningState`)
      }
      return 'cannot_run'
    }
  }
  utils.patchToStringNested(window.chrome.app)
}
