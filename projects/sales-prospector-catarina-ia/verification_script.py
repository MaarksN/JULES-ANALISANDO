import sys
from playwright.sync_api import sync_playwright

def verify():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Mock API response
        page.route("**/api/sales/leads", lambda route: route.fulfill(
            status=200,
            content_type="application/json",
            body='[{"id":"1","company":"Acme","role":"CEO","name":"Alice","score":90,"status":"new","location":"NY","createdAt":"2024-01-01"}]'
        ))

        page.goto("http://localhost:5173")
        page.wait_for_selector("text=Meus Leads")
        page.wait_for_selector("text=Acme")

        # 1. Verify Focus Restoration
        details_btn = page.locator("button[aria-label='Ver detalhes de Alice']")
        details_btn.focus()
        page.keyboard.press("Enter")
        page.wait_for_selector("text=Dossiê do Lead")

        # Take screenshot of Modal
        page.screenshot(path="verification_modal.png")

        page.keyboard.press("Escape")
        page.wait_for_selector("text=Dossiê do Lead", state="hidden")

        # Wait a bit for focus restoration
        page.wait_for_timeout(500)

        # Take screenshot of restored focus
        page.screenshot(path="verification_restored_focus.png")

        # 2. Verify Search Shortcut (should not work)
        details_btn.click()
        page.wait_for_selector("text=Dossiê do Lead")
        page.keyboard.press("Control+k")
        page.wait_for_timeout(500)

        # Take screenshot of search shortcut attempt (while modal is open)
        page.screenshot(path="verification_search_shortcut.png")

        browser.close()

if __name__ == "__main__":
    verify()
