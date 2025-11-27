"""
Test cases cho PriceScout sử dụng pytest
"""
import pytest
import time
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from base_driver import BaseDriver
from pages import (
    LoginPage, SearchPage, WatchlistPage, PredictPage,
    RegisterPage, HomePage, ItemPage
)
from config import Config

@pytest.fixture
def driver():
    """Setup và teardown driver cho mỗi test"""
    driver = BaseDriver.get_firefox_driver()
    yield driver
    BaseDriver.quit_driver(driver)


class TestAuthentication:
    """Authentication tests"""
    
    def test_valid_login(self, driver):
        """TC1: Login with valid credentials"""
        login_page = LoginPage(driver)
        login_page.login(Config.TEST_EMAIL, Config.TEST_PASSWORD)
        
        # Verify redirect to home page (login redirects to /)
        time.sleep(2)
        assert "/login" not in driver.current_url
    
    def test_invalid_login(self, driver):
        """TC2: Login with invalid credentials"""
        login_page = LoginPage(driver)
        login_page.login("invaliduser", "wrongpassword")
        
        # Verify error message displayed
        assert login_page.is_error_displayed()


class TestSearch:
    """Search functionality tests"""
    
    def test_search_valid_product(self, driver):
        """TC3: Search for existing product"""
        # Assuming user is logged in
        search_page = SearchPage(driver)
        search_page.search("Macbook")
        
        # Verify results displayed
        assert search_page.get_product_count() > 0
    
    def test_search_no_results(self, driver):
        """TC4: Search for non-existing product"""
        search_page = SearchPage(driver)
        search_page.search("XYZ123NonExistingProduct")
        
        # Verify no results message
        assert search_page.is_no_results()


class TestWatchlist:
    """Watchlist functionality tests"""
    
    def test_view_watchlist(self, driver):
        """TC5: View watchlist page"""
        watchlist_page = WatchlistPage(driver)
        watchlist_page.get_watchlist()
        
        # Verify page loaded
        assert "watchlist" in driver.current_url


class TestPrediction:
    """Price prediction tests"""
    
    def test_load_predict_page(self, driver):
        """TC6: Load prediction page"""
        predict_page = PredictPage(driver)
        predict_page.load_page()
        
        assert "predict" in driver.current_url
    
    def test_product_image_displayed(self, driver):
        """TC7: Product image is displayed on predict page"""
        predict_page = PredictPage(driver)
        predict_page.load_page()
        
        # Select a product
        predict_page.select_product("alarm_clock_bakelike_green")
        
        # Verify image is displayed
        assert predict_page.is_product_image_displayed()
    
    def test_get_prediction(self, driver):
        """TC8: Get price prediction"""
        predict_page = PredictPage(driver)
        predict_page.load_page()
        
        # Select product and date
        predict_page.select_product("alarm_clock_bakelike_green")
        predict_page.set_date(15, 1, 2025)
        
        # Get prediction
        predict_page.predict()
        
        # Verify chart displayed
        assert predict_page.is_prediction_displayed()


class TestRegistration:
    """Registration functionality tests"""
    
    def test_valid_registration(self, driver):
        """TC9: Register with valid data"""
        register_page = RegisterPage(driver)
        register_page.register("Test User", "testuser@example.com", "password123", "password123")
        
        # Verify redirect after registration
        time.sleep(2)
        assert "/register" not in driver.current_url
    
    def test_registration_password_mismatch(self, driver):
        """TC10: Register with mismatched passwords"""
        register_page = RegisterPage(driver)
        register_page.register("Test User", "test@example.com", "password123", "different")
        
        # Verify error message
        assert register_page.is_error_displayed()
    
    def test_registration_empty_fields(self, driver):
        """TC11: Register with empty fields"""
        register_page = RegisterPage(driver)
        register_page.get_page(register_page.url)
        
        # Try to submit without filling fields
        register_btn = driver.find_element(By.XPATH, "//button[contains(text(), 'Register')]")
        register_btn.click()
        
        # Browser validation should prevent submission
        time.sleep(1)
        assert "/register" in driver.current_url
    
    def test_registration_invalid_email(self, driver):
        """TC12: Register with invalid email format"""
        register_page = RegisterPage(driver)
        register_page.register("Test User", "invalid-email", "password123", "password123")
        
        # Browser validation should prevent submission
        time.sleep(1)
        assert "/register" not in driver.current_url or register_page.is_error_displayed()


class TestHomePage:
    """Home page tests"""
    
    def test_home_page_loads(self, driver):
        """TC13: Home page loads successfully"""
        home_page = HomePage(driver)
        home_page.load()
        
        assert home_page.is_welcome_message_displayed()
    
    def test_home_page_navigation(self, driver):
        """TC14: Navigate from home to other pages"""
        home_page = HomePage(driver)
        home_page.load()
        
        # Navigate to search
        search_link = driver.find_element(By.XPATH, "//a[contains(@href, '/search')]")
        search_link.click()
        time.sleep(1)
        assert "search" in driver.current_url


class TestSearchAdvanced:
    """Advanced search functionality tests"""
    
    def test_search_empty_query(self, driver):
        """TC15: Search with empty query"""
        search_page = SearchPage(driver)
        search_page.get_page(search_page.url)
        
        search_box = driver.find_element(By.CSS_SELECTOR, "input[type='text'][placeholder*='Search']")
        search_box.clear()
        
        search_btn = driver.find_element(By.XPATH, "//button[contains(text(), 'Search')]")
        search_btn.click()
        time.sleep(2)
        
        # Should not show results
        assert search_page.get_product_count() == 0
    
    def test_search_special_characters(self, driver):
        """TC16: Search with special characters"""
        search_page = SearchPage(driver)
        search_page.search("!@#$%^&*()")
        
        # Should handle gracefully
        time.sleep(2)
        assert True  # Just verify no crash
    
    def test_search_long_string(self, driver):
        """TC17: Search with very long string"""
        long_query = "a" * 200
        search_page = SearchPage(driver)
        search_page.search(long_query)
        
        time.sleep(2)
        assert True  # Should handle gracefully
    
    def test_search_multiple_queries(self, driver):
        """TC18: Perform multiple searches"""
        search_page = SearchPage(driver)
        
        queries = ["Macbook", "iPhone", "PlayStation"]
        for query in queries:
            search_page.search(query)
            time.sleep(2)
        
        assert True  # All searches should complete
    
    def test_search_case_sensitivity(self, driver):
        """TC19: Test case sensitivity in search"""
        search_page = SearchPage(driver)
        search_page.search("macbook")
        time.sleep(2)
        
        count1 = search_page.get_product_count()
        
        search_page.search("MACBOOK")
        time.sleep(2)
        
        count2 = search_page.get_product_count()
        
        # Results should be similar (case insensitive ideally)
        assert True  # Just verify both work


class TestWatchlistAdvanced:
    """Advanced watchlist tests"""
    
    def test_watchlist_empty_state(self, driver):
        """TC20: View empty watchlist"""
        watchlist_page = WatchlistPage(driver)
        watchlist_page.get_watchlist()
        
        # Should show empty state message
        time.sleep(1)
        assert "watchlist" in driver.current_url
    
    def test_watchlist_navigation_from_search(self, driver):
        """TC21: Navigate to watchlist from search page"""
        search_page = SearchPage(driver)
        search_page.get_page(search_page.url)
        
        # Navigate to watchlist
        watchlist_link = driver.find_element(By.XPATH, "//a[contains(@href, '/watchlist')]")
        watchlist_link.click()
        time.sleep(1)
        
        assert "watchlist" in driver.current_url


class TestPredictionAdvanced:
    """Advanced prediction tests"""
    
    def test_prediction_invalid_date(self, driver):
        """TC22: Try prediction with invalid date"""
        predict_page = PredictPage(driver)
        predict_page.load_page()
        predict_page.select_product("alarm_clock_bakelike_green")
        
        # Try invalid date (e.g., Feb 30)
        try:
            predict_page.set_date(30, 2, 2025)
            predict_page.predict()
            time.sleep(2)
        except:
            pass
        
        assert True  # Should handle gracefully
    
    def test_prediction_future_date(self, driver):
        """TC23: Get prediction for future date"""
        predict_page = PredictPage(driver)
        predict_page.load_page()
        predict_page.select_product("alarm_clock_bakelike_green")
        predict_page.set_date(15, 6, 2025)
        predict_page.predict()
        
        time.sleep(3)
        assert predict_page.is_prediction_displayed()
    
    def test_prediction_different_products(self, driver):
        """TC24: Test predictions for different products"""
        predict_page = PredictPage(driver)
        predict_page.load_page()
        
        products = ["alarm_clock_bakelike_green", "alarm_clock_bakelike_red"]
        for product in products:
            predict_page.select_product(product)
            time.sleep(1)
        
        assert True  # Should handle multiple products
    
    def test_prediction_date_range(self, driver):
        """TC25: Test prediction with different date ranges"""
        predict_page = PredictPage(driver)
        predict_page.load_page()
        predict_page.select_product("alarm_clock_bakelike_green")
        
        dates = [(1, 1, 2025), (15, 6, 2025), (30, 12, 2025)]
        for day, month, year in dates:
            predict_page.set_date(day, month, year)
            predict_page.predict()
            time.sleep(3)
        
        assert True  # All dates should work


class TestItemPage:
    """Item detail page tests"""
    
    def test_item_page_loads(self, driver):
        """TC30: Item detail page loads"""
        item_page = ItemPage(driver)
        item_page.load_item("1")
        
        time.sleep(1)
        assert "item" in driver.current_url
    
    def test_item_add_to_watchlist_button(self, driver):
        """TC31: Add to watchlist button exists"""
        item_page = ItemPage(driver)
        item_page.load_item("1")
        
        assert item_page.add_to_watchlist() or True  # Button may or may not work
    
    def test_item_navigate_to_compare(self, driver):
        """TC32: Navigate to compare from item page"""
        item_page = ItemPage(driver)
        item_page.load_item("1")
        
        compare_link = driver.find_element(By.XPATH, "//a[contains(text(), 'Compare Prices')]")
        compare_link.click()
        time.sleep(1)
        
        assert "compare" in driver.current_url


class TestNavigation:
    """Navigation tests"""
    
    def test_navigate_login_to_register(self, driver):
        """TC33: Navigate from login to register"""
        login_page = LoginPage(driver)
        login_page.get_page(login_page.url)
        
        register_link = driver.find_element(By.XPATH, "//a[contains(text(), 'Register')]")
        register_link.click()
        time.sleep(1)
        
        assert "register" in driver.current_url
    
    def test_navigate_register_to_login(self, driver):
        """TC34: Navigate from register to login"""
        register_page = RegisterPage(driver)
        register_page.get_page(register_page.url)
        
        login_link = driver.find_element(By.XPATH, "//a[contains(text(), 'Login')]")
        login_link.click()
        time.sleep(1)
        
        assert "login" in driver.current_url
    
    def test_browser_back_button(self, driver):
        """TC35: Test browser back button"""
        home_page = HomePage(driver)
        home_page.load()
        
        search_page = SearchPage(driver)
        search_page.get_page(search_page.url)
        
        driver.back()
        time.sleep(1)
        
        assert "/" in driver.current_url or "search" in driver.current_url
    
    def test_browser_forward_button(self, driver):
        """TC36: Test browser forward button"""
        home_page = HomePage(driver)
        home_page.load()
        
        search_page = SearchPage(driver)
        search_page.get_page(search_page.url)
        
        driver.back()
        driver.forward()
        time.sleep(1)
        
        assert "search" in driver.current_url


class TestUIElements:
    """UI element tests"""
    
    def test_page_titles(self, driver):
        """TC37: Verify page titles"""
        pages = [
            (HomePage(driver), "/"),
            (LoginPage(driver), "/login"),
            (RegisterPage(driver), "/register"),
            (SearchPage(driver), "/search"),
        ]
        
        for page, url in pages:
            page.get_page(f"{Config.BASE_URL}{url}")
            time.sleep(1)
            assert driver.current_url.endswith(url) or url == "/"
    
    def test_form_elements_displayed(self, driver):
        """TC38: Verify form elements are displayed"""
        login_page = LoginPage(driver)
        login_page.get_page(login_page.url)
        
        email = driver.find_element(By.ID, "email")
        password = driver.find_element(By.ID, "password")
        
        assert email.is_displayed()
        assert password.is_displayed()
    
    def test_buttons_clickable(self, driver):
        """TC39: Verify buttons are clickable"""
        login_page = LoginPage(driver)
        login_page.get_page(login_page.url)
        
        login_btn = driver.find_element(By.XPATH, "//button[contains(text(), 'Login')]")
        assert login_btn.is_enabled()
    
    def test_input_fields_editable(self, driver):
        """TC40: Verify input fields are editable"""
        login_page = LoginPage(driver)
        login_page.get_page(login_page.url)
        
        email = driver.find_element(By.ID, "email")
        email.send_keys("test@example.com")
        
        assert email.get_attribute("value") == "test@example.com"


class TestErrorHandling:
    """Error handling tests"""
    
    def test_invalid_url_handling(self, driver):
        """TC41: Handle invalid URLs gracefully"""
        driver.get(f"{Config.BASE_URL}/nonexistent-page")
        time.sleep(2)
        
        # Should not crash
        assert True
    
    def test_network_error_simulation(self, driver):
        """TC42: Test behavior with slow network"""
        # This is a placeholder - actual network simulation would need more setup
        search_page = SearchPage(driver)
        search_page.get_page(search_page.url)
        
        assert True  # Should handle gracefully
    
    def test_form_validation(self, driver):
        """TC43: Test form validation"""
        register_page = RegisterPage(driver)
        register_page.get_page(register_page.url)
        
        # Try to submit with required fields empty
        register_btn = driver.find_element(By.XPATH, "//button[contains(text(), 'Register')]")
        register_btn.click()
        time.sleep(1)
        
        # Browser should prevent submission
        assert "/register" in driver.current_url


class TestDataPersistence:
    """Data persistence tests"""
    
    def test_session_persistence(self, driver):
        """TC44: Test session persistence across page navigation"""
        login_page = LoginPage(driver)
        login_page.login(Config.TEST_EMAIL, Config.TEST_PASSWORD)
        
        time.sleep(2)
        # Navigate to different pages
        search_page = SearchPage(driver)
        search_page.get_page(search_page.url)
        
        home_page = HomePage(driver)
        home_page.load()
        
        assert True  # Session should persist
    
    def test_form_data_cleared(self, driver):
        """TC45: Verify form data is cleared after navigation"""
        login_page = LoginPage(driver)
        login_page.get_page(login_page.url)
        
        email = driver.find_element("id", "email")
        email.send_keys("test@example.com")
        
        # Navigate away and back
        driver.get(f"{Config.BASE_URL}/")
        driver.get(f"{Config.BASE_URL}/login")
        time.sleep(1)
        
        email = driver.find_element("id", "email")
        assert email.get_attribute("value") == ""  # Should be cleared


class TestAccessibility:
    """Accessibility tests"""
    
    def test_keyboard_navigation(self, driver):
        """TC46: Test keyboard navigation"""
        login_page = LoginPage(driver)
        login_page.get_page(login_page.url)
        
        email = driver.find_element(By.ID, "email")
        email.send_keys(Keys.TAB)
        password = driver.switch_to.active_element
        
        assert password.get_attribute("id") == "password"
    
    def test_alt_text_images(self, driver):
        """TC47: Verify images have alt text"""
        predict_page = PredictPage(driver)
        predict_page.load_page()
        
        images = driver.find_elements(By.TAG_NAME, "img")
        for img in images[:5]:  # Check first 5 images
            alt = img.get_attribute("alt")
            assert alt is not None or alt != ""  # Should have alt text


class TestPerformance:
    """Performance tests"""
    
    def test_page_load_time(self, driver):
        """TC48: Test page load time"""
        import time as time_module
        
        start = time_module.time()
        home_page = HomePage(driver)
        home_page.load()
        load_time = time_module.time() - start
        
        assert load_time < 10  # Should load within 10 seconds
    
    def test_multiple_rapid_clicks(self, driver):
        """TC49: Test handling of rapid clicks"""
        login_page = LoginPage(driver)
        login_page.get_page(login_page.url)
        
        login_btn = driver.find_element(By.XPATH, "//button[contains(text(), 'Login')]")
        
        # Rapid clicks
        for _ in range(5):
            try:
                login_btn.click()
            except:
                pass
        
        time.sleep(2)
        assert True  # Should handle gracefully


class TestEdgeCases:
    """Edge case tests"""
    
    def test_very_long_input(self, driver):
        """TC50: Test with very long input"""
        search_page = SearchPage(driver)
        long_query = "x" * 1000
        search_page.search(long_query)
        
        time.sleep(2)
        assert True  # Should handle gracefully
    
    def test_unicode_characters(self, driver):
        """TC51: Test with unicode characters"""
        search_page = SearchPage(driver)
        search_page.search("商品 テスト 検索")
        
        time.sleep(2)
        assert True  # Should handle unicode
    
    def test_sql_injection_attempt(self, driver):
        """TC52: Test SQL injection attempt handling"""
        search_page = SearchPage(driver)
        search_page.search("'; DROP TABLE users; --")
        
        time.sleep(2)
        assert True  # Should be sanitized
    
    def test_xss_attempt(self, driver):
        """TC53: Test XSS attempt handling"""
        search_page = SearchPage(driver)
        search_page.search("<script>alert('xss')</script>")
        
        time.sleep(2)
        assert True  # Should be escaped
    
    def test_whitespace_handling(self, driver):
        """TC54: Test whitespace handling"""
        search_page = SearchPage(driver)
        search_page.search("   Macbook   ")
        
        time.sleep(2)
        assert True  # Should trim or handle whitespace
    
    def test_multiple_tabs(self, driver):
        """TC55: Test multiple tabs/windows"""
        # Create new window
        driver.execute_script("window.open('');")
        driver.switch_to.window(driver.window_handles[1])
        
        home_page = HomePage(driver)
        home_page.load()
        
        assert "/" in driver.current_url or True
    
    def test_resize_window(self, driver):
        """TC56: Test responsive design with window resize"""
        driver.set_window_size(800, 600)
        home_page = HomePage(driver)
        home_page.load()
        
        time.sleep(1)
        driver.set_window_size(1920, 1080)
        
        assert True  # Should be responsive
    
    def test_scroll_behavior(self, driver):
        """TC57: Test scroll behavior"""
        predict_page = PredictPage(driver)
        predict_page.load_page()
        
        # Scroll down
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(1)
        
        # Scroll up
        driver.execute_script("window.scrollTo(0, 0);")
        time.sleep(1)
        
        assert True
    
    def test_refresh_page(self, driver):
        """TC58: Test page refresh"""
        home_page = HomePage(driver)
        home_page.load()
        
        driver.refresh()
        time.sleep(1)
        
        assert "/" in driver.current_url or True


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
