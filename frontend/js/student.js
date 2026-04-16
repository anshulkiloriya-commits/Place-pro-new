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
  rollNo: session?.studentId || '',
  mobile: '',
  fatherName: '',
  fatherMobile: '',
  motherName: '',
  motherMobile: '',
  personalEmail: session?.email || '',
  collegeEmail: session?.email || '',
  dob: '',
  className: '',
  section: '',
  abcId: '',
  aadhaar: '',
  pan: '',
  signature: null,
  studentImage: session?.photo || ''
};
const appliedItems = [];
const documentsData = {
  // These cards appear in the student "Documents" section.
  resume: { title: 'Resume', icon: 'file-text', accept: '.pdf,.doc,.docx,image/*', category: 'documents', fileName: '', fileUrl: '', fileType: '' },
  tenthMarksheet: { title: '10th Marksheet', icon: 'graduation-cap', accept: '.pdf,image/*', category: 'documents', fileName: '', fileUrl: '', fileType: '' },
  twelfthMarksheet: { title: '12th Marksheet', icon: 'book-open-check', accept: '.pdf,image/*', category: 'documents', fileName: '', fileUrl: '', fileType: '' },
  prd: { title: 'PRD Form', icon: 'shield-check', accept: '.pdf,image/*', category: 'documents', fileName: '', fileUrl: '', fileType: '' },
  // These cards stay grouped under the certificates page.
  internshipCertificates: { title: 'Internship Certificates', icon: 'briefcase-business', accept: '.pdf,image/*', category: 'certificates', showOnDocumentsPage: true, fileName: '', fileUrl: '', fileType: '' },
  skillCertificates: { title: 'Skills Certificates', icon: 'badge-check', accept: '.pdf,image/*', category: 'certificates', fileName: '', fileUrl: '', fileType: '' },
  otherCertificates: { title: 'Other Certificates', icon: 'folder-open', accept: '.pdf,image/*', category: 'certificates', fileName: '', fileUrl: '', fileType: '' }
};
let jobPostings = [
  { id: 'j1', type: 'Job', company: 'Google', role: 'Software Engineer', lpa: '32.5', location: 'Bangalore', deadline: '2025-05-10', description: 'Working on cloud infrastructure and scalable services.' },
  { id: 'j2', type: 'Job', company: 'Microsoft', role: 'Full Stack Dev', lpa: '28.0', location: 'Hyderabad', deadline: '2025-05-15', description: 'Azure integration and modern web technologies.' },
  { id: 'i1', type: 'Internship', company: 'Amazon', role: 'SDE Intern', stipend: '80,000/mo', duration: '6 Months', location: 'Remote', deadline: '2025-04-30', description: 'Summer internship focused on supply chain optimization.' },
  { id: 'i2', type: 'Internship', company: 'Adobe', role: 'Product Intern', stipend: '65,000/mo', duration: '3 Months', location: 'Noida', deadline: '2025-05-05', description: 'UI/UX design and product management research.' }
];
function getSession() {
  try {
    // Read the logged-in user details saved during login.
    const raw = localStorage.getItem('placeProSession');
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
}
function refreshNotifications() {
  notifications = notifications.length > 0 ? notifications : defaultNotifications;
}
function requireStudentSession() {
  // Only students should open the student dashboard.
  if (!session || String(session.role || '').toLowerCase() !== 'student') {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}
function persistSession() {
  if (!session) {
    return;
  }
  // Keep the browser session aligned with the latest student profile values.
  const updatedSession = {
    ...session,
    studentId: profile.rollNo || session.studentId || null,
    name: profile.name,
    email: profile.personalEmail || profile.collegeEmail,
    photo: profile.studentImage || session.photo || ''
  };
  session.studentId = updatedSession.studentId;
  session.name = updatedSession.name;
  session.email = updatedSession.email;
  session.photo = updatedSession.photo;
  localStorage.setItem('loggedInUser', updatedSession.name);
  localStorage.setItem('placeProSession', JSON.stringify(updatedSession));
}
// Preserve student profile data so the other dashboards can still read it locally.
function syncStudentProfileToStorage() {
  localStorage.setItem('placeProStudentProfile', JSON.stringify(profile));
}
// Preserve uploaded document metadata for the existing admin/recruiter views.
function syncDocumentsToStorage() {
  const documentsForStorage = Object.fromEntries(
    Object.entries(documentsData).map(([key, value]) => ([key, { ...value, key }]))
  );
  localStorage.setItem('placeProStudentDocuments', JSON.stringify(documentsForStorage));
}
// Preserve application data for the existing admin/recruiter views.
function syncApplicationsToStorage() {
  localStorage.setItem('placeProApplications', JSON.stringify(appliedItems));
}
function closeStudentSidebar() {
  document.body.classList.remove('nav-open');
  const toggleButton = document.getElementById('sidebar-toggle');
  if (toggleButton) {
    toggleButton.setAttribute('aria-expanded', 'false');
  }
}
function toggleStudentSidebar() {
  const isOpen = document.body.classList.toggle('nav-open');
  const toggleButton = document.getElementById('sidebar-toggle');
  if (toggleButton) {
    toggleButton.setAttribute('aria-expanded', String(isOpen));
  }
}
function mapOpportunityForStudent(opportunity) {
  return {
    id: String(opportunity.id),
    type: opportunity.type,
    company: opportunity.company,
    role: opportunity.role,
    location: opportunity.location,
    deadline: opportunity.deadline,
    description: opportunity.description,
    lpa: opportunity.type === 'Job' ? opportunity.packageValue : '',
    stipend: opportunity.type === 'Internship' ? opportunity.packageValue : '',
    packageValue: opportunity.packageValue
  };
}
function applyDocumentsFromBackend(documentList) {
  Object.values(documentsData).forEach((document) => {
    document.fileName = '';
    document.fileUrl = '';
    document.fileType = '';
  });

  (documentList || []).forEach((document) => {
    const documentType = document.documentType || document.key;
    if (!documentsData[documentType]) {
      return;
    }
    documentsData[documentType].fileName = document.fileName || '';
    documentsData[documentType].fileUrl = document.fileUrl || '';
    documentsData[documentType].fileType = document.mimeType || document.fileType || '';
  });
  syncDocumentsToStorage();
}
function applyApplicationsFromBackend(records) {
  appliedItems.splice(0, appliedItems.length, ...records.map((record) => ({
    id: String(record.id),
    opportunityId: record.opportunityId,
    company: record.company,
    role: record.role,
    type: 'Opportunity',
    status: record.status,
    appliedDate: record.appliedAt ? new Date(record.appliedAt).toLocaleDateString() : '',
    location: record.location,
    packageValue: record.packageValue,
    studentName: record.studentName,
    rollNo: record.studentId || record.rollNo,
    dob: record.dob,
    mobile: record.mobile,
    collegeEmail: record.collegeEmail,
    tenthMarks: record.tenthMarks,
    twelfthMarks: record.twelfthMarks,
    graduationMarks: record.graduationMarks,
    postGraduationMarks: record.postGraduationMarks,
    resumeName: record.resumeName,
    resumeUrl: record.resumeUrl,
    resumeType: record.resumeType || '',
    additionalInfo: record.additionalInfo
  })));
  syncApplicationsToStorage();
}
async function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Unable to read selected file'));
    reader.readAsDataURL(file);
  });
}
async function loadStudentDashboardData() {
  try {
    const [updates, opportunities, applications, documents] = await Promise.all([
      fetchPortalUpdates(),
      fetchOpportunities(),
      session?.studentId ? fetchStudentApplications(session.studentId) : Promise.resolve([]),
      session?.studentId ? fetchStudentDocuments(session.studentId) : Promise.resolve([])
    ]);

    notifications = updates.length > 0 ? updates : defaultNotifications;
    safeWriteStorage('placeProUpdates', updates);
    jobPostings = opportunities.map(mapOpportunityForStudent);
    safeWriteStorage('placeProOpportunities', opportunities);
    applyApplicationsFromBackend(applications);
    applyDocumentsFromBackend(documents);
  } catch (error) {
    const storedUpdates = safeReadStorage('placeProUpdates', []);
    notifications = storedUpdates.length > 0 ? storedUpdates : defaultNotifications;
    const storedOpportunities = safeReadStorage('placeProOpportunities', []);
    jobPostings = storedOpportunities.length > 0 ? storedOpportunities.map(mapOpportunityForStudent) : jobPostings;
    applyApplicationsFromBackend(safeReadStorage('placeProApplications', []));
    applyDocumentsFromBackend(Object.values(safeReadStorage('placeProStudentDocuments', {})));
  }
}
function applyStudentProfile(student) {
  if (!student) {
    return;
  }

  // Map backend student fields into the frontend profile object.
  // Left side = frontend field used by the page.
  // Right side = field name returned by Spring Boot.
  profile.rollNo = student.enrollmentNo || profile.rollNo;
  profile.name = student.fullName || profile.name;
  profile.mobile = student.mobile || profile.mobile;
  profile.personalEmail = student.personalEmail || profile.personalEmail;
  profile.collegeEmail = student.collegeEmail || profile.collegeEmail;
  profile.dob = student.dob || profile.dob;
  profile.fatherName = student.fatherName || profile.fatherName;
  profile.fatherMobile = student.fatherMobile || profile.fatherMobile;
  profile.motherName = student.motherName || profile.motherName;
  profile.motherMobile = student.motherMobile || profile.motherMobile;
  profile.className = student.className || profile.className;
  profile.section = student.section || profile.section;
  profile.abcId = student.abcId || profile.abcId;
  profile.aadhaar = student.aadharNo || profile.aadhaar;
  profile.pan = student.panNo || profile.pan;
  profile.studentImage = student.studentImage || profile.studentImage;

  if (student.enrollmentNo) {
    session.studentId = student.enrollmentNo;
  }

  persistSession();
  syncStudentProfileToStorage();
}
function createStudentPayload() {
  // Map frontend form fields back into the backend Student entity shape.
  return {
    enrollmentNo: profile.rollNo,
    fullName: profile.name || 'Not Provided',
    personalEmail: profile.personalEmail || null,
    collegeEmail: profile.collegeEmail || null,
    mobile: profile.mobile || null,
    dob: profile.dob || null,
    fatherName: profile.fatherName || null,
    fatherMobile: profile.fatherMobile || null,
    motherName: profile.motherName || null,
    motherMobile: profile.motherMobile || null,
    className: profile.className || null,
    section: profile.section || null,
    abcId: profile.abcId || null,
    aadharNo: profile.aadhaar || null,
    panNo: profile.pan || null,
    studentImage: profile.studentImage || null
  };
}
async function loadStudentProfile() {
  if (!session?.studentId) {
    // If we do not know the student id yet, skip backend loading for now.
    syncStudentProfileToStorage();
    return;
  }

  try {
    // Load the student profile after login using the student id from session.
    const student = await placeProApi(`/api/students/${encodeURIComponent(session.studentId)}`);
    applyStudentProfile(student);
  } catch (error) {
    console.error('Unable to load student profile', error);
    syncStudentProfileToStorage();
  }
}
async function saveStudentProfile() {
  if (!profile.rollNo) {
    alert('Student roll number is required to save profile.');
    return false;
  }
  if (!/^[0-9]{4}[A-Z]{2}[0-9]{6}$/.test(profile.rollNo)) {
    alert('Student ID must match format 0801CA251022.');
    return false;
  }
  if (profile.mobile && !/^[0-9]{10}$/.test(profile.mobile)) {
    alert('Phone number must be exactly 10 digits.');
    return false;
  }
  if (profile.fatherMobile && !/^[0-9]{10}$/.test(profile.fatherMobile)) {
    alert("Father's mobile number must be exactly 10 digits.");
    return false;
  }
  if (profile.motherMobile && !/^[0-9]{10}$/.test(profile.motherMobile)) {
    alert("Mother's mobile number must be exactly 10 digits.");
    return false;
  }
  if (profile.abcId && !/^[0-9]{12}$/.test(profile.abcId)) {
    alert('ABC ID must be exactly 12 digits.');
    return false;
  }
  if (profile.aadhaar && !/^[0-9]{12}$/.test(profile.aadhaar)) {
    alert('Aadhaar number must be exactly 12 digits.');
    return false;
  }
  if (profile.pan && !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(profile.pan)) {
    alert('PAN number must be in format ABCDE1234F.');
    return false;
  }
  if (!profile.collegeEmail && !profile.personalEmail) {
    alert('Please provide at least one email address in the profile.');
    return false;
  }

  try {
    // Save profile edits back to the Spring Boot API.
    const savedProfile = await placeProApi(`/api/students/${encodeURIComponent(profile.rollNo)}`, {
      method: 'PUT',
      // Send the full edited profile in backend format.
      body: JSON.stringify(createStudentPayload())
    });
    applyStudentProfile(savedProfile);
    return true;
  } catch (error) {
    alert(error.message || 'Unable to save profile right now.');
    return false;
  }
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
  const mobileAvatar = document.getElementById('mobile-profile-avatar');
  if (mobileAvatar) {
    mobileAvatar.src = getAvatarSrc();
  }
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
    ? 'Manage your resume, marksheets, PRD, and uploaded proof documents from one place.'
    : 'Keep internship, skills, and other certificates ready for verification.';

  const cards = Object.entries(documentsData)
    .filter(([, doc]) => (
      isDocumentPage
        ? doc.category === 'documents' || doc.showOnDocumentsPage
        : doc.category === 'certificates'
    ))
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
      // Update the in-memory profile immediately while the user types.
      profile[event.target.dataset.profileKey] = event.target.value;
      updateHeader();
      persistSession();
      syncStudentProfileToStorage();
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
  const toggleButton = document.getElementById('sidebar-toggle');
  if (toggleButton) {
    toggleButton.onclick = toggleStudentSidebar;
    toggleButton.setAttribute('aria-expanded', String(document.body.classList.contains('nav-open')));
  }
  const overlay = document.getElementById('sidebar-overlay');
  if (overlay) {
    overlay.onclick = closeStudentSidebar;
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
    // Save the selected image as a base64 data URL for preview/storage.
    profile.studentImage = reader.result;
    persistSession();
    syncStudentProfileToStorage();
    updateHeader();
    renderContent();
  };
  reader.readAsDataURL(file);
}
async function handleDocumentUpload(event) {
  const file = event.target.files[0];
  const docKey = event.target.dataset.docKey;
  if (!file || !docKey || !documentsData[docKey]) {
    return;
  }
  if (file.size > 1024 * 1024) {
    alert('Document size must be 1MB or less.');
    event.target.value = '';
    return;
  }
  if (!profile.rollNo) {
    alert('Please save your profile with a student ID before uploading documents.');
    event.target.value = '';
    return;
  }

  try {
    const fileDataUrl = await readFileAsDataUrl(file);
    const saved = await saveStudentDocument(profile.rollNo, {
      documentType: docKey,
      fileName: file.name,
      fileDataUrl,
      mimeType: file.type || 'application/octet-stream',
      fileSizeBytes: file.size
    });
    documentsData[docKey].fileName = saved.fileName;
    documentsData[docKey].fileType = saved.mimeType || '';
    documentsData[docKey].fileUrl = saved.fileUrl || '';
    syncDocumentsToStorage();
    renderContent();
  } catch (error) {
    alert(error.message || 'Unable to upload document right now.');
  } finally {
    event.target.value = '';
  }
}
async function handleApplicationResumeUpload(event) {
  const file = event.target.files[0];
  if (!file || !applicationDraft) {
    return;
  }
  if (file.size > 1024 * 1024) {
    alert('Resume size must be 1MB or less.');
    event.target.value = '';
    return;
  }

  try {
    applicationDraft.resumeName = file.name;
    applicationDraft.resumeType = file.type || '';
    applicationDraft.resumeUrl = await readFileAsDataUrl(file);
    renderModal();
  } catch (error) {
    alert(error.message || 'Unable to read selected resume.');
  } finally {
    event.target.value = '';
  }
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
  closeStudentSidebar();
  renderContent();
}
async function toggleEditProfile() {
  if (isEditing) {
    // When the user clicks Save, push the edited profile to the backend first.
    const saved = await saveStudentProfile();
    if (!saved) {
      return;
    }
    persistSession();
    syncStudentProfileToStorage();
    isEditing = false;
    renderContent();
    return;
  }

  // First click switches the profile page into editable mode.
  isEditing = true;
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
async function handleApply() {
  if (!selectedJob || !applicationDraft) {
    return;
  }
  const requiredFields = ['dob', 'mobile', 'collegeEmail', 'tenthMarks', 'twelfthMarks', 'graduationMarks', 'resumeUrl'];
  const missingRequired = requiredFields.some((key) => !applicationDraft[key]);
  if (missingRequired) {
    alert('Please complete all required fields and upload your resume before submitting.');
    return;
  }
  try {
    await createApplication({
      opportunityId: Number(selectedJob.id) || null,
      studentId: applicationDraft.rollNo,
      studentName: applicationDraft.studentName,
      company: selectedJob.company,
      role: selectedJob.role,
      location: selectedJob.location,
      packageValue: applicationDraft.packageValue,
      dob: applicationDraft.dob,
      mobile: applicationDraft.mobile,
      collegeEmail: applicationDraft.collegeEmail,
      tenthMarks: applicationDraft.tenthMarks || null,
      twelfthMarks: applicationDraft.twelfthMarks || null,
      graduationMarks: applicationDraft.graduationMarks || null,
      postGraduationMarks: applicationDraft.postGraduationMarks || null,
      additionalInfo: applicationDraft.additionalInfo || '',
      resumeName: applicationDraft.resumeName,
      resumeUrl: applicationDraft.resumeUrl,
      resumeType: applicationDraft.resumeType || ''
    });
    applyApplicationsFromBackend(await fetchStudentApplications(applicationDraft.rollNo));
    selectedJob = null;
    applicationDraft = null;
    activePage = 'applied';
    updateNav();
    updateHeader();
    renderContent();
  } catch (error) {
    alert(error.message || 'Unable to submit application right now.');
  }
}
function logoutToLogin() {
  if (window.clearPlaceProSession) {
    window.clearPlaceProSession();
  } else {
    localStorage.removeItem('placeProSession');
    localStorage.removeItem('loggedInUser');
  }
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
window.onload = async () => {
  const activeSession = window.requireRoleSession ? window.requireRoleSession('Student') : null;
  if (!activeSession) {
    return;
  }
  await loadStudentProfile();
  await loadStudentDashboardData();
  bindStaticEvents();
  updateHeader();
  switchPage('home');
  window.addEventListener('resize', () => {
    if (window.innerWidth > 1024) {
      closeStudentSidebar();
    }
  });
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeStudentSidebar();
      closeApplyModal();
      closeDocumentPreview();
      closeAppliedRecordView();
    }
  });
};
