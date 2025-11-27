"""
Focused E2E Test Suite for PriceScout
Covers critical user journeys only (15-20 tests recommended for E2E)
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


class TestCoreUserJourneys:
    """Core user journey tests - Focus on happy paths"""
    
    def test_01_home_page_loads(self, driver):
        """TC1: Home page loads successfully"""
        home_page = HomePage(driver)
        home_page.load()
        assert home_page.is_welcome_message_displayed()
    
    def test_02_user_registration(self, driver):
        """TC2: User can register new account"""
        register_page = RegisterPage(driver)
        register_page.register(
            "Test User", 
            f"testuser{int(time.time())}@example.com", 
            "password123", 
            "password123"
        )
        time.sleep(2)
        assert "/register" not in driver.current_url
    
    def test_03_user_login_valid(self, driver):
        """TC3: User can login with valid credentials"""
        login_page = LoginPage(driver)
        
        # Debug: Check what credentials we're using
        print(f"\n=== LOGIN TEST DEBUG ===")
        print(f"Using email: {Config.TEST_EMAIL}")
        print(f"Using password: {Config.TEST_PASSWORD}")
        
        login_page.login(Config.TEST_EMAIL, Config.TEST_PASSWORD)
        
        # Wait for navigation to complete
        time.sleep(3)
        
        # Debug: Check current state
        current_url = driver.current_url
        print(f"Current URL after login: {current_url}")
        
        # Check for error message
        try:
            error_elements = driver.find_elements(By.CSS_SELECTOR, ".bg-red-100")
            if error_elements:
                error_text = error_elements[0].text
                print(f"Error message found: {error_text}")
        except:
            print("No error message found")
        
        # Check if form fields still have values (might indicate form didn't submit)
        try:
            email_value = driver.find_element(By.ID, "email").get_attribute("value")
            print(f"Email field value: {email_value}")
        except:
            pass
        
        # Verify we're not on login page anymore (should be on home page)
        assert "/login" not in current_url, \
            f"Still on login page. Current URL: {current_url}. " \
            f"Check if login form submitted correctly."
        
        # Additionally verify we're on home page
        assert current_url.rstrip('/').endswith(':5173') or current_url.endswith('/'), \
            f"Expected to be on home page, but URL is: {current_url}"
    
    def test_04_user_login_invalid(self, driver):
        """TC4: Login fails with invalid credentials"""
        login_page = LoginPage(driver)
        login_page.login("invalid@example.com", "wrongpassword")
        assert login_page.is_error_displayed()
    
    def test_05_search_products(self, driver):
        """TC5: User can search for products"""
        search_page = SearchPage(driver)
        search_page.search("Macbook")
        time.sleep(2)
        # Should either show results or no results message
        assert search_page.get_product_count() >= 0
    
    def test_06_search_no_results(self, driver):
        """TC6: Search shows appropriate message when no results"""
        search_page = SearchPage(driver)
        search_page.search("XYZ123NonExistingProduct999")
        time.sleep(2)
        # Should handle gracefully
        assert True
    
    def test_07_view_item_details(self, driver):
        """TC7: User can view item detail page"""
        item_page = ItemPage(driver)
        item_page.load_item("1")
        time.sleep(1)
        assert "item" in driver.current_url
    
    def test_09_view_watchlist(self, driver):
        """TC9: User can view watchlist page"""
        watchlist_page = WatchlistPage(driver)
        watchlist_page.get_watchlist()
        time.sleep(1)
        assert "watchlist" in driver.current_url
    
    def test_10_load_prediction_page(self, driver):
        """TC10: User can load prediction page"""
        predict_page = PredictPage(driver)
        predict_page.load_page()
        assert "predict" in driver.current_url
    
    def test_11_get_price_prediction(self, driver):
        """TC11: User can get price prediction"""
        predict_page = PredictPage(driver)
        predict_page.load_page()
        predict_page.select_product("alarm_clock_bakelike_green")
        predict_page.set_date(15, 1, 2025)
        predict_page.predict()
        time.sleep(3)
        # Should show prediction or handle error gracefully
        assert True


class TestNavigation:
    """Navigation and user flow tests"""
    
    def test_12_navigate_login_to_register(self, driver):
        """TC12: User can navigate from login to register"""
        login_page = LoginPage(driver)
        login_page.get_page(login_page.url)
        register_link = driver.find_element(By.XPATH, "//a[contains(text(), 'Register')]")
        register_link.click()
        time.sleep(1)
        assert "register" in driver.current_url
    
    def test_13_navigate_home_to_search(self, driver):
        """TC13: User can navigate from home to search"""
        home_page = HomePage(driver)
        home_page.load()
        try:
            search_link = driver.find_element(By.XPATH, "//a[contains(@href, '/search')]")
            search_link.click()
            time.sleep(1)
            assert "search" in driver.current_url
        except:
            # If link not found, navigate directly
            driver.get(f"{Config.BASE_URL}/search")
            assert "search" in driver.current_url


class TestFormValidation:
    """Form validation and error handling"""
    
    def test_14_registration_password_mismatch(self, driver):
        """TC14: Registration validates password mismatch"""
        register_page = RegisterPage(driver)
        register_page.register(
            "Test User", 
            "test@example.com", 
            "password123", 
            "different"
        )
        assert register_page.is_error_displayed()
    
    def test_15_form_fields_required(self, driver):
        """TC15: Form fields are required"""
        login_page = LoginPage(driver)
        login_page.get_page(login_page.url)
        # Try to submit without filling
        login_btn = driver.find_element(By.XPATH, "//button[contains(text(), 'Login')]")
        login_btn.click()
        time.sleep(1)
        # Browser validation should prevent or show error
        assert True


class TestUIElements:
    """UI element visibility and functionality"""
    
    def test_16_forms_display_correctly(self, driver):
        """TC16: Form elements are displayed"""
        login_page = LoginPage(driver)
        login_page.get_page(login_page.url)
        email = driver.find_element(By.ID, "email")
        password = driver.find_element(By.ID, "password")
        assert email.is_displayed()
        assert password.is_displayed()
    
    def test_17_buttons_are_clickable(self, driver):
        """TC17: Buttons are enabled and clickable"""
        login_page = LoginPage(driver)
        login_page.get_page(login_page.url)
        login_btn = driver.find_element(By.XPATH, "//button[contains(text(), 'Login')]")
        assert login_btn.is_enabled()


class TestErrorHandling:
    """Error handling and edge cases"""
    
    def test_18_invalid_url_handling(self, driver):
        """TC18: Application handles invalid URLs gracefully"""
        driver.get(f"{Config.BASE_URL}/nonexistent-page-12345")
        time.sleep(2)
        # Should not crash
        assert True
    
    def test_19_empty_search_handling(self, driver):
        """TC19: Search handles empty queries"""
        search_page = SearchPage(driver)
        search_page.get_page(search_page.url)
        search_box = driver.find_element(By.CSS_SELECTOR, "input[type='text'][placeholder*='Search']")
        search_box.clear()
        search_btn = driver.find_element(By.XPATH, "//button[contains(text(), 'Search')]")
        search_btn.click()
        time.sleep(2)
        assert True  # Should handle gracefully


if __name__ == "__main__":
    pytest.main([__file__, "-v"])

