# Code Trails — Test Cases & Showcase Guide

This folder contains sample code files across multiple programming languages (JavaScript, TypeScript, Python, Java, Go, React/JSX, SQL) designed to test and showcase all the features of **Code Trails**.

---

## Quick Test Matrix

| File | Language | What It Tests | Expected Result |
| :--- | :--- | :--- | :--- |
| `01_clean_calculator.js` | JavaScript | Clean code, proper validation, no bugs | **Score: 95–100 (Excellent)** · Zero errors or security flaws |
| `02_python_code_smells.py` | Python | TODO/FIXME markers, empty `except` block, error logging | **Score: ~75–84 (Good/Fair)** · 3 errors detected with line numbers |
| `03_unbalanced_syntax.ts` | TypeScript | Mismatched bracket `[ ;` and unclosed function braces | **Score: <60 (Needs attention)** · Delimiter balance flags exact line |
| `04_security_vulnerabilities.py` | Python | Hardcoded API key, plaintext HTTP URL, `verify=False` | **Score: ~40–55 (Needs attention)** · 3 high-severity security flaws |
| `05_web_injection_flaws.jsx` | React / JSX | `dangerouslySetInnerHTML`, dynamic `new Function()` | **Score: <60 (Needs attention)** · Flags XSS and dynamic code execution |
| `06_backend_service.go` | Go | Command execution (`exec.Command`), hardcoded secret, TODO | **Score: ~60–75 (Fair)** · Security flaws & errors identified |
| `07_java_database_service.java` | Java | SQL query string concatenation, empty `catch` block | **Score: ~60–75 (Fair)** · Unsafe SQL & error suppression flagged |
| `08_blocked_sql_injection.sql` | SQL | `' OR '1'='1`, `UNION SELECT` attack string | 🚫 **BLOCKED BY GUARDRAIL** · Scoring disabled immediately |
| `09_blocked_remote_execution.js` | JavaScript | `curl ... \| bash`, `child_process.exec` | 🚫 **BLOCKED BY GUARDRAIL** · Scoring disabled immediately |

---

## How to Test

### Method 1: File Upload (Easiest)
1. Open the Code Trails web app in your browser (`http://localhost:3000`).
2. Click **"Open file"** in the top-right of the code card.
3. Select any file from this `test_cases/` folder.
4. Notice how Code Trails automatically detects the file's language in the dropdown!
5. Click **"Score the code"** (or **"Score with AI"** if you enabled a free key).

### Method 2: Drag and Drop
1. Open the web app.
2. Drag any file from this folder and drop it onto the code area.
3. Watch the green drop indicator appear and load the file instantly.

### Method 3: Copy & Paste
1. Open any test file in your text editor.
2. Copy all text and paste it into the Code Trails textarea.
3. Change the language selector dropdown in the header to match the language.
4. Click **"Score the code"**.

---

## What to Look For During Showcase

1. **Safety Guardrails (`08` and `09`)**:
   - As soon as you paste or open `08_blocked_sql_injection.sql` or `09_blocked_remote_execution.js`, notice how the **"Score the code" button turns disabled** and a clear red alert appears stating:
     `"This submission matches a SQL-injection pattern and was blocked. Line 7."`
   - This proves that dangerous code is stopped before it even reaches the scanner or AI.

2. **Language Dropdown Synchronization**:
   - Opening `04_security_vulnerabilities.py` automatically sets the language dropdown to **Python**.
   - Opening `03_unbalanced_syntax.ts` sets it to **TypeScript**.

3. **Expandable Findings Accordion**:
   - For files with errors or security flaws, click **"View details"** to see the exact line numbers and concise recommendations.

4. **Local vs. Free AI Mode**:
   - Without an API key, scoring is 100% local, instant, and offline.
   - If you click **"Enable Free AI"** in the header and paste a free Google AI Studio key, clicking **"Score with AI"** provides deep, AI-augmented analysis with Gemini!
