import time
from playwright.sync_api import sync_playwright

def verify_cycle1():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        page.on("console", lambda msg: print(f"Browser Console: {msg.text}"))
        page.on("pageerror", lambda err: print(f"Browser Error: {err}"))

        # 1. Verify API Health (BFF Check)
        print("Checking API Health...")
        try:
            page.goto("http://localhost:3001/health/live")
            content = page.content()
            if "ok" in content or "status" in content:
                print("API Health Check: PASSED")
            else:
                print(f"API Health Check: FAILED. Content: {content}")
        except Exception as e:
            print(f"API Connection Failed: {e}")

        # 2. Verify Frontend Load
        print("Checking Web Frontend...")
        try:
            page.goto("http://localhost:5173")
            page.wait_for_selector("text=Meus Leads", timeout=5000)
            print("Web Frontend Load: PASSED")
            page.screenshot(path="cycle1_verification.png")
        except Exception as e:
            print(f"Web Frontend Check Failed: {e}")
            page.screenshot(path="cycle1_error.png")

        browser.close()

if __name__ == "__main__":
    verify_cycle1()
