require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const OpenAI = require('openai');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Update these values with your PostgreSQL credentials
const pool = new Pool({
  user: process.env.PGUSER,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  password: process.env.PGPASSWORD,
  port: process.env.PGPORT,
});

// Initialize OpenAI API (replace with your actual API key)
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY});

// Describe your schema for the AI
const schemaDescription = `You are a helpful assistant that writes safe SQL queries for a PostgreSQL database. The main table is account_details with columns: account_no (integer), payment (numeric), payment_plan (text), payment_method (text), smart_meter (boolean), meter_serial (varchar). You must only respond with a valid SQL SELECT statement and nothing else.`;

app.post('/api/query', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required.' });
  }
  try {
    // 1. Ask OpenAI to generate a SQL query for the user's prompt
    const aiResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: schemaDescription },
        { role: 'user', content: `Write a SQL SELECT query for: ${prompt}` }
      ]
    });
    let sqlQuery = aiResponse.choices[0].message.content.trim();
    // Remove any code block formatting and newlines from AI output
    sqlQuery = sqlQuery.replace(/^```sql[\r\n]+|```$/gi, '').replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
    console.log('Generated SQL:', JSON.stringify(sqlQuery)); // Log the generated SQL for debugging

    // 2. Run the generated SQL query (read-only, SELECT only)
    if (!sqlQuery.toLowerCase().startsWith('select')) {
      return res.status(400).json({ error: 'Only SELECT queries are allowed.' });
    }
    const { rows } = await pool.query(sqlQuery);
    res.json({ data: rows, sql: sqlQuery });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/creation', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required.' });
  }
  try {
    // Instruct OpenAI to return a JSON array of objects for table display
    const aiResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful assistant that generates test data in JSON array format for table display. Always respond ONLY with a valid JSON array of objects, where each object represents a row and keys are column names. If the user asks for a list of numbers, return a JSON array of objects with a single key (e.g., "number") and each number as a separate object. Do not include any explanation, markdown, or text before or after the JSON.' },
        { role: 'user', content: `${prompt}. Respond only with a JSON array of objects.` }
      ]
    });
    const responseText = aiResponse.choices[0].message.content.trim();
    res.json({ response: responseText });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
