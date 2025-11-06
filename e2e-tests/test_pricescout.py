"""
Test cases cho PriceScout sử dụng pytest
"""
import pytest
from base_driver import BaseDriver
from pages import LoginPage, SearchPage, WatchlistPage, PredictPage
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
        login_page.login(Config.TEST_USERNAME, Config.TEST_PASSWORD)
        
        # Verify redirect to search page
        assert "search" in driver.current_url
    
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


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
