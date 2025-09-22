const log: string[] = []

export default (text: unknown, outputToConsole: boolean = true): void => {
  const nowPadded = String(Math.floor(window.performance.now())).padStart(5, '0')
  log.push(`${nowPadded}: ${text}`)
  if (outputToConsole) {
    console.warn(text)
  }
}

export const entries = (): string[] => log
