function showPage(pageId){
    let sections=document.querySelectorAll(".page-section");
    sections.forEach(section=>{
    section.classList.remove("active");
    });
    document.getElementById(pageId).classList.add("active");
    window.scrollTo(0,0);
    }
    function goHome(){
    let sections=document.querySelectorAll(".page-section");
    sections.forEach(section=>{
    section.classList.remove("active");
    });
    document.getElementById("home").classList.add("active");
    window.scrollTo(0,0);
    }
    function enableEdit(){
        let inputs=document.querySelectorAll("#profile input");
        inputs.forEach(input=>{
        if(input.type !== "file"){
        input.disabled=false;
        }
        });        
        document.getElementById("uploadPhotoBtn").style.display="inline-block";
        document.getElementById("uploadSignatureBtn").style.display="inline-block";
        }
        function previewPhoto(event){
            const reader = new FileReader();
            reader.onload = function(){
            document.getElementById("studentPhoto").src = reader.result;
            }
            reader.readAsDataURL(event.target.files[0]);
            }
            function previewSignature(event){
            const reader = new FileReader();
            reader.onload = function(){
            document.getElementById("studentSignature").src = reader.result;
            }
            reader.readAsDataURL(event.target.files[0]);
            }
            function enableEdit(){
                let inputs=document.querySelectorAll("#profile input");
                inputs.forEach(input=>{
                if(input.type !== "file"){
                input.disabled=false;
                }
                });
                document.getElementById("uploadPhotoBtn").style.display="inline-block";
                document.getElementById("uploadSignatureBtn").style.display="inline-block";
                document.getElementById("saveBtn").style.display="inline-block";
                document.getElementById("editBtn").style.display="none";  
                }
                function saveProfile(){
                
                let inputs=document.querySelectorAll("#profile input");
                
                inputs.forEach(input=>{
                if(input.type !== "file"){
                input.disabled=true;
                }
                });
                document.getElementById("uploadPhotoBtn").style.display="none";
                document.getElementById("uploadSignatureBtn").style.display="none";
                document.getElementById("saveBtn").style.display="none";
                document.getElementById("editBtn").style.display="inline-block";
                alert("Profile Saved Successfully!");
                }
                let appliedJobs = [];
    function openApplicationForm(company, role, location){
    document.getElementById("formCompany").value = company;
    document.getElementById("formRole").value = role;
    document.getElementById("formLocation").value = location;
    showPage("jobApplicationForm");
    }
    function submitApplication(){
    let company = document.getElementById("formCompany").value;
    let role = document.getElementById("formRole").value;
    let location = document.getElementById("formLocation").value;
    let name = document.getElementById("studentName").value;
    let email = document.getElementById("studentEmail").value;
    let phone = document.getElementById("studentPhone").value;
    let cgpa = document.getElementById("studentCgpa").value;
    let skills = document.getElementById("studentSkills").value;
    if(name=="" || email=="" || phone=="" || cgpa=="" || skills==""){
    alert("Please fill all fields");
    return;
    }
    appliedJobs.push({
    company,
    role,
    location,
    name,
    email,
    phone,
    cgpa,
    skills
    });
    updateApplications();
    alert("Application submitted successfully!");
    showPage("applications");
    document.getElementById("applyForm").reset();
    }
    function updateApplications(){
    let table = document.getElementById("applicationsTable");
    table.innerHTML = `
    <tr>
    <th>Company</th>
    <th>Role</th>
    <th>Location</th>
    <th>Status</th>
    </tr>
    `;
    appliedJobs.forEach(job => {
    let row = table.insertRow();
    row.insertCell(0).innerText = job.company;
    row.insertCell(1).innerText = job.role;
    row.insertCell(2).innerText = job.location;
    row.insertCell(3).innerText = "Submitted";
    });
    }
    document.getElementById("internFile").addEventListener("change", function(){
    document.getElementById("internFileName").value = this.files[0].name;
    });
    document.getElementById("certFile").addEventListener("change", function(){
    document.getElementById("certFileName").value = this.files[0].name;
    });
    function uploadInternship(){
        let fileInput = document.getElementById("internFile");        
        if(fileInput.files.length === 0){
        alert("Please choose a file first");
        return;
        }
        let file = fileInput.files[0];
        let fileName = file.name;
        let fileURL = URL.createObjectURL(file);
        let table = document.getElementById("internTable");
        let row = table.insertRow();
        row.insertCell(0).innerText = "Internship";
        row.insertCell(1).innerText = fileName;
        row.insertCell(2).innerText = "Uploaded";
        let viewCell = row.insertCell(3);
        viewCell.innerHTML = `<button class="view-btn" onclick="window.open('${fileURL}')">View</button>`;
        document.getElementById("internFile").value="";
        document.getElementById("internFileName").value="";
            alert("Internship certificate uploaded");
        }
        function uploadCertificate(){
        let fileInput = document.getElementById("certFile");
        if(fileInput.files.length === 0){
        alert("Please choose a file first");
        return;
        } 
        let file = fileInput.files[0];
        let fileName = file.name;
        let fileURL = URL.createObjectURL(file);
        let table = document.getElementById("internTable");
        let row = table.insertRow();
        row.insertCell(0).innerText = "Certificate";
        row.insertCell(1).innerText = fileName;
        row.insertCell(2).innerText = "Uploaded";
        let viewCell = row.insertCell(3);
        viewCell.innerHTML = `<button class="view-btn" onclick="window.open('${fileURL}')">View</button>`;
        document.getElementById("certFile").value="";
        document.getElementById("certFileName").value="";
        alert("Certificate uploaded");
        }
        document.getElementById("resumeFile").addEventListener("change", function(){
        if(this.files.length > 0){
        document.getElementById("resumeFileName").value = this.files[0].name;
        } });
    function uploadResume(){
    let fileInput = document.getElementById("resumeFile");
    if(fileInput.files.length === 0){
    alert("Please choose a resume file");
    return;
    }
    let file = fileInput.files[0];
    let fileName = file.name;
    let fileURL = URL.createObjectURL(file);
    let table = document.getElementById("resumeTable");
    table.innerHTML = `
    <tr>
    <th>File Name</th>
    <th>Status</th>
    <th>View</th>
    </tr>
    `;
    let row = table.insertRow();
    row.insertCell(0).innerText = fileName;
    row.insertCell(1).innerText = "Uploaded";
    let viewCell = row.insertCell(2);
    viewCell.innerHTML = `<button class="view-btn" onclick="window.open('${fileURL}')">View</button>`;
    document.getElementById("resumeFile").value="";
    document.getElementById("resumeFileName").value="";
    alert("Resume uploaded successfully");
    }
    function loadNotifications(){
        let notifications = JSON.parse(localStorage.getItem("notifications")) || [];
        let list = document.getElementById("notificationList");
        list.innerHTML = "";
        notifications.forEach(note => {
        let li = document.createElement("li");
        let urlPattern = /(https?:\/\/[^\s]+)/g;
        if(note.match(urlPattern)){        
        let formatted = note.replace(urlPattern, function(url){
        return `<a href="${url}" target="_blank" class="highlight-link">${url}</a>`;
        });
        li.innerHTML = formatted;
        }else{
        li.textContent = note;
        }
        list.appendChild(li);
        });
        }
        window.onload = loadNotifications;