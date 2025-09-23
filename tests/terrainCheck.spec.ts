/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import { test, expect, type Page } from '@playwright/test'
import { finalStageId } from '../src/entities/constants.js'
import { randomGenerator, randomInt } from '../src/shared/random.js'

const linearProgression = true
const linearStart = 0
const linearCount = 20
const randomCount = 20
const takeScreenshots = true
const showWireframes = false

interface StageIterator {
  initialId: number
  getNext: () => Promise<number | undefined>
}

test.describe('Terrain Check Tests', () => {
  let errorCount = 0

  const loadPage = async (page: Page): Promise<void> => {
    await page.goto('/#devtools', { waitUntil: 'networkidle' })
    if (showWireframes) {
      await page.click('#wireframes')
    }
  }

  const moveToStage = async (page: Page, id: number): Promise<void> => {
    await page.click('#title')
    await page.click('#moveTo', { clickCount: 3 })
    await page.fill('#moveTo', id.toString())
    await page.press('#moveTo', 'Enter')
  }

  const createLinearStages = (page: Page, startId: number, count: number): StageIterator => {
    const endId = startId + count - 1
    let localCurrentId = startId

    const getNext = async (): Promise<number | undefined> => {
      if (localCurrentId === endId) {
        return undefined
      }
      localCurrentId += 1
      await page.keyboard.press('ArrowRight')
      return localCurrentId
    }
    return { initialId: localCurrentId, getNext }
  }

  const createRandomStages = (page: Page, count: number): StageIterator => {
    const rand = randomGenerator(Math.random())
    let c = 0
    let localCurrentId = randomInt(rand, 0, finalStageId)

    const getNext = async (): Promise<number | undefined> => {
      if (c === count) {
        return undefined
      }
      c += 1
      localCurrentId = randomInt(rand, 0, finalStageId)
      await moveToStage(page, localCurrentId)
      return localCurrentId
    }
    return { initialId: localCurrentId, getNext }
  }

  test('should navigate through terrain stages without errors', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })

    page.on('console', (msg) => {
      console.log(msg.text())
    })

    page.on('pageerror', (err) => {
      const errorMessage = err.toString()
      console.log(`Stage error: ${errorMessage}`)
      errorCount += 1
    })

    await loadPage(page)

    const { initialId, getNext } = linearProgression
      ? createLinearStages(page, linearStart, linearCount)
      : createRandomStages(page, randomCount)

    let counter = -1
    let currentId: number | undefined = initialId

    while (currentId !== undefined) {
      counter += 1

      if (counter === 0) {
        await moveToStage(page, currentId)
      } else if (counter % 100 === 0) {
        console.log(`set ${counter}`)
        await loadPage(page)
        await moveToStage(page, currentId)
      }

      if (errorCount > 0) {
        console.log(`stopping on ${currentId}`)
        break
      }

      if (takeScreenshots) {
        await page.waitForTimeout(1000)
        await page.screenshot({ path: `screenshots/${currentId.toString().padStart(5, '0')}.png`, fullPage: true })
      }

      currentId = await getNext()
    }

    expect(errorCount).toBe(0)
  })
})
