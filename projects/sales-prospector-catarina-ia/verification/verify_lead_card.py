from playwright.sync_api import sync_playwright, expect

def test_lead_card(page):
    # Log console messages
    page.on("console", lambda msg: print(f"Browser console: {msg.text}"))

    # Mock the API response
    # Using wildcard to match any host/protocol
    page.route("**/api/sales/leads", lambda route: route.fulfill(
        status=200,
        content_type="application/json",
        body='''[
            {
                "id": "1",
                "name": "Bolt Test Lead",
                "role": "CTO",
                "company": "Bolt Inc.",
                "location": "San Francisco, CA",
                "email": "bolt@example.com",
                "linkedin": "https://linkedin.com/in/bolt",
                "score": 95,
                "createdAt": "2023-01-01T00:00:00.000Z",
                "updatedAt": "2023-01-01T00:00:00.000Z"
            },
            {
                 "id": "2",
                "name": "Another Lead",
                "role": "CEO",
                "company": "Other Co.",
                "location": "New York, NY",
                "score": 40,
                "createdAt": "2023-01-01T00:00:00.000Z",
                "updatedAt": "2023-01-01T00:00:00.000Z"
            }
        ]'''
    ))

    # Go to the page
    print("Navigating to page...")
    page.goto("http://localhost:5173/")

    # Wait for the lead card to appear
    print("Waiting for lead card...")
    try:
        lead_card = page.get_by_text("Bolt Test Lead")
        expect(lead_card).to_be_visible(timeout=5000)
    except Exception as e:
        print(f"Failed to find lead card: {e}")
        page.screenshot(path="verification/failed_state.png")
        raise e

    # Wait a bit for animation to complete
    page.wait_for_timeout(1000)

    # Take a screenshot of the list
    page.screenshot(path="verification/lead_list_initial.png")
    print("Initial screenshot taken.")

    # Hover over the first card
    lead_card.hover()

    # Wait for hover transition
    page.wait_for_timeout(500)

    # Take a screenshot of the hover state
    page.screenshot(path="verification/lead_card_hover.png")
    print("Hover screenshot taken.")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            test_lead_card(page)
        except Exception as e:
            print(f"Error: {e}")
            exit(1)
        finally:
            browser.close()
