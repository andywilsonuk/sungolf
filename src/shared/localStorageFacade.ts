export default class LocalStorageFacade {
  private key: string

  constructor(key: string) {
    this.key = `sungolf_1.0_${key}`
  }

  write(serializedState: string): void {
    window.localStorage.setItem(this.key, serializedState)
  }

  read(): string | null {
    return window.localStorage.getItem(this.key)
  }

  exists(): boolean {
    return window.localStorage.getItem(this.key) != null
  }

  remove(): void {
    window.localStorage.removeItem(this.key)
  }
}
