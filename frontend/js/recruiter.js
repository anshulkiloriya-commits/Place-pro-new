let recruiterActivePage = 'home';
let recruiterModalState = null;
let recruiterStudentSearch = '';
let recruiterSession = null;
let recruiterUpdates = [];
let recruiterApplications = [];
let recruiterOpportunities = [];
let recruiterStudents = [];
let recruiterMessages = [];
const recruiterDocumentsByStudent = {};
const recruiterFilters = {
  search: '',
  branch: '',
  minCgpa: '',
  status: '',
  stage: '',
  hiringStatus: '',
  round: '',
  resume: '',
  date: ''
};
const pipelineStages = ['Applied', 'Shortlisted', 'Interview Scheduled', 'Moved to Next Round', 'Selected', 'Rejected'];
const hiringStatuses = ['Selected', 'Rejected', 'On Hold', 'Final Selected', 'Offer Sent'];
const interviewStatuses = ['Pending', 'Completed', 'Selected', 'Rejected', 'Moved to Next Round'];

function recruiterEscapeHtml(value) {
  return String(value ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function syncRecruiterCaches() {
  safeWriteStorage(`placeProRecruiterMessages:${recruiterSession?.id || 'local'}`, recruiterMessages);
}

function currentRecruiterCompany() {
  return recruiterSession?.company || recruiterSession?.name || 'Company Recruiter';
}

function getRecruiterTitle(page) {
  return {
    home: 'Dashboard',
    updates: 'Send Updates',
    applications: 'Applied Records',
    pipeline: 'CANDIDATE PIPELINE',
    interviews: 'Interview Management',
    hiring: 'Hiring Status',
    communication: 'Communication Center',
    students: 'Student Data',
    opportunities: 'Post Opportunities'
  }[page] || page;
}

function updateRecruiterHeader() {
  document.getElementById('recruiter-page-title').innerText = getRecruiterTitle(recruiterActivePage);
}

function updateRecruiterNav() {
  document.querySelectorAll('.recruiter-nav-btn').forEach((btn) => {
    const active = btn.getAttribute('data-page') === recruiterActivePage;
    btn.classList.toggle('recruiter-active-nav', active);
    btn.classList.toggle('text-neutral-400', !active);
    btn.classList.toggle('border-transparent', !active);
  });
}

function recruiterStudentView(student, index) {
  return {
    serialNo: index + 1,
    enrollmentNo: student.enrollmentNo || '',
    branchName: inferBranchNameFromEnrollment(student.enrollmentNo, student.className),
    profile: {
      name: student.fullName,
      rollNo: student.enrollmentNo,
      mobile: student.mobile,
      personalEmail: student.personalEmail,
      collegeEmail: student.collegeEmail,
      dob: student.dob,
      className: student.className,
      section: student.section,
      abcId: student.abcId,
      aadhaar: student.aadharNo,
      pan: student.panNo,
      studentImage: student.studentImage
    }
  };
}

function appBranch(app) {
  return app.branch || inferBranchNameFromEnrollment(app.studentId, '');
}

function appCgpa(app) {
  const direct = Number(app.cgpa);
  if (!Number.isNaN(direct) && direct > 0) return direct;
  const marks = [app.graduationMarks, app.postGraduationMarks, app.twelfthMarks].map(Number).filter((value) => !Number.isNaN(value) && value > 0);
  if (!marks.length) return 0;
  return Math.min(10, Math.max(...marks) / 10);
}

function stageOf(app) {
  return app.pipelineStage || (String(app.status || '').toLowerCase().includes('short') ? 'Shortlisted' : 'Applied');
}

function hiringOf(app) {
  return app.hiringStatus || (stageOf(app) === 'Selected' ? 'Selected' : stageOf(app) === 'Rejected' ? 'Rejected' : 'On Hold');
}

function statusBadge(label) {
  const text = recruiterEscapeHtml(label || 'Pending');
  const normalized = text.toLowerCase();
  const tone = normalized.includes('reject') ? 'bg-red-100 text-red-700'
    : normalized.includes('select') || normalized.includes('offer') ? 'bg-green-100 text-green-700'
      : normalized.includes('interview') || normalized.includes('next') ? 'bg-blue-100 text-blue-700'
        : 'bg-amber-100 text-amber-700';
  return `<span class="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase ${tone}">${text}</span>`;
}

function recruiterStatCard(icon, count, label, className) {
  return `<div class="recruiter-stat-card p-8 border border-neutral-200 group transition-all ${className}"><i data-lucide="${icon}" size="24" class="recruiter-stat-icon mb-6 transition-transform"></i><h3 class="text-5xl font-black mb-1 tracking-tighter">${count}</h3><p class="text-[10px] font-bold uppercase tracking-widest opacity-60">${label}</p></div>`;
}

function filteredApplications() {
  const query = recruiterFilters.search.trim().toLowerCase();
  return recruiterApplications.filter((app) => {
    const branch = appBranch(app);
    const cgpa = appCgpa(app);
    const haystack = `${app.studentName || ''} ${app.studentId || ''} ${app.company || ''} ${app.role || ''}`.toLowerCase();
    if (query && !haystack.includes(query)) return false;
    if (recruiterFilters.branch && branch !== recruiterFilters.branch) return false;
    if (recruiterFilters.minCgpa && cgpa < Number(recruiterFilters.minCgpa)) return false;
    if (recruiterFilters.status && app.status !== recruiterFilters.status) return false;
    if (recruiterFilters.stage && stageOf(app) !== recruiterFilters.stage) return false;
    if (recruiterFilters.hiringStatus && hiringOf(app) !== recruiterFilters.hiringStatus) return false;
    if (recruiterFilters.round && (app.interviewRound || '') !== recruiterFilters.round) return false;
    if (recruiterFilters.resume === 'yes' && !app.resumeUrl) return false;
    if (recruiterFilters.resume === 'no' && app.resumeUrl) return false;
    if (recruiterFilters.date && !String(app.appliedAt || '').startsWith(recruiterFilters.date)) return false;
    return true;
  });
}

function uniqueOptions(values) {
  return [...new Set(values.filter(Boolean))].sort();
}

function renderFilterPanel(context = 'applications') {
  const branches = uniqueOptions(recruiterApplications.map(appBranch));
  const statuses = uniqueOptions(recruiterApplications.map((app) => app.status));
  const rounds = uniqueOptions(recruiterApplications.map((app) => app.interviewRound));
  return `<div class="mb-6 p-5 bg-white border border-neutral-200 rounded-2xl shadow-sm">
    <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      <div class="relative"><i data-lucide="search" size="16" class="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400"></i><input value="${recruiterEscapeHtml(recruiterFilters.search)}" oninput="setRecruiterFilter('search', this.value)" placeholder="Search enrollment or name" class="w-full pl-11 p-4 border border-neutral-200 text-sm font-bold"></div>
      <select onchange="setRecruiterFilter('branch', this.value)" class="w-full p-4 border border-neutral-200 text-sm font-bold"><option value="">All Branches</option>${branches.map((branch) => `<option ${recruiterFilters.branch === branch ? 'selected' : ''}>${recruiterEscapeHtml(branch)}</option>`).join('')}</select>
      <input type="number" min="0" max="10" step="0.1" value="${recruiterEscapeHtml(recruiterFilters.minCgpa)}" oninput="setRecruiterFilter('minCgpa', this.value)" placeholder="Minimum CGPA" class="w-full p-4 border border-neutral-200 text-sm font-bold">
      <select onchange="setRecruiterFilter('resume', this.value)" class="w-full p-4 border border-neutral-200 text-sm font-bold"><option value="">Resume: Any</option><option value="yes" ${recruiterFilters.resume === 'yes' ? 'selected' : ''}>Resume Uploaded</option><option value="no" ${recruiterFilters.resume === 'no' ? 'selected' : ''}>No Resume</option></select>
      <select onchange="setRecruiterFilter('status', this.value)" class="w-full p-4 border border-neutral-200 text-sm font-bold"><option value="">All Application Status</option>${statuses.map((status) => `<option ${recruiterFilters.status === status ? 'selected' : ''}>${recruiterEscapeHtml(status)}</option>`).join('')}</select>
      <select onchange="setRecruiterFilter('stage', this.value)" class="w-full p-4 border border-neutral-200 text-sm font-bold"><option value="">All Candidate Stages</option>${pipelineStages.map((stage) => `<option ${recruiterFilters.stage === stage ? 'selected' : ''}>${stage}</option>`).join('')}</select>
      <select onchange="setRecruiterFilter('hiringStatus', this.value)" class="w-full p-4 border border-neutral-200 text-sm font-bold"><option value="">All Hiring Status</option>${hiringStatuses.map((status) => `<option ${recruiterFilters.hiringStatus === status ? 'selected' : ''}>${status}</option>`).join('')}</select>
      <select onchange="setRecruiterFilter('round', this.value)" class="w-full p-4 border border-neutral-200 text-sm font-bold"><option value="">All Interview Rounds</option>${rounds.map((round) => `<option ${recruiterFilters.round === round ? 'selected' : ''}>${recruiterEscapeHtml(round)}</option>`).join('')}</select>
      <input type="date" value="${recruiterEscapeHtml(recruiterFilters.date)}" oninput="setRecruiterFilter('date', this.value)" class="w-full p-4 border border-neutral-200 text-sm font-bold">
      <button onclick="resetRecruiterFilters()" class="px-5 py-3 bg-white border border-neutral-300 text-[10px] font-black uppercase tracking-widest">Reset Filters</button>
      ${context === 'applications' ? `<button onclick="shortlistByCgpa()" class="px-5 py-3 bg-black text-white text-[10px] font-black uppercase tracking-widest">Shortlist CGPA >= 7.5</button>` : ''}
      ${context === 'hiring' ? `<button onclick="exportHiringReport()" class="px-5 py-3 bg-black text-white text-[10px] font-black uppercase tracking-widest">Download Report</button>` : ''}
    </div>
  </div>`;
}

function renderRecruiterOverview() {
  const ownUpdates = recruiterUpdates.filter((item) => item.source === 'Recruiter' && (!item.createdByUserId || item.createdByUserId === recruiterSession?.id));
  const shortlisted = recruiterApplications.filter((app) => stageOf(app) === 'Shortlisted').length;
  const interviews = recruiterApplications.filter((app) => stageOf(app) === 'Interview Scheduled').length;
  return `<div class="recruiter-animate-in">
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
      ${recruiterStatCard('briefcase', recruiterOpportunities.length, 'Owned Opportunities', 'bg-black text-white')}
      ${recruiterStatCard('clipboard-check', recruiterApplications.length, 'Own Applicants', 'bg-neutral-50')}
      ${recruiterStatCard('list-checks', shortlisted, 'Shortlisted', 'bg-neutral-50')}
      ${recruiterStatCard('calendar-clock', interviews, 'Interviews', 'bg-neutral-50')}
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2">
        <h2 class="text-[10px] font-black tracking-[0.3em] uppercase mb-6 flex items-center gap-2"><i data-lucide="zap" size="14" class="text-amber-500"></i>Recruiter Workflow</h2>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          ${[['Applied Records','Filter and shortlist applicants','clipboard-check','applications'],['CANDIDATE PIPELINE','Move candidates by stage','kanban-square','pipeline'],['Interview Management','Schedule rounds and track status','calendar-clock','interviews'],['Communication Center','Send targeted messages','messages-square','communication']].map(([title,desc,icon,page]) => `<button onclick="switchRecruiterPage('${page}')" class="recruiter-action-card flex items-center gap-5 p-6 border border-neutral-100 hover:border-black hover:bg-neutral-50 transition-all text-left group"><div class="recruiter-action-icon w-12 h-12 bg-neutral-100 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all"><i data-lucide="${icon}" size="20"></i></div><div><h4 class="text-sm font-black uppercase tracking-tighter">${title}</h4><p class="text-[10px] font-bold text-neutral-400 uppercase">${desc}</p></div></button>`).join('')}
        </div>
      </div>
      <div>
        <div class="flex justify-between items-center mb-6"><h2 class="text-[10px] font-black tracking-[0.3em] uppercase flex items-center gap-2"><i data-lucide="bell" size="14"></i>Message Feed</h2><button onclick="switchRecruiterPage('communication')" class="text-[9px] font-black uppercase text-neutral-400 hover:text-black">Open</button></div>
        <div class="space-y-4">${(recruiterMessages.length ? recruiterMessages.slice(0, 4) : ownUpdates.slice(0, 4)).map((item) => `<div class="p-5 border border-neutral-100 rounded-2xl bg-white"><div class="flex justify-between gap-3 mb-2"><span class="text-[8px] font-black px-2 py-0.5 uppercase bg-neutral-100 text-neutral-500">${recruiterEscapeHtml(item.type || item.target || 'Update')}</span><span class="text-[8px] font-bold text-neutral-300 uppercase">${recruiterEscapeHtml(item.createdAt || 'Recent')}</span></div><h4 class="text-xs font-black uppercase tracking-tighter mb-1">${recruiterEscapeHtml(item.title || 'Recruiter Message')}</h4><p class="text-[10px] font-medium text-neutral-500 leading-relaxed recruiter-line-clamp-2">${recruiterEscapeHtml(item.message)}</p></div>`).join('') || '<div class="p-6 border border-dashed border-neutral-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-neutral-300">No messages yet</div>'}</div>
      </div>
    </div>
  </div>`;
}

function renderRecruiterUpdatesPage() {
  const selectedCount = getTargetedStudentIds().length;
  return `<div class="recruiter-animate-in">
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-8">
      <div class="xl:col-span-2 p-6 bg-white border border-neutral-200 rounded-2xl shadow-sm">
        <h2 class="text-sm font-black uppercase tracking-[0.2em] mb-6">Targeted Update Composer</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <select id="recruiter-update-target" onchange="renderRecruiterContent()" class="w-full p-4 border border-neutral-200 text-sm font-bold">
            <option value="all">All Students</option><option value="applicants">All Applicants</option><option value="branch">Entire Branch</option><option value="shortlisted">Shortlisted Students</option><option value="selected">Selected Candidates</option><option value="manual">Selected Students</option>
          </select>
          <input id="recruiter-update-branch" placeholder="Branch filter" class="w-full p-4 border border-neutral-200 text-sm font-bold">
          <input id="recruiter-update-title" placeholder="Message title" class="w-full p-4 border border-neutral-200 text-sm font-bold">
          <select id="recruiter-update-type" class="w-full p-4 border border-neutral-200 text-sm font-bold"><option>Update</option><option>Alert</option><option>Urgent</option><option>Interview</option></select>
        </div>
        <textarea id="recruiter-update-message" placeholder="Write a clear update for the selected students" class="w-full p-4 border border-neutral-200 min-h-[180px] text-sm font-bold resize-none mb-5"></textarea>
        <input id="recruiter-update-link" placeholder="Optional link / meeting / form URL" class="w-full p-4 border border-neutral-200 text-sm font-bold mb-5">
        <button onclick="sendRecruiterUpdate()" class="w-full bg-black text-white py-4 text-[10px] font-black uppercase tracking-[0.2em]">Send Targeted Update</button>
      </div>
      <div class="p-6 bg-white border border-neutral-200 rounded-2xl shadow-sm">
        <h3 class="text-[11px] font-black uppercase tracking-[0.2em] mb-4">Student Selector</h3>
        <input id="recruiter-target-search" oninput="renderRecruiterContent()" placeholder="Search enrollment number" class="w-full p-4 border border-neutral-200 text-sm font-bold mb-4">
        <p class="text-xs text-neutral-500 mb-4">${selectedCount} students currently match the target rule.</p>
        <div class="max-h-[420px] overflow-y-auto space-y-2">${targetableStudents().slice(0, 40).map((student) => `<label class="flex items-center gap-3 p-3 border border-neutral-200 rounded-xl cursor-pointer"><input type="checkbox" class="recruiter-target-student" value="${recruiterEscapeHtml(student.enrollmentNo)}"><span><strong class="block text-xs uppercase">${recruiterEscapeHtml(student.enrollmentNo)}</strong><span class="text-[10px] text-neutral-500">${recruiterEscapeHtml(student.branchName)}</span></span></label>`).join('') || '<div class="p-6 border border-dashed border-neutral-200 text-center text-xs text-neutral-500">No students found</div>'}</div>
      </div>
    </div>
  </div>`;
}

function renderRecruiterApplicationsPage() {
  const rows = filteredApplications();
  return `<div class="recruiter-animate-in">${renderFilterPanel('applications')}<div class="recruiter-responsive-table border border-neutral-200"><table class="w-full min-w-[980px] text-left"><thead><tr><th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Student</th><th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Branch / CGPA</th><th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Role</th><th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Stage</th><th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Resume</th><th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Action</th></tr></thead><tbody>${rows.length ? rows.map((app) => `<tr><td class="px-6 py-5"><div class="font-black text-sm uppercase">${recruiterEscapeHtml(app.studentName)}</div><div class="text-[10px] text-neutral-400 font-bold">${recruiterEscapeHtml(app.studentId)}</div></td><td class="px-6 py-5"><div class="font-bold text-sm">${recruiterEscapeHtml(appBranch(app))}</div><div class="text-[10px] text-neutral-400 font-bold">CGPA ${appCgpa(app).toFixed(1)}</div></td><td class="px-6 py-5"><div class="font-black text-sm uppercase">${recruiterEscapeHtml(app.role)}</div><div class="text-[10px] text-neutral-400 font-bold">${recruiterEscapeHtml(app.company)}</div></td><td class="px-6 py-5">${statusBadge(stageOf(app))}</td><td class="px-6 py-5">${app.resumeUrl ? `<button onclick="openRecruiterApplicationResume('${app.id}')" class="px-4 py-2 border border-neutral-300 text-[9px] font-black uppercase tracking-widest hover:border-black">View CV</button>` : '<span class="text-xs text-neutral-400">Missing</span>'}</td><td class="px-6 py-5"><button onclick="openRecruiterModal('application','${app.id}')" class="px-4 py-2 bg-black text-white text-[9px] font-black uppercase tracking-widest">Manage</button></td></tr>`).join('') : '<tr><td colspan="6" class="px-6 py-20 text-center text-neutral-300 uppercase text-[10px] font-black tracking-widest">No applicants match filters</td></tr>'}</tbody></table></div></div>`;
}

function renderPipelinePage() {
  const rows = filteredApplications();
  return `<div class="recruiter-animate-in">${renderFilterPanel('pipeline')}<div class="candidate-pipeline-grid grid grid-cols-1 xl:grid-cols-3 2xl:grid-cols-6 gap-5">${pipelineStages.map((stage) => { const stageRows = rows.filter((app) => stageOf(app) === stage); return `<section class="bg-white border border-neutral-200 rounded-2xl p-4 shadow-sm"><div class="flex items-center justify-between mb-4"><h3 class="text-[10px] font-black uppercase tracking-[0.2em]">${stage}</h3><span class="text-[10px] font-black text-neutral-400">${stageRows.length}</span></div><div class="space-y-3 min-h-[120px]">${stageRows.map((app) => `<div class="candidate-pipeline-card p-4 border border-neutral-200 rounded-xl hover:border-black transition-all"><div class="candidate-pipeline-card-title font-black text-sm uppercase">${recruiterEscapeHtml(app.studentName)}</div><div class="candidate-pipeline-card-meta text-[10px] text-neutral-500 font-bold mb-3">${recruiterEscapeHtml(app.studentId)}<br>CGPA ${appCgpa(app).toFixed(1)}</div><div class="candidate-pipeline-card-actions"><select onchange="moveCandidate('${app.id}', this.value)" class="w-full p-3 border border-neutral-200 text-xs font-bold mb-3">${pipelineStages.map((item) => `<option ${stageOf(app) === item ? 'selected' : ''}>${item}</option>`).join('')}</select><button onclick="openRecruiterModal('application','${app.id}')" class="w-full px-3 py-2 bg-white border border-neutral-300 text-[9px] font-black uppercase">Notes & Details</button></div></div>`).join('') || '<div class="p-5 border border-dashed border-neutral-200 rounded-xl text-center text-[10px] text-neutral-400 uppercase font-black">Empty stage</div>'}</div></section>`; }).join('')}</div></div>`;
}

function renderInterviewsPage() {
  const rows = filteredApplications().filter((app) => stageOf(app) === 'Interview Scheduled' || app.interviewRound || app.interviewAt);
  return `<div class="recruiter-animate-in">${renderFilterPanel('interviews')}<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">${rows.map((app) => `<div class="p-6 bg-white border border-neutral-200 rounded-2xl shadow-sm"><div class="flex justify-between gap-4 mb-5"><div><h3 class="text-lg font-black uppercase tracking-tighter">${recruiterEscapeHtml(app.studentName)}</h3><p class="text-xs text-neutral-500 font-bold">${recruiterEscapeHtml(app.studentId)} · ${recruiterEscapeHtml(appBranch(app))}</p></div>${statusBadge(app.interviewStatus || 'Pending')}</div><div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5"><input type="datetime-local" id="interview-at-${app.id}" value="${recruiterEscapeHtml(String(app.interviewAt || '').slice(0, 16))}" class="p-4 border border-neutral-200 text-sm font-bold"><select id="interview-round-${app.id}" class="p-4 border border-neutral-200 text-sm font-bold"><option>Round 1: Aptitude</option><option ${app.interviewRound === 'Round 2: Technical' ? 'selected' : ''}>Round 2: Technical</option><option ${app.interviewRound === 'Round 3: HR' ? 'selected' : ''}>Round 3: HR</option></select><input id="interview-location-${app.id}" value="${recruiterEscapeHtml(app.interviewLocation || '')}" placeholder="Location" class="p-4 border border-neutral-200 text-sm font-bold"><input id="interview-link-${app.id}" value="${recruiterEscapeHtml(app.interviewLink || '')}" placeholder="Meeting link" class="p-4 border border-neutral-200 text-sm font-bold"><select id="interview-status-${app.id}" class="p-4 border border-neutral-200 text-sm font-bold">${interviewStatuses.map((status) => `<option ${app.interviewStatus === status ? 'selected' : ''}>${status}</option>`).join('')}</select></div><button onclick="saveInterview('${app.id}')" class="w-full bg-black text-white py-3 text-[10px] font-black uppercase tracking-widest">Save Interview</button></div>`).join('') || '<div class="lg:col-span-2 p-10 border border-dashed border-neutral-200 rounded-2xl text-center text-neutral-400 text-xs font-black uppercase tracking-widest">No interviews scheduled</div>'}</div></div>`;
}

function renderHiringPage() {
  const rows = filteredApplications();
  return `<div class="recruiter-animate-in">${renderFilterPanel('hiring')}<div class="recruiter-responsive-table border border-neutral-200"><table class="w-full min-w-[900px] text-left"><thead><tr><th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Candidate</th><th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Stage</th><th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Hiring Status</th><th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Bulk/Action</th></tr></thead><tbody>${rows.map((app) => `<tr><td class="px-6 py-5"><div class="font-black text-sm uppercase">${recruiterEscapeHtml(app.studentName)}</div><div class="text-[10px] text-neutral-400 font-bold">${recruiterEscapeHtml(app.studentId)} · ${recruiterEscapeHtml(appBranch(app))}</div></td><td class="px-6 py-5">${statusBadge(stageOf(app))}</td><td class="px-6 py-5">${statusBadge(hiringOf(app))}</td><td class="px-6 py-5"><select onchange="setHiringStatus('${app.id}', this.value)" class="p-3 border border-neutral-200 text-xs font-bold">${hiringStatuses.map((status) => `<option ${hiringOf(app) === status ? 'selected' : ''}>${status}</option>`).join('')}</select></td></tr>`).join('') || '<tr><td colspan="4" class="px-6 py-20 text-center text-neutral-300 uppercase text-[10px] font-black tracking-widest">No candidates available</td></tr>'}</tbody></table></div></div>`;
}

function renderCommunicationPage() {
  return `<div class="recruiter-animate-in">
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-8">
      <div class="xl:col-span-2">${renderRecruiterUpdatesPage()}</div>
      <div class="p-6 bg-white border border-neutral-200 rounded-2xl shadow-sm"><h3 class="text-[11px] font-black uppercase tracking-[0.2em] mb-5">Message History</h3><div class="space-y-4 max-h-[680px] overflow-y-auto">${recruiterMessages.map((message) => `<div class="p-4 border border-neutral-200 rounded-xl"><div class="flex justify-between mb-2"><strong class="text-xs uppercase">${recruiterEscapeHtml(message.title)}</strong><span class="text-[9px] text-neutral-400">${recruiterEscapeHtml(message.createdAt)}</span></div><p class="text-xs text-neutral-600 mb-2">${recruiterEscapeHtml(message.message)}</p><span class="text-[9px] font-black uppercase text-blue-700">${recruiterEscapeHtml(message.target)} · ${message.studentIds.length} recipients</span></div>`).join('') || '<div class="p-8 border border-dashed border-neutral-200 rounded-xl text-center text-xs text-neutral-400">No communication history yet</div>'}</div></div>
    </div>
  </div>`;
}

function renderRecruiterStudentsPage() {
  const students = recruiterStudents.map(recruiterStudentView);
  const q = recruiterStudentSearch.trim().toLowerCase();
  const filtered = students.filter((s) => s.enrollmentNo.toLowerCase().includes(q) || s.branchName.toLowerCase().includes(q));
  return `<div class="recruiter-animate-in"><div class="mb-6 p-5 bg-white border border-neutral-200 rounded-2xl shadow-sm"><div class="flex items-center gap-3 mb-3"><i data-lucide="search" size="18" class="text-neutral-400"></i><h3 class="text-[11px] font-black uppercase tracking-[0.2em]">Search Student</h3></div><input id="recruiter-student-search" type="text" value="${recruiterEscapeHtml(recruiterStudentSearch)}" placeholder="Search by enrollment number or branch" oninput="updateRecruiterStudentSearch(this.value)" class="w-full p-4 border border-neutral-200 text-sm font-bold"></div><div class="recruiter-responsive-table border border-neutral-200"><table class="w-full min-w-[640px] text-left"><thead><tr><th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest">S.No</th><th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Enrollment No</th><th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Branch Name</th><th class="px-6 py-4 text-[10px] font-black uppercase tracking-widest">Action</th></tr></thead><tbody>${filtered.length ? filtered.map((student) => `<tr><td class="px-6 py-6 font-black text-sm">${student.serialNo}</td><td class="px-6 py-6"><div class="font-black text-sm uppercase">${recruiterEscapeHtml(student.enrollmentNo)}</div></td><td class="px-6 py-6"><div class="font-bold text-sm">${recruiterEscapeHtml(student.branchName)}</div></td><td class="px-6 py-6"><button onclick="openRecruiterModal('student','${encodeURIComponent(student.enrollmentNo)}')" class="px-4 py-2 border border-neutral-300 text-[9px] font-black uppercase tracking-widest hover:border-black">View</button></td></tr>`).join('') : '<tr><td colspan="4" class="px-6 py-20 text-center text-neutral-300 uppercase text-[10px] font-black tracking-widest">No student match found</td></tr>'}</tbody></table></div></div>`;
}

function renderRecruiterOpportunitiesPage() {
  return `<div class="recruiter-animate-in"><div class="grid grid-cols-1 xl:grid-cols-2 gap-8"><div class="p-6 bg-white border border-neutral-200 rounded-2xl shadow-sm"><h2 class="text-sm font-black uppercase tracking-[0.2em] mb-6">Create Opportunity</h2><div class="space-y-5"><div class="grid grid-cols-1 md:grid-cols-2 gap-5"><select id="recruiter-opportunity-type" class="w-full p-4 border border-neutral-200 text-sm font-bold"><option value="Job">Job</option><option value="Internship">Internship</option></select><input id="recruiter-opportunity-company" type="text" value="${recruiterEscapeHtml(currentRecruiterCompany())}" placeholder="Company name" class="w-full p-4 border border-neutral-200 text-sm font-bold"></div><div class="grid grid-cols-1 md:grid-cols-2 gap-5"><input id="recruiter-opportunity-role" type="text" placeholder="Role" class="w-full p-4 border border-neutral-200 text-sm font-bold"><input id="recruiter-opportunity-location" type="text" placeholder="Location" class="w-full p-4 border border-neutral-200 text-sm font-bold"></div><div class="grid grid-cols-1 md:grid-cols-2 gap-5"><input id="recruiter-opportunity-package" type="text" placeholder="Package / Stipend" class="w-full p-4 border border-neutral-200 text-sm font-bold"><input id="recruiter-opportunity-deadline" type="date" class="w-full p-4 border border-neutral-200 text-sm font-bold"></div><textarea id="recruiter-opportunity-description" placeholder="Opportunity description" class="w-full p-4 border border-neutral-200 min-h-[140px] text-sm font-bold resize-none"></textarea><button onclick="postRecruiterOpportunity()" class="w-full bg-black text-white py-4 text-[10px] font-black uppercase tracking-[0.2em]">Post Opportunity</button></div></div><div><h2 class="text-sm font-black uppercase tracking-[0.2em] mb-6">My Published Opportunities</h2><div class="space-y-5">${recruiterOpportunities.length ? recruiterOpportunities.map((item) => `<div class="p-6 border border-neutral-200 bg-white rounded-2xl shadow-sm"><div class="flex justify-between gap-4 flex-wrap mb-4"><div><h3 class="text-sm font-black uppercase tracking-tight">${recruiterEscapeHtml(item.company)}</h3><p class="text-[10px] font-bold uppercase text-neutral-400 mt-2">${recruiterEscapeHtml(item.role)} · ${recruiterEscapeHtml(item.location)}</p></div><span class="text-[10px] font-black px-3 py-2 bg-black text-white uppercase rounded-xl">${recruiterEscapeHtml(item.packageValue)}</span></div><p class="text-xs text-neutral-500 leading-relaxed mb-4">${recruiterEscapeHtml(item.description)}</p><div class="text-[10px] font-bold uppercase text-neutral-400">Deadline ${recruiterEscapeHtml(item.deadline || 'TBA')}</div></div>`).join('') : '<div class="p-6 border border-dashed border-neutral-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-neutral-300">No opportunities posted yet</div>'}</div></div></div></div>`;
}

function renderRecruiterContent() {
  const c = document.getElementById('recruiter-content-area');
  if (recruiterActivePage === 'home') c.innerHTML = renderRecruiterOverview();
  if (recruiterActivePage === 'updates') c.innerHTML = renderRecruiterUpdatesPage();
  if (recruiterActivePage === 'applications') c.innerHTML = renderRecruiterApplicationsPage();
  if (recruiterActivePage === 'pipeline') c.innerHTML = renderPipelinePage();
  if (recruiterActivePage === 'interviews') c.innerHTML = renderInterviewsPage();
  if (recruiterActivePage === 'hiring') c.innerHTML = renderHiringPage();
  if (recruiterActivePage === 'communication') c.innerHTML = renderCommunicationPage();
  if (recruiterActivePage === 'students') c.innerHTML = renderRecruiterStudentsPage();
  if (recruiterActivePage === 'opportunities') c.innerHTML = renderRecruiterOpportunitiesPage();
  bindRecruiterStaticEvents();
  renderRecruiterModal();
  lucide.createIcons();
}

function switchRecruiterPage(page) {
  recruiterActivePage = page;
  updateRecruiterNav();
  updateRecruiterHeader();
  closeRecruiterSidebar();
  renderRecruiterContent();
}

function setRecruiterFilter(key, value) {
  recruiterFilters[key] = value;
  renderRecruiterContent();
}

function resetRecruiterFilters() {
  Object.keys(recruiterFilters).forEach((key) => recruiterFilters[key] = '');
  renderRecruiterContent();
}

function targetableStudents() {
  const q = (document.getElementById('recruiter-target-search')?.value || '').toLowerCase();
  return recruiterStudents.map(recruiterStudentView).filter((student) => !q || student.enrollmentNo.toLowerCase().includes(q) || student.branchName.toLowerCase().includes(q));
}

function getTargetedStudentIds() {
  const target = document.getElementById('recruiter-update-target')?.value || 'all';
  const branch = (document.getElementById('recruiter-update-branch')?.value || '').trim().toLowerCase();
  const manual = [...document.querySelectorAll('.recruiter-target-student:checked')].map((item) => item.value);
  if (target === 'manual') return manual;
  if (target === 'applicants') return uniqueOptions(recruiterApplications.map((app) => app.studentId));
  if (target === 'shortlisted') return uniqueOptions(recruiterApplications.filter((app) => stageOf(app) === 'Shortlisted').map((app) => app.studentId));
  if (target === 'selected') return uniqueOptions(recruiterApplications.filter((app) => hiringOf(app).includes('Selected') || stageOf(app) === 'Selected').map((app) => app.studentId));
  return recruiterStudents.map(recruiterStudentView).filter((student) => target !== 'branch' || student.branchName.toLowerCase().includes(branch)).map((student) => student.enrollmentNo);
}

async function sendRecruiterUpdate() {
  const title = document.getElementById('recruiter-update-title').value.trim();
  const message = document.getElementById('recruiter-update-message').value.trim();
  const type = document.getElementById('recruiter-update-type').value;
  const link = document.getElementById('recruiter-update-link').value.trim();
  const target = document.getElementById('recruiter-update-target').value;
  const studentIds = getTargetedStudentIds();
  if (!message) {
    alert('Enter update message');
    return;
  }
  try {
    const saved = await createPortalUpdate({ title: title || 'Recruiter Update', message, type, link, source: 'Recruiter', createdByUserId: recruiterSession?.id || null, target, studentIds });
    recruiterUpdates.unshift(saved);
    recruiterMessages.unshift({ title: title || 'Recruiter Update', message, type, link, target, studentIds, createdAt: new Date().toLocaleString() });
    syncRecruiterCaches();
    renderRecruiterContent();
  } catch (error) {
    alert(error.message || 'Unable to publish update right now.');
  }
}

async function postRecruiterOpportunity() {
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
  try {
    const saved = await createOpportunity({ type, company, role, location, packageValue, deadline: deadline || null, description, postedByUserId: recruiterSession?.id || null });
    recruiterOpportunities.unshift(saved);
    renderRecruiterContent();
  } catch (error) {
    alert(error.message || 'Unable to post opportunity right now.');
  }
}

async function updateWorkflow(appId, payload) {
  const saved = await updateRecruiterApplication(appId, recruiterSession.id, payload);
  recruiterApplications = recruiterApplications.map((app) => String(app.id) === String(saved.id) ? saved : app);
  return saved;
}

async function moveCandidate(appId, stage) {
  try {
    await updateWorkflow(appId, { pipelineStage: stage, status: stage, hiringStatus: stage === 'Selected' ? 'Selected' : stage === 'Rejected' ? 'Rejected' : undefined });
    renderRecruiterContent();
  } catch (error) {
    alert(error.message || 'Unable to update candidate stage.');
  }
}

async function shortlistByCgpa() {
  const eligible = filteredApplications().filter((app) => appCgpa(app) >= 7.5);
  await Promise.all(eligible.map((app) => updateWorkflow(app.id, { pipelineStage: 'Shortlisted', status: 'Shortlisted' })));
  renderRecruiterContent();
}

async function saveInterview(appId) {
  try {
    await updateWorkflow(appId, {
      pipelineStage: 'Interview Scheduled',
      status: 'Interview Scheduled',
      interviewAt: document.getElementById(`interview-at-${appId}`).value,
      interviewRound: document.getElementById(`interview-round-${appId}`).value,
      interviewStatus: document.getElementById(`interview-status-${appId}`).value,
      interviewLocation: document.getElementById(`interview-location-${appId}`).value,
      interviewLink: document.getElementById(`interview-link-${appId}`).value
    });
    renderRecruiterContent();
  } catch (error) {
    alert(error.message || 'Unable to save interview.');
  }
}

async function setHiringStatus(appId, status) {
  try {
    await updateWorkflow(appId, { hiringStatus: status, pipelineStage: status === 'Rejected' ? 'Rejected' : status.includes('Selected') ? 'Selected' : undefined, status });
    renderRecruiterContent();
  } catch (error) {
    alert(error.message || 'Unable to update hiring status.');
  }
}

function exportHiringReport() {
  const rows = filteredApplications().map((app) => [app.studentName, app.studentId, appBranch(app), appCgpa(app).toFixed(1), stageOf(app), hiringOf(app), app.role].map((cell) => `"${String(cell || '').replace(/"/g, '""')}"`).join(','));
  const csv = ['Student Name,Enrollment,Branch,CGPA,Stage,Hiring Status,Role', ...rows].join('\n');
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'placepro-hiring-report.csv';
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function ensureRecruiterStudentDocuments(enrollmentNo) {
  if (recruiterDocumentsByStudent[enrollmentNo]) return recruiterDocumentsByStudent[enrollmentNo];
  try {
    recruiterDocumentsByStudent[enrollmentNo] = mapDocumentsByType(await fetchStudentDocuments(enrollmentNo));
  } catch (error) {
    recruiterDocumentsByStudent[enrollmentNo] = {};
  }
  return recruiterDocumentsByStudent[enrollmentNo];
}

function openRecruiterApplicationResume(recordId) {
  const record = recruiterApplications.find((item) => String(item.id) === String(recordId));
  if (record?.resumeUrl) showBinaryAssetPreview(record.resumeUrl, record.resumeType, record.resumeName || 'Submitted Resume');
}

function openRecruiterStudentDocument(enrollmentNo, documentKey) {
  const docs = recruiterDocumentsByStudent[decodeURIComponent(enrollmentNo)] || {};
  const doc = docs[documentKey];
  if (doc?.fileUrl) showBinaryAssetPreview(doc.fileUrl, doc.fileType, doc.fileName || 'Student Document');
}

async function openRecruiterModal(type, recordId) {
  if (type === 'student') await ensureRecruiterStudentDocuments(decodeURIComponent(recordId || ''));
  recruiterModalState = { type, recordId };
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
    const app = recruiterApplications.find((item) => String(item.id) === String(recruiterModalState.recordId));
    if (!app) return closeRecruiterModal();
    modal.className = '';
    modal.innerHTML = `<div class="recruiter-modal-backdrop fixed inset-0 z-[100] flex items-center justify-center p-6"><div class="bg-white w-full max-w-5xl p-8 md:p-10 relative recruiter-animate-in max-h-[90vh] overflow-y-auto"><button onclick="closeRecruiterModal()" class="absolute top-6 right-6"><i data-lucide="x" size="24"></i></button><div class="mb-8 pr-10"><p class="text-[10px] font-black uppercase tracking-[0.24em] text-neutral-400 mb-2">Candidate Workflow</p><h2 class="text-3xl font-black uppercase tracking-tighter">${recruiterEscapeHtml(app.studentName)}</h2><p class="text-sm text-neutral-500 mt-3">${recruiterEscapeHtml(app.studentId)} · ${recruiterEscapeHtml(appBranch(app))} · CGPA ${appCgpa(app).toFixed(1)}</p></div><div class="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8"><select id="modal-stage" class="p-4 border border-neutral-200 text-sm font-bold">${pipelineStages.map((stage) => `<option ${stageOf(app) === stage ? 'selected' : ''}>${stage}</option>`).join('')}</select><select id="modal-hiring" class="p-4 border border-neutral-200 text-sm font-bold">${hiringStatuses.map((status) => `<option ${hiringOf(app) === status ? 'selected' : ''}>${status}</option>`).join('')}</select><input id="modal-round" value="${recruiterEscapeHtml(app.interviewRound || '')}" placeholder="Interview round" class="p-4 border border-neutral-200 text-sm font-bold"><input id="modal-link" value="${recruiterEscapeHtml(app.interviewLink || '')}" placeholder="Meeting link" class="p-4 border border-neutral-200 text-sm font-bold"></div><textarea id="modal-remarks" class="w-full p-4 border border-neutral-200 min-h-[140px] text-sm font-bold resize-none mb-6" placeholder="Recruiter remarks">${recruiterEscapeHtml(app.recruiterRemarks || '')}</textarea><div class="flex gap-3 flex-wrap">${app.resumeUrl ? `<button onclick="openRecruiterApplicationResume('${app.id}')" class="px-5 py-3 border border-neutral-300 text-[10px] font-black uppercase tracking-widest">View Resume</button>` : ''}<button onclick="saveModalWorkflow('${app.id}')" class="px-5 py-3 bg-black text-white text-[10px] font-black uppercase tracking-widest">Save Workflow</button></div></div></div>`;
    lucide.createIcons();
  }
  if (recruiterModalState.type === 'student') {
    const enrollmentNo = decodeURIComponent(recruiterModalState.recordId || '');
    const student = recruiterStudents.find((item) => item.enrollmentNo === enrollmentNo);
    if (!student) return closeRecruiterModal();
    const profile = recruiterStudentView(student, 0).profile;
    const docs = [['resume', 'Resume', 'file-text'], ['abcId', 'ABC ID', 'id-card'], ['domicileCertificate', 'Domicile Certificate', 'map-pinned'], ['casteCertificate', 'Caste Certificate', 'file-badge'], ['cvOnePage', 'CV 01 Page', 'file-user']].map(([key, title, icon]) => [key, title, recruiterDocumentsByStudent[enrollmentNo]?.[key], icon]);
    modal.className = '';
    modal.innerHTML = `<div class="recruiter-modal-backdrop fixed inset-0 z-[100] flex items-center justify-center p-6"><div class="bg-white w-full max-w-6xl p-8 md:p-10 relative recruiter-animate-in max-h-[90vh] overflow-y-auto"><button onclick="closeRecruiterModal()" class="absolute top-6 right-6"><i data-lucide="x" size="24"></i></button><div class="mb-8 pr-10"><p class="text-[10px] font-black uppercase tracking-[0.24em] text-neutral-400 mb-2">Student Data</p><h2 class="text-3xl font-black uppercase tracking-tighter">${recruiterEscapeHtml(profile.name || 'Student')}</h2><p class="text-sm text-neutral-500 mt-3">${recruiterEscapeHtml(enrollmentNo)} · ${recruiterEscapeHtml(inferBranchNameFromEnrollment(enrollmentNo, profile.className))}</p></div><div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">${[['Mobile', profile.mobile], ['Personal Email', profile.personalEmail], ['College Email', profile.collegeEmail], ['Class / Year', profile.className], ['ABC ID', profile.abcId], ['PAN Number', profile.pan]].map(([label, value]) => `<div class="border-b border-neutral-100 pb-2"><label class="block text-[9px] font-black uppercase text-neutral-400 mb-2 tracking-widest">${label}</label><div class="font-bold text-sm">${recruiterEscapeHtml(value || 'N/A')}</div></div>`).join('')}</div><h3 class="text-[11px] font-black uppercase tracking-[0.2em] mb-5">Documents</h3><div class="grid grid-cols-1 md:grid-cols-3 gap-5">${docs.map(([key, title, doc, icon]) => `<div class="recruiter-doc-card p-5 border ${doc?.fileUrl ? 'border-black bg-neutral-50' : 'border-neutral-200 bg-white'} rounded-2xl"><div class="flex items-center gap-3 mb-4"><i data-lucide="${icon}" size="18"></i><strong class="text-xs uppercase">${title}</strong></div><p class="text-xs text-neutral-500 mb-4">${doc?.fileName ? recruiterEscapeHtml(doc.fileName) : 'Not uploaded'}</p>${doc?.fileUrl ? `<button onclick="openRecruiterStudentDocument('${encodeURIComponent(enrollmentNo)}','${key}')" class="px-4 py-2 border border-neutral-300 text-[9px] font-black uppercase tracking-widest">View</button>` : ''}</div>`).join('')}</div></div></div>`;
    lucide.createIcons();
  }
}

async function saveModalWorkflow(appId) {
  try {
    await updateWorkflow(appId, {
      pipelineStage: document.getElementById('modal-stage').value,
      status: document.getElementById('modal-stage').value,
      hiringStatus: document.getElementById('modal-hiring').value,
      interviewRound: document.getElementById('modal-round').value,
      interviewLink: document.getElementById('modal-link').value,
      recruiterRemarks: document.getElementById('modal-remarks').value
    });
    closeRecruiterModal();
    renderRecruiterContent();
  } catch (error) {
    alert(error.message || 'Unable to save workflow.');
  }
}

function updateRecruiterStudentSearch(value) {
  recruiterStudentSearch = value;
  renderRecruiterContent();
}

function bindRecruiterStaticEvents() {
  const logoutBtn = document.getElementById('recruiter-logout-btn');
  if (logoutBtn) {
    logoutBtn.onclick = () => {
      clearPlaceProSession();
      window.location.href = 'login.html';
    };
  }
  const toggleButton = document.getElementById('recruiter-sidebar-toggle');
  if (toggleButton) {
    toggleButton.onclick = toggleRecruiterSidebar;
    toggleButton.setAttribute('aria-expanded', String(document.body.classList.contains('recruiter-nav-open')));
  }
  const overlay = document.getElementById('recruiter-sidebar-overlay');
  if (overlay) overlay.onclick = closeRecruiterSidebar;
}

function toggleRecruiterSidebar() {
  const isOpen = document.body.classList.toggle('recruiter-nav-open');
  const toggleButton = document.getElementById('recruiter-sidebar-toggle');
  if (toggleButton) toggleButton.setAttribute('aria-expanded', String(isOpen));
}

function closeRecruiterSidebar() {
  document.body.classList.remove('recruiter-nav-open');
  const toggleButton = document.getElementById('recruiter-sidebar-toggle');
  if (toggleButton) toggleButton.setAttribute('aria-expanded', 'false');
}

async function loadRecruiterData() {
  const id = recruiterSession?.id;
  try {
    const [updates, applications, opportunities, students] = await Promise.all([
      fetchPortalUpdates(),
      id ? fetchRecruiterApplications(id) : Promise.resolve([]),
      id ? fetchRecruiterOpportunities(id) : Promise.resolve([]),
      fetchStudents()
    ]);
    recruiterUpdates = updates;
    recruiterApplications = applications;
    recruiterOpportunities = opportunities;
    recruiterStudents = students;
  } catch (error) {
    recruiterUpdates = safeReadStorage('placeProUpdates', []);
    recruiterApplications = [];
    recruiterOpportunities = [];
    recruiterStudents = [];
  }
  recruiterMessages = safeReadStorage(`placeProRecruiterMessages:${id || 'local'}`, []);
}

window.switchRecruiterPage = switchRecruiterPage;
window.setRecruiterFilter = setRecruiterFilter;
window.resetRecruiterFilters = resetRecruiterFilters;
window.sendRecruiterUpdate = sendRecruiterUpdate;
window.postRecruiterOpportunity = postRecruiterOpportunity;
window.openRecruiterModal = openRecruiterModal;
window.closeRecruiterModal = closeRecruiterModal;
window.updateRecruiterStudentSearch = updateRecruiterStudentSearch;
window.openRecruiterApplicationResume = openRecruiterApplicationResume;
window.openRecruiterStudentDocument = openRecruiterStudentDocument;
window.moveCandidate = moveCandidate;
window.shortlistByCgpa = shortlistByCgpa;
window.saveInterview = saveInterview;
window.setHiringStatus = setHiringStatus;
window.exportHiringReport = exportHiringReport;
window.saveModalWorkflow = saveModalWorkflow;

window.onload = async () => {
  recruiterSession = window.requireRoleSession ? window.requireRoleSession('Recruiter') : null;
  if (!recruiterSession) return;
  await loadRecruiterData();
  updateRecruiterHeader();
  switchRecruiterPage('home');
  window.addEventListener('resize', () => { if (window.innerWidth > 1024) closeRecruiterSidebar(); });
  window.addEventListener('keydown', (event) => { if (event.key === 'Escape') { closeRecruiterSidebar(); closeRecruiterModal(); } });
};
