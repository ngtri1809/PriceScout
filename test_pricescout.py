from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.firefox.service import Service
from webdriver_manager.firefox import GeckoDriverManager
import time

class TestPriceScout:
    def __init__(self):
        # Setup Firefox WebDriver với webdriver-manager
        self.driver = webdriver.Firefox(service=Service(GeckoDriverManager().install()))
        self.base_url = "http://localhost:5173"
        self.wait = WebDriverWait(self.driver, 10)
        
    def setup(self):
        """Mở browser và maximize window"""
        self.driver.maximize_window()
        
    def teardown(self):
        """Đóng browser sau khi test xong"""
        time.sleep(2)  # Delay để xem kết quả
        self.driver.quit()
        
    def test_login(self, username="testuser", password="testpass123"):
        """TC1: Test Login functionality"""
        print("Testing TC1: Login...")
        
        try:
            # Navigate to login page
            self.driver.get(f"{self.base_url}/login")
            
            # Wait for login form to load
            username_field = self.wait.until(
                EC.presence_of_element_located((By.ID, "username"))
            )
            password_field = self.driver.find_element(By.ID, "password")
            login_button = self.driver.find_element(By.ID, "login-button")
            
            # Enter credentials
            username_field.send_keys(username)
            password_field.send_keys(password)
            
            # Click login
            login_button.click()
            
            # Wait for redirect to search page
            self.wait.until(EC.url_contains("/search"))
            
            # Verify successful login
            assert "/search" in self.driver.current_url
            print("✓ TC1 PASSED: Login successful, redirected to search page")
            return True
            
        except Exception as e:
            print(f"✗ TC1 FAILED: {str(e)}")
            return False
            
    def test_register(self, username="newuser", email="newuser@test.com", password="newpass123"):
        """TC2: Test Registration functionality"""
        print("Testing TC2: Register...")
        
        try:
            # Navigate to register page
            self.driver.get(f"{self.base_url}/register")
            
            # Wait for registration form
            username_field = self.wait.until(
                EC.presence_of_element_located((By.ID, "reg-username"))
            )
            email_field = self.driver.find_element(By.ID, "reg-email")
            password_field = self.driver.find_element(By.ID, "reg-password")
            register_button = self.driver.find_element(By.ID, "register-button")
            
            # Fill registration form
            username_field.send_keys(username)
            email_field.send_keys(email)
            password_field.send_keys(password)
            
            # Submit registration
            register_button.click()
            
            # Wait for success message or redirect
            time.sleep(2)
            
            # Verify registration success
            success_message = self.driver.find_element(By.CLASS_NAME, "success-message")
            assert "successful" in success_message.text.lower()
            
            print("✓ TC2 PASSED: Registration successful")
            return True
            
        except Exception as e:
            print(f"✗ TC2 FAILED: {str(e)}")
            return False
            
    def test_search(self, search_query="Macbook"):
        """TC3: Test Search functionality"""
        print(f"Testing TC3: Search for '{search_query}'...")
        
        try:
            # Make sure user is logged in first
            if "/search" not in self.driver.current_url:
                self.driver.get(f"{self.base_url}/search")
            
            # Find search box
            search_box = self.wait.until(
                EC.presence_of_element_located((By.ID, "product-search"))
            )
            
            # Enter search query
            search_box.clear()
            search_box.send_keys(search_query)
            search_box.send_keys(Keys.RETURN)
            
            # Wait for search results to load
            results = self.wait.until(
                EC.presence_of_all_elements_located((By.CLASS_NAME, "product-item"))
            )
            
            # Verify results are displayed
            assert len(results) > 0
            print(f"✓ TC3 PASSED: Found {len(results)} results for '{search_query}'")
            return True
            
        except Exception as e:
            print(f"✗ TC3 FAILED: {str(e)}")
            return False
            
    def test_add_to_watchlist(self):
        """TC4: Test Add to Watchlist functionality"""
        print("Testing TC4: Add to Watchlist...")
        
        try:
            # Assume we're on search results page
            # Find first product's "Add to Watchlist" button
            add_button = self.wait.until(
                EC.element_to_be_clickable((By.CLASS_NAME, "add-to-watchlist"))
            )
            
            # Click add to watchlist
            add_button.click()
            
            # Wait for confirmation message
            success_msg = self.wait.until(
                EC.presence_of_element_located((By.CLASS_NAME, "watchlist-success"))
            )
            
            assert "added" in success_msg.text.lower()
            print("✓ TC4 PASSED: Product added to watchlist")
            return True
            
        except Exception as e:
            print(f"✗ TC4 FAILED: {str(e)}")
            return False
            
    def test_check_watchlist(self):
        """TC5: Test Check Watchlist functionality"""
        print("Testing TC5: Check Watchlist...")
        
        try:
            # Navigate to watchlist page
            self.driver.get(f"{self.base_url}/watchlist")
            
            # Wait for watchlist to load
            watchlist_items = self.wait.until(
                EC.presence_of_all_elements_located((By.CLASS_NAME, "watchlist-item"))
            )
            
            # Verify watchlist contains items
            assert len(watchlist_items) > 0
            print(f"✓ TC5 PASSED: Watchlist contains {len(watchlist_items)} items")
            return True
            
        except Exception as e:
            print(f"✗ TC5 FAILED: {str(e)}")
            return False
            
    def test_price_prediction(self):
        """TC6: Test Price Prediction functionality"""
        print("Testing TC6: Price Prediction...")
        
        try:
            # Click on a product to view details
            product_link = self.wait.until(
                EC.element_to_be_clickable((By.CLASS_NAME, "product-link"))
            )
            product_link.click()
            
            # Wait for product detail page to load
            predict_button = self.wait.until(
                EC.presence_of_element_located((By.ID, "predict-price-btn"))
            )
            
            # Click predict button
            predict_button.click()
            
            # Wait for prediction chart to load
            prediction_chart = self.wait.until(
                EC.presence_of_element_located((By.CLASS_NAME, "prediction-chart"))
            )
            
            assert prediction_chart.is_displayed()
            print("✓ TC6 PASSED: Price prediction displayed successfully")
            return True
            
        except Exception as e:
            print(f"✗ TC6 FAILED: {str(e)}")
            return False
            
    def run_all_tests(self):
        """Chạy tất cả test cases"""
        print("=" * 50)
        print("Starting PriceScout Test Suite")
        print("=" * 50)
        
        self.setup()
        
        results = {
            "TC1_Login": self.test_login(),
            "TC3_Search": self.test_search(),
            "TC4_Add_to_Watchlist": self.test_add_to_watchlist(),
            "TC5_Check_Watchlist": self.test_check_watchlist(),
            "TC6_Price_Prediction": self.test_price_prediction()
        }
        
        # Summary
        print("\n" + "=" * 50)
        print("Test Summary:")
        print("=" * 50)
        passed = sum(1 for result in results.values() if result)
        total = len(results)
        print(f"Passed: {passed}/{total}")
        print(f"Failed: {total - passed}/{total}")
        
        for test_name, result in results.items():
            status = "✓ PASSED" if result else "✗ FAILED"
            print(f"{test_name}: {status}")
        
        self.teardown()

# Chạy tests
if __name__ == "__main__":
    tester = TestPriceScout()
    tester.run_all_tests()