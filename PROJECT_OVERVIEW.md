# Code Trails — Project Overview & Technology Guide

> **Plain-English Analogy (4/10 Technical Level):**  
> Think of Code Trails as an automated **"health check and safety inspection"** for computer code. Just like Grammarly checks your writing for typos and clarity before you send an email, Code Trails checks computer code for bugs, accidental password leaks, syntax errors, and cyber-attack vulnerabilities before software goes live.

---

## 1. Why Does This Project Exist?

Software developers write hundreds or thousands of lines of code every day. During this process, it is easy to make simple human errors: leaving a secret database password in the code, accidentally forgetting a closing bracket, or leaving a loophole that hackers can exploit. 

Catching these problems manually takes hours of tedious review, and commercial security software is often complicated, intrusive, and expensive.

**Code Trails provides an immediate, free, and simple solution:** developers can simply paste or drag-and-drop their code into a web page and get an instant score from 0 to 100, complete with specific line numbers and easy-to-understand feedback.

---

## 2. What is Currently Built in the App?

Everything in Code Trails is designed to be streamlined in a single, clean workspace without unnecessary menus or page hopping:

### A. Interactive Code Editor & File Drop Zone
* **Line-Numbered Editor:** A clean monospace code editor with a synchronized line counter, making it effortless to pinpoint issues.
* **Drag-and-Drop Upload:** Drag any file from your computer and drop it directly onto the web page to load it instantly.
* **File Picker:** An "Open file" button that lets you select any file directly from your folders.

### B. Manual & Automatic Language Selector
* When you upload a file (like a `.py` Python file or `.js` JavaScript file), Code Trails automatically detects the language.
* If you copy and paste raw code from somewhere else, you can use the language dropdown at the top of the editor to pick from **16+ supported languages** (JavaScript, TypeScript, Python, Java, C/C++, Go, Rust, SQL, HTML, CSS, JSON, and more).

### C. The Safety Guardrail (Instant Attack Blocker)
* **Security comes first.** Before any code is scored or analyzed, Code Trails passes it through an automated security filter.
* If someone inputs a dangerous malicious payload—such as a **SQL injection attack** designed to steal database records or a **remote command** designed to take over a computer—Code Trails immediately disables the score button and displays a clear warning banner identifying the exact line number of the attack.

### D. Built-in Local Scoring Engine (100% Free & Offline)
Code Trails works right out of the box with zero setup, no account needed, and no internet required. The built-in local engine checks for:
* **Syntax & Bracket Balance:** Checks every opening parenthesis `(`, bracket `[`, and curly brace `{` to make sure they are properly closed, while smartly ignoring quotes and comments.
* **Hardcoded Passwords & Keys:** Flags accidentally exposed API keys, secret tokens, and passwords.
* **Code Smells & Unfinished Work:** Finds forgotten `TODO` or `FIXME` markers, empty error catches that silently hide bugs, and leftover debugging error logs.
* **Web Security Vulnerabilities:** Flags unencrypted plaintext HTTP connections, disabled SSL certificates (`verify=False`), and unsafe HTML injection.
* **Visual Scorecard:** Provides a circular score badge (0 to 100), quality rating (*Excellent*, *Good*, *Fair*, *Needs Attention*), metric summary cards, and an expandable list of findings with exact line numbers.

### E. Free AI Connection (Google Gemini & OpenRouter)
For developers who want deeper, human-like explanations, Code Trails includes an integrated AI connector built specifically for zero-cost, free AI tiers:
* **Zero Cost:** Pre-configured for Google AI Studio (free Gemini API keys) and OpenRouter (free community models). No credit card or paid subscription needed.
* **Built-in Setup Modal:** A clean popup window directly on the main page allows you to paste your free key and pick your model without leaving the workspace.
* **Auto Model Discovery:** Because Google updates its model names over time, Code Trails automatically queries Google to find which models are active on your key (such as Gemini 1.5 Flash) and routes to it automatically, preventing "model not found" errors.
* **Token & Speed Compression:** Automatically removes unnecessary blank lines and trailing spaces, compressing code payload so users stay comfortably within free speed and quota limits.
* **Private & Secure:** Your API key is saved exclusively in your personal browser storage (`localStorage`). It is never sent to any third-party database and can be cleared with one click.

---

## 3. Technologies Used & Why They Were Chosen

| Technology | What It Is | Why We Used It (In Simple Terms) |
| :--- | :--- | :--- |
| **Next.js 14** | Web Application Framework | Modern foundation built by Vercel that powers the website, user interface, and backend server APIs together seamlessly. |
| **React 18** | User Interface Library | Makes buttons, animations, and editor interactions feel snappy, fast, and smooth without page reloads. |
| **TypeScript** | Type-Safe Programming Language | Catches mistakes and typos while building the project, making the code reliable and bug-free. |
| **Tailwind CSS** | Modern Styling System | Creates the clean, attractive, mint-and-navy aesthetic with fast loading speeds and mobile responsiveness. |
| **Google Gemini API** | Generative AI Service | Provides fast, free, intelligent code analysis and explanations using Google's Flash models. |
| **OpenRouter** | AI Model Gateway | Gives users the option to connect other free open-source models (like Meta's Llama 3 or Qwen). |
| **Browser LocalStorage** | Device-Only Memory Storage | Securely keeps your chosen settings and API keys on your own computer without needing user accounts or server databases. |

---

## 4. How Does It Work? (The 4-Step Journey)

1. **Step 1: Input:** You paste code or drop a file. The app reads the lines and detects the programming language.
2. **Step 2: Safety Shield:** The code is checked for dangerous injection attacks. If it is an attack, it is blocked immediately for safety.
3. **Step 3: Evaluation:** The local rule engine checks the code structure, brackets, and security rules. If you enabled a free AI key, a compressed version is simultaneously evaluated by Gemini for deeper context.
4. **Step 4: The Scorecard:** The app computes a score from 0 to 100, assigns a badge (e.g. *Excellent* or *Needs Attention*), and displays specific findings with line numbers and recommendations.

---

## 5. The Test Cases Showcase Folder

To help anyone test and demonstrate Code Trails immediately, we created a dedicated folder named [`test_cases/`](file:///Users/arun/develop/codetrail_test1/test_cases) containing 9 ready-to-use sample files in different languages:

| Sample File | Language | What Scenario It Tests | Expected Result |
| :--- | :--- | :--- | :--- |
| `01_clean_calculator.js` | JavaScript | Clean, well-written code with proper input validation | **Score 95–100 (Excellent)** · Zero errors |
| `02_python_code_smells.py` | Python | Unresolved TODOs, empty error catch, debug logging | **Score ~75–84 (Good/Fair)** · Flags code smells |
| `03_unbalanced_syntax.ts` | TypeScript | Mismatched bracket `[ ;` and missing closing braces | **Score <60** · Delimiter checker flags exact lines |
| `04_security_vulnerabilities.py` | Python | Exposed API key, plaintext HTTP URL, `verify=False` | **Score ~40–55** · Flags high-severity security flaws |
| `05_web_injection_flaws.jsx` | React / JSX | `dangerouslySetInnerHTML` and dynamic `new Function()` | Flags XSS vulnerabilities and dynamic execution |
| `06_backend_service.go` | Go | Command execution (`exec.Command`), hardcoded secret | Flags command execution & security tokens |
| `07_java_database_service.java` | Java | SQL query string concatenation and empty catch | Flags unsafe database query patterns |
| `08_blocked_sql_injection.sql` | SQL | Overt `' OR '1'='1` SQL injection attack string | 🚫 **BLOCKED BY SAFETY GUARDRAIL** · Scoring disabled |
| `09_blocked_remote_execution.js` | JavaScript | Dangerous `curl ... \| bash` shell execution attack | 🚫 **BLOCKED BY SAFETY GUARDRAIL** · Scoring disabled |

---

## 6. Summary

Code Trails bridges the gap between complex developer tools and simple everyday usability. Whether you are a student learning to code, a seasoned developer doing a quick sanity check, or a team lead auditing security, Code Trails gives you instantaneous, private, and actionable code health scores in one click.
