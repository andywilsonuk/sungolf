import { test, expect, type Page } from '@playwright/test'

test.describe('Loading Screen Tests', () => {
  test('should show loading screen before JavaScript loads and then show game UI', async ({ page }) => {
    // Navigate to the page but don't wait for the JavaScript to load
    await page.goto('/', { waitUntil: 'domcontentloaded' })

    // Check that loading screen is visible initially
    const loadingScreen = page.locator('#loadingScreen')
    await expect(loadingScreen).toBeVisible()

    // Check that loading text is displayed
    const loadingText = page.locator('#loadingText')
    await expect(loadingText).toBeVisible()
    await expect(loadingText).toHaveText('Loading Sungolf')

    // Check that game area is hidden initially
    const gameArea = page.locator('#gameArea')
    await expect(gameArea).toHaveClass(/hide/)

    // Check that options button is hidden initially
    const optionsButton = page.locator('#optionsButton')
    await expect(optionsButton).toHaveClass(/hide/)

    // Wait for JavaScript to load and complete
    await page.waitForLoadState('networkidle')

    // Give some extra time for the async operations to complete
    await page.waitForTimeout(2000)

    // Check that loading screen is hidden after loading
    await expect(loadingScreen).toBeHidden()

    // Check that game area is now visible
    await expect(gameArea).not.toHaveClass(/hide/)
    await expect(gameArea).toBeVisible()

    // Check that options button is now visible
    await expect(optionsButton).not.toHaveClass(/hide/)
    await expect(optionsButton).toBeVisible()

    // Check that title is visible (indicating the game has loaded)
    const title = page.locator('#title')
    await expect(title).toBeVisible()
  })

  test('should handle no JavaScript scenario', async ({ page }) => {
    // Disable JavaScript
    await page.context().addInitScript(() => {
      delete (window as any).onload
    })

    await page.goto('/')
    
    // Loading screen should still be visible since JavaScript won't run
    const loadingScreen = page.locator('#loadingScreen')
    await expect(loadingScreen).toBeVisible()

    // Game area should remain hidden
    const gameArea = page.locator('#gameArea')
    await expect(gameArea).toHaveClass(/hide/)
  })
})