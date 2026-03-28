let adminActivePage = 'home';
let adminModalState = null;
const ADMIN_DEFAULT_OPPORTUNITIES = [
  { id: 'admin_j1', type: 'Job', company: 'Google', role: 'Software Engineer', location: 'Bangalore', packageValue: '32.5 LPA', deadline: '2025-05-10', description: 'Working on cloud infrastructure and scalable services.' },
  { id: 'admin_j2', type: 'Job', company: 'Microsoft', role: 'Full Stack Dev', location: 'Hyderabad', packageValue: '28.0 LPA', deadline: '2025-05-15', description: 'Azure integration and modern web technologies.' },
  { id: 'admin_i1', type: 'Internship', company: 'Amazon', role: 'SDE Intern', location: 'Remote', packageValue: '80,000/mo', deadline: '2025-04-30', description: 'Summer internship focused on supply chain optimization.' }
];
function readStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch (error) {
    return fallback;
  }
}
function writeStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}
function getAdminUpdates() {
  return readStorage('placeProUpdates', []).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
}
function getAdminApplications() {
  return readStorage('placeProApplications', []);
}
function getAdminDocuments() {
  return readStorage('placeProStudentDocuments', {});
}
function getAdminStudentProfile() {
  const storedProfile = readStorage('placeProStudentProfile', null);
  if (storedProfile) return storedProfile;
  const session = readStorage('placeProSession', null);
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
function getAdminOpportunities() {
  const stored = readStorage('placeProOpportunities', []);
  if (stored.length > 0) return stored;
  writeStorage('placeProOpportunities', ADMIN_DEFAULT_OPPORTUNITIES);
  return ADMIN_DEFAULT_OPPORTUNITIES;
}
function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
function getAdminTitle(page) {
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
function updateAdminHeader() {
  document.getElementById('admin-page-title').innerText = getAdminTitle(adminActivePage);
}
function updateAdminNav() {
  document.querySelectorAll('.admin-nav-btn').forEach((btn) => {
    const isActive = btn.getAttribute('data-page') === adminActivePage;
    btn.classList.toggle('admin-active-nav', isActive);
    btn.classList.toggle('text-neutral-400', !isActive);
    btn.classList.toggle('border-transparent', !isActive);
  });
}
function renderAdminOverview() {
  const updates = getAdminUpdates();
  const applications = getAdminApplications();
  const opportunities = getAdminOpportunities();
  const profile = getAdminStudentProfile();
  return `
    <div class="admin-animate-in">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        ${adminStatCard('bell', updates.length, 'Live Updates', 'bg-black text-white')}
        ${adminStatCard('clipboard-check', applications.length, 'Submitted Applications', 'bg-neutral-50')}
        ${adminStatCard('briefcase', opportunities.length, 'Posted Opportunities', 'bg-neutral-50')}
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div class="lg:col-span-2">
          <h2 class="text-[10px] font-black tracking-[0.3em] uppercase mb-8 flex items-center gap-2">
            <i data-lucide="zap" size="14" class="text-amber-500"></i>
            Admin Actions
          </h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            ${[
              ['Send Updates', 'Publish notices and links for students', 'bell', 'updates'],
              ['Review Applications', 'Open submitted application records', 'clipboard-check', 'applications'],
              ['Inspect Documents', 'See uploaded resumes and files', 'file-text', 'documents'],
              ['Post Opportunities', 'Add new jobs and internships', 'briefcase', 'opportunities']
            ].map(([title, desc, icon, target]) => `
              <button onclick="switchAdminPage('${target}')" class="admin-action-card flex items-center gap-6 p-6 border border-neutral-100 hover:border-black hover:bg-neutral-50 transition-all text-left group">
                <div class="admin-action-icon w-12 h-12 bg-neutral-100 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all">
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
                <h4 class="text-[10px] font-black uppercase tracking-widest">Student Profile Access</h4>
                <p class="text-[9px] font-bold text-neutral-500 uppercase">${profile ? 'Profile data available for review.' : 'No student profile data found yet.'}</p>
              </div>
              <button onclick="switchAdminPage('students')" class="ml-auto text-[9px] font-black uppercase border-b border-black">Open Student Data</button>
            </div>
          </div>
        </div>
        <div>
          <div class="flex justify-between items-center mb-8">
            <h2 class="text-[10px] font-black tracking-[0.3em] uppercase flex items-center gap-2">
              <i data-lucide="bell" size="14"></i>
              Recent Updates
            </h2>
            <button onclick="switchAdminPage('updates')" class="text-[9px] font-black uppercase text-neutral-400 hover:text-black">Manage</button>
          </div>
          <div class="space-y-4">
            ${(updates.length ? updates.slice(0, 4) : [{ title: 'No updates yet', message: 'Send your first update from the Send Updates section.', type: 'Update', time: 'Now', source: 'Admin', link: '' }]).map((item) => `
              <div class="p-5 border border-neutral-100 hover:border-neutral-200 transition-all">
                <div class="flex justify-between items-start mb-2 gap-3">
                  <span class="text-[8px] font-black px-2 py-0.5 uppercase ${item.type === 'Urgent' ? 'bg-red-100 text-red-600' : item.type === 'Alert' ? 'bg-amber-100 text-amber-600' : 'bg-neutral-100 text-neutral-500'}">${item.type}</span>
                  <span class="text-[8px] font-bold text-neutral-300 uppercase">${item.source || 'Portal'}</span>
                </div>
                <h4 class="text-xs font-black uppercase tracking-tighter mb-1">${escapeHtml(item.title)}</h4>
                <p class="text-[10px] font-medium text-neutral-500 leading-relaxed admin-line-clamp-2">${escapeHtml(item.message)}</p>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}
function adminStatCard(icon, count, label, className) {
  return `
    <div class="admin-stat-card p-8 border border-neutral-200 group transition-all ${className}">
      <i data-lucide="${icon}" size="24" class="admin-stat-icon mb-6 transition-transform"></i>
      <h3 class="text-5xl font-black mb-1 tracking-tighter">${count}</h3>
      <p class="text-[10px] font-bold uppercase tracking-widest opacity-60">${label}</p>
    </div>
  `;
}
function renderUpdatesPage() {
  const updates = getAdminUpdates();
  return `
    <div class="admin-animate-in">
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-10">
        <div>
          <h2 class="text-sm font-black uppercase tracking-[0.2em] mb-8">Send New Update</h2>
          <div class="space-y-5">
            <input id="admin-update-title" type="text" placeholder="Enter update title" class="w-full p-4 border border-neutral-200 text-sm font-bold">
            <textarea id="admin-update-message" placeholder="Enter the update message" class="w-full p-4 border border-neutral-200 min-h-[140px] text-sm font-bold resize-none"></textarea>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <select id="admin-update-type" class="w-full p-4 border border-neutral-200 text-sm font-bold">
                <option value="Update">Update</option>
                <option value="Alert">Alert</option>
                <option value="Urgent">Urgent</option>
              </select>
              <input id="admin-update-link" type="text" placeholder="Optional link" class="w-full p-4 border border-neutral-200 text-sm font-bold">
            </div>
            <button onclick="sendAdminUpdate()" class="w-full bg-black text-white py-4 text-[10px] font-black uppercase tracking-[0.2em]">Publish Update</button>
          </div>
        </div>
        <div>
          <h2 class="text-sm font-black uppercase tracking-[0.2em] mb-8">Update Feed</h2>
          <div class="space-y-5">
            ${(updates.length ? updates : []).map((item) => `
              <div class="p-6 border border-neutral-100 hover:border-black transition-all">
                <div class="flex justify-between gap-4 mb-3 flex-wrap">
                  <div>
                    <h3 class="text-sm font-black uppercase tracking-tight">${escapeHtml(item.title)}</h3>
                    <p class="text-[10px] font-bold text-neutral-400 uppercase mt-2">${item.source || 'Admin'} · ${item.type} · ${item.time || 'Recent'}</p>
                  </div>
                </div>
                <p class="text-sm text-neutral-600 leading-relaxed">${escapeHtml(item.message)}</p>
                ${item.link ? `<a href="${escapeHtml(item.link)}" target="_blank" rel="noopener noreferrer" class="inline-block mt-4 text-[10px] font-black uppercase border-b border-black">Open Link</a>` : ''}
              </div>
            `).join('') || '<div class="p-6 border border-dashed border-neutral-200 text-[10px] font-black uppercase tracking-widest text-neutral-300">No updates published yet</div>'}
          </div>
        </div>
      </div>
    </div>
  `;
}
function renderApplicationsPage() {
  const applications = getAdminApplications();
  return `
    <div class="admin-animate-in">
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
                <td class="px-6 py-6"><div class="font-black text-sm uppercase">${escapeHtml(app.studentName || 'Student')}</div><div class="text-[10px] text-neutral-400 font-bold">${escapeHtml(app.rollNo || '')}</div></td>
                <td class="px-6 py-6"><div class="font-black text-sm uppercase">${escapeHtml(app.company)}</div><div class="text-[10px] text-neutral-400 font-bold">${escapeHtml(app.role)}</div></td>
                <td class="px-6 py-6"><span class="text-[10px] font-black uppercase text-amber-600">${escapeHtml(app.status)}</span></td>
                <td class="px-6 py-6"><button onclick="openAdminModal('application', '${app.id}')" class="px-4 py-2 border border-neutral-300 text-[9px] font-black uppercase tracking-widest hover:border-black">View</button></td>
              </tr>
            `).join('') : `<tr><td colspan="4" class="px-6 py-20 text-center text-neutral-300 uppercase text-[10px] font-black tracking-widest">No applications submitted yet</td></tr>`}
          </tbody>
        </table>
      </div>
    </div>
  `;
}
function renderCredentialsPage() {
  const documents = getAdminDocuments();
  const cards = [
    ['Internship Certificates', documents.internshipCertificates],
    ['Skills Certificates', documents.skillCertificates],
    ['Other Certificates', documents.otherCertificates]
  ];
  return `
    <div class="admin-animate-in">
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        ${cards.map(([title, doc]) => `
          <div class="admin-doc-card p-6 border border-neutral-200 bg-white flex flex-col gap-5">
            <div class="flex items-center gap-4">
              <div class="admin-doc-icon w-12 h-12 border border-neutral-200 bg-neutral-50 flex items-center justify-center transition-transform"><i data-lucide="award" size="20"></i></div>
              <div>
                <h3 class="text-sm font-black uppercase tracking-tighter">${title}</h3>
                <p class="text-[10px] font-bold uppercase text-neutral-400">${doc && doc.fileUrl ? 'Uploaded' : 'Not uploaded'}</p>
              </div>
            </div>
            <div class="border border-dashed border-neutral-200 p-4">
              <p class="text-xs text-neutral-500 leading-relaxed mb-3">${doc && doc.fileName ? escapeHtml(doc.fileName) : 'No certificate uploaded yet.'}</p>
              ${doc && doc.fileUrl ? `<button onclick="openAdminModal('document', '${doc.key || ''}', '${encodeURIComponent(title)}')" class="px-4 py-2 border border-neutral-300 text-[9px] font-black uppercase tracking-widest hover:border-black">View</button>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}
function renderDocumentsPage() {
  const documents = getAdminDocuments();
  const cards = [
    ['Resume', documents.resume, 'file-text'],
    ['Student Documents', documents.otherCertificates, 'folder-open']
  ];
  return `
    <div class="admin-animate-in">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        ${cards.map(([title, doc, icon]) => `
          <div class="admin-doc-card p-6 border border-neutral-200 bg-white flex flex-col gap-5">
            <div class="flex items-center gap-4">
              <div class="admin-doc-icon w-12 h-12 border border-neutral-200 bg-neutral-50 flex items-center justify-center transition-transform"><i data-lucide="${icon}" size="20"></i></div>
              <div>
                <h3 class="text-sm font-black uppercase tracking-tighter">${title}</h3>
                <p class="text-[10px] font-bold uppercase text-neutral-400">${doc && doc.fileUrl ? 'Uploaded' : 'Not uploaded'}</p>
              </div>
            </div>
            <div class="border border-dashed border-neutral-200 p-4">
              <p class="text-xs text-neutral-500 leading-relaxed mb-3">${doc && doc.fileName ? escapeHtml(doc.fileName) : 'No document uploaded yet.'}</p>
              ${doc && doc.fileUrl ? `<button onclick="openAdminModal('document', '${doc.key || ''}', '${encodeURIComponent(title)}')" class="px-4 py-2 border border-neutral-300 text-[9px] font-black uppercase tracking-widest hover:border-black">View</button>` : ''}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}
function renderStudentsPage() {
  const profile = getAdminStudentProfile();
  if (!profile) {
    return `<div class="admin-animate-in text-center py-32 border border-dashed border-neutral-200 text-[10px] font-black uppercase tracking-widest text-neutral-300">No student profile data available yet</div>`;
  }
  return `
    <div class="admin-animate-in max-w-5xl">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div class="border border-neutral-200 bg-neutral-50 p-6">
          <p class="text-[9px] font-black uppercase tracking-[0.24em] text-neutral-400 mb-4">Student Snapshot</p>
          <img src="${profile.studentImage || 'https://api.dicebear.com/7.x/notionists/svg?seed=PlacePro%20Student'}" alt="Student" class="w-full aspect-[4/5] object-cover border border-black p-1 bg-white mb-4">
          <h3 class="text-lg font-black uppercase tracking-tight">${escapeHtml(profile.name)}</h3>
          <p class="text-[10px] font-bold uppercase text-neutral-400 mt-2">${escapeHtml(profile.rollNo || '')}</p>
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
              <div class="font-bold text-sm">${escapeHtml(value || 'N/A')}</div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}
function renderOpportunitiesPage() {
  const opportunities = getAdminOpportunities();
  return `
    <div class="admin-animate-in">
      <div class="grid grid-cols-1 xl:grid-cols-2 gap-10">
        <div>
          <h2 class="text-sm font-black uppercase tracking-[0.2em] mb-8">Create Opportunity</h2>
          <div class="space-y-5">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <select id="admin-opportunity-type" class="w-full p-4 border border-neutral-200 text-sm font-bold">
                <option value="Job">Job</option>
                <option value="Internship">Internship</option>
              </select>
              <input id="admin-opportunity-company" type="text" placeholder="Company name" class="w-full p-4 border border-neutral-200 text-sm font-bold">
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <input id="admin-opportunity-role" type="text" placeholder="Role" class="w-full p-4 border border-neutral-200 text-sm font-bold">
              <input id="admin-opportunity-location" type="text" placeholder="Location" class="w-full p-4 border border-neutral-200 text-sm font-bold">
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <input id="admin-opportunity-package" type="text" placeholder="Package / Stipend" class="w-full p-4 border border-neutral-200 text-sm font-bold">
              <input id="admin-opportunity-deadline" type="date" class="w-full p-4 border border-neutral-200 text-sm font-bold">
            </div>
            <textarea id="admin-opportunity-description" placeholder="Opportunity description" class="w-full p-4 border border-neutral-200 min-h-[140px] text-sm font-bold resize-none"></textarea>
            <button onclick="postOpportunity()" class="w-full bg-black text-white py-4 text-[10px] font-black uppercase tracking-[0.2em]">Post Opportunity</button>
          </div>
        </div>
        <div>
          <h2 class="text-sm font-black uppercase tracking-[0.2em] mb-8">Published Opportunities</h2>
          <div class="space-y-5">
            ${opportunities.map((item) => `
              <div class="p-6 border border-neutral-200 bg-white">
                <div class="flex justify-between gap-4 flex-wrap mb-4">
                  <div>
                    <h3 class="text-sm font-black uppercase tracking-tight">${escapeHtml(item.company)}</h3>
                    <p class="text-[10px] font-bold uppercase text-neutral-400 mt-2">${escapeHtml(item.role)} · ${escapeHtml(item.location)}</p>
                  </div>
                  <span class="text-[10px] font-black px-3 py-2 ${item.type === 'Job' ? 'bg-black text-white' : 'border border-black'} uppercase">${escapeHtml(item.packageValue)}</span>
                </div>
                <p class="text-xs text-neutral-500 leading-relaxed mb-4">${escapeHtml(item.description)}</p>
                <div class="text-[10px] font-bold uppercase text-neutral-400">Deadline ${escapeHtml(item.deadline || 'TBA')}</div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}
function renderAdminContent() {
  const container = document.getElementById('admin-content-area');
  if (adminActivePage === 'home') container.innerHTML = renderAdminOverview();
  if (adminActivePage === 'updates') container.innerHTML = renderUpdatesPage();
  if (adminActivePage === 'applications') container.innerHTML = renderApplicationsPage();
  if (adminActivePage === 'credentials') container.innerHTML = renderCredentialsPage();
  if (adminActivePage === 'documents') container.innerHTML = renderDocumentsPage();
  if (adminActivePage === 'students') container.innerHTML = renderStudentsPage();
  if (adminActivePage === 'opportunities') container.innerHTML = renderOpportunitiesPage();
  bindAdminStaticEvents();
  renderAdminModal();
  lucide.createIcons();
}
function switchAdminPage(page) {
  adminActivePage = page;
  updateAdminNav();
  updateAdminHeader();
  renderAdminContent();
}
function sendAdminUpdate() {
  const title = document.getElementById('admin-update-title').value.trim();
  const message = document.getElementById('admin-update-message').value.trim();
  const type = document.getElementById('admin-update-type').value;
  const link = document.getElementById('admin-update-link').value.trim();
  if (!message) {
    alert('Enter update message');
    return;
  }
  const updates = getAdminUpdates();
  updates.unshift({
    id: 'admin_' + Date.now(),
    title: title || 'Admin Update',
    message,
    type,
    link,
    source: 'Admin',
    time: 'Recent',
    createdAt: new Date().toISOString()
  });
  writeStorage('placeProUpdates', updates);
  renderAdminContent();
}
function postOpportunity() {
  const type = document.getElementById('admin-opportunity-type').value;
  const company = document.getElementById('admin-opportunity-company').value.trim();
  const role = document.getElementById('admin-opportunity-role').value.trim();
  const location = document.getElementById('admin-opportunity-location').value.trim();
  const packageValue = document.getElementById('admin-opportunity-package').value.trim();
  const deadline = document.getElementById('admin-opportunity-deadline').value;
  const description = document.getElementById('admin-opportunity-description').value.trim();
  if (!company || !role || !location || !packageValue || !description) {
    alert('Please complete all opportunity fields before posting.');
    return;
  }
  const opportunities = getAdminOpportunities();
  opportunities.unshift({
    id: 'posted_' + Date.now(),
    type,
    company,
    role,
    location,
    packageValue,
    deadline,
    description
  });
  writeStorage('placeProOpportunities', opportunities);
  renderAdminContent();
}
function openAdminModal(type, recordId, title) {
  adminModalState = { type, recordId, title: decodeURIComponent(title || '') };
  renderAdminModal();
}
function closeAdminModal() {
  adminModalState = null;
  renderAdminModal();
}
function renderAdminModal() {
  const modal = document.getElementById('admin-modal-container');
  if (!adminModalState) {
    modal.className = 'hidden';
    modal.innerHTML = '';
    return;
  }
  if (adminModalState.type === 'application') {
    const record = getAdminApplications().find((item) => item.id === adminModalState.recordId);
    if (!record) {
      closeAdminModal();
      return;
    }
    modal.className = '';
    modal.innerHTML = `
      <div class="admin-modal-backdrop fixed inset-0 z-[100] flex items-center justify-center p-6">
        <div class="bg-white w-full max-w-5xl p-8 md:p-10 relative admin-animate-in max-h-[90vh] overflow-y-auto">
          <button onclick="closeAdminModal()" class="absolute top-6 right-6"><i data-lucide="x" size="24"></i></button>
          <div class="mb-8 pr-10">
            <p class="text-[10px] font-black uppercase tracking-[0.24em] text-neutral-400 mb-2">Application Record</p>
            <h2 class="text-3xl font-black uppercase tracking-tighter">${escapeHtml(record.company)}</h2>
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
                <div class="font-bold text-sm">${escapeHtml(value || 'N/A')}</div>
              </div>
            `).join('')}
          </div>
          <div class="mt-8 border-b border-neutral-100 pb-2">
            <label class="block text-[9px] font-black uppercase text-neutral-400 mb-2 tracking-widest">Additional Details</label>
            <div class="font-bold text-sm whitespace-pre-wrap">${escapeHtml(record.additionalInfo || 'No additional details submitted.')}</div>
          </div>
        </div>
      </div>
    `;
    lucide.createIcons();
    return;
  }
  if (adminModalState.type === 'document') {
    const documents = getAdminDocuments();
    const doc = Object.values(documents).find((item) => item && item.fileUrl && (!adminModalState.recordId || item.key === adminModalState.recordId)) || null;
    if (!doc) {
      closeAdminModal();
      return;
    }
    const isImage = (doc.fileType || '').startsWith('image/');
    const isPdf = doc.fileType === 'application/pdf';
    const content = isImage
      ? `<img src="${doc.fileUrl}" alt="${escapeHtml(doc.fileName)}" class="w-full h-full object-contain">`
      : isPdf
        ? `<iframe src="${doc.fileUrl}" class="w-full h-[70vh] border border-neutral-200"></iframe>`
        : `<div class="py-20 border border-dashed border-neutral-200 text-center"><a href="${doc.fileUrl}" download="${escapeHtml(doc.fileName)}" class="inline-flex items-center justify-center px-4 py-2 border border-black bg-white text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all">Download File</a></div>`;
    modal.className = '';
    modal.innerHTML = `
      <div class="admin-modal-backdrop fixed inset-0 z-[100] flex items-center justify-center p-6">
        <div class="bg-white w-full max-w-5xl p-8 relative admin-animate-in">
          <button onclick="closeAdminModal()" class="absolute top-6 right-6"><i data-lucide="x" size="24"></i></button>
          <div class="mb-6 pr-10">
            <p class="text-[10px] font-black uppercase tracking-[0.24em] text-neutral-400 mb-2">Document Preview</p>
            <h2 class="text-2xl font-black uppercase tracking-tighter">${escapeHtml(adminModalState.title || doc.fileName)}</h2>
            <p class="text-xs text-neutral-500 mt-2">${escapeHtml(doc.fileName)}</p>
          </div>
          ${content}
        </div>
      </div>
    `;
    lucide.createIcons();
  }
}
function bindAdminStaticEvents() {
  const logoutBtn = document.getElementById('admin-logout-btn');
  if (logoutBtn) {
    logoutBtn.onclick = () => {
      localStorage.removeItem('placeProSession');
      localStorage.removeItem('loggedInUser');
      window.location.href = 'login.html';
    };
  }
}
window.switchAdminPage = switchAdminPage;
window.sendAdminUpdate = sendAdminUpdate;
window.postOpportunity = postOpportunity;
window.openAdminModal = openAdminModal;
window.closeAdminModal = closeAdminModal;
window.onload = () => {
  updateAdminHeader();
  switchAdminPage('home');
};