"""
Page Object Models cho PriceScout pages
"""
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from config import Config

class BasePage:
    """Base class cho tất cả pages"""
    
    def __init__(self, driver):
        self.driver = driver
        self.wait = WebDriverWait(driver, Config.WAIT_TIMEOUT)
    
    def get_page(self, url):
        """Navigate to page"""
        self.driver.get(url)
    
    def find_element(self, locator):
        """Find element with wait"""
        return self.wait.until(EC.presence_of_element_located(locator))
    
    def find_clickable_element(self, locator):
        """Find clickable element"""
        return self.wait.until(EC.element_to_be_clickable(locator))
    
    def find_elements(self, locator):
        """Find multiple elements"""
        return self.wait.until(EC.presence_of_all_elements_located(locator))


class LoginPage(BasePage):
    """Login page objects"""
    
    # Locators
    USERNAME_INPUT = (By.ID, "username")
    PASSWORD_INPUT = (By.ID, "password")
    LOGIN_BUTTON = (By.ID, "login-button")
    ERROR_MESSAGE = (By.CLASS_NAME, "error-message")
    
    def __init__(self, driver):
        super().__init__(driver)
        self.url = f"{Config.BASE_URL}/login"
    
    def login(self, username, password):
        """Perform login"""
        self.get_page(self.url)
        
        username_field = self.find_element(self.USERNAME_INPUT)
        password_field = self.find_element(self.PASSWORD_INPUT)
        login_btn = self.find_clickable_element(self.LOGIN_BUTTON)
        
        username_field.clear()
        username_field.send_keys(username)
        password_field.clear()
        password_field.send_keys(password)
        
        login_btn.click()
    
    def is_error_displayed(self):
        """Check if error message is shown"""
        try:
            self.find_element(self.ERROR_MESSAGE)
            return True
        except:
            return False


class SearchPage(BasePage):
    """Search page objects"""
    
    # Locators
    SEARCH_INPUT = (By.ID, "product-search")
    SEARCH_BUTTON = (By.ID, "search-button")
    PRODUCT_ITEMS = (By.CLASS_NAME, "product-item")
    NO_RESULTS = (By.CLASS_NAME, "no-results")
    
    def __init__(self, driver):
        super().__init__(driver)
        self.url = f"{Config.BASE_URL}/search"
    
    def search(self, query):
        """Perform search"""
        self.get_page(self.url)
        
        search_box = self.find_element(self.SEARCH_INPUT)
        search_box.clear()
        search_box.send_keys(query)
        
        search_btn = self.find_clickable_element(self.SEARCH_BUTTON)
        search_btn.click()
    
    def get_product_count(self):
        """Get number of search results"""
        try:
            products = self.find_elements(self.PRODUCT_ITEMS)
            return len(products)
        except:
            return 0
    
    def is_no_results(self):
        """Check if no results message shown"""
        try:
            self.find_element(self.NO_RESULTS)
            return True
        except:
            return False


class WatchlistPage(BasePage):
    """Watchlist page objects"""
    
    # Locators
    WATCHLIST_ITEMS = (By.CLASS_NAME, "watchlist-item")
    EMPTY_MESSAGE = (By.CLASS_NAME, "empty-watchlist")
    
    def __init__(self, driver):
        super().__init__(driver)
        self.url = f"{Config.BASE_URL}/watchlist"
    
    def get_watchlist(self):
        """Load watchlist page"""
        self.get_page(self.url)
    
    def get_item_count(self):
        """Get number of watchlist items"""
        try:
            items = self.find_elements(self.WATCHLIST_ITEMS)
            return len(items)
        except:
            return 0
    
    def is_empty(self):
        """Check if watchlist is empty"""
        try:
            self.find_element(self.EMPTY_MESSAGE)
            return True
        except:
            return False


class PredictPage(BasePage):
    """Predict page objects"""
    
    # Locators
    PRODUCT_SELECT = (By.ID, "product-select")
    DATE_INPUT = (By.ID, "date-input")
    MONTH_INPUT = (By.ID, "month-input")
    YEAR_INPUT = (By.ID, "year-input")
    PREDICT_BUTTON = (By.ID, "predict-button")
    PREDICTION_CHART = (By.CLASS_NAME, "prediction-chart")
    PRODUCT_IMAGE = (By.CLASS_NAME, "product-image")
    
    def __init__(self, driver):
        super().__init__(driver)
        self.url = f"{Config.BASE_URL}/predict"
    
    def load_page(self):
        """Load predict page"""
        self.get_page(self.url)
    
    def select_product(self, product_name):
        """Select product from dropdown"""
        select_element = self.find_element(self.PRODUCT_SELECT)
        select_element.send_keys(product_name)
    
    def set_date(self, day, month, year):
        """Set prediction date"""
        date_input = self.find_element(self.DATE_INPUT)
        date_input.send_keys(str(day))
        
        month_input = self.find_element(self.MONTH_INPUT)
        month_input.send_keys(str(month))
        
        year_input = self.find_element(self.YEAR_INPUT)
        year_input.send_keys(str(year))
    
    def predict(self):
        """Click predict button"""
        predict_btn = self.find_clickable_element(self.PREDICT_BUTTON)
        predict_btn.click()
    
    def is_prediction_displayed(self):
        """Check if prediction chart is shown"""
        try:
            self.find_element(self.PREDICTION_CHART)
            return True
        except:
            return False
    
    def is_product_image_displayed(self):
        """Check if product image is displayed"""
        try:
            img = self.find_element(self.PRODUCT_IMAGE)
            return img.is_displayed()
        except:
            return False
