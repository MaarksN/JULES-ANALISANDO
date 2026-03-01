from playwright.sync_api import Page, expect, sync_playwright
import os

def test_html_files(page: Page):
    files_to_test = [
        "buscador-vagas.html",
        "enriquecimento-leads.html",
        "jus-2026.html",
        "saas-birthub-360.html",
        "sales-prospector-catarina-ia.html"
    ]

    # Use the absolute path as requested by Playwright instructions
    verification_dir = "/home/jules/verification"
    if not os.path.exists(verification_dir):
        os.makedirs(verification_dir)

    for filename in files_to_test:
        filepath = os.path.abspath(filename)
        page.goto(f"file://{filepath}")

        # Take full page screenshot
        page.screenshot(path=f"{verification_dir}/{filename}.png", full_page=True)
        print(f"Saved {filename}.png to {verification_dir}")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            test_html_files(page)
        finally:
            browser.close()
