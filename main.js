document.getElementById('prompt-form').addEventListener('submit', async function (e) {
  e.preventDefault();
  const prompt = document.getElementById('prompt-input').value.trim();
  const table = document.getElementById('data-table');
  const errorDiv = document.getElementById('error-message');
  const loading = document.getElementById('loading-spinner');
  const sendBtn = document.getElementById('send-btn');
  const mode = document.querySelector('input[name="mode"]:checked').value;
  const useSchema = document.getElementById('schema-toggle')?.checked;
  table.classList.add('hidden');
  errorDiv.textContent = '';

  if (!prompt) return;

  loading.classList.remove('hidden');
  sendBtn.disabled = true;

  try {
    // Remove any previous OpenAI prompt display
    let promptDiv = document.getElementById('openai-prompt');
    if (promptDiv) promptDiv.remove();
    promptDiv = document.createElement('div');
    promptDiv.id = 'openai-prompt';
    promptDiv.style.margin = '1.5rem 0';
    promptDiv.style.background = '#e6f0ff';
    promptDiv.style.borderRadius = '12px';
    promptDiv.style.padding = '1rem 1.5rem';
    promptDiv.style.color = '#185a9d';
    promptDiv.style.fontSize = '1.05rem';
    promptDiv.style.boxShadow = '0 1px 4px rgba(0, 119, 255, 0.07)';
    document.getElementById('response-area').prepend(promptDiv);

    if (mode === 'query') {
      const response = await fetch('https://fetchgenai.onrender.com/api/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      const result = await response.json();
      if (response.ok && result.data && result.data.length > 0) {
        renderTable(result.data);
        table.classList.remove('hidden');
      } else {
        errorDiv.textContent = 'No data found.';
      }
    } else if (mode === 'creation') {
      const response = await fetch('https://fetchgenai.onrender.com/api/creation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, useSchema })
      });
      const result = await response.json();
      if (response.ok && result.response) {
        errorDiv.textContent = '';
        table.classList.add('hidden');
        // Try to parse the response as JSON array for table rendering
        let data;
        let responseText = result.response.trim();
        if (responseText.startsWith('```json')) {
          responseText = responseText.replace(/^```json[\r\n]*/i, '').replace(/```$/, '').trim();
        } else if (responseText.startsWith('```')) {
          responseText = responseText.replace(/^```[\w]*[\r\n]*/i, '').replace(/```$/, '').trim();
        }
        try {
          data = JSON.parse(responseText);
        } catch (e) {
          data = null;
        }
        if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object') {
          renderTable(data);
          table.classList.remove('hidden');
        } else {
          let aiDiv = document.getElementById('ai-response');
          if (aiDiv) aiDiv.remove();
          errorDiv.textContent = 'No valid table data returned.';
        }
      } else if (result.error) {
        errorDiv.textContent = result.error;
      } else {
        errorDiv.textContent = 'No AI response.';
      }
    }
  } catch (err) {
    errorDiv.textContent = 'Error fetching data.';
  } finally {
    loading.classList.add('hidden');
    sendBtn.disabled = false;
  }
});

// Add a toggle for schema-based generation
const radioOptions = document.getElementById('radio-options');
const schemaToggle = document.createElement('label');
schemaToggle.id = 'schema-toggle-label';
schemaToggle.style.marginLeft = '1.5rem';
schemaToggle.style.fontWeight = '600';
schemaToggle.style.fontSize = '1rem';
schemaToggle.style.cursor = 'pointer';
schemaToggle.innerHTML = `
  <input type="checkbox" id="schema-toggle" style="margin-right:0.4em;"> Use DB Schema
`;
radioOptions.appendChild(schemaToggle);

function renderTable(data) {
  const table = document.getElementById('data-table');
  table.innerHTML = '';
  const headers = Object.keys(data[0]);
  const thead = document.createElement('thead');
  const tr = document.createElement('tr');
  headers.forEach(h => {
    const th = document.createElement('th');
    th.textContent = h;
    tr.appendChild(th);
  });
  thead.appendChild(tr);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  data.forEach(row => {
    const tr = document.createElement('tr');
    headers.forEach(h => {
      const td = document.createElement('td');
      td.textContent = row[h];
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
}
