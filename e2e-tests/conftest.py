"""
Pytest configuration and shared fixtures
"""
import pytest
from base_driver import BaseDriver


@pytest.fixture(scope="function")
def driver():
    """
    Provide WebDriver instance for each test
    
    Scope: function - new driver for each test
    """
    driver = BaseDriver.get_firefox_driver()
    
    yield driver
    
    # Cleanup after test
    BaseDriver.quit_driver(driver)


@pytest.fixture(scope="session")
def test_config():
    """Provide test configuration"""
    from config import Config
    return Config


def pytest_configure(config):
    """Configure pytest with custom markers"""
    config.addinivalue_line(
        "markers", "smoke: mark test as smoke test (quick sanity checks)"
    )
    config.addinivalue_line(
        "markers", "regression: mark test as regression test"
    )
    config.addinivalue_line(
        "markers", "slow: mark test as slow running"
    )


def pytest_collection_modifyitems(config, items):
    """Add markers to tests based on name"""
    for item in items:
        if "login" in item.nodeid:
            item.add_marker(pytest.mark.smoke)
        if "search" in item.nodeid:
            item.add_marker(pytest.mark.smoke)
