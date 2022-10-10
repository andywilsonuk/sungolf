const log = []

export default (text, outputToConsole = true) => {
  const nowPadded = String(Math.floor(global.performance.now())).padStart(5, '0')
  log.push(`${nowPadded}: ${text}`)
  if (outputToConsole) {
    console.warn(text)
  }
}

export const entries = () => log
