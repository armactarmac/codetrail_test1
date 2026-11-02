"""
Test Case 04: Security Vulnerabilities
Language: Python (.py)
Expected Result: Needs attention (Low Score ~40 - 55, Multiple High Severity Security Flaws)
Description: Contains a redacted hardcoded API-secret placeholder, plaintext unencrypted HTTP requests, and disabled TLS verification.
"""

import urllib.request
import ssl

# SECURITY FLAW 1: Redacted hardcoded API-secret placeholder
api_key = "[REDACTED]"
jwt_token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy_token"

def sync_customer_records():
    # SECURITY FLAW 2: Insecure plaintext HTTP protocol transmitting customer data
    remote_endpoint = "http://internal-payroll.corporate-network.net/sync"
    
    print(f"Connecting using API token: {api_key}")

    # SECURITY FLAW 3: Disabling TLS certificate verification allows Man-In-The-Middle attacks
    unsafe_context = ssl._create_unverified_context()
    
    # Passing verify=False pattern
    req = urllib.request.Request(remote_endpoint, headers={"Authorization": f"Bearer {jwt_token}"})
    try:
        response = urllib.request.urlopen(req, context=unsafe_context)
        return response.read()
    except Exception as err:
        return None

if __name__ == "__main__":
    sync_customer_records()
