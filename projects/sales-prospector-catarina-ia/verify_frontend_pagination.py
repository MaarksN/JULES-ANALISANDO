import time
import subprocess
import sys
import os
import signal
import json
from playwright.sync_api import sync_playwright

def verify_pagination():
    # Start the frontend server
    print("Starting frontend server...")
    # Using specific port 5174 to avoid conflict
    server_process = subprocess.Popen(
        ["npm", "run", "dev", "--", "--port", "5174"],
        cwd="apps/web",
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        preexec_fn=os.setsid
    )

    # Wait blindly for server to start (Vite is fast)
    time.sleep(10)
    server_url = "http://localhost:5174"

    try:
        with sync_playwright() as p:
            print("Launching browser...")
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()

            # Mock API response
            def handle_route(route):
                leads = []
                for i in range(100):
                    leads.append({
                        "id": f"lead-{i}",
                        "name": f"Lead {i}",
                        "company": f"Company {i}",
                        "role": "CEO",
                        "score": 85,
                        "status": "new",
                        "createdAt": "2023-01-01T00:00:00Z"
                    })

                route.fulfill(
                    status=200,
                    content_type="application/json",
                    body=json.dumps(leads)
                )

            # Intercept API calls
            page.route("**/api/sales/leads", handle_route)

            print(f"Navigating to {server_url}...")
            page.goto(server_url)

            # Wait for leads to load
            # LeadCard class starts with "group relative flex flex-col"
            # We can use a more robust selector if needed, but this matches the code I saw.
            selector = ".group.relative.flex.flex-col"

            try:
                page.wait_for_selector(selector, timeout=10000)
            except Exception:
                print("Timed out waiting for lead cards.")
                # Maybe the server didn't start?
                # Dump stdout/stderr
                # print(server_process.stdout.read().decode())
                # print(server_process.stderr.read().decode())
                raise

            # Count lead cards
            cards = page.locator(selector).all()
            count = len(cards)
            print(f"Found {count} lead cards initially.")

            # Screenshot initial state
            page.screenshot(path="/home/jules/verification/initial_load.png")
            print("Saved initial_load.png")

            # Check for Load More button
            load_more = page.get_by_role("button", name="Carregar mais")

            if load_more.is_visible():
                print("Load More button is visible. Clicking it...")
                load_more.click()
                time.sleep(2) # Wait for render

                cards_after = page.locator(selector).all()
                count_after = len(cards_after)
                print(f"Found {count_after} lead cards after clicking Load More.")

                if count_after > count:
                    print("SUCCESS: Pagination works! Count increased.")
                    page.screenshot(path="/home/jules/verification/load_more_clicked.png")
                    print("Saved load_more_clicked.png")

                    if count_after == 70: # 50 + 20
                        print("SUCCESS: Count increased by 20 as expected.")
                    elif count_after == 100:
                        print("Count increased to 100.")
                else:
                    print("FAILURE: Count did not increase.")
            else:
                print("Load More button NOT visible.")
                if count == 100:
                    print("Observation: Currently showing ALL 100 leads (Before Optimization).")
                elif count == 50:
                     print("FAILURE: Only 50 shown but no Load More button?")

            browser.close()

    except Exception as e:
        print(f"Verification failed: {e}")
    finally:
        print("Stopping frontend server...")
        try:
            os.killpg(os.getpgid(server_process.pid), signal.SIGTERM)
        except:
            pass

if __name__ == "__main__":
    verify_pagination()
