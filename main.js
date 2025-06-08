document.getElementById('prompt-form').addEventListener('submit', async function (e) {
  e.preventDefault();
  const prompt = document.getElementById('prompt-input').value.trim();
  const table = document.getElementById('data-table');
  const errorDiv = document.getElementById('error-message');
  const loading = document.getElementById('loading-spinner');
  const sendBtn = document.getElementById('send-btn');
  const mode = document.querySelector('input[name="mode"]:checked').value;
  table.classList.add('hidden');
  errorDiv.textContent = '';

  if (!prompt) return;

  loading.classList.remove('hidden');
  sendBtn.disabled = true;

  try {
    if (mode === 'query') {
      const response = await fetch('http://localhost:3000/api/query', {
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
      // Remove any previous AI response
      let aiDiv = document.getElementById('ai-response');
      if (aiDiv) aiDiv.remove();
      const response = await fetch('http://localhost:3000/api/creation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      const result = await response.json();
      if (response.ok && result.response) {
        errorDiv.textContent = '';
        table.classList.add('hidden');
        // Try to parse the response as JSON array for table rendering
        let data;
        // Remove markdown code block if present
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
          aiDiv = document.createElement('div');
          aiDiv.id = 'ai-response';
          aiDiv.style.margin = '1.5rem 0';
          aiDiv.style.background = '#fff3e6';
          aiDiv.style.borderRadius = '12px';
          aiDiv.style.padding = '1rem 1.5rem';
          aiDiv.style.color = '#ee0979';
          aiDiv.style.fontSize = '1.1rem';
          aiDiv.style.boxShadow = '0 1px 4px rgba(255, 106, 0, 0.07)';
          aiDiv.textContent = result.response;
          document.getElementById('response-area').prepend(aiDiv);
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
