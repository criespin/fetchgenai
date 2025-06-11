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
  const { prompt, useSchema } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required.' });
  }
  try {
    let systemPrompt;
    if (useSchema) {
      // Dynamically fetch schema from DB and build a strict JSON template for OpenAI
      const { rows } = await pool.query(
        `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'account_details' AND table_schema = 'public' ORDER BY ordinal_position`
      );
      if (!rows.length) {
        return res.status(500).json({ error: 'Could not fetch schema from database.' });
      }
      // Build schema string and a strict JSON template
      const schemaString = rows.map(r => `${r.column_name} (${r.data_type})`).join(', ');
      const exampleObj = rows.map(r => {
        if (r.data_type.includes('int')) return `\"${r.column_name}\": 1`;
        if (r.data_type === 'numeric') return `\"${r.column_name}\": 100.0`;
        if (r.data_type === 'boolean') return `\"${r.column_name}\": true`;
        if (r.data_type === 'character varying' || r.data_type === 'varchar' || r.data_type === 'text') return `\"${r.column_name}\": \"example\"`;
        return `\"${r.column_name}\": null`;
      }).join(', ');
      systemPrompt = `You are a strict data generator. ALWAYS respond ONLY with a valid JSON array of objects. Each object MUST have ALL of these keys, with NO extra or missing keys, and in this exact order: ${schemaString}.\n\nEach value must be realistic and type-appropriate.\n\nDo not include any explanation, markdown, or text before or after the JSON.\n\nExample:\n[\n  {${exampleObj}}\n]\n\nIf the user prompt asks for a different number of rows, adjust the number of objects, but ALWAYS use these exact keys and types.`;
    } else {
      // Freeform generation
      systemPrompt = 'You are a helpful assistant that generates test data in JSON array format for table display. Always respond ONLY with a valid JSON array of objects, where each object represents a row and keys are column names. If the user asks for a list of numbers, return a JSON array of objects with a single key (e.g., "number") and each number as a separate object. Do not include any explanation, markdown, or text before or after the JSON.';
    }
    const aiResponse = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
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
