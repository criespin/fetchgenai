# AI Test Data Generator - Project Documentation

## Overview
This project is a vibrant, modern web application for fetching and generating data with a ChatGPT-style UI. It features a Node.js backend with PostgreSQL integration and a frontend built with HTML, JavaScript, and CSS. The app allows users to enter prompts, select between "Smart Query" (fetches from DB) and "Smart Creation" (AI-generated data), and displays results in a table.

---

## Features
- **ChatGPT-style UI** with blue-green gradient theme and responsive design
- **Smart Query**: Fetches data from PostgreSQL based on user prompt (AI-generated SQL)
- **Smart Creation**: Uses OpenAI API to generate creative/test data in JSON array format
- **Table display**: Results shown in a modern, styled table
- **Prompt examples**: Example prompts for both modes, shown in side-by-side cards
- **Loading spinner**: Modern CSS spinner for feedback
- **Error handling**: User-friendly error messages

---

## Project Structure
```
index.html         # Frontend HTML
main.js            # Frontend JavaScript (handles UI, API calls, table rendering)
style.css          # Frontend CSS (modern, vibrant, responsive)
server.js          # Node.js backend (API endpoints, DB, OpenAI integration)
package.json       # Node.js dependencies and scripts
.env               # Environment variables (NOT in version control)
.gitignore         # Ensures .env and other sensitive files are not pushed
```

---

## Setup & Development

### 1. Clone the Repository
```
git clone <your-repo-url>
cd AI-Test-data-generator
```

### 2. Install Dependencies
```
npm install
```

### 3. Create a `.env` File
Add your environment variables:
```
OPENAI_API_KEY=your-openai-api-key
PGUSER=your-db-username
PGPASSWORD=your-db-password
PGHOST=your-db-host
PGPORT=your-db-port
PGDATABASE=your-db-name
```

### 4. Start the Application Locally
```
node server.js
```
Visit `http://localhost:3000` (or the port shown in your terminal).

---

## PostgreSQL Database Setup

1. **Create the required table:**
   ```sql
   CREATE TABLE account_details (
     account_no integer,
     payment numeric,
     payment_plan text,
     payment_method text,
     smart_meter boolean,
     meter_serial varchar
   );
   ```
2. **(Optional) Insert test data:**
   ```sql
   INSERT INTO account_details (account_no, payment, payment_plan, payment_method, smart_meter, meter_serial)
   VALUES
     (1, 120.50, 'monthly', 'credit card', true, 'SM12345'),
     (2, 80.00, 'yearly', 'debit card', false, 'SM54321');
   ```

---

## Deployment on Render

### 1. Push Code to GitHub
- Ensure `.env` is in `.gitignore` and not pushed.

### 2. Create a PostgreSQL Database on Render
- In Render dashboard: **New** → **PostgreSQL**
- Wait for provisioning, then copy the **Internal Database URL**

### 3. Create a Web Service on Render
- **New** → **Web Service**
- Connect your GitHub repo
- Set build command: `npm install`
- Set start command: `node server.js`

### 4. Set Environment Variables in Render
- In your web service's **Environment** tab, add:
  - `OPENAI_API_KEY`
  - `PGUSER`, `PGPASSWORD`, `PGHOST`, `PGPORT`, `PGDATABASE` (from Internal Database URL)

### 5. (Optional) Connect to Render DB with pgAdmin
- Use the **External Database URL** for host, port, user, password, and database fields in pgAdmin.

### 6. Create the Required Table in Render DB
- Use pgAdmin or psql to run the `CREATE TABLE` statement above.

### 7. Redeploy (if needed)
- If you change code, push to GitHub and trigger a deploy in Render.
- If you only change the database, no redeploy is needed.

---

## Usage
- Enter a prompt in the textarea.
- Select **Smart Query** to fetch from the database, or **Smart Creation** to generate data with AI.
- Results are displayed in a styled table.
- Example prompts are shown in side-by-side cards for both modes.

---

## Security Notes
- Never commit your `.env` file or secrets to version control.
- Always use environment variables for API keys and DB credentials.

---

## Credits
- UI inspired by ChatGPT and modern web design best practices.
- Backend uses OpenAI API and PostgreSQL.

---

## Troubleshooting
- **ERR_CONNECTION_REFUSED**: Make sure your backend is running and frontend is using the correct API URL.
- **relation "account_details" does not exist**: Create the required table in your database.
- **'idna' codec can't encode characters...**: In pgAdmin, use only the host part from the connection URL, not the full URL.

---

For further help, see the README or contact the project maintainer.
