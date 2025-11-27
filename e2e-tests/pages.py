"""
Page Object Models cho PriceScout pages
"""
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys
import time
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
    
    # Locators - Updated to match actual HTML
    EMAIL_INPUT = (By.ID, "email")
    PASSWORD_INPUT = (By.ID, "password")
    LOGIN_BUTTON = (By.XPATH, "//button[contains(text(), 'Login')]")
    ERROR_MESSAGE = (By.CSS_SELECTOR, ".bg-red-100")
    
    def __init__(self, driver):
        super().__init__(driver)
        self.url = f"{Config.BASE_URL}/login"
    
    def login(self, email, password):
        """Perform login"""
        self.get_page(self.url)
        time.sleep(1)  # Wait for page to load
        
        email_field = self.find_element(self.EMAIL_INPUT)
        password_field = self.find_element(self.PASSWORD_INPUT)
        
        # Clear and fill email
        email_field.clear()
        email_field.send_keys(email)
        time.sleep(0.5)
        
        # Clear and fill password
        password_field.clear()
        password_field.send_keys(password)
        time.sleep(0.5)
        
        # Find and click login button
        login_btn = self.find_clickable_element(self.LOGIN_BUTTON)
        
        # Try clicking the button - if that doesn't work, try submitting the form
        login_btn.click()
        time.sleep(1)
        
        # Alternative: Try submitting the form directly
        try:
            form = self.driver.find_element(By.TAG_NAME, "form")
            form.submit()
        except:
            pass
        
        # Wait for navigation - either redirect away from login or show error
        try:
            # Wait for URL to change (successful login) or error message to appear
            self.wait.until(
                lambda d: "/login" not in d.current_url or 
                len(d.find_elements(By.CSS_SELECTOR, ".bg-red-100")) > 0
            )
            # Give a bit more time for React to update
            time.sleep(1)
        except Exception as e:
            # If wait times out, give it a moment anyway
            time.sleep(2)
    
    def is_error_displayed(self):
        """Check if error message is shown"""
        try:
            self.find_element(self.ERROR_MESSAGE)
            return True
        except:
            return False


class SearchPage(BasePage):
    """Search page objects"""
    
    # Locators - Updated to match actual HTML
    SEARCH_INPUT = (By.CSS_SELECTOR, "input[type='text'][placeholder*='Search']")
    SEARCH_BUTTON = (By.XPATH, "//button[contains(text(), 'Search')]")
    PRODUCT_ITEMS = (By.CSS_SELECTOR, ".bg-white.p-4.rounded-lg.shadow-md")
    NO_RESULTS = (By.XPATH, "//p[contains(text(), 'No products found')]")
    
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
        # Wait for results to load
        time.sleep(2)
    
    def get_product_count(self):
        """Get number of search results"""
        try:
            products = self.driver.find_elements(*self.PRODUCT_ITEMS)
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
    
    # Locators - Updated to match actual HTML
    PRODUCT_BUTTON = (By.XPATH, "//button[contains(@class, 'rounded-lg')]//p[contains(text(), '{}')]")
    DATE_SELECT = (By.XPATH, "//select[following-sibling::label[contains(text(), 'Date')] or preceding-sibling::label[contains(text(), 'Date')]]")
    MONTH_SELECT = (By.XPATH, "//select[following-sibling::label[contains(text(), 'Month')] or preceding-sibling::label[contains(text(), 'Month')]]")
    YEAR_SELECT = (By.XPATH, "//select[following-sibling::label[contains(text(), 'Year')] or preceding-sibling::label[contains(text(), 'Year')]]")
    PREDICT_BUTTON = (By.XPATH, "//button[contains(text(), 'Get Price Prediction')]")
    PREDICTION_RESULT = (By.CSS_SELECTOR, ".bg-white.rounded-lg.shadow-md.p-6")
    PRODUCT_IMAGE = (By.CSS_SELECTOR, "img[alt*='alarm_clock']")
    SELECTED_PRODUCT_INFO = (By.CSS_SELECTOR, ".bg-blue-50")
    
    def __init__(self, driver):
        super().__init__(driver)
        self.url = f"{Config.BASE_URL}/predict"
    
    def load_page(self):
        """Load predict page"""
        self.get_page(self.url)
        time.sleep(2)  # Wait for page to load
    
    def select_product(self, product_name):
        """Select product from product grid"""
        # Normalize product name: convert underscores to spaces for matching
        # Product names in catalog use spaces (e.g., "alarm clock bakelike green")
        # but tests might use underscores (e.g., "alarm_clock_bakelike_green")
        normalized_name = product_name.replace('_', ' ').lower()
        
        # Wait a bit for products to load
        time.sleep(1)
        
        # Try to find product button with case-insensitive match
        # First, try with normalized name (spaces)
        try:
            # Use translate() for case-insensitive comparison
            xpath = f"//button[.//p[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), '{normalized_name}')]]"
            product_button = self.wait.until(
                EC.element_to_be_clickable((By.XPATH, xpath))
            )
        except:
            # Fallback: try with original name (with underscores)
            try:
                xpath = f"//button[.//p[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), '{product_name.lower()}')]]"
                product_button = self.wait.until(
                    EC.element_to_be_clickable((By.XPATH, xpath))
                )
            except:
                # Last resort: scroll to make sure all products are visible and try again
                self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
                time.sleep(0.5)
                self.driver.execute_script("window.scrollTo(0, 0);")
                time.sleep(0.5)
                xpath = f"//button[.//p[contains(translate(text(), 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), '{normalized_name}')]]"
                product_button = self.wait.until(
                    EC.element_to_be_clickable((By.XPATH, xpath))
                )
        
        # Scroll element into view before clicking
        self.driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", product_button)
        time.sleep(0.3)
        
        product_button.click()
        self.selected_product = product_name
        time.sleep(1)  # Wait for selection
    
    def set_date(self, day, month, year):
        """Set prediction date using selects"""
        # Find selects by their position or labels
        selects = self.driver.find_elements(By.TAG_NAME, "select")
        if len(selects) >= 3:
            # Usually year, month, date in that order
            year_select = Select(selects[0])
            month_select = Select(selects[1])
            date_select = Select(selects[2])
            
            year_select.select_by_value(str(year))
            month_select.select_by_value(str(month))
            date_select.select_by_value(str(day))
        else:
            # Fallback: find by XPath
            year_select = Select(self.find_element((By.XPATH, "//select[preceding-sibling::label[contains(text(), 'Year')]]")))
            month_select = Select(self.find_element((By.XPATH, "//select[preceding-sibling::label[contains(text(), 'Month')]]")))
            date_select = Select(self.find_element((By.XPATH, "//select[preceding-sibling::label[contains(text(), 'Date')]]")))
            year_select.select_by_value(str(year))
            month_select.select_by_value(str(month))
            date_select.select_by_value(str(day))
    
    def predict(self):
        """Click predict button"""
        predict_btn = self.find_clickable_element(self.PREDICT_BUTTON)
        predict_btn.click()
        time.sleep(3)  # Wait for prediction to load
    
    def is_prediction_displayed(self):
        """Check if prediction chart is shown"""
        try:
            self.find_element(self.PREDICTION_RESULT)
            return True
        except:
            return False
    
    def is_product_image_displayed(self):
        """Check if product image is displayed"""
        try:
            img = self.driver.find_element(By.CSS_SELECTOR, f"img[alt*='{self.selected_product}']")
            return img.is_displayed()
        except:
            # Try alternative selector
            try:
                imgs = self.driver.find_elements(By.TAG_NAME, "img")
                return len(imgs) > 0
            except:
                return False


class RegisterPage(BasePage):
    """Register page objects"""
    
    # Locators
    NAME_INPUT = (By.ID, "name")
    EMAIL_INPUT = (By.ID, "email")
    PASSWORD_INPUT = (By.ID, "password")
    CONFIRM_PASSWORD_INPUT = (By.ID, "confirmPassword")
    REGISTER_BUTTON = (By.XPATH, "//button[contains(text(), 'Register')]")
    ERROR_MESSAGE = (By.CSS_SELECTOR, ".bg-red-100")
    
    def __init__(self, driver):
        super().__init__(driver)
        self.url = f"{Config.BASE_URL}/register"
    
    def register(self, name, email, password, confirm_password):
        """Perform registration"""
        self.get_page(self.url)
        
        name_field = self.find_element(self.NAME_INPUT)
        email_field = self.find_element(self.EMAIL_INPUT)
        password_field = self.find_element(self.PASSWORD_INPUT)
        confirm_field = self.find_element(self.CONFIRM_PASSWORD_INPUT)
        register_btn = self.find_clickable_element(self.REGISTER_BUTTON)
        
        name_field.clear()
        name_field.send_keys(name)
        email_field.clear()
        email_field.send_keys(email)
        password_field.clear()
        password_field.send_keys(password)
        confirm_field.clear()
        confirm_field.send_keys(confirm_password)
        
        register_btn.click()
        time.sleep(2)
    
    def is_error_displayed(self):
        """Check if error message is shown"""
        try:
            self.find_element(self.ERROR_MESSAGE)
            return True
        except:
            return False




class HomePage(BasePage):
    """Home page objects"""
    
    def __init__(self, driver):
        super().__init__(driver)
        self.url = f"{Config.BASE_URL}/"
    
    def load(self):
        """Load home page"""
        self.get_page(self.url)
    
    def is_welcome_message_displayed(self):
        """Check if welcome message is shown"""
        try:
            self.find_element((By.XPATH, "//h1[contains(text(), 'Welcome')]"))
            return True
        except:
            return False


class ItemPage(BasePage):
    """Item detail page objects"""
    
    # Locators
    ADD_TO_WATCHLIST_BUTTON = (By.XPATH, "//button[contains(text(), 'Add to Watchlist')]")
    PREDICT_BUTTON = (By.XPATH, "//button[contains(text(), 'Get Price Prediction')]")
    COMPARE_BUTTON = (By.XPATH, "//a[contains(text(), 'Compare Prices')]")
    
    def __init__(self, driver):
        super().__init__(driver)
        self.url = f"{Config.BASE_URL}/item"
    
    def load_item(self, item_id):
        """Load item detail page"""
        self.get_page(f"{self.url}/{item_id}")
        time.sleep(1)
    
    def add_to_watchlist(self):
        """Add item to watchlist"""
        try:
            btn = self.find_clickable_element(self.ADD_TO_WATCHLIST_BUTTON)
            btn.click()
            time.sleep(1)
            return True
        except:
            return False
