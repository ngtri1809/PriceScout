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
        
        driver = webdriver.Firefox(
            service=Service(GeckoDriverManager().install()),
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
