# AI Test Data Generator - Solution Document

## Problem Statement
Organizations often need to quickly fetch, analyze, and generate test data for their applications. Manual data entry and SQL writing are time-consuming and error-prone. There is a need for a user-friendly, AI-powered web application that allows both querying a database and generating realistic test data, all through natural language prompts.

---

## Solution Overview
This project delivers a vibrant, modern web application that enables users to:
- Query a PostgreSQL database using natural language (with AI-generated SQL)
- Generate creative/test data in table format using OpenAI
- View results in a modern, responsive, ChatGPT-style UI

The solution is built with a Node.js backend, PostgreSQL database, OpenAI API integration, and a frontend using HTML, JavaScript, and CSS.

---

## Key Features
- **Smart Query:** Users enter a prompt, and the backend uses OpenAI to generate a safe SQL SELECT query, fetches data from PostgreSQL, and displays it in a table.
- **Smart Creation:** Users enter a prompt, and the backend uses OpenAI to generate a JSON array of objects (test data), which is displayed in a table.
- **Modern UI:** ChatGPT-style interface, blue-green gradients, animated cards, loading spinner, and responsive design.
- **Prompt Examples:** Example prompts for both modes, shown in side-by-side cards.
- **Error Handling:** User-friendly error messages for all failure cases.

---

## How the Solution Works

### 1. User Interaction
- User enters a prompt and selects either "Smart Query" or "Smart Creation".
- User submits the prompt via the web interface.

### 2. Frontend Logic
- JavaScript captures the prompt and mode, shows a loading spinner, and sends a POST request to the backend API (`/api/query` or `/api/creation`).
- On response, the frontend parses the data and renders it in a styled table, or displays an error if needed.

### 3. Backend Logic
- **/api/query:**
  - Receives the prompt.
  - Uses OpenAI to generate a SQL SELECT statement based on the prompt and schema description.
  - Executes the SQL on PostgreSQL (read-only, SELECT only).
  - Returns the result as JSON.
- **/api/creation:**
  - Receives the prompt.
  - Uses OpenAI to generate a JSON array of objects (test data) based on the prompt.
  - Returns the JSON array for table display.

### 4. Database
- PostgreSQL database with a table `account_details` for Smart Query mode.
- Table must be created and optionally seeded with test data.

### 5. AI Integration
- OpenAI API is used for both SQL generation and creative data generation.
- API key and DB credentials are managed via environment variables for security.

---

## Benefits
- **No SQL knowledge required:** Users can query the database using natural language.
- **Rapid test data generation:** Instantly generate realistic data for development or testing.
- **Modern, accessible UI:** Easy to use for both technical and non-technical users.
- **Secure:** No sensitive credentials in version control; all secrets managed via environment variables.
- **Extensible:** Can be expanded to support more tables, data types, or even data insertion.

---

## Limitations & Future Improvements
- Currently, "Smart Creation" only generates data for display; it does not insert data into the database.
- Only SELECT queries are supported for safety.
- No authentication or user management (can be added as needed).
- Future versions could allow saving AI-generated data to the database, support more schemas, or add export features.

---

## Conclusion
This solution provides a powerful, user-friendly tool for both database querying and AI-powered data generation, streamlining workflows for developers, testers, and analysts. It leverages modern web technologies and AI to make data work accessible to everyone.
