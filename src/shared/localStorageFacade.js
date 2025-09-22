export default class LocalStorageFacade {
  constructor (key) {
    this.key = `sungolf_1.0_${key}`
  }

  write (serializedState) { window.localStorage.setItem(this.key, serializedState) }

  read () { return window.localStorage.getItem(this.key) }

  exists () { return window.localStorage.getItem(this.key) != null }

  remove () { window.localStorage.removeItem(this.key) }
}
