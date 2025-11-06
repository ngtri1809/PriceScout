"""
Base driver setup và utilities cho Selenium
"""
from selenium import webdriver
from selenium.webdriver.firefox.service import Service
from selenium.webdriver.firefox.options import Options
from webdriver_manager.firefox import GeckoDriverManager
from selenium.webdriver.support.ui import WebDriverWait
from config import Config
import time
import os

class BaseDriver:
    """Base class để manage WebDriver"""
    
    @staticmethod
    def get_firefox_driver():
        """Initialize Firefox WebDriver"""
        options = Options()
        
        if Config.HEADLESS:
            options.add_argument('--headless')
        
        # Optional: disable notifications
        options.set_preference('dom.webnotifications.enabled', False)
        
        # Try to use cached driver or handle rate limit gracefully
        try:
            # Use cache to avoid hitting GitHub API rate limits
            os.environ['WDM_LOCAL'] = '1'
            driver_path = GeckoDriverManager().install()
        except Exception as e:
            # If webdriver-manager fails, try to use system geckodriver
            print(f"Warning: Could not download geckodriver: {e}")
            print("Attempting to use system geckodriver...")
            try:
                # Try without service (uses system PATH)
                driver = webdriver.Firefox(options=options)
            except Exception as e2:
                raise Exception(f"Could not initialize Firefox driver. Please ensure geckodriver is installed.\nError: {e2}")
        else:
            driver = webdriver.Firefox(
                service=Service(driver_path),
                options=options
            )
        
        driver.implicitly_wait(Config.WAIT_TIMEOUT)
        driver.maximize_window()
        
        return driver
    
    @staticmethod
    def quit_driver(driver):
        """Close browser gracefully"""
        if driver:
            time.sleep(1)  # Short delay để xem kết quả
            driver.quit()
