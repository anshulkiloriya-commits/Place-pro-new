let activePage = 'home';
let isEditing = false;
let selectedJob = null
let selectedDocumentKey = null;
let applicationDraft = null;
let selectedApplicationRecord = null;
const DEMO_STUDENT_IMAGE = 'https://api.dicebear.com/7.x/notionists/svg?seed=PlacePro%20Student';
const session = getSession();
const defaultNotifications = [
  { id: 1, title: 'TCS Ninja Drive', message: 'Last date to register is tomorrow 5 PM.', type: 'Urgent', time: '2h ago', source: 'Admin', link: '' },
  { id: 2, title: 'Resume Workshop', message: 'Join the mandatory session on resume building at 10 AM.', type: 'Update', time: '5h ago', source: 'Admin', link: '' },
  { id: 3, title: 'Eligibility Criteria', message: 'Microsoft drive criteria updated to 8.0 CGPA.', type: 'Alert', time: '1d ago', source: 'Recruiter', link: '' }
];
let notifications = [];
const profile = {
  name: session?.name || 'John Doe',
  rollNo: '0101CS211045',
  mobile: '+91 9876543210',
  fatherName: 'Robert Doe',
  fatherMobile: '+91 9876543211',
  motherName: 'Jane Doe',
  motherMobile: '+91 9876543212',
  personalEmail: session?.email || 'john.personal@gmail.com',
  collegeEmail: session?.email || 'student@sgsits.ac.in',
  dob: '2003-05-15',
  className: 'B.Tech IV Year',
  section: 'A',
  abcId: '123-456-789-012',
  aadhaar: 'XXXX-XXXX-4567',
  pan: 'ABCDE1234F',
  signature: null,
  studentImage: session?.photo || ''
};
const appliedItems = [];
const documentsData = {
  resume: { title: 'Resume', icon: 'file-text', accept: '.pdf,.doc,.docx,image/*', fileName: '', fileUrl: '', fileType: '' },
  internshipCertificates: { title: 'Internship Certificates', icon: 'briefcase-business', accept: '.pdf,image/*', fileName: '', fileUrl: '', fileType: '' },
  skillCertificates: { title: 'Skills Certificates', icon: 'badge-check', accept: '.pdf,image/*', fileName: '', fileUrl: '', fileType: '' },
  otherCertificates: { title: 'Other Certificates', icon: 'folder-open', accept: '.pdf,image/*', fileName: '', fileUrl: '', fileType: '' }
};
const jobPostings = [
  { id: 'j1', type: 'Job', company: 'Google', role: 'Software Engineer', lpa: '32.5', location: 'Bangalore', deadline: '2025-05-10', description: 'Working on cloud infrastructure and scalable services.' },
  { id: 'j2', type: 'Job', company: 'Microsoft', role: 'Full Stack Dev', lpa: '28.0', location: 'Hyderabad', deadline: '2025-05-15', description: 'Azure integration and modern web technologies.' },
  { id: 'i1', type: 'Internship', company: 'Amazon', role: 'SDE Intern', stipend: '80,000/mo', duration: '6 Months', location: 'Remote', deadline: '2025-04-30', description: 'Summer internship focused on supply chain optimization.' },
  { id: 'i2', type: 'Internship', company: 'Adobe', role: 'Product Intern', stipend: '65,000/mo', duration: '3 Months', location: 'Noida', deadline: '2025-05-05', description: 'UI/UX design and product management research.' }
];
function getSession() {
  try {
    const raw = localStorage.getItem('placeProSession');
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
}
function getSharedUpdates() {
  try {
    const raw = localStorage.getItem('placeProUpdates');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      }
    }

    const legacy = JSON.parse(localStorage.getItem('notifications') || '[]');
    if (Array.isArray(legacy) && legacy.length > 0) {
      return legacy.map((message, index) => ({
        id: `legacy-${index}`,
        title: 'Admin Update',
        message: String(message),
        type: 'Update',
        time: 'Recent',
        source: 'Admin',
        link: '',
        createdAt: new Date().toISOString()
      }));
    }
  } catch (error) {
    return [];
  }
  return [];
}
function refreshNotifications() {
  const sharedUpdates = getSharedUpdates();
  notifications = sharedUpdates.length > 0 ? sharedUpdates : defaultNotifications;
}
function requireStudentSession() {
  if (!session || session.role !== 'Student') {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}
function persistSession() {
  if (!session) {
    return;
  }
  const updatedSession = {
    ...session,
    name: profile.name,
    email: profile.personalEmail || profile.collegeEmail,
    photo: profile.studentImage || session.photo || ''
  };
  localStorage.setItem('loggedInUser', updatedSession.name);
  localStorage.setItem('placeProSession', JSON.stringify(updatedSession));
}
function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
function createApplicationDraft(job) {
  return {
    company: job.company,
    location: job.location,
    packageValue: job.lpa ? `${job.lpa} LPA` : (job.stipend || ''),
    studentName: profile.name,
    rollNo: profile.rollNo,
    role: job.role,
    dob: profile.dob || '',
    mobile: profile.mobile || '',
    collegeEmail: profile.collegeEmail || '',
    tenthMarks: '',
    twelfthMarks: '',
    graduationMarks: '',
    postGraduationMarks: '',
    resumeName: documentsData.resume.fileName || '',
    resumeUrl: documentsData.resume.fileUrl || '',
    resumeType: documentsData.resume.fileType || '',
    additionalInfo: ''
  };
}
function getAvatarSrc() {
  return profile.studentImage || DEMO_STUDENT_IMAGE;
}
function getPageTitle(pageId) {
  const titles = {
    home: 'Dashboard',
    jobs: 'Opportunities',
    applied: 'Submission History',
    profile: 'Profile Management',
    notifications: 'TPO Notifications',
    certs: 'Credentials',
    resume: 'Documents'
  };
  return titles[pageId] || pageId;
}
function updateHeader() {
  document.getElementById('page-title').innerText = getPageTitle(activePage);
  document.querySelector('.user-name-display').innerText = profile.name;
  document.querySelector('.user-roll-display').innerText = profile.rollNo;
  document.getElementById('profile-avatar').src = getAvatarSrc();
}
function updateNav() {
  document.querySelectorAll('.nav-btn').forEach((btn) => {
    const isActive = btn.getAttribute('data-page') === activePage;
    btn.classList.toggle('active-nav', isActive);
    btn.classList.toggle('text-neutral-400', !isActive);
    btn.classList.toggle('border-transparent', !isActive);
  });
}
function statCard(icon, count, label, className) {
  return `
    <div class="stat-card p-8 border border-neutral-200 group transition-all ${className}">
      <i data-lucide="${icon}" size="24" class="stat-icon mb-6 transition-transform"></i>
      <h3 class="text-5xl font-black mb-1 tracking-tighter">${count}</h3>
      <p class="text-[10px] font-bold uppercase tracking-widest opacity-60">${label}</p>
    </div>
  `;
}
function renderHome() {
  const latestNotifications = notifications.slice(0, 4);
  const quickLinks = [
    { title: 'Complete Profile', desc: 'Keep identity details verified', icon: 'user', target: 'profile' },
    { title: 'Browse Jobs', desc: 'Explore placement drives', icon: 'briefcase', target: 'jobs' },
    { title: 'Upload Resume', desc: 'Update your latest CV', icon: 'file-text', target: 'resume' },
    { title: 'Applied History', desc: 'Track your progress', icon: 'clipboard-check', target: 'applied' }
  ];
  return `
    <div class="animate-in">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        ${statCard('briefcase', jobPostings.length, 'Live Opportunities', 'bg-black text-white')}
        ${statCard('clipboard-check', appliedItems.length, 'Total Applications', 'bg-neutral-50')}
        ${statCard('clock-3', '02', 'Active Rounds', 'bg-neutral-50')}
      </div>
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div class="lg:col-span-2">
          <h2 class="text-[10px] font-black tracking-[0.3em] uppercase mb-8 flex items-center gap-2">
            <i data-lucide="zap" size="14" class="text-amber-500"></i>
            Fast Navigation
          </h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            ${quickLinks.map((item) => `
              <button onclick="switchPage('${item.target}')" class="quick-link flex items-center gap-6 p-6 border border-neutral-100 hover:border-black hover:bg-neutral-50 transition-all text-left group">
                <div class="quick-link-icon w-12 h-12 bg-neutral-100 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all">
                  <i data-lucide="${item.icon}" size="20"></i>
                </div>
                <div>
                  <h4 class="text-sm font-black uppercase tracking-tighter">${item.title}</h4>
                  <p class="text-[10px] font-bold text-neutral-400 uppercase">${item.desc}</p>
                </div>
                <i data-lucide="arrow-right" size="16" class="quick-link-arrow ml-auto opacity-0 transition-opacity"></i>
              </button>
            `).join('')}
          </div>
          <div class="mt-8 p-6 bg-neutral-50 border-l-4 border-green-500">
            <div class="flex items-center gap-4 flex-wrap">
              <i data-lucide="check-circle-2" size="20" class="text-green-500"></i>
              <div>
                <h4 class="text-[10px] font-black uppercase tracking-widest">Profile Compliance: 85%</h4>
                <p class="text-[9px] font-bold text-neutral-500 uppercase">Verification documents pending for TPO approval.</p>
              </div>
              <button onclick="switchPage('profile')" class="ml-auto text-[9px] font-black uppercase border-b border-black">Fix Now</button>
            </div>
          </div>
        </div>
        <div class="lg:col-span-1">
          <div class="flex justify-between items-center mb-8">
            <h2 class="text-[10px] font-black tracking-[0.3em] uppercase flex items-center gap-2">
              <i data-lucide="bell" size="14"></i>
              Notifications
            </h2>
            <button onclick="switchPage('notifications')" class="text-[9px] font-black uppercase text-neutral-400 hover:text-black">View All</button>
          </div>
          <div class="space-y-4">
            ${latestNotifications.map((note) => `
              <div class="p-5 border border-neutral-100 hover:border-neutral-200 transition-all">
                <div class="flex justify-between items-start mb-2 gap-3">
                  <span class="text-[8px] font-black px-2 py-0.5 uppercase ${note.type === 'Urgent' ? 'bg-red-100 text-red-600' : note.type === 'Alert' ? 'bg-amber-100 text-amber-600' : 'bg-neutral-100 text-neutral-500'}">${note.type}</span>
                  <span class="text-[8px] font-bold text-neutral-300 uppercase">${note.time}</span>
                </div>
                <h4 class="text-xs font-black uppercase tracking-tighter mb-1">${note.title}</h4>
                <p class="text-[10px] font-medium text-neutral-500 leading-relaxed line-clamp-2">${note.message}</p>
                ${note.link ? `<a href="${escapeHtml(note.link)}" target="_blank" rel="noopener noreferrer" class="inline-block mt-3 text-[9px] font-black uppercase border-b border-black tracking-widest">Open Link</a>` : ''}
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}
function renderNotifications() {
  return `
    <div class="animate-in">
      <div class="max-w-4xl space-y-6">
        ${notifications.map((note) => `
          <div class="p-8 border border-neutral-100 hover:border-black transition-all group relative">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 flex items-center justify-center ${note.type === 'Urgent' ? 'bg-red-50 text-red-600' : note.type === 'Alert' ? 'bg-amber-50 text-amber-600' : 'bg-neutral-50 text-neutral-600'}">
                  <i data-lucide="bell" size="20"></i>
                </div>
                <div>
                  <h3 class="text-lg font-black uppercase tracking-tighter">${note.title}</h3>
                  <p class="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">${note.time} · ${note.source || 'Portal'}</p>
                </div>
              </div>
              <span class="text-[9px] font-black px-4 py-1.5 uppercase ${note.type === 'Urgent' ? 'bg-red-600 text-white' : note.type === 'Alert' ? 'bg-amber-500 text-white' : 'bg-neutral-800 text-white'}">${note.type}</span>
            </div>
            <p class="text-sm text-neutral-600 leading-relaxed mb-8">${note.message}</p>
            <div class="flex gap-4 flex-wrap">
              <button class="text-[10px] font-black uppercase border-b-2 border-black tracking-widest">Mark as Read</button>
              ${note.link ? `<a href="${escapeHtml(note.link)}" target="_blank" rel="noopener noreferrer" class="text-[10px] font-black uppercase border-b-2 border-black tracking-widest">Open Link</a>` : ''}
              ${note.type === 'Urgent' ? '<button class="text-[10px] font-black uppercase border-b-2 border-red-600 text-red-600 tracking-widest">Action Required</button>' : ''}
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}
function jobCard(job) {
  const tag = job.type === 'Job'
    ? `<span class="text-[10px] font-black px-2 py-1 bg-black text-white uppercase">${job.lpa} LPA</span>`
    : `<span class="text-[10px] font-black px-2 py-1 border border-black uppercase">${job.stipend}</span>`;
  return `
    <div class="p-6 border border-neutral-200 hover:border-black transition-all group">
      <div class="flex justify-between items-start mb-4 gap-4">
        <div>
          <h3 class="text-xl font-black uppercase tracking-tighter">${job.company}</h3>
          <p class="text-xs font-bold text-neutral-400 uppercase">${job.role}</p>
        </div>
        ${tag}
      </div>
      <div class="space-y-2 mb-5 text-[10px] font-bold uppercase text-neutral-500 tracking-wide">
        <div class="flex items-center gap-2"><i data-lucide="map-pin" size="14"></i>${job.location}</div>
        <div class="flex items-center gap-2"><i data-lucide="calendar" size="14"></i>Deadline ${job.deadline}</div>
      </div>
      <p class="text-xs text-neutral-500 leading-relaxed mb-5">${job.description}</p>
      <button onclick="openApplyModal('${job.id}')" class="w-full py-3 border border-black text-[10px] font-black uppercase hover:bg-black hover:text-white transition-all">Apply Now</button>
    </div>
  `;
}
function renderJobs() {
  return `
    <div class="animate-in">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <h2 class="text-sm font-black uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
            <i data-lucide="briefcase" size="18"></i>
            Placement Drives
          </h2>
          <div class="space-y-6">
            ${jobPostings.filter((job) => job.type === 'Job').map(jobCard).join('')}
          </div>
        </div>
        <div>
          <h2 class="text-sm font-black uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
            <i data-lucide="layers" size="18"></i>
            Internship Offers
          </h2>
          <div class="space-y-6">
            ${jobPostings.filter((job) => job.type === 'Internship').map(jobCard).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}
function renderApplied() {
  return `
    <div class="animate-in">
      <div class="border border-neutral-200 overflow-hidden">
        <table class="w-full text-left">
          <thead>
            <tr class="bg-neutral-50 border-b border-neutral-200">
              <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Type</th>
              <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Company / Role</th>
              <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Current Status</th>
              <th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Action</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-neutral-100">
            ${appliedItems.length > 0 ? appliedItems.map((app) => `
              <tr class="hover:bg-neutral-50 transition-colors">
                <td class="px-6 py-6 font-black text-[9px] uppercase">${app.type}</td>
                <td class="px-6 py-6"><div class="font-black text-sm uppercase">${app.company}</div><div class="text-[10px] text-neutral-400 font-bold">${app.role}</div></td>
                <td class="px-6 py-6"><span class="text-[10px] font-black uppercase text-amber-600">${app.status}</span></td>
                <td class="px-6 py-6"><button onclick="viewAppliedRecord('${app.id}')" class="px-4 py-2 border border-neutral-300 text-[9px] font-black uppercase tracking-widest hover:border-black hover:text-black transition-all">View</button></td>
              </tr>
            `).join('') : `<tr><td colspan="4" class="px-6 py-20 text-center text-neutral-300 uppercase text-[10px] font-black tracking-widest">No applications yet</td></tr>`}
          </tbody>
        </table>
      </div>
    </div>
  `;
}
function renderDocumentsSection(pageId) {
  const isDocumentPage = pageId === 'resume';
  const sectionTitle = isDocumentPage ? 'Documents Vault' : 'Certificates Vault';
  const sectionDesc = isDocumentPage
    ? 'Manage your resume and uploaded proof documents from one place.'
    : 'Keep internship, skills, and other certificates ready for verification.';

  const cards = Object.entries(documentsData)
    .filter(([key]) => isDocumentPage ? true : key !== 'resume')
    .map(([key, doc]) => {
      const hasFile = Boolean(doc.fileUrl);
      return `
        <div class="doc-card p-6 border border-neutral-200 bg-white transition-all flex flex-col gap-5">
          <div class="flex items-start justify-between gap-4">
            <div class="flex items-center gap-4">
              <div class="doc-card-icon w-12 h-12 border border-neutral-200 bg-neutral-50 flex items-center justify-center transition-transform">
                <i data-lucide="${doc.icon}" size="20"></i>
              </div>
              <div>
                <h3 class="text-sm font-black uppercase tracking-tighter mb-1">${doc.title}</h3>
                <p class="text-[10px] font-bold uppercase text-neutral-400">${hasFile ? 'Uploaded' : 'No file uploaded yet'}</p>
              </div>
            </div>
          </div>

          <div class="border border-dashed border-neutral-200 p-4">
            <p class="text-xs text-neutral-500 leading-relaxed mb-3">${hasFile ? escapeHtml(doc.fileName) : 'Upload a document to keep it ready for placements and verification.'}</p>
            <div class="flex items-center gap-3 flex-wrap">
              <label class="inline-flex items-center justify-center px-4 py-2 border border-black bg-white text-[9px] font-black uppercase tracking-widest cursor-pointer hover:bg-black hover:text-white transition-all">
                Upload
                <input type="file" accept="${doc.accept}" data-doc-key="${key}" class="document-input hidden">
              </label>
              ${hasFile ? `<button onclick="viewDocument('${key}')" class="px-4 py-2 border border-neutral-300 text-[9px] font-black uppercase tracking-widest hover:border-black hover:text-black transition-all">View</button>` : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');

  return `
    <div class="animate-in">
      <div class="mb-10 max-w-3xl">
        <p class="text-[10px] font-black uppercase tracking-[0.3em] text-neutral-400 mb-3">${sectionTitle}</p>
        <h2 class="text-2xl font-black uppercase tracking-tighter mb-3">${isDocumentPage ? 'Student Documents' : 'Certificate Records'}</h2>
        <p class="text-sm text-neutral-500 leading-relaxed">${sectionDesc}</p>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl">
        ${cards}
      </div>
    </div>
  `;
}
function renderInputField(field, type) {
  return `
    <div class="border-b border-neutral-100 pb-2">
      <label class="block text-[9px] font-black uppercase text-neutral-400 mb-2 tracking-widest">${field.label}</label>
      <input type="${type || 'text'}" ${isEditing ? '' : 'disabled'} value="${escapeHtml(profile[field.key] || '')}" data-profile-key="${field.key}" class="profile-input w-full bg-transparent font-bold text-sm outline-none disabled:text-neutral-500" />
    </div>
  `;
}
function renderStudentImageCard() {
  const displayImage = profile.studentImage || DEMO_STUDENT_IMAGE;
  return `
    <div class="md:col-span-4">
      <div class="student-image-card">
        <label class="block text-[9px] font-black uppercase text-neutral-400 mb-2 tracking-widest">Student Image</label>
        <div class="student-image-frame mb-3">
          <img src="${displayImage}" alt="Student" class="student-photo-preview">
        </div>
        <label class="inline-flex items-center justify-center px-3 py-2 border border-black bg-white text-[9px] font-black uppercase tracking-widest cursor-pointer hover:bg-black hover:text-white transition-all ${isEditing ? '' : 'pointer-events-none opacity-50'}">
          Change Image
          <input type="file" accept="image/*" id="student-image-input" class="hidden" ${isEditing ? '' : 'disabled'} />
        </label>
      </div>
    </div>
  `;
}
function renderApplicationReadOnlyField(label, value) {
  return `
    <div class="border-b border-neutral-100 pb-2">
      <label class="block text-[9px] font-black uppercase text-neutral-400 mb-2 tracking-widest">${label}</label>
      <input type="text" value="${escapeHtml(value || '')}" disabled class="w-full bg-transparent font-bold text-sm outline-none disabled:text-neutral-500" />
    </div>
  `;
}
function renderApplicationInputField(label, key, type, value) {
  return `
    <div class="border-b border-neutral-100 pb-2">
      <label class="block text-[9px] font-black uppercase text-neutral-400 mb-2 tracking-widest">${label}</label>
      <input type="${type || 'text'}" value="${escapeHtml(value || '')}" data-application-key="${key}" class="application-input w-full bg-transparent font-bold text-sm outline-none" />
    </div>
  `;
}
function renderProfile() {
  const personalFields = [
    { label: 'Student Name', key: 'name' },
    { label: 'Date of Birth', key: 'dob', type: 'date' },
    { label: 'Mobile Number', key: 'mobile' },
    { label: 'Personal Email', key: 'personalEmail' },
    { label: 'College Email', key: 'collegeEmail' }
  ];
  const parentalFields = [
    { label: "Father's Name", key: 'fatherName' },
    { label: "Father's Mobile No", key: 'fatherMobile' },
    { label: "Mother's Name", key: 'motherName' },
    { label: "Mother's Mobile No", key: 'motherMobile' }
  ];
  const academicFields = [
    { label: 'Roll Number', key: 'rollNo' },
    { label: 'Class / Year', key: 'className' },
    { label: 'Section', key: 'section' }
  ];
  const idFields = [
    { label: 'ABC ID', key: 'abcId' },
    { label: 'Aadhaar Card Number', key: 'aadhaar' },
    { label: 'PAN Card Number', key: 'pan' }
  ];
  const uploadCards = [
    { label: 'Aadhaar Scan (Front/Back)', icon: 'credit-card' },
    { label: 'PAN Card Scan', icon: 'credit-card' },
    { label: 'Student Signature', icon: 'pen-tool' }
  ];
  return `
    <div class="animate-in">
      <div class="flex justify-between items-center mb-10 gap-4 flex-wrap">
        <h2 class="text-sm font-black uppercase tracking-[0.3em] text-neutral-400">Identity Details</h2>
        <button onclick="toggleEditProfile()" class="px-8 py-2 text-[10px] font-black uppercase tracking-widest border transition-all ${isEditing ? 'bg-black text-white border-black' : 'bg-white text-black border-neutral-300 hover:border-black'}">${isEditing ? 'Save Profile' : 'Edit Information'}</button>
      </div>
      <div class="space-y-12 pb-20">
        <section>
          <div class="flex items-center gap-3 mb-8">
            <i data-lucide="user" size="18" class="text-neutral-300"></i>
            <h3 class="text-[11px] font-black uppercase tracking-[0.2em]">Personal Information</h3>
            <div class="h-px bg-neutral-100 flex-grow"></div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            <div class="md:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              ${personalFields.map((field) => renderInputField(field, field.type)).join('')}
            </div>
            ${renderStudentImageCard()}
          </div>
        </section>
        <section>
          <div class="flex items-center gap-3 mb-8">
            <i data-lucide="users" size="18" class="text-neutral-300"></i>
            <h3 class="text-[11px] font-black uppercase tracking-[0.2em]">Parental Details</h3>
            <div class="h-px bg-neutral-100 flex-grow"></div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            ${parentalFields.map((field) => renderInputField(field)).join('')}
          </div>
        </section>
        <section>
          <div class="flex items-center gap-3 mb-8">
            <i data-lucide="award" size="18" class="text-neutral-300"></i>
            <h3 class="text-[11px] font-black uppercase tracking-[0.2em]">Academic Records</h3>
            <div class="h-px bg-neutral-100 flex-grow"></div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            ${academicFields.map((field) => renderInputField(field)).join('')}
          </div>
        </section>
        <section>
          <div class="flex items-center gap-3 mb-8">
            <i data-lucide="fingerprint" size="18" class="text-neutral-300"></i>
            <h3 class="text-[11px] font-black uppercase tracking-[0.2em]">Government IDs</h3>
            <div class="h-px bg-neutral-100 flex-grow"></div>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            ${idFields.map((field) => renderInputField(field)).join('')}
          </div>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            ${uploadCards.map((doc) => `
              <div class="doc-card p-6 border border-dashed border-neutral-200 hover:border-black transition-all flex flex-col items-center justify-center text-center group">
                <i data-lucide="${doc.icon}" size="20" class="doc-card-icon mb-4 text-neutral-300 group-hover:text-black transition-transform"></i>
                <p class="text-[10px] font-black uppercase mb-4 tracking-tighter">${doc.label}</p>
                <label class="px-4 py-2 bg-neutral-100 text-[9px] font-black uppercase tracking-widest cursor-pointer hover:bg-black hover:text-white transition-all">
                  Upload Image
                  <input type="file" class="hidden" />
                </label>
              </div>
            `).join('')}
          </div>
        </section>
      </div>
    </div>
  `;
}
function renderModal() {
  const modalContainer = document.getElementById('modal-container');
  if (selectedApplicationRecord) {
    modalContainer.className = '';
    modalContainer.innerHTML = `
      <div class="modal-backdrop fixed inset-0 z-[100] flex items-center justify-center p-6">
        <div class="bg-white w-full max-w-5xl p-8 md:p-10 relative animate-in max-h-[90vh] overflow-y-auto">
          <button onclick="closeAppliedRecordView()" class="absolute top-6 right-6"><i data-lucide="x" size="24"></i></button>
          <div class="mb-8 pr-10">
            <p class="text-[10px] font-black uppercase tracking-[0.24em] text-neutral-400 mb-2">Submitted Application</p>
            <h2 class="text-3xl font-black uppercase tracking-tighter">${selectedApplicationRecord.company}</h2>
            <p class="text-sm text-neutral-500 mt-3">Submitted on ${selectedApplicationRecord.appliedDate} with status ${selectedApplicationRecord.status}.</p>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-8">
            <section>
              <h3 class="text-[11px] font-black uppercase tracking-[0.2em] mb-5">Opportunity Details</h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                ${renderApplicationReadOnlyField('Company', selectedApplicationRecord.company)}
                ${renderApplicationReadOnlyField('Location', selectedApplicationRecord.location)}
                ${renderApplicationReadOnlyField('Package', selectedApplicationRecord.packageValue)}
                ${renderApplicationReadOnlyField('Role', selectedApplicationRecord.role)}
              </div>
            </section>

            <section>
              <h3 class="text-[11px] font-black uppercase tracking-[0.2em] mb-5">Student Details</h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                ${renderApplicationReadOnlyField('Student Name', selectedApplicationRecord.studentName)}
                ${renderApplicationReadOnlyField('Roll No', selectedApplicationRecord.rollNo)}
                ${renderApplicationReadOnlyField('Date of Birth', selectedApplicationRecord.dob)}
                ${renderApplicationReadOnlyField('Mobile Number', selectedApplicationRecord.mobile)}
                ${renderApplicationReadOnlyField('College Email', selectedApplicationRecord.collegeEmail)}
              </div>
            </section>

            <section>
              <h3 class="text-[11px] font-black uppercase tracking-[0.2em] mb-5">Academic Details</h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                ${renderApplicationReadOnlyField('10th Marks (%)', selectedApplicationRecord.tenthMarks)}
                ${renderApplicationReadOnlyField('12th Marks (%)', selectedApplicationRecord.twelfthMarks)}
                ${renderApplicationReadOnlyField('Graduation Marks (%)', selectedApplicationRecord.graduationMarks)}
                ${renderApplicationReadOnlyField('Post Graduation Marks (%)', selectedApplicationRecord.postGraduationMarks || 'N/A')}
              </div>
            </section>

            <section>
              <h3 class="text-[11px] font-black uppercase tracking-[0.2em] mb-5">Submitted Resume & Notes</h3>
              <div class="border border-neutral-200 p-5 mb-6">
                <p class="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-400 mb-3">Resume</p>
                <div class="flex items-center gap-3 flex-wrap">
                  ${selectedApplicationRecord.resumeUrl ? `<button onclick="viewAppliedResume('${selectedApplicationRecord.id}')" class="px-4 py-2 border border-neutral-300 text-[9px] font-black uppercase tracking-widest hover:border-black hover:text-black transition-all">View Resume</button>` : '<span class="text-xs text-neutral-500">No resume attached</span>'}
                </div>
                <p class="text-xs text-neutral-500 mt-3">${escapeHtml(selectedApplicationRecord.resumeName || 'No resume attached')}</p>
              </div>
              <div class="border-b border-neutral-100 pb-2">
                <label class="block text-[9px] font-black uppercase text-neutral-400 mb-2 tracking-widest">Other Required Details</label>
                <div class="text-sm font-bold text-neutral-700 min-h-[100px] whitespace-pre-wrap">${escapeHtml(selectedApplicationRecord.additionalInfo || 'No additional details submitted.')}</div>
              </div>
            </section>
          </div>
        </div>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  if (selectedDocumentKey) {
    const doc = documentsData[selectedDocumentKey];
    if (!doc || !doc.fileUrl) {
      selectedDocumentKey = null;
      modalContainer.className = 'hidden';
      modalContainer.innerHTML = '';
      return;
    }

    const isImage = doc.fileType.startsWith('image/');
    const isPdf = doc.fileType === 'application/pdf';
    const previewContent = isImage
      ? `<img src="${doc.fileUrl}" alt="${escapeHtml(doc.title)}" class="document-preview-image w-full h-full object-contain">`
      : isPdf
        ? `<iframe src="${doc.fileUrl}" class="w-full h-[70vh] border border-neutral-200" title="${escapeHtml(doc.title)} preview"></iframe>`
        : `<div class="py-16 text-center border border-dashed border-neutral-200">
             <p class="text-sm font-black uppercase tracking-widest mb-3">Preview Not Available</p>
             <p class="text-xs text-neutral-500 mb-6">This file type opens best after download.</p>
             <a href="${doc.fileUrl}" download="${escapeHtml(doc.fileName)}" class="inline-flex items-center justify-center px-4 py-2 border border-black bg-white text-[10px] font-black uppercase tracking-widest hover:bg-black hover:text-white transition-all">Download File</a>
           </div>`;

    modalContainer.className = '';
    modalContainer.innerHTML = `
      <div class="modal-backdrop fixed inset-0 z-[100] flex items-center justify-center p-6">
        <div class="bg-white w-full max-w-5xl p-8 relative animate-in">
          <button onclick="closeDocumentPreview()" class="absolute top-6 right-6"><i data-lucide="x" size="24"></i></button>
          <div class="mb-6 pr-10">
            <p class="text-[10px] font-black uppercase tracking-[0.24em] text-neutral-400 mb-2">Document Preview</p>
            <h2 class="text-2xl font-black uppercase tracking-tighter">${doc.title}</h2>
            <p class="text-xs text-neutral-500 mt-2">${escapeHtml(doc.fileName)}</p>
          </div>
          ${previewContent}
        </div>
      </div>
    `;
    lucide.createIcons();
    return;
  }

  if (!selectedJob) {
    modalContainer.className = 'hidden';
    modalContainer.innerHTML = '';
    return;
  }

  const formResumeLabel = applicationDraft && applicationDraft.resumeName
    ? escapeHtml(applicationDraft.resumeName)
    : 'No resume selected';

  modalContainer.className = '';
  modalContainer.innerHTML = `
    <div class="modal-backdrop fixed inset-0 z-[100] flex items-center justify-center p-6">
      <div class="bg-white w-full max-w-5xl p-8 md:p-10 relative animate-in max-h-[90vh] overflow-y-auto">
        <button onclick="closeApplyModal()" class="absolute top-6 right-6"><i data-lucide="x" size="24"></i></button>
        <div class="mb-8 pr-10">
          <p class="text-[10px] font-black uppercase tracking-[0.24em] text-neutral-400 mb-2">Application Form</p>
          <h2 class="text-3xl font-black uppercase tracking-tighter">${selectedJob.company} Application</h2>
          <p class="text-sm text-neutral-500 mt-3">Fill the required academic and resume details. Company and student basics are already prefilled.</p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-8 mb-10">
          <div class="space-y-8">
            <section>
              <h3 class="text-[11px] font-black uppercase tracking-[0.2em] mb-5">Opportunity Details</h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                ${renderApplicationReadOnlyField('Company', applicationDraft.company)}
                ${renderApplicationReadOnlyField('Location', applicationDraft.location)}
                ${renderApplicationReadOnlyField('Package', applicationDraft.packageValue)}
                ${renderApplicationReadOnlyField('Role', applicationDraft.role)}
              </div>
            </section>

            <section>
              <h3 class="text-[11px] font-black uppercase tracking-[0.2em] mb-5">Student Details</h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                ${renderApplicationReadOnlyField('Student Name', applicationDraft.studentName)}
                ${renderApplicationReadOnlyField('Roll No', applicationDraft.rollNo)}
                ${renderApplicationInputField('Date of Birth', 'dob', 'date', applicationDraft.dob)}
                ${renderApplicationInputField('Mobile Number', 'mobile', 'text', applicationDraft.mobile)}
                ${renderApplicationInputField('College Email', 'collegeEmail', 'email', applicationDraft.collegeEmail)}
              </div>
            </section>
          </div>

          <div class="space-y-8">
            <section>
              <h3 class="text-[11px] font-black uppercase tracking-[0.2em] mb-5">Academic Details</h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                ${renderApplicationInputField('10th Marks (%)', 'tenthMarks', 'number', applicationDraft.tenthMarks)}
                ${renderApplicationInputField('12th Marks (%)', 'twelfthMarks', 'number', applicationDraft.twelfthMarks)}
                ${renderApplicationInputField('Graduation Marks (%)', 'graduationMarks', 'number', applicationDraft.graduationMarks)}
                ${renderApplicationInputField('Post Graduation Marks (%)', 'postGraduationMarks', 'number', applicationDraft.postGraduationMarks)}
              </div>
            </section>

            <section>
              <h3 class="text-[11px] font-black uppercase tracking-[0.2em] mb-5">Required Documents</h3>
              <div class="border border-neutral-200 p-5">
                <p class="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-400 mb-3">Resume Upload</p>
                <div class="flex items-center gap-3 flex-wrap">
                  <label class="inline-flex items-center justify-center px-4 py-2 border border-black bg-white text-[9px] font-black uppercase tracking-widest cursor-pointer hover:bg-black hover:text-white transition-all">
                    Upload Resume
                    <input type="file" accept=".pdf,.doc,.docx,image/*" id="application-resume-input" class="hidden">
                  </label>
                  ${applicationDraft.resumeUrl ? `<button onclick="viewApplicationResume()" class="px-4 py-2 border border-neutral-300 text-[9px] font-black uppercase tracking-widest hover:border-black hover:text-black transition-all">View Resume</button>` : ''}
                </div>
                <p class="text-xs text-neutral-500 mt-3">${formResumeLabel}</p>
              </div>
            </section>

            <section>
              <div class="border-b border-neutral-100 pb-2">
                <label class="block text-[9px] font-black uppercase text-neutral-400 mb-2 tracking-widest">Other Required Details</label>
                <textarea id="application-additionalInfo" class="w-full min-h-[120px] bg-transparent font-bold text-sm outline-none resize-none" placeholder="Add backlog status, projects, achievements, or any other details required for this opportunity.">${escapeHtml(applicationDraft.additionalInfo || '')}</textarea>
              </div>
            </section>
          </div>
        </div>

        <button onclick="handleApply()" class="w-full bg-black text-white py-4 text-[10px] font-black uppercase tracking-[0.2em]">Submit Application</button>
      </div>
    </div>
  `;
  bindApplicationForm();
  lucide.createIcons();
}
function bindProfileInputs() {
  document.querySelectorAll('.profile-input').forEach((input) => {
    input.addEventListener('input', (event) => {
      profile[event.target.dataset.profileKey] = event.target.value;
      updateHeader();
      persistSession();
    });
  });
  const imageInput = document.getElementById('student-image-input');
  if (imageInput) {
    imageInput.addEventListener('change', handleStudentImageUpload);
  }

  document.querySelectorAll('.document-input').forEach((input) => {
    input.addEventListener('change', handleDocumentUpload);
  });
}
function bindStaticEvents() {
  const logoutButton = document.getElementById('logout-btn');
  if (logoutButton) {
    logoutButton.onclick = logoutToLogin;
  }
}
function bindApplicationForm() {
  document.querySelectorAll('.application-input').forEach((input) => {
    input.addEventListener('input', (event) => {
      if (!applicationDraft) {
        return;
      }
      applicationDraft[event.target.dataset.applicationKey] = event.target.value;
    });
  });

  const additionalInfo = document.getElementById('application-additionalInfo');
  if (additionalInfo) {
    additionalInfo.addEventListener('input', (event) => {
      if (!applicationDraft) {
        return;
      }
      applicationDraft.additionalInfo = event.target.value;
    });
  }

  const resumeInput = document.getElementById('application-resume-input');
  if (resumeInput) {
    resumeInput.addEventListener('change', handleApplicationResumeUpload);
  }
}
function handleStudentImageUpload(event) {
  const file = event.target.files[0];
  if (!file) {
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    profile.studentImage = reader.result;
    persistSession();
    updateHeader();
    renderContent();
  };
  reader.readAsDataURL(file);
}
function handleDocumentUpload(event) {
  const file = event.target.files[0];
  const docKey = event.target.dataset.docKey;
  if (!file || !docKey || !documentsData[docKey]) {
    return;
  }
  const existingUrl = documentsData[docKey].fileUrl;
  if (existingUrl && existingUrl.startsWith('blob:')) {
    URL.revokeObjectURL(existingUrl);
  }

  documentsData[docKey].fileName = file.name;
  documentsData[docKey].fileType = file.type || '';
  documentsData[docKey].fileUrl = URL.createObjectURL(file);
  renderContent();
}
function handleApplicationResumeUpload(event) {
  const file = event.target.files[0];
  if (!file || !applicationDraft) {
    return;
  }

  if (applicationDraft.resumeUrl && applicationDraft.resumeUrl.startsWith('blob:')) {
    URL.revokeObjectURL(applicationDraft.resumeUrl);
  }

  applicationDraft.resumeName = file.name;
  applicationDraft.resumeType = file.type || '';
  applicationDraft.resumeUrl = URL.createObjectURL(file);
  renderModal();
}
function viewDocument(docKey) {
  const doc = documentsData[docKey];
  if (!doc || !doc.fileUrl) {
    return;
  }
  selectedDocumentKey = docKey;
  renderModal();
}
function closeDocumentPreview() {
  selectedDocumentKey = null;
  renderModal();
}
function viewApplicationResume() {
  if (!applicationDraft || !applicationDraft.resumeUrl) {
    return;
  }

  const tempKey = '__applicationResume';
  documentsData[tempKey] = {
    title: 'Application Resume',
    fileName: applicationDraft.resumeName,
    fileUrl: applicationDraft.resumeUrl,
    fileType: applicationDraft.resumeType || ''
  };
  selectedDocumentKey = tempKey;
  renderModal();
}
function viewAppliedRecord(recordId) {
  selectedApplicationRecord = appliedItems.find((item) => item.id === recordId) || null;
  renderModal();
}
function closeAppliedRecordView() {
  selectedApplicationRecord = null;
  renderModal();
}
function viewAppliedResume(recordId) {
  const record = appliedItems.find((item) => item.id === recordId);
  if (!record || !record.resumeUrl) {
    return;
  }

  const tempKey = '__appliedResume';
  documentsData[tempKey] = {
    title: `${record.company} Resume`,
    fileName: record.resumeName || 'Submitted Resume',
    fileUrl: record.resumeUrl,
    fileType: record.resumeType || ''
  };
  selectedDocumentKey = tempKey;
  renderModal();
}
function renderContent() {
  const container = document.getElementById('content-area');
  refreshNotifications();
  if (activePage === 'home') {
    container.innerHTML = renderHome();
  } else if (activePage === 'notifications') {
    container.innerHTML = renderNotifications();
  } else if (activePage === 'jobs') {
    container.innerHTML = renderJobs();
  } else if (activePage === 'applied') {
    container.innerHTML = renderApplied();
  } else if (activePage === 'profile') {
    container.innerHTML = renderProfile();
  } else if (activePage === 'certs' || activePage === 'resume') {
    container.innerHTML = renderDocumentsSection(activePage);
  }
  bindProfileInputs();
  bindStaticEvents();
  renderModal();
  lucide.createIcons();
}
function switchPage(pageId) {
  activePage = pageId;
  updateNav();
  updateHeader();
  renderContent();
}
function toggleEditProfile() {
  isEditing = !isEditing;
  if (!isEditing) {
    persistSession();
  }
  renderContent();
}
function openApplyModal(jobId) {
  selectedJob = jobPostings.find((job) => job.id === jobId) || null;
  applicationDraft = selectedJob ? createApplicationDraft(selectedJob) : null;
  renderModal();
}
function closeApplyModal() {
  if (applicationDraft && applicationDraft.resumeUrl && applicationDraft.resumeUrl.startsWith('blob:') && applicationDraft.resumeUrl !== documentsData.resume.fileUrl) {
    URL.revokeObjectURL(applicationDraft.resumeUrl);
  }
  selectedJob = null;
  applicationDraft = null;
  renderModal();
}
function handleApply() {
  if (!selectedJob || !applicationDraft) {
    return;
  }
  const requiredFields = ['dob', 'mobile', 'collegeEmail', 'tenthMarks', 'twelfthMarks', 'graduationMarks', 'resumeUrl'];
  const missingRequired = requiredFields.some((key) => !applicationDraft[key]);
  if (missingRequired) {
    alert('Please complete all required fields and upload your resume before submitting.');
    return;
  }
  const alreadyApplied = appliedItems.some((item) => item.id === selectedJob.id);
  if (!alreadyApplied) {
    appliedItems.unshift({
      id: selectedJob.id,
      company: selectedJob.company,
      role: selectedJob.role,
      type: selectedJob.type,
      status: 'Pending Review',
      appliedDate: new Date().toLocaleDateString(),
      location: selectedJob.location,
      packageValue: applicationDraft.packageValue,
      studentName: applicationDraft.studentName,
      rollNo: applicationDraft.rollNo,
      dob: applicationDraft.dob,
      mobile: applicationDraft.mobile,
      collegeEmail: applicationDraft.collegeEmail,
      tenthMarks: applicationDraft.tenthMarks,
      twelfthMarks: applicationDraft.twelfthMarks,
      graduationMarks: applicationDraft.graduationMarks,
      postGraduationMarks: applicationDraft.postGraduationMarks,
      resumeName: applicationDraft.resumeName,
      resumeUrl: applicationDraft.resumeUrl,
      resumeType: applicationDraft.resumeType || '',
      additionalInfo: applicationDraft.additionalInfo
    });
  }
  if (applicationDraft.resumeUrl && applicationDraft.resumeUrl.startsWith('blob:') && applicationDraft.resumeUrl !== documentsData.resume.fileUrl) {
    documentsData.resume.fileName = applicationDraft.resumeName;
    documentsData.resume.fileUrl = applicationDraft.resumeUrl;
    documentsData.resume.fileType = applicationDraft.resumeType || '';
  }
  selectedJob = null;
  applicationDraft = null;
  activePage = 'applied';
  updateNav();
  updateHeader();
  renderContent();
}
function logoutToLogin() {
  localStorage.removeItem('placeProSession');
  localStorage.removeItem('loggedInUser');
  window.location.href = 'login.html';
}
window.switchPage = switchPage;
window.toggleEditProfile = toggleEditProfile;
window.openApplyModal = openApplyModal;
window.closeApplyModal = closeApplyModal;
window.handleApply = handleApply;
window.viewDocument = viewDocument;
window.closeDocumentPreview = closeDocumentPreview;
window.viewApplicationResume = viewApplicationResume;
window.viewAppliedRecord = viewAppliedRecord;
window.closeAppliedRecordView = closeAppliedRecordView;
window.viewAppliedResume = viewAppliedResume;
window.onload = () => {
  if (!requireStudentSession()) {
    return;
  }
  bindStaticEvents();
  updateHeader();
  switchPage('home');
};
