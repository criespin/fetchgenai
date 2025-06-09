# AI Test Data Generator - Architecture Document

## Overview
This document describes the architecture of the AI Test Data Generator project, which provides a ChatGPT-style web interface for querying and generating data using a Node.js backend, PostgreSQL database, and OpenAI API.

---

## High-Level Architecture

```
+-------------------+        HTTP/REST        +-------------------+        SQL         +-------------------+
|                   |  <------------------->  |                   |  <------------->  |                   |
|    Frontend       |                        |     Backend        |                  |   PostgreSQL DB    |
| (HTML/JS/CSS)     |                        |   (Node.js/Express)|                  |                   |
|                   |  <--- OpenAI API ----> |                   |                  |                   |
+-------------------+                        +-------------------+                  +-------------------+
```

---

## Components

### 1. Frontend (HTML, JavaScript, CSS)
- **index.html**: Main UI layout, prompt input, mode selection, and result display.
- **main.js**: Handles user input, sends API requests to backend, processes responses, and renders tables.
- **style.css**: Provides vibrant, modern, responsive styling (blue-green gradients, cards, spinner, etc).
- **Features:**
  - ChatGPT-style prompt input and response area
  - Mode selection: Smart Query (DB) or Smart Creation (AI)
  - Loading spinner and error display
  - Table rendering for results
  - Example prompts in side-by-side cards

### 2. Backend (Node.js, Express)
- **server.js**: Main server file
  - Serves API endpoints:
    - `POST /api/query`: Receives a prompt, uses OpenAI to generate a SQL SELECT, runs it on PostgreSQL, returns results as JSON.
    - `POST /api/creation`: Receives a prompt, uses OpenAI to generate a JSON array of objects, returns it for table display.
  - Handles CORS and JSON parsing
  - Connects to PostgreSQL using environment variables
  - Connects to OpenAI API using environment variable

### 3. Database (PostgreSQL)
- **Table:** `account_details`
  - Columns: `account_no` (integer), `payment` (numeric), `payment_plan` (text), `payment_method` (text), `smart_meter` (boolean), `meter_serial` (varchar)
- **Purpose:** Stores account data for Smart Query mode
- **Setup:** Table must be created and optionally seeded with test data

### 4. OpenAI API
- Used for:
  - Generating SQL queries from natural language prompts (Smart Query)
  - Generating creative/test data in JSON array format (Smart Creation)
- Accessed via OpenAI Node.js SDK using API key from environment variable

---

## Data Flow

### Smart Query Mode
1. User enters a prompt and selects "Smart Query"
2. Frontend sends POST request to `/api/query` with prompt
3. Backend uses OpenAI to generate a SQL SELECT statement
4. Backend runs the SQL on PostgreSQL and returns results as JSON
5. Frontend displays results in a table

### Smart Creation Mode
1. User enters a prompt and selects "Smart Creation"
2. Frontend sends POST request to `/api/creation` with prompt
3. Backend uses OpenAI to generate a JSON array of objects
4. Backend returns the JSON array
5. Frontend displays results in a table

---

## Deployment Architecture
- **Frontend and backend** can be served together (Node.js serves static files) or separately (e.g., static hosting + API backend)
- **Database** is hosted on Render (managed PostgreSQL)
- **Environment variables** are used for all secrets and DB credentials
- **OpenAI API** is accessed over the internet from the backend

---

## Security Considerations
- `.env` file is excluded from version control
- All secrets and credentials are managed via environment variables
- Only SELECT queries are allowed in Smart Query mode (no data modification)
- CORS is enabled for frontend-backend communication

---

## Extensibility
- Additional endpoints can be added for data insertion, update, or deletion
- More tables and schema can be supported by updating the schema description and backend logic
- UI can be extended for authentication, user management, etc.

---

## Diagram

```
+-------------------+        POST /api/query         +-------------------+
|                   |  <------------------------->  |                   |
|    Frontend       |                              |     Backend        |
| (HTML/JS/CSS)     |        POST /api/creation     |   (Node.js/Express)|
|                   |  <------------------------->  |                   |
+-------------------+                              +-------------------+
                                                        |
                                                        |  SQL
                                                        v
                                                +-------------------+
                                                |   PostgreSQL DB   |
                                                +-------------------+
                                                        |
                                                        |  OpenAI API
                                                        v
                                                +-------------------+
                                                |    OpenAI Cloud   |
                                                +-------------------+
```

---

## Summary
This architecture enables a flexible, modern, and secure web app for both database querying and AI-powered data generation, with clear separation of concerns and easy extensibility for future features.
