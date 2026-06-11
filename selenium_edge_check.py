import shutil
import sys
import time
from pathlib import Path

from selenium import webdriver
from selenium.webdriver.edge.service import Service


driver_path = shutil.which("msedgedriver")
if not driver_path:
    scripts_driver = Path(sys.executable).parent / "Scripts" / "msedgedriver.exe"
    if scripts_driver.exists():
        driver_path = str(scripts_driver)

if not driver_path:
    raise RuntimeError("msedgedriver.exe was not found on PATH")

driver = webdriver.Edge(service=Service(driver_path))
try:
    driver.get("data:text/html,<title>Selenium OK</title><h1>Selenium OK</h1>")
    print("EdgeDriver:", driver_path)
    print("Page title:", driver.title)
    time.sleep(2)
finally:
    driver.quit()
