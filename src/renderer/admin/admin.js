(function initAdmin() {
  const $ = (id) => document.getElementById(id);

  function headers() {
    return {
      'Content-Type': 'application/json',
      'x-admin-token': $('admin-token').value.trim()
    };
  }

  function backendUrl() {
    return $('backend-url').value.trim().replace(/\/$/, '');
  }

  async function request(path, options = {}) {
    const response = await fetch(`${backendUrl()}${path}`, {
      ...options,
      headers: {
        ...headers(),
        ...(options.headers || {})
      }
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Admin-Anfrage fehlgeschlagen.');
    return result;
  }

  async function createLicense() {
    const email = $('create-email').value.trim();
    const source = $('create-source').value.trim() || 'admin';
    if (!email) {
      $('create-result').textContent = 'Bitte E-Mail eintragen.';
      return;
    }

    try {
      const result = await request('/api/admin/licenses', {
        method: 'POST',
        body: JSON.stringify({ email, source })
      });
      $('create-result').textContent = JSON.stringify(result, null, 2);
      await refreshList();
    } catch (error) {
      $('create-result').textContent = error.message;
    }
  }

  async function refreshList() {
    const query = encodeURIComponent($('search-query').value.trim());
    const list = $('license-list');
    list.textContent = 'Lade...';
    try {
      const result = await request(`/api/admin/licenses?query=${query}`, { method: 'GET' });
      if (!result.licenses.length) {
        list.textContent = 'Keine Lizenzen gefunden.';
        return;
      }
      list.innerHTML = '';
      for (const license of result.licenses) {
        const card = document.createElement('div');
        card.className = 'license-card';
        card.innerHTML = `
          <div>
            <strong>${license.licenseKey}</strong>
            <div>${license.email}</div>
            <div class="muted">Status: ${license.status} · Quelle: ${license.source} · Aktivierungen: ${license.activationCount}</div>
            <div class="muted">Erstellt: ${license.createdAt}</div>
          </div>
          <button class="danger" type="button">Sperren</button>
        `;
        card.querySelector('button').addEventListener('click', () => revokeLicense(license.id));
        list.appendChild(card);
      }
    } catch (error) {
      list.textContent = error.message;
    }
  }

  async function revokeLicense(id) {
    try {
      await request(`/api/admin/licenses/${id}/revoke`, { method: 'POST', body: '{}' });
      await refreshList();
    } catch (error) {
      alert(error.message);
    }
  }

  async function initConfig() {
    if (window.mastilNative) {
      const config = await window.mastilNative.getConfig();
      $('backend-url').value = config.backendUrl || $('backend-url').value;
    }
  }

  $('create-license').addEventListener('click', createLicense);
  $('refresh-list').addEventListener('click', refreshList);
  initConfig();
})();
