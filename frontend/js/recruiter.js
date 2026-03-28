let recruiterActivePage = 'home';
let recruiterModalState = null;

const RECRUITER_DEFAULT_OPPORTUNITIES = [
  { id: 'recruiter_j1', type: 'Job', company: 'Atlassian', role: 'Frontend Engineer', location: 'Remote', packageValue: '24 LPA', deadline: '2025-05-28', description: 'Build product experiences with strong UI engineering and platform collaboration.' },
  { id: 'recruiter_j2', type: 'Job', company: 'Salesforce', role: 'Software Engineer', location: 'Hyderabad', packageValue: '22 LPA', deadline: '2025-06-05', description: 'Work across cloud products with scalable backend and frontend teams.' },
  { id: 'recruiter_i1', type: 'Internship', company: 'Adobe', role: 'Product Intern', location: 'Noida', packageValue: '65,000/mo', deadline: '2025-05-18', description: 'Support product research, user journeys, and internal release workflows.' }
];

function recruiterReadStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch (error) {
    return fallback;
  }
}

function recruiterWriteStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getRecruiterUpdates() {
  return recruiterReadStorage('placeProUpdates', []).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
}

function getRecruiterApplications() {
  return recruiterReadStorage('placeProApplications', []);
}

function getRecruiterDocuments() {
  return recruiterReadStorage('placeProStudentDocuments', {});
}

function getRecruiterStudentProfile() {
  const storedProfile = recruiterReadStorage('placeProStudentProfile', null);
  if (storedProfile) return storedProfile;

  const session = recruiterReadStorage('placeProSession', null);
  if (session && session.role === 'Student') {
    return {
      name: session.name || 'Student',
      rollNo: '0101CS211045',
      mobile: '',
      personalEmail: session.email || '',
      collegeEmail: session.email || '',
      dob: '',
      className: '',
      section: '',
      studentImage: session.photo || ''
    };
  }

  return null;
}

function getRecruiterOpportunities() {
  const stored = recruiterReadStorage('placeProOpportunities', []);
  if (stored.length > 0) return stored;
  recruiterWriteStorage('placeProOpportunities', RECRUITER_DEFAULT_OPPORTUNITIES);
  return RECRUITER_DEFAULT_OPPORTUNITIES;
}

function recruiterEscapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getRecruiterTitle(page) {
  const titles = {
    home: 'Dashboard',
    updates: 'Send Updates',
    applications: 'Applied Records',
    credentials: 'Credentials',
    documents: 'Documents',
    students: 'Student Data',
    opportunities: 'Post Opportunities'
  };
  return titles[page] || page;
}

function updateRecruiterHeader() {
  document.getElementById('recruiter-page-title').innerText = getRecruiterTitle(recruiterActivePage);
}

function updateRecruiterNav() {
  document.querySelectorAll('.recruiter-nav-btn').forEach((btn) => {
    const isActive = btn.getAttribute('data-page') === recruiterActivePage;
    btn.classList.toggle('recruiter-active-nav', isActive);
    btn.classList.toggle('text-neutral-400', !isActive);
    btn.classList.toggle('border-transparent', !isActive);
  });
}

function recruiterStatCard(icon, count, label, className) {
  return `
    <div class="recruiter-stat-card p-8 border border-neutral-200 group transition-all ${className}">
      <i data-lucide="${icon}" size="24" class="recruiter-stat-icon mb-6 transition-transform"></i>
      <h3 class="text-5xl font-black mb-1 tracking-tighter">${count}</h3>
      <p class="text-[10px] font-bold uppercase tracking-widest opacity-60">${label}</p>
    </div>
  `;
}

function renderRecruiterOverview() {
  const updates = getRecruiterUpdates().filter(item => item.source === 'Recruiter');
  const applications = getRecruiterApplications();
  const opportunities = getRecruiterOpportunities();
  const profile = getRecruiterStudentProfile();

  return `
    <div class="recruiter-animate-in">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        ${recruiterStatCard('bell', updates.length, 'Recruiter Updates', 'bg-black text-white')}
        ${recruiterStatCard('clipboard-check', applications.length, 'Applied Records', 'bg-neutral-50')}
        ${recruiterStatCard('briefcase', opportunities.length, 'Open Opportunities', 'bg-neutral-50')}
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div class="lg:col-span-2">
          <h2 class="text-[10px] font-black tracking-[0.3em] uppercase mb-8 flex items-center gap-2">
            <i data-lucide="zap" size="14" class="text-amber-500"></i>
            Recruiter Actions
          </h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            ${[
              ['Send Updates', 'Share links, forms, and drive details', 'bell', 'updates'],
              ['Review Applications', 'Inspect student submissions quickly', 'clipboard-check', 'applications'],
              ['Open Documents', 'View uploaded resumes and files', 'file-text', 'documents'],
              ['Post Opportunities', 'Create new jobs and internships', 'briefcase', 'opportunities']
            ].map(([title, desc, icon, target]) => `
              <button onclick="switchRecruiterPage('${target}')" class="recruiter-action-card flex items-center gap-6 p-6 border border-neutral-100 hover:border-black hover:bg-neutral-50 transition-all text-left group">
                <div class="recruiter-action-icon w-12 h-12 bg-neutral-100 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all">
                  <i data-lucide="${icon}" size="20"></i>
                </div>
                <div>
                  <h4 class="text-sm font-black uppercase tracking-tighter">${title}</h4>
                  <p class="text-[10px] font-bold text-neutral-400 uppercase">${desc}</p>
                </div>
              </button>
            `).join('')}
          </div>

          <div class="mt-8 p-6 bg-neutral-50 border-l-4 border-green-500">
            <div class="flex items-center gap-4 flex-wrap">
              <i data-lucide="check-circle-2" size="20" class="text-green-500"></i>
              <div>
                <h4 class="text-[10px] font-black uppercase tracking-widest">Student Data Access</h4>
                <p class="text-[9px] font-bold text-neutral-500 uppercase">${profile ? 'Student profile available for recruiter review.' : 'No student profile data found yet.'}</p>
              </div>
              <button onclick="switchRecruiterPage('students')" class="ml-auto text-[9px] font-black uppercase border-b border-black">Open Student Data</button>
            </div>
          </div>
        </div>

        <div>
          <div class="flex justify-between items-center mb-8">
            <h2 class="text-[10px] font-black tracking-[0.3em] uppercase flex items-center gap-2">
              <i data-lucide="bell" size="14"></i>
              Recruiter Feed
            </h2>
            <button onclick="switchRecruiterPage('updates')" class="text-[9px] font-black uppercase text-neutral-400 hover:text-black">Manage</button>
          </div>
          <div class="space-y-4">
            ${(updates.length ? updates.slice(0, 4) : [{ title: 'No recruiter updates yet', message: 'Publish your first hiring update from the Send Updates section.', type: 'Update', time: 'Now', source: 'Recruiter', link: '' }]).map((item) => `
              <div class="p-5 border border-neutral-100 hover:border-neutral-200 transition-all">
                <div class="flex justify-between items-start mb-2 gap-3">
                  <span class="text-[8px] font-black px-2 py-0.5 uppercase ${item.type === 'Urgent' ? 'bg-red-100 text-red-600' : item.type === 'Alert' ? 'bg-amber-100 text-amber-600' : 'bg-neutral-100 text-neutral-500'}">${item.type}</span>
                  <span class="text-[8px] font-bold text-neutral-300 uppercase">Recruiter</span>
                </div>
                <h4 class="text-xs font-black uppercase tracking-tighter mb-1">${recruiterEscapeHtml(item.title)}</h4>
                <p class="text-[10px] font-medium text-neutral-500 leading-relaxed recruiter-line-clamp-2">${recruiterEscapeHtml(item.message)}</p>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderRecruiterUpdatesPage() {
  const updates = getRecruiterUpdates().filter(item => item.source === 'Recruiter');
  return `
    <div class="recruiter-animate-in">
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-10">
        <div>
          <h2 class="text-sm font-black uppercase tracking-[0.2em] mb-8">Publish Recruiter Update</h2>
          <div class="space-y-5">
            <input id="recruiter-update-title" type="text" placeholder="Enter update title" class="w-full p-4 border border-neutral-200 text-sm font-bold">
            <textarea id="recruiter-update-message" placeholder="Enter update message" class="w-full p-4 border border-neutral-200 min-h-[140px] text-sm font-bold resize-none"></textarea>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <select id="recruiter-update-type" class="w-full p-4 border border-neutral-200 text-sm font-bold">
                <option value="Update">Update</option>
                <option value="Alert">Alert</option>
                <option value="Urgent">Urgent</option>
              </select>
              <input id="recruiter-update-link" type="text" placeholder="Optional form / drive / meet link" class="w-full p-4 border border-neutral-200 text-sm font-bold">
            </div>
            <button onclick="sendRecruiterUpdate()" class="w-full bg-black text-white py-4 text-[10px] font-black uppercase tracking-[0.2em]">Publish Update</button>
          </div>
        </div>
        <div>
          <h2 class="text-sm font-black uppercase tracking-[0.2em] mb-8">Recruiter Update Feed</h2>
          <div class="space-y-5">
            ${updates.map((item) => `
              <div class="p-6 border border-neutral-100 hover:border-black transition-all">
                <div class="flex justify-between gap-4 mb-3 flex-wrap">
                  <div>
                    <h3 class="text-sm font-black uppercase tracking-tight">${recruiterEscapeHtml(item.title)}</h3>
                    <p class="text-[10px] font-bold text-neutral-400 uppercase mt-2">Recruiter · ${item.type} · ${item.time || 'Recent'}</p>
                  </div>
                </div>
                <p class="text-sm text-neutral-600 leading-relaxed">${recruiterEscapeHtml(item.message)}</p>
                ${item.link ? `<a href="${recruiterEscapeHtml(item.link)}" target="_blank" rel="noopener noreferrer" class="inline-block mt-4 text-[10px] font-black uppercase border-b border-black">Open Link</a>` : ''}
              </div>
            `).join('') || '<div class="p-6 border border-dashed border-neutral-200 text-[10px] font-black uppercase tracking-widest text-neutral-300">No recruiter updates published yet</div>'}
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderRecruiterApplicationsPage() {
  const applications = getRecruiterApplications();
  return `
    <div class="recruiter-animate-in">
      <div class="border border-neutral-200 overflow-hidden">
        <table class="w-full text-left">
          <thead>
            <tr class="bg-neutral-50 border-b border-neutral-200">
              <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Student</th>
              <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Company / Role</th>
              <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Status</th>
              <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-neutral-100">
            ${applications.length ? applications.map((app) => `
              <tr class="hover:bg-neutral-50 transition-colors">
                <td class="px-6 py-6"><div class="font-black text-sm uppercase">${recruiterEscapeHtml(app.studentName || 'Student')}</div><div class="text-[10px] text-neutral-400 font-bold">${recruiterEscapeHtml(app.rollNo || '')}</div></td>
                <td class="px-6 py-6"><div class="font-black text-sm uppercase">${recruiterEscapeHtml(app.company)}</div><div class="text-[10px] text-neutral-400 font-bold">${recruiterEscapeHtml(app.role)}</div></td>
                <td class="px-6 py-6"><span class="text-[10px] font-black uppercase text-amber-600">${recruiterEscapeHtml(app.status)}</span></td>
                <td class="px-6 py-6"><button onclick="openRecruiterModal('application', '${app.id}')" class="px-4 py-2 border border-neutral-300 text-[9px] font-black uppercase tracking-widest hover:border-black">View</button></td>
              </tr>
            `).join('') : `<tr><td colspan="4" class="px-6 py-20 text-center text-neutral-300 uppercase text-[10px] font-black tracking-widest">No applications submitted yet</td></tr>`}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function renderRecruiterCredentialsPage() {
  const documents = getRecruiterDocuments();
  const cards = [
    ['Internship Certificates', documents.internshipCertificates],
    ['Skills Certificates', documents.skillCertificates],
    ['Other Certificates', documents.otherCertificates]
  ];

  return `
    <div class="recruiter-animate-in">
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        ${cards.map(([title, doc]) => `
          <div class="recruiter-doc-card p-6 border border-neutral-200 bg-white flex flex-col gap-5">
            <div class="flex items-center gap-4">
              <div class="recruiter-doc-icon w-12 h-12 border border-neutral-200 bg-neutral-50 flex items-center justify-center transition-transform"><i data-lucide="award" size="20"></i></div>
              <div>
                <h3 class="text-sm font-black uppercase tracking-tighter">${title}</h3>
                <p class="text-[10px] font-bold uppercase text-neutral-400">${doc && doc.fileUrl ? 'Uploaded' : 'Not uploaded'}</p>
              </div>
            </div>
            <div class="border border-dashed border-neutral-200 p-4">
              <p class="text-xs text-neutral-500 leading-relaxed mb-3">${doc && doc.fileName ? recruiterEscapeHtml(doc.fileName) : 'No certificate uploaded yet.'}</p>
              ${doc && doc.fileUrl ? `<button onclick="openRecruiterModal('document', '${doc.key || ''}', '${encodeURIComponent(title)}')" class="px-4 py-2 border border-neutral-300 text-[9px] font-black uppercase tracking-widest hover:border-black">View</button>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderRecruiterDocumentsPage() {
  const documents = getRecruiterDocuments();
  const cards = [
    ['Resume', documents.resume, 'file-text'],
    ['Student Documents', documents.otherCertificates, 'folder-open']
  ];

  return `
    <div class="recruiter-animate-in">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        ${cards.map(([title, doc, icon]) => `
          <div class="recruiter-doc-card p-6 border border-neutral-200 bg-white flex flex-col gap-5">
            <div class="flex items-center gap-4">
              <div class="recruiter-doc-icon w-12 h-12 border border-neutral-200 bg-neutral-50 flex items-center justify-center transition-transform"><i data-lucide="${icon}" size="20"></i></div>
              <div>
                <h3 class="text-sm font-black uppercase tracking-tighter">${title}</h3>
                <p class="text-[10px] font-bold uppercase text-neutral-400">${doc && doc.fileUrl ? 'Uploaded' : 'Not uploaded'}</p>
              </div>
            </div>
            <div class="border border-dashed border-neutral-200 p-4">
              <p class="text-xs text-neutral-500 leading-relaxed mb-3">${doc && doc.fileName ? recruiterEscapeHtml(doc.fileName) : 'No document uploaded yet.'}</p>
              ${doc && doc.fileUrl ? `<button onclick="openRecruiterModal('document', '${doc.key || ''}', '${encodeURIComponent(title)}')" class="px-4 py-2 border border-neutral-300 text-[9px] font-black uppercase tracking-widest hover:border-black">View</button>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderRecruiterStudentsPage() {
  const profile = getRecruiterStudentProfile();
  if (!profile) {
    return `<div class="recruiter-animate-in text-center py-32 border border-dashed border-neutral-200 text-[10px] font-black uppercase tracking-widest text-neutral-300">No student profile data available yet</div>`;
  }

  return `
    <div class="recruiter-animate-in max-w-5xl">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div class="border border-neutral-200 bg-neutral-50 p-6">
          <p class="text-[9px] font-black uppercase tracking-[0.24em] text-neutral-400 mb-4">Student Snapshot</p>
          <img src="${profile.studentImage || 'https://api.dicebear.com/7.x/notionists/svg?seed=PlacePro%20Student'}" alt="Student" class="w-full aspect-[4/5] object-cover border border-black p-1 bg-white mb-4">
          <h3 class="text-lg font-black uppercase tracking-tight">${recruiterEscapeHtml(profile.name)}</h3>
          <p class="text-[10px] font-bold uppercase text-neutral-400 mt-2">${recruiterEscapeHtml(profile.rollNo || '')}</p>
        </div>
        <div class="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
          ${[
            ['Student Name', profile.name],
            ['Roll Number', profile.rollNo],
            ['Mobile Number', profile.mobile],
            ['Personal Email', profile.personalEmail],
            ['College Email', profile.collegeEmail],
            ['Date of Birth', profile.dob],
            ['Class / Year', profile.className],
            ['Section', profile.section]
          ].map(([label, value]) => `
            <div class="border-b border-neutral-100 pb-2">
              <label class="block text-[9px] font-black uppercase text-neutral-400 mb-2 tracking-widest">${label}</label>
              <div class="font-bold text-sm">${recruiterEscapeHtml(value || 'N/A')}</div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

function renderRecruiterOpportunitiesPage() {
  const opportunities = getRecruiterOpportunities();
  return `
    <div class="recruiter-animate-in">
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-10">
        <div>
          <h2 class="text-sm font-black uppercase tracking-[0.2em] mb-8">Create Opportunity</h2>
          <div class="space-y-5">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <select id="recruiter-opportunity-type" class="w-full p-4 border border-neutral-200 text-sm font-bold">
                <option value="Job">Job</option>
                <option value="Internship">Internship</option>
              </select>
              <input id="recruiter-opportunity-company" type="text" placeholder="Company name" class="w-full p-4 border border-neutral-200 text-sm font-bold">
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <input id="recruiter-opportunity-role" type="text" placeholder="Role" class="w-full p-4 border border-neutral-200 text-sm font-bold">
              <input id="recruiter-opportunity-location" type="text" placeholder="Location" class="w-full p-4 border border-neutral-200 text-sm font-bold">
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <input id="recruiter-opportunity-package" type="text" placeholder="Package / Stipend" class="w-full p-4 border border-neutral-200 text-sm font-bold">
              <input id="recruiter-opportunity-deadline" type="date" class="w-full p-4 border border-neutral-200 text-sm font-bold">
            </div>
            <textarea id="recruiter-opportunity-description" placeholder="Opportunity description" class="w-full p-4 border border-neutral-200 min-h-[140px] text-sm font-bold resize-none"></textarea>
            <button onclick="postRecruiterOpportunity()" class="w-full bg-black text-white py-4 text-[10px] font-black uppercase tracking-[0.2em]">Post Opportunity</button>
          </div>
        </div>
        <div>
          <h2 class="text-sm font-black uppercase tracking-[0.2em] mb-8">Published Opportunities</h2>
          <div class="space-y-5">
            ${opportunities.map((item) => `
              <div class="p-6 border border-neutral-200 bg-white">
                <div class="flex justify-between gap-4 flex-wrap mb-4">
                  <div>
                    <h3 class="text-sm font-black uppercase tracking-tight">${recruiterEscapeHtml(item.company)}</h3>
                    <p class="text-[10px] font-bold uppercase text-neutral-400 mt-2">${recruiterEscapeHtml(item.role)} · ${recruiterEscapeHtml(item.location)}</p>
                  </div>
                  <span class="text-[10px] font-black px-3 py-2 ${item.type === 'Job' ? 'bg-black text-white' : 'border border-black'} uppercase">${recruiterEscapeHtml(item.packageValue)}</span>
                </div>
                <p class="text-xs text-neutral-500 leading-relaxed mb-4">${recruiterEscapeHtml(item.description)}</p>
                <div class="text-[10px] font-bold uppercase text-neutral-400">Deadline ${recruiterEscapeHtml(item.deadline || 'TBA')}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderRecruiterContent() {
  const container = document.getElementById('recruiter-content-area');
  if (recruiterActivePage === 'home') container.innerHTML = renderRecruiterOverview();
  if (recruiterActivePage === 'updates') container.innerHTML = renderRecruiterUpdatesPage();
  if (recruiterActivePage === 'applications') container.innerHTML = renderRecruiterApplicationsPage();
  if (recruiterActivePage === 'credentials') container.innerHTML = renderRecruiterCredentialsPage();
  if (recruiterActivePage === 'documents') container.innerHTML = renderRecruiterDocumentsPage();
  if (recruiterActivePage === 'students') container.innerHTML = renderRecruiterStudentsPage();
  if (recruiterActivePage === 'opportunities') container.innerHTML = renderRecruiterOpportunitiesPage();
  bindRecruiterStaticEvents();
  renderRecruiterModal();
  lucide.createIcons();
}

function switchRecruiterPage(page) {
  recruiterActivePage = page;
  updateRecruiterNav();
  updateRecruiterHeader();
  renderRecruiterContent();
}

function sendRecruiterUpdate() {
  const title = document.getElementById('recruiter-update-title').value.trim();
  const message = document.getElementById('recruiter-update-message').value.trim();
  const type = document.getElementById('recruiter-update-type').value;
  const link = document.getElementById('recruiter-update-link').value.trim();
  if (!message) {
    alert('Enter update message');
    return;
  }

  const updates = getRecruiterUpdates();
  updates.unshift({
    id: 'recruiter_' + Date.now(),
    title: title || 'Recruiter Update',
    message,
    type,
    link,
    source: 'Recruiter',
    time: 'Recent',
    createdAt: new Date().toISOString()
  });
  recruiterWriteStorage('placeProUpdates', updates);
  renderRecruiterContent();
}

function postRecruiterOpportunity() {
  const type = document.getElementById('recruiter-opportunity-type').value;
  const company = document.getElementById('recruiter-opportunity-company').value.trim();
  const role = document.getElementById('recruiter-opportunity-role').value.trim();
  const location = document.getElementById('recruiter-opportunity-location').value.trim();
  const packageValue = document.getElementById('recruiter-opportunity-package').value.trim();
  const deadline = document.getElementById('recruiter-opportunity-deadline').value;
  const description = document.getElementById('recruiter-opportunity-description').value.trim();

  if (!company || !role || !location || !packageValue || !description) {
    alert('Please complete all opportunity fields before posting.');
    return;
  }

  const opportunities = getRecruiterOpportunities();
  opportunities.unshift({
    id: 'recruiter_posted_' + Date.now(),
    type,
    company,
    role,
    location,
    packageValue,
    deadline,
    description
  });
  recruiterWriteStorage('placeProOpportunities', opportunities);
  renderRecruiterContent();
}

function openRecruiterModal(type, recordId, title) {
  recruiterModalState = { type, recordId, title: decodeURIComponent(title || '') };
  renderRecruiterModal();
}

function closeRecruiterModal() {
  recruiterModalState = null;
  renderRecruiterModal();
}

function renderRecruiterModal() {
  const modal = document.getElementById('recruiter-modal-container');
  if (!recruiterModalState) {
    modal.className = 'hidden';
    modal.innerHTML = '';
    return;
  }

  if (recruiterModalState.type === 'application') {
    const record = getRecruiterApplications().find((item) => item.id === recruiterModalState.recordId);
    if (!record) {
      closeRecruiterModal();
      return;
    }
    modal.className = '';
    modal.innerHTML = `
      <div class="recruiter-modal-backdrop fixed inset-0 z-[100] flex items-center justify-center p-6">
        <div class="bg-white w-full max-w-5xl p-8 md:p-10 relative recruiter-animate-in max-h-[90vh] overflow-y-auto">
          <button onclick="closeRecruiterModal()" class="absolute top-6 right-6"><i data-lucide="x" size="24"></i></button>
          <div class="mb-8 pr-10">
            <p class="text-[10px] font-black uppercase tracking-[0.24em] text-neutral-400 mb-2">Application Record</p>
            <h2 class="text-3xl font-black uppercase tracking-tighter">${recruiterEscapeHtml(record.company)}</h2>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            ${[
              ['Student Name', record.studentName],
              ['Roll No', record.rollNo],
              ['Role', record.role],
              ['Location', record.location],
              ['Package', record.packageValue],
              ['DOB', record.dob],
              ['Mobile', record.mobile],
              ['College Email', record.collegeEmail],
              ['10th Marks', record.tenthMarks],
              ['12th Marks', record.twelfthMarks],
              ['Graduation Marks', record.graduationMarks],
              ['Post Graduation Marks', record.postGraduationMarks || 'N/A']
            ].map(([label, value]) => `
              <div class="border-b border-neutral-100 pb-2">
                <label class="block text-[9px] font-black uppercase text-neutral-400 mb-2 tracking-widest">${label}</label>
                <div class="font-bold text-sm">${recruiterEscapeHtml(value || 'N/A')}</div>
              </div>
            `).join('')}
          </div>
          <div class="mt-8 border-b border-neutral-100 pb-2">
            <label class="block text-[9px] font-black uppercase text-neutral-400 mb-2 tracking-widest">Additional Details</label>
            <div class="font-bold text-sm whitespace-pre-wrap">${recruiterEscapeHtml(record.additionalInfo || 'No additional details submitted.')}</div>
          </div>
        </div>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  if (recruiterModalState.type === 'document') {
    const documents = getRecruiterDocuments();
    const doc = Object.values(documents).find((item) => item && item.fileUrl && (!recruiterModalState.recordId || item.key === recruiterModalState.recordId)) || null;
    if (!doc) {
      closeRecruiterModal();
      return;
    }
    const isImage = (doc.fileType || '').startsWith('image/');
    const isPdf = doc.fileType === 'application/pdf';
    const content = isImage
      ? `<img src="${doc.fileUrl}" alt="${recruiterEscapeHtml(doc.fileName)}" class="w-full h-full object-contain">`
      : isPdf
        ? `<iframe src="${doc.fileUrl}" class="w-full h-[70vh] border border-neutral-200"></iframe>`
        : `<div class="py-20 border border-dashed border-neutral-200 text-center"><a href="${doc.fileUrl}" download="${recruiterEscapeHtml(doc.fileName)}" class="inline-flex items-center justify-center px-4 py-2 border border-black bg-white text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all">Download File</a></div>`;
    modal.className = '';
    modal.innerHTML = `
      <div class="recruiter-modal-backdrop fixed inset-0 z-[100] flex items-center justify-center p-6">
        <div class="bg-white w-full max-w-5xl p-8 relative recruiter-animate-in">
          <button onclick="closeRecruiterModal()" class="absolute top-6 right-6"><i data-lucide="x" size="24"></i></button>
          <div class="mb-6 pr-10">
            <p class="text-[10px] font-black uppercase tracking-[0.24em] text-neutral-400 mb-2">Document Preview</p>
            <h2 class="text-2xl font-black uppercase tracking-tighter">${recruiterEscapeHtml(recruiterModalState.title || doc.fileName)}</h2>
            <p class="text-xs text-neutral-500 mt-2">${recruiterEscapeHtml(doc.fileName)}</p>
          </div>
          ${content}
        </div>
      </div>
    `;
    lucide.createIcons();
  }
}

function bindRecruiterStaticEvents() {
  const logoutBtn = document.getElementById('recruiter-logout-btn');
  if (logoutBtn) {
    logoutBtn.onclick = () => {
      localStorage.removeItem('placeProSession');
      localStorage.removeItem('loggedInUser');
      window.location.href = 'login.html';
    };
  }
}

window.switchRecruiterPage = switchRecruiterPage;
window.sendRecruiterUpdate = sendRecruiterUpdate;
window.postRecruiterOpportunity = postRecruiterOpportunity;
window.openRecruiterModal = openRecruiterModal;
window.closeRecruiterModal = closeRecruiterModal;

window.onload = () => {
  updateRecruiterHeader();
  switchRecruiterPage('home');
};
