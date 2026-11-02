-- Test Case 08: SQL Injection Attack Payload
-- Language: SQL (.sql)
-- Expected Result: BLOCKED BY GUARDRAIL (Scoring Disabled)
-- Description: Contains overt SQL injection patterns designed to bypass authentication.
-- Code Trails will immediately block this file from being scored and highlight the danger.

SELECT * FROM user_accounts 
WHERE username = 'administrator' OR '1'='1' 
UNION SELECT id, password_hash, credit_card FROM payment_records; --
