from playwright.sync_api import sync_playwright, expect
import json
import time

def run(playwright):
    browser = playwright.chromium.launch(headless=True)
    context = browser.new_context()
    page = context.new_page()

    # Mock API
    def handle_leads(route):
        route.fulfill(
            status=200,
            content_type="application/json",
            body=json.dumps([{
                "id": "1",
                "name": "Jane Doe",
                "role": "CEO",
                "company": "Tech Corp",
                "score": 90,
                "status": "new",
                "createdAt": "2023-01-01T00:00:00Z"
            }])
        )

    # page.route("**/api/sales/leads", handle_leads)

    # Go to app
    page.goto("http://localhost:5173/")

    # Wait for the search input
    search_input = page.locator('input[type="search"]')
    search_input.wait_for()

    # Verify initial state: not focused
    # expect(search_input).not_to_be_focused()

    # Verify hint text is visible
    hint = page.locator("kbd")
    if hint.is_visible():
        print("Hint is visible")
        print(f"Hint text: {hint.inner_text()}")
    else:
        print("Hint is NOT visible")

    # Simulate Ctrl+K
    print("Pressing Control+k...")
    page.keyboard.press("Control+k")

    # Wait a bit for focus
    time.sleep(0.5)

    # Verify focus
    try:
        expect(search_input).to_be_focused(timeout=2000)
        print("SUCCESS: Search input is focused after Ctrl+K")
    except AssertionError:
        print("FAILURE: Search input is NOT focused after Ctrl+K")
        # try Meta+K just in case
        print("Pressing Meta+k...")
        page.keyboard.press("Meta+k")
        time.sleep(0.5)
        try:
             expect(search_input).to_be_focused(timeout=2000)
             print("SUCCESS: Search input is focused after Meta+K")
        except AssertionError:
             print("FAILURE: Search input is NOT focused after Meta+K either")

    # Take screenshot
    page.screenshot(path="verification_search_shortcut.png")

    browser.close()

with sync_playwright() as playwright:
    run(playwright)
