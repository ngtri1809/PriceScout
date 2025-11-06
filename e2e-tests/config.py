"""
Base configuration và fixtures cho Selenium tests
"""
import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file
env_path = Path(__file__).parent / '.env'
load_dotenv(env_path)

class Config:
    """Test configuration"""
    BASE_URL = os.getenv('BASE_URL', 'http://localhost:5173')
    API_URL = os.getenv('API_URL', 'http://localhost:3001/api')
    
    # Test credentials
    TEST_USERNAME = os.getenv('TEST_USERNAME', 'testuser')
    TEST_PASSWORD = os.getenv('TEST_PASSWORD', 'testpass123')
    TEST_EMAIL = os.getenv('TEST_EMAIL', 'testuser@test.com')
    
    # Browser settings
    BROWSER = os.getenv('BROWSER', 'firefox')
    HEADLESS = os.getenv('HEADLESS', 'false').lower() == 'true'
    WAIT_TIMEOUT = int(os.getenv('WAIT_TIMEOUT', '10'))
