# E2E Test Strategy for PriceScout

## Test Count Recommendations

### ✅ **Recommended: 15-25 E2E Tests**

For E2E (End-to-End) testing, focus on:
- **Critical user journeys** (happy paths)
- **Main features** (not every edge case)
- **Integration between components**

**Why this number?**
- E2E tests are **slow** (each test opens browser, navigates, interacts)
- E2E tests are **expensive** to maintain
- Focus on **user value** not technical coverage
- Edge cases belong in **unit/integration tests**

### 📊 **Test Distribution**

```
Core User Journeys:     11 tests (60%)
Navigation Tests:        2 tests  (10%)
Form Validation:         2 tests  (10%)
UI Elements:             2 tests  (10%)
Error Handling:          2 tests  (10%)
─────────────────────────────────────
Total:                   19 tests
```

## Test Files

### 1. `test_pricescout_focused.py` ⭐ **RECOMMENDED**
- **19 tests** covering critical user journeys
- **Fast execution** (~5-10 minutes)
- **Easy to maintain**
- **Use this for CI/CD**

### 2. `test_pricescout.py` (Comprehensive)
- **58 tests** including edge cases
- **Slow execution** (~30-60 minutes)
- **Use for:**
  - Manual regression testing
  - Pre-release validation
  - Not recommended for CI/CD

## Fixing the WebDriver Errors

The errors you're seeing are from **GitHub API rate limits** when downloading geckodriver.

### Solution 1: Use Cached Driver (Recommended)
```bash
# The base_driver.py now handles this automatically
# It will cache the driver after first download
```

### Solution 2: Install geckodriver Manually
```bash
# macOS
brew install geckodriver

# Linux
# Download from: https://github.com/mozilla/geckodriver/releases
# Add to PATH
```

### Solution 3: Use Chrome Instead
```python
# In base_driver.py, change to:
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager

driver = webdriver.Chrome(
    service=Service(ChromeDriverManager().install()),
    options=options
)
```

## Running Tests

### Run Focused Suite (Recommended)
```bash
cd e2e-tests
source .venv/bin/activate
pytest test_pricescout_focused.py -v
```

### Run Comprehensive Suite
```bash
pytest test_pricescout.py -v
```

### Run Specific Test
```bash
pytest test_pricescout_focused.py::TestCoreUserJourneys::test_03_user_login_valid -v
```

## Best Practices

1. ✅ **Start with focused suite** (19 tests)
2. ✅ **Run focused tests in CI/CD** (fast feedback)
3. ✅ **Run comprehensive suite before releases** (full coverage)
4. ✅ **Move edge cases to unit tests** (faster, cheaper)
5. ✅ **Keep tests independent** (each test should stand alone)

## Test Maintenance

- **Add tests** when adding new features
- **Remove obsolete tests** when features change
- **Keep focused suite lean** (15-25 tests)
- **Document critical paths** that must always work





