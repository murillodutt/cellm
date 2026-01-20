// CELLM Oracle - E2E Tests for Dashboard
import { test, expect } from '@playwright/test'

test.describe('Dashboard Home', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display page title', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Dashboard')
  })

  test('should show CELLM Oracle header', async ({ page }) => {
    await expect(page.locator('header')).toContainText('CELLM Oracle')
  })

  test('should have navigation links', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Dashboard' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Budget' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Patterns' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Pulse' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Actions' })).toBeVisible()
  })

  test('should show status cards', async ({ page }) => {
    // Wait for data to load
    await page.waitForSelector('[data-testid="health-status"]', { timeout: 5000 }).catch(() => {
      // Card may use different selector
    })

    // Check for health indicator
    await expect(page.locator('text=/\\[\\+\\]|\\[-\\]/')).toBeVisible()
  })

  test('should have refresh button', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'Refresh' })).toBeVisible()
  })

  test('should navigate to budget page', async ({ page }) => {
    await page.getByRole('link', { name: 'Budget' }).click()
    await expect(page).toHaveURL('/budget')
    await expect(page.locator('h1')).toContainText('Budget Tracker')
  })
})

test.describe('Budget Tracker Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/budget')
  })

  test('should display budget page title', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Budget Tracker')
  })

  test('should show total budget card', async ({ page }) => {
    await expect(page.locator('text=Total Budget')).toBeVisible()
  })

  test('should show layer details table', async ({ page }) => {
    await expect(page.locator('text=Layer Details')).toBeVisible()
    await expect(page.locator('table')).toBeVisible()
  })

  test('should show recommendations section', async ({ page }) => {
    await expect(page.locator('text=Recommendations')).toBeVisible()
  })
})

test.describe('Pattern Analytics Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/patterns')
  })

  test('should display patterns page title', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Pattern Analytics')
  })

  test('should show stats cards', async ({ page }) => {
    await expect(page.locator('text=Total Patterns')).toBeVisible()
    await expect(page.locator('text=Total Hits')).toBeVisible()
    await expect(page.locator('text=Prevention Rate')).toBeVisible()
  })

  test('should have category filter', async ({ page }) => {
    await expect(page.locator('select')).toBeVisible()
  })

  test('should show pattern table', async ({ page }) => {
    await expect(page.locator('text=Pattern Usage')).toBeVisible()
    await expect(page.locator('table')).toBeVisible()
  })
})

test.describe('Project Pulse Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pulse')
  })

  test('should display pulse page title', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Project Pulse')
  })

  test('should show health score', async ({ page }) => {
    await expect(page.locator('text=Health Score')).toBeVisible()
  })

  test('should show active issues count', async ({ page }) => {
    await expect(page.locator('text=Active Issues')).toBeVisible()
  })

  test('should show recent validations', async ({ page }) => {
    await expect(page.locator('text=Recent Validations')).toBeVisible()
  })

  test('should show 7-day history table', async ({ page }) => {
    await expect(page.locator('text=7-Day History')).toBeVisible()
  })
})

test.describe('Prescriptive Actions Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/actions')
  })

  test('should display actions page title', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Prescriptive Actions')
  })

  test('should show pending actions count', async ({ page }) => {
    await expect(page.locator('text=Pending Actions')).toBeVisible()
  })

  test('should show completed count', async ({ page }) => {
    await expect(page.locator('text=Completed')).toBeVisible()
  })

  test('should have filter tabs', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'All' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Pending' })).toBeVisible()
  })

  test('should show action cards', async ({ page }) => {
    // Wait for actions to load
    await page.waitForTimeout(500)
    // Check for action elements
    await expect(page.locator('text=/optimization|fix|improvement|maintenance/')).toBeVisible()
  })
})

test.describe('Navigation', () => {
  test('should navigate through all pages', async ({ page }) => {
    // Start at home
    await page.goto('/')
    await expect(page).toHaveURL('/')

    // Go to budget
    await page.getByRole('link', { name: 'Budget' }).click()
    await expect(page).toHaveURL('/budget')

    // Go to patterns
    await page.getByRole('link', { name: 'Patterns' }).click()
    await expect(page).toHaveURL('/patterns')

    // Go to pulse
    await page.getByRole('link', { name: 'Pulse' }).click()
    await expect(page).toHaveURL('/pulse')

    // Go to actions
    await page.getByRole('link', { name: 'Actions' }).click()
    await expect(page).toHaveURL('/actions')

    // Back to home
    await page.getByRole('link', { name: 'Dashboard' }).click()
    await expect(page).toHaveURL('/')
  })
})

test.describe('API Endpoints', () => {
  test('GET /api/status should return valid response', async ({ request }) => {
    const response = await request.get('/api/status')
    expect(response.ok()).toBeTruthy()

    const data = await response.json()
    expect(data).toHaveProperty('valid')
    expect(data).toHaveProperty('version')
    expect(data).toHaveProperty('budget')
  })

  test('GET /api/budget should return valid response', async ({ request }) => {
    const response = await request.get('/api/budget')
    expect(response.ok()).toBeTruthy()

    const data = await response.json()
    expect(data).toHaveProperty('layers')
    expect(data).toHaveProperty('total')
    expect(data).toHaveProperty('limit')
  })

  test('GET /api/patterns should return valid response', async ({ request }) => {
    const response = await request.get('/api/patterns')
    expect(response.ok()).toBeTruthy()

    const data = await response.json()
    expect(data).toHaveProperty('patterns')
    expect(data).toHaveProperty('totalPatterns')
  })

  test('GET /api/pulse should return valid response', async ({ request }) => {
    const response = await request.get('/api/pulse')
    expect(response.ok()).toBeTruthy()

    const data = await response.json()
    expect(data).toHaveProperty('currentScore')
    expect(data).toHaveProperty('history')
  })

  test('GET /api/actions should return valid response', async ({ request }) => {
    const response = await request.get('/api/actions')
    expect(response.ok()).toBeTruthy()

    const data = await response.json()
    expect(data).toHaveProperty('actions')
    expect(data).toHaveProperty('totalPending')
  })
})
