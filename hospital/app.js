const patients = [
  {
    mrd: 'MRD-240001',
    name: 'Ramesh Kumar',
    age: 58,
    sex: 'Male',
    phone: '98765 43210',
    location: 'ICU Bed 03',
    department: 'ICU',
    consultant: 'Dr. Manoj Kumar',
    diagnosis: 'Community acquired pneumonia with type 2 diabetes mellitus',
    admissionDate: '11 May 2026',
    status: 'Admitted',
    advance: 10000,
  },
  {
    mrd: 'MRD-240002',
    name: 'Lakshmi Devi',
    age: 46,
    sex: 'Female',
    phone: '91234 56780',
    location: 'Ward 2A',
    department: 'Ward',
    consultant: 'Dr. Manoj Kumar',
    diagnosis: 'Acute gastroenteritis with dehydration',
    admissionDate: '10 May 2026',
    status: 'Admitted',
    advance: 5000,
  },
  {
    mrd: 'MRD-240003',
    name: 'Suresh Reddy',
    age: 34,
    sex: 'Male',
    phone: '90000 11122',
    location: 'OPD',
    department: 'OPD',
    consultant: 'Dr. Manoj Kumar',
    diagnosis: 'Fever under evaluation',
    admissionDate: '11 May 2026',
    status: 'OPD',
    advance: 1000,
  },
];

const labs = [
  {
    mrd: 'MRD-240001',
    test: 'Complete Blood Count',
    result: 'Hb 11.8 g/dL, WBC 13,400/cumm, Platelets 2.2 lakh/cumm',
    status: 'Completed',
    time: '11 May, 10:20 AM',
  },
  {
    mrd: 'MRD-240001',
    test: 'ABG',
    result: 'pH 7.31, pCO2 52 mmHg, pO2 78 mmHg on oxygen support',
    status: 'Completed',
    time: '11 May, 11:05 AM',
  },
  {
    mrd: 'MRD-240002',
    test: 'Serum Electrolytes',
    result: 'Na 132 mmol/L, K 3.4 mmol/L, Cl 96 mmol/L',
    status: 'Processing',
    time: '11 May, 09:45 AM',
  },
  {
    mrd: 'MRD-240003',
    test: 'Dengue NS1 / IgM',
    result: 'Sample collected, report pending',
    status: 'Sample collected',
    time: '11 May, 12:10 PM',
  },
];

const bills = [
  { mrd: 'MRD-240001', category: 'ER charges', description: 'Emergency triage and stabilization', amount: 2500 },
  { mrd: 'MRD-240001', category: 'ICU bed charges', description: 'ICU bed with monitor - day 1', amount: 8000 },
  { mrd: 'MRD-240001', category: 'Lab investigations', description: 'CBC, RFT, ABG', amount: 3200 },
  { mrd: 'MRD-240002', category: 'Ward bed charges', description: 'Ward bed - day 1', amount: 2500 },
  { mrd: 'MRD-240002', category: 'Doctor consultation', description: 'Inpatient consultation', amount: 1200 },
  { mrd: 'MRD-240003', category: 'OPD consultation', description: 'General medicine OPD', amount: 500 },
];

let selectedMrd = patients[0].mrd;

const money = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

function patientByMrd(mrd) {
  return patients.find((patient) => patient.mrd === mrd) || patients[0];
}

function currentPatient() {
  return patientByMrd(selectedMrd);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function statusClass(status) {
  if (status === 'Completed') return 'completed';
  if (status === 'Processing' || status === 'Sample collected') return 'pending';
  return '';
}

function fillSelect(select, value) {
  select.innerHTML = patients
    .map((patient) => `<option value="${patient.mrd}">${patient.mrd} — ${patient.name}</option>`)
    .join('');
  select.value = value;
}

function syncSelects() {
  ['globalMrd', 'labMrd', 'icuMrd', 'billingMrd'].forEach((id) => {
    const select = document.getElementById(id);
    if (select) fillSelect(select, selectedMrd);
  });
}

function billTotals(mrd) {
  const total = bills
    .filter((bill) => bill.mrd === mrd)
    .reduce((sum, bill) => sum + Number(bill.amount), 0);
  const advance = patientByMrd(mrd).advance;
  return { total, advance, due: Math.max(total - advance, 0) };
}

function labsFor(mrd) {
  return labs.filter((lab) => lab.mrd === mrd);
}

function renderHero() {
  const patient = currentPatient();
  const totals = billTotals(patient.mrd);
  const pendingCount = labsFor(patient.mrd).filter((lab) => lab.status !== 'Completed').length;

  document.getElementById('heroPatientName').textContent = `${patient.name} (${patient.mrd})`;
  document.getElementById('heroPatientMeta').textContent =
    `${patient.age}/${patient.sex} • ${patient.location} • ${patient.consultant} • ${patient.status}`;
  document.getElementById('heroPendingLabs').textContent = pendingCount;
  document.getElementById('heroBillDue').textContent = money.format(totals.due);
}

function renderMetrics() {
  document.getElementById('metricPatients').textContent = patients.length;
  document.getElementById('metricPendingLabs').textContent = labs.filter((lab) => lab.status !== 'Completed').length;
  document.getElementById('metricIcu').textContent = patients.filter((patient) => patient.department === 'ICU').length;
  document.getElementById('metricCollection').textContent = money.format(
    patients.reduce((sum, patient) => sum + patient.advance, 0)
  );
}

function patientSnapshot(patient) {
  return `
    <h4>${escapeHtml(patient.name)} <span class="status">${escapeHtml(patient.status)}</span></h4>
    <p><strong>${escapeHtml(patient.mrd)}</strong> • ${patient.age}/${patient.sex} • ${escapeHtml(patient.phone)}</p>
    <p>${escapeHtml(patient.location)} • ${escapeHtml(patient.consultant)}</p>
    <p>Diagnosis: ${escapeHtml(patient.diagnosis)}</p>
    <p>Admission: ${escapeHtml(patient.admissionDate)}</p>
  `;
}

function renderDashboard() {
  const activity = [...labs].reverse().slice(0, 5);
  document.getElementById('labActivity').innerHTML = activity
    .map((lab) => {
      const patient = patientByMrd(lab.mrd);
      return `
        <div class="timeline-item">
          <h4>${escapeHtml(lab.test)} <span class="status ${statusClass(lab.status)}">${escapeHtml(lab.status)}</span></h4>
          <p>${escapeHtml(patient.name)} • ${escapeHtml(lab.mrd)} • ${escapeHtml(lab.time)}</p>
        </div>
      `;
    })
    .join('');
  document.getElementById('dashboardPatient').innerHTML = patientSnapshot(currentPatient());
}

function renderPatients() {
  const query = document.getElementById('patientSearch').value.trim().toLowerCase();
  const filtered = patients.filter((patient) =>
    [patient.mrd, patient.name, patient.phone, patient.location, patient.department, patient.consultant]
      .join(' ')
      .toLowerCase()
      .includes(query)
  );

  document.getElementById('patientCards').innerHTML = filtered
    .map((patient) => {
      const totals = billTotals(patient.mrd);
      return `
        <article class="patient-card ${patient.mrd === selectedMrd ? 'active' : ''}" data-mrd="${patient.mrd}">
          <div>
            <h4>${escapeHtml(patient.name)}</h4>
            <p>${escapeHtml(patient.mrd)} • ${patient.age}/${patient.sex} • ${escapeHtml(patient.location)}</p>
            <p>${escapeHtml(patient.diagnosis)}</p>
          </div>
          <div>
            <span class="status">${escapeHtml(patient.status)}</span>
            <p>Due: <strong>${money.format(totals.due)}</strong></p>
          </div>
        </article>
      `;
    })
    .join('');

  document.querySelectorAll('.patient-card').forEach((card) => {
    card.addEventListener('click', () => {
      selectedMrd = card.dataset.mrd;
      renderAll();
      showSection('icu');
    });
  });
}

function resultCards(mrd) {
  const patientLabs = labsFor(mrd);
  if (!patientLabs.length) return '<div class="empty-state">No investigations entered for this MRD yet.</div>';
  return patientLabs
    .map((lab) => `
      <article class="result-card">
        <h4>${escapeHtml(lab.test)} <span class="status ${statusClass(lab.status)}">${escapeHtml(lab.status)}</span></h4>
        <p>${escapeHtml(lab.result)}</p>
        <p>${escapeHtml(lab.time)}</p>
      </article>
    `)
    .join('');
}

function renderLabs() {
  document.getElementById('labSelectedMrd').textContent = selectedMrd;
  document.getElementById('labResults').innerHTML = resultCards(selectedMrd);
}

function renderIcu() {
  document.getElementById('icuPatient').innerHTML = patientSnapshot(currentPatient());
  document.getElementById('icuResults').innerHTML = resultCards(selectedMrd);
}

function renderSummary() {
  const patient = currentPatient();
  const diagnosis = document.getElementById('diagnosis').value || patient.diagnosis;
  const course = document.getElementById('course').value || 'Patient was evaluated, monitored, and treated as per clinical condition.';
  const treatment = document.getElementById('treatment').value || 'Supportive care, antibiotics/medications as advised, monitoring, and nursing care.';
  const advice = document.getElementById('advice').value || 'Review in OPD after 7 days or earlier if fever, breathlessness, chest pain, vomiting, or worsening symptoms occur.';
  const labSummary = labsFor(patient.mrd)
    .map((lab) => `<li>${escapeHtml(lab.test)}: ${escapeHtml(lab.result)}</li>`)
    .join('');

  document.getElementById('summaryPreview').innerHTML = `
    <h2>Discharge Summary</h2>
    <p><strong>${escapeHtml(patient.name)}</strong> • ${escapeHtml(patient.mrd)} • ${patient.age}/${patient.sex}</p>
    <p>${escapeHtml(patient.location)} • Consultant: ${escapeHtml(patient.consultant)}</p>
    <p>Admission date: ${escapeHtml(patient.admissionDate)}</p>
    <h4>Final diagnosis</h4>
    <p>${escapeHtml(diagnosis)}</p>
    <h4>Investigations</h4>
    <ul>${labSummary || '<li>No investigations available.</li>'}</ul>
    <h4>Course in hospital</h4>
    <p>${escapeHtml(course)}</p>
    <h4>Treatment given</h4>
    <p>${escapeHtml(treatment)}</p>
    <h4>Advice on discharge</h4>
    <p>${escapeHtml(advice)}</p>
  `;
}

function renderBilling() {
  const totals = billTotals(selectedMrd);
  document.getElementById('billTotalPill').textContent = `Due ${money.format(totals.due)}`;
  const patientBills = bills.filter((bill) => bill.mrd === selectedMrd);
  const rows = patientBills
    .map((bill) => `
      <div class="bill-row">
        <div>
          <h4>${escapeHtml(bill.category)}</h4>
          <p>${escapeHtml(bill.description)}</p>
        </div>
        <strong>${money.format(bill.amount)}</strong>
      </div>
    `)
    .join('');

  document.getElementById('billRows').innerHTML = `
    ${rows || '<div class="empty-state">No charges added yet.</div>'}
    <div class="bill-row">
      <div><h4>Total charges</h4><p>Advance paid: ${money.format(totals.advance)}</p></div>
      <strong>${money.format(totals.total)}</strong>
    </div>
    <div class="bill-row">
      <div><h4>Final due</h4><p>Amount payable at discharge</p></div>
      <strong>${money.format(totals.due)}</strong>
    </div>
  `;
}

function renderAll() {
  syncSelects();
  renderHero();
  renderMetrics();
  renderDashboard();
  renderPatients();
  renderLabs();
  renderIcu();
  renderSummary();
  renderBilling();
}

function showSection(id) {
  document.querySelectorAll('.screen').forEach((screen) => screen.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  document.querySelectorAll('[data-section-link]').forEach((link) => {
    link.classList.toggle('active', link.dataset.sectionLink === id);
  });
  history.replaceState(null, '', `#${id}`);
}

document.querySelectorAll('[data-section-link]').forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    showSection(link.dataset.sectionLink);
  });
});

document.querySelectorAll('[data-jump]').forEach((button) => {
  button.addEventListener('click', () => showSection(button.dataset.jump));
});

document.getElementById('globalMrd').addEventListener('change', (event) => {
  selectedMrd = event.target.value;
  renderAll();
});

['labMrd', 'icuMrd', 'billingMrd'].forEach((id) => {
  document.getElementById(id).addEventListener('change', (event) => {
    selectedMrd = event.target.value;
    renderAll();
  });
});

document.getElementById('patientSearch').addEventListener('input', renderPatients);

document.getElementById('labForm').addEventListener('submit', (event) => {
  event.preventDefault();
  labs.push({
    mrd: document.getElementById('labMrd').value,
    test: document.getElementById('labTest').value,
    result: document.getElementById('labResult').value || 'Result updated by lab.',
    status: document.getElementById('labStatus').value,
    time: new Date().toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }),
  });
  selectedMrd = document.getElementById('labMrd').value;
  event.target.reset();
  renderAll();
});

document.getElementById('billingForm').addEventListener('submit', (event) => {
  event.preventDefault();
  const mrd = document.getElementById('billingMrd').value;
  const category = document.getElementById('chargeCategory').value;
  bills.push({
    mrd,
    category,
    description: document.getElementById('chargeDescription').value || category,
    amount: Number(document.getElementById('chargeAmount').value || 0),
  });
  selectedMrd = mrd;
  document.getElementById('chargeDescription').value = '';
  renderAll();
});

document.getElementById('fillSummary').addEventListener('click', () => {
  const patient = currentPatient();
  document.getElementById('diagnosis').value = patient.diagnosis;
  document.getElementById('course').value =
    'Patient was admitted under ' + patient.consultant + '. Clinical condition, vitals, laboratory investigations, and response to treatment were monitored. Patient improved symptomatically and is being discharged in stable condition.';
  document.getElementById('treatment').value =
    'IV fluids, oxygen/supportive care where required, antibiotics/medications as per chart, monitoring, and nursing care.';
  document.getElementById('advice').value =
    'Continue prescribed medications. Maintain hydration and diet advice. Review in OPD after 7 days with all reports. Return immediately for fever, breathlessness, chest pain, altered sensorium, or worsening symptoms.';
  renderSummary();
});

['diagnosis', 'course', 'treatment', 'advice'].forEach((id) => {
  document.getElementById(id).addEventListener('input', renderSummary);
});

const hash = window.location.hash.replace('#', '');
if (hash && document.getElementById(hash)) showSection(hash);
renderAll();
