import puppeteer, { type Browser, type Page } from 'puppeteer'
import { finalStageId } from '../src/entities/constants.js'
import { randomGenerator, randomInt } from '../src/shared/random.js'
import { createFolder, folderExists, removeReservedCharacters } from './fileUtils.js'

const linearProgression = true
const linearStart = 0
const linearCount = 20
const randomCount = 20
const takeScreenshots = false
const showWireframes = false
const watchMode = false

const waitTimeout = 10 * 1000
const outputFolder = 'screenshots'
const puppeteerSettings = {
  dumpio: true,
  defaultViewport: { width: 1280, height: 800 },
  timeout: waitTimeout,
  headless: !watchMode,
  slowMo: watchMode ? 25 : 0
}
const browser: Browser = await puppeteer.launch(puppeteerSettings)
let currentId = 0
let errorCount = 0
let browserTab: Page

interface StageIterator {
  initialId: number
  getNext: () => Promise<number | undefined>
}

const init = async (): Promise<void> => {
  if (takeScreenshots && !await folderExists(outputFolder)) {
    await createFolder(outputFolder)
  }
  browserTab = await browser.newPage()

  browserTab.setDefaultTimeout(waitTimeout)
  browserTab.on('console', (msg) => {
    console.log(msg.text())
  })
  browserTab.on('pageerror', (err) => {
    const errorMessage = err.toString()
    console.log(`Stage ${currentId}: ${errorMessage}`)
    errorCount += 1
  })
  browserTab.on('error', (err) => {
    const errorMessage = err.toString()
    console.log(`Stage ${currentId}: ${errorMessage}`)
    errorCount += 1
  })

  await loadPage()
}

const loadPage = async (): Promise<void> => {
  await browserTab.goto('http://localhost:5173/#devtools', { waitUntil: ['networkidle0', 'domcontentloaded'] })
  if (showWireframes) {
    await browserTab.click('#wireframes')
  }
}

const moveToStage = async (id: number): Promise<void> => {
  await browserTab.click('#title')
  await browserTab.click('#moveTo', { clickCount: 3 })
  await browserTab.type('#moveTo', id + '\n')
}

const linearStages = (startId: number, count: number): StageIterator => {
  const endId = startId + count - 1
  currentId = startId

  const getNext = async (): Promise<number | undefined> => {
    if (currentId === endId) { return undefined }
    currentId += 1
    await browserTab.keyboard.press('ArrowRight')
    return currentId
  }
  return { initialId: currentId, getNext }
}

const randomStages = (count: number): StageIterator => {
  const rand = randomGenerator(Math.random())
  let c = 0
  currentId = randomInt(rand, 0, finalStageId)

  const getNext = async (): Promise<number | undefined> => {
    if (c === count) { return undefined }
    c += 1
    currentId = randomInt(rand, 0, finalStageId)
    await moveToStage(currentId)
    return currentId
  }
  return { initialId: currentId, getNext }
}

await init()
const { initialId, getNext } = linearProgression ? linearStages(linearStart, linearCount) : randomStages(randomCount)

let counter = -1
currentId = initialId

while (currentId !== undefined) {
  counter += 1
  if (counter === 0) {
    await moveToStage(currentId)
  } else if (counter % 100 === 0) {
    console.log(`set ${counter}`)
    await loadPage()
    await moveToStage(currentId)
  }
  if (errorCount > 0) {
    console.log(`stopping on ${currentId}`)
    break
  }
  if (takeScreenshots) {
    await browserTab.waitForTimeout(1 * 1000)
    await browserTab.screenshot({ path: `${outputFolder}/${removeReservedCharacters(String(currentId).padStart(5, '0'))}.png` })
  }

  currentId = await getNext()
}

console.log('stopped')

await browser?.close()
