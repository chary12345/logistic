function showGlobalSearchForm() {
  hideAllForms();
  document.getElementById("globalSearchFormContainer").style.display = "block";
  loadGlobalRegions();
  resetGlobalSearch();
}

async function loadGlobalRegions() {
  const res = await fetch('/api/regions');
  const list = await res.json();
  const regionSelect = document.getElementById('gRegion');
  regionSelect.innerHTML = '<option value="">-- Select Region --</option>';
  list.forEach(r => regionSelect.add(new Option(r, r)));
}

document.getElementById('gRegion').addEventListener('change', async (e) => {
  const region = e.target.value;
  document.getElementById('gSubregion').innerHTML = '<option value="">-- Select Sub-region --</option>';
  document.getElementById('gBranch').innerHTML = '<option value="">-- Select Branch --</option>';
  if (region) {
    const res = await fetch(`/api/subregions?region=${region}`);
    const list = await res.json();
    list.forEach(r => document.getElementById('gSubregion').add(new Option(r, r)));
  }
});

document.getElementById('gSubregion').addEventListener('change', async (e) => {
  const region = document.getElementById('gRegion').value;
  const subregion = e.target.value;
  document.getElementById('gBranch').innerHTML = '<option value="">-- Select Branch --</option>';
  if (region && subregion) {
    const res = await fetch(`/api/branches?region=${region}&subRegion=${subregion}`);
    const list = await res.json();
    list.forEach(r => document.getElementById('gBranch').add(new Option(r, r)));
  }
});

async function findGlobalSearch() {
  const payload = {
    from: document.getElementById('gFromDate').value,
    to: document.getElementById('gToDate').value,
    region: document.getElementById('gRegion').value || null,
    subRegion: document.getElementById('gSubregion').value || null,
    branch: document.getElementById('gBranch').value || null
  };

  const res = await fetch('/api/lr-paid-statement/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();

  const container = document.getElementById('globalSearchTableContainer');
  container.innerHTML = '';
  if (data.length === 0) {
    container.innerHTML = '<p>No records found.</p>';
    return;
  }

  let html = '<table class="table table-bordered"><thead><tr>' +
    '<th>Paid Date</th><th>LR Number</th><th>Amount</th><th>Region</th><th>Sub-Region</th><th>Branch</th>' +
    '</tr></thead><tbody>';
  data.forEach(r => {
    html += `<tr><td>${r.paidDate}</td><td>${r.lrNumber}</td><td>${r.amount}</td><td>${r.region}</td><td>${r.subRegion}</td><td>${r.branch}</td></tr>`;
  });
  html += '</tbody></table>';
  container.innerHTML = html;
}

function resetGlobalSearch() {
  document.getElementById('gFromDate').value = '';
  document.getElementById('gToDate').value = '';
  document.getElementById('gRegion').value = '';
  document.getElementById('gSubregion').innerHTML = '<option value="">-- Select Sub-region --</option>';
  document.getElementById('gBranch').innerHTML = '<option value="">-- Select Branch --</option>';
  document.getElementById('globalSearchTableContainer').innerHTML = '';
}