# PriceScout E2E Testing with Selenium

End-to-end testing framework cho PriceScout sử dụng Selenium + pytest trên Firefox.

## 📁 Project Structure

```
e2e-tests/
├── config.py              # Configuration và environment variables
├── base_driver.py         # WebDriver setup và utilities
├── pages.py               # Page Object Models
├── test_pricescout.py     # Test cases
├── requirements.txt       # Python dependencies
├── .env.example           # Environment variables template
├── README.md              # This file
└── conftest.py           # Pytest configuration (optional)
```

## 🚀 Setup Instructions

### 1. Install Python & Virtual Environment

```bash
# Ensure Python 3.8+ is installed
python3 --version

# Create virtual environment
cd e2e-tests
python3 -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate

# On Windows:
# venv\Scripts\activate
```

### 2. Install Dependencies

```bash
# Install only in this folder's virtual environment
pip install -r requirements.txt
```

**⚠️ IMPORTANT:** Dependencies chỉ install trong `venv` của folder `e2e-tests`, KHÔNG global!

### 3. Setup Environment Variables

```bash
# Copy example config
cp .env.example .env

# Edit .env với credentials của bạn
# BASE_URL=http://localhost:5173
# TEST_USERNAME=your_username
# TEST_PASSWORD=your_password
```

## 🏃 Running Tests

### Prerequisites - Start PriceScout Services

Mở 2 terminal windows khác nhau:

**Terminal 1: Start Backend**
```bash
cd /path/to/PriceScout
npm run server  # Runs on port 3001
```

**Terminal 2: Start Frontend**
```bash
cd /path/to/PriceScout
npm run dev     # Runs on port 5173
```

### Run Tests

```bash
# Activate venv first
source venv/bin/activate

# Run all tests
pytest test_pricescout.py -v

# Run specific test class
pytest test_pricescout.py::TestAuthentication -v

# Run specific test
pytest test_pricescout.py::TestAuthentication::test_valid_login -v

# Run with detailed output
pytest test_pricescout.py -v -s

# Run in headless mode
# Edit .env: HEADLESS=true
pytest test_pricescout.py -v
```

## 📊 Test Coverage

| Feature | Test Cases | Status |
|---------|-----------|--------|
| Authentication | TC1, TC2 | ✓ |
| Search | TC3, TC4 | ✓ |
| Watchlist | TC5 | ✓ |
| Prediction | TC6, TC7, TC8 | ✓ |
| Product Images | Included in TC7 | ✓ |

## 🔍 Understanding the Code Structure

### Page Object Pattern
Tất cả pages được define trong `pages.py` để:
- Giảm code duplication
- Dễ maintain khi UI thay đổi
- Tách business logic từ selectors

### Example: LoginPage
```python
class LoginPage(BasePage):
    USERNAME_INPUT = (By.ID, "username")
    PASSWORD_INPUT = (By.ID, "password")
    LOGIN_BUTTON = (By.ID, "login-button")
    
    def login(self, username, password):
        # Reusable method
        username_field = self.find_element(self.USERNAME_INPUT)
        username_field.send_keys(username)
        # ... more steps
```

### Test Cases
Tất cả test cases trong `test_pricescout.py` sử dụng Page Objects:
```python
def test_valid_login(self, driver):
    login_page = LoginPage(driver)
    login_page.login(Config.TEST_USERNAME, Config.TEST_PASSWORD)
    assert "search" in driver.current_url
```

## ⚠️ Troubleshooting

### Issue: "No module named 'selenium'"
**Solution:** Đảm bảo virtual environment đã activate
```bash
source venv/bin/activate
pip list  # Verify packages installed
```

### Issue: "Connection refused" on localhost:5173
**Solution:** Ensure frontend is running
```bash
# Terminal 2
npm run dev
```

### Issue: Firefox browser not found
**Solution:** Install Firefox browser
```bash
# macOS
brew install firefox

# Or download from: https://www.mozilla.org/firefox/
```

### Issue: GeckoDriver error
**Solution:** Re-install webdriver-manager
```bash
pip uninstall webdriver-manager
pip install webdriver-manager
```

### Issue: Element not found errors
**Solutions:**
1. Increase wait timeout in `.env`: `WAIT_TIMEOUT=15`
2. Verify selectors match actual HTML (use browser Inspect tool)
3. Check if page is fully loaded before asserting

## 🎯 Adding New Tests

### Step 1: Create Page Object
```python
# In pages.py
class NewPage(BasePage):
    ELEMENT_LOCATOR = (By.ID, "element-id")
    
    def do_action(self):
        element = self.find_element(self.ELEMENT_LOCATOR)
        element.click()
```

### Step 2: Write Test Case
```python
# In test_pricescout.py
class TestNewFeature:
    def test_new_feature(self, driver):
        new_page = NewPage(driver)
        new_page.do_action()
        assert some_condition
```

### Step 3: Run Test
```bash
pytest test_pricescout.py::TestNewFeature::test_new_feature -v
```

## 📝 Best Practices

✅ **DO:**
- Use Page Object Pattern
- Use meaningful test names
- Use Config for credentials
- Separate setup/teardown with fixtures
- Document complex test scenarios

❌ **DON'T:**
- Hardcode URLs or credentials in tests
- Use global variables for driver
- Mix UI tests with API tests
- Create dependencies between tests

## 🔗 Resources

- [Selenium Documentation](https://www.selenium.dev/documentation/)
- [Pytest Documentation](https://docs.pytest.org/)
- [Page Object Model Pattern](https://www.selenium.dev/documentation/test_practices/encouraged/page_object_models/)

## 📞 Support

Nếu có issue, check:
1. Đúng terminal đang chạy đó không? (frontend port 5173, backend port 3001)
2. Credentials đúng chưa?
3. Firefox browser installed chưa?
4. Virtual environment activate chưa?
