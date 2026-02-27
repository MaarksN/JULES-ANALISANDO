from playwright.sync_api import sync_playwright
import time

def run():
    with sync_playwright() as p:
        print("Launching browser...")
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Intercept the request to /api/sales/leads
        def handle_route(route):
            print("Intercepted /api/sales/leads - holding request to keep loading state")
            # Do not fulfill or continue, causing the request to hang
            pass

        page.route("**/api/sales/leads", handle_route)

        print("Navigating to http://localhost:5173/")
        # waitUntil='domcontentloaded' to avoid waiting for network idle (which won't happen if we hang a request)
        page.goto("http://localhost:5173/", wait_until="domcontentloaded")

        print("Waiting for skeleton elements...")
        try:
            # Look for the skeleton structure we added
            # We added 6 SkeletonCards. Each has animate-pulse.
            # We can check for the container grid too.
            page.wait_for_selector(".animate-pulse", timeout=5000)

            # Count them just to be sure
            count = page.locator(".animate-pulse").count()
            print(f"Found {count} elements with animate-pulse class.")

            # Take a screenshot
            screenshot_path = "verification_skeleton.png"
            page.screenshot(path=screenshot_path)
            print(f"Screenshot saved to {screenshot_path}")

        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="verification_error.png")

        browser.close()

if __name__ == "__main__":
    run()
