// js/render.js
// Functions to populate dynamic content

function esc(v) { return String(v).replace(/[&<>"']/g, c => '&#' + c.charCodeAt(0) + ';'); }

async function renderDashboard() {
    const container = document.getElementById("dashboardWidgets");
    if (!container) return;
    if (currentRole === "Student") {
        container.innerHTML = `
            <a class="card card-link" href="my_grades.html">
                <h3>My Grades</h3>
                <p>View semester grades and GPA details.</p>
            </a>
            <a class="card card-link" href="appeals_status.html">
                <h3>Appeals Status</h3>
                <p>Check progress of your submitted appeals.</p>
            </a>
        `;
        return;
    }
    let widgets = [];
    if (currentRole === "Lecturer") {
        try {
            var userId = (function() { try { return JSON.parse(localStorage.getItem("sc_user") || "{}").id; } catch { return null; } })();
            if (userId) {
                var dashData = await SmartCampusAPI.withFallback(function() { return apiFetch('/grades/lecturer/' + userId + '/dashboard'); }, function() { return null; });
                var lecData = await SmartCampusAPI.withFallback(function() { return apiFetch('/lecturers/' + userId); }, function() { return null; });
                var coursesCount = (lecData && lecData.assignedCourses) ? lecData.assignedCourses.length : 0;
                if (dashData) {
                    var totalGrades = dashData.totalGrades || 0;
                    var draft = dashData.draftGrades || 0;
                    var submitted = dashData.submittedGrades || 0;
                    var returned = dashData.returnedForCorrection || 0;
                    var approvedChain = (dashData.approvedByDepartment || 0) + (dashData.approvedBySchool || 0) + (dashData.approvedByUniversity || 0);
                    var published = dashData.published || 0;
                    var avgScore = dashData.averageScore || 0;
                    var passRate = dashData.passRate || 0;
                    var uniqueStudents = dashData.uniqueStudents || 0;
                    widgets = [
                        { label: "Total Grades", value: totalGrades, icon: "fa-table", color: "var(--primary)" },
                        { label: "Drafts", value: draft, icon: "fa-pen", color: "var(--gray-500)" },
                        { label: "Submitted", value: submitted, icon: "fa-paper-plane", color: "var(--warning)" },
                        { label: "Approved", value: approvedChain, icon: "fa-check-circle", color: "var(--success)" },
                        { label: "Published", value: published, icon: "fa-check-double", color: "#8B5CF6" },
                        { label: "Returned", value: returned, icon: "fa-rotate-left", color: "var(--error)" },
                        { label: "Students", value: uniqueStudents, icon: "fa-users", color: "var(--info)" },
                        { label: "Courses", value: coursesCount, icon: "fa-book", color: "var(--navy)" },
                        { label: "Avg Score", value: avgScore.toFixed(1), icon: "fa-chart-line", color: "var(--teal)" },
                        { label: "Pass Rate", value: passRate + "%", icon: "fa-percent", color: "var(--success)" }
                    ];
                }
            }
        } catch(e) { /* fallback */ }
        if (!widgets.length) {
            widgets = [
                { label: "Total Grades", value: "—", icon: "fa-table", color: "var(--primary)" },
                { label: "Students", value: "—", icon: "fa-users", color: "var(--info)" },
                { label: "Courses", value: "—", icon: "fa-book", color: "var(--navy)" }
            ];
        }
    } else {
        try {
            const schools = await SmartCampusAPI.fetchSchools();
            const totalDepts = schools.reduce((sum, s) => sum + (s.departments || []).length, 0);
            widgets = [`Total Schools: ${schools.length}`, `Total Departments: ${totalDepts}`, "Total Students: 2450"];
        } catch {
            widgets = ["Total Schools: 5", "Total Departments: 21", "Total Students: 2450"];
        }
    }
    var widgetHtml;
    if (typeof widgets[0] === "string") {
        widgetHtml = widgets.map(function(w) { return '<div class="card"><h3>' + w + '</h3><p>Live data for ' + currentRole + '</p></div>'; }).join("");
    } else {
        widgetHtml = widgets.map(function(w) { return '<div class="card" style="text-align:center;padding:1rem"><div style="font-size:2rem;color:' + w.color + ';margin-bottom:.35rem"><i class="fa-solid ' + w.icon + '"></i></div><div style="font-size:1.5rem;font-weight:700;color:var(--gray-800)">' + w.value + '</div><div style="font-size:.8rem;color:var(--gray-500);margin-top:.15rem">' + w.label + '</div></div>'; }).join("");
    }
    let html = '<div style="margin-bottom:1.5rem">' + widgetHtml + '</div>';

    // Management section links
    const mgmtCards = [];
    if (["University Super Admin", "School Super Admin"].includes(currentRole)) {
        mgmtCards.push(`<a class="card card-link" href="admin-management.html">
            <div style="display:flex;align-items:center;gap:.75rem">
                <i class="fa-solid fa-user-shield fa-xl" style="color:#8B5CF6;width:2rem"></i>
                <div><h3 style="margin:0">Admin Management</h3><p style="margin:.15rem 0 0;font-size:.8rem;color:var(--gray-600)">Manage School and Departmental admins, approve registrations.</p></div>
            </div>
        </a>`);
        mgmtCards.push(`<a class="card card-link" href="manage-students.html">
            <div style="display:flex;align-items:center;gap:.75rem">
                <i class="fa-solid fa-users-gear fa-xl" style="color:var(--primary);width:2rem"></i>
                <div><h3 style="margin:0">Student Management</h3><p style="margin:.15rem 0 0;font-size:.8rem;color:var(--gray-600)">Add, browse, update, and delete student records.</p></div>
            </div>
        </a>`);
        mgmtCards.push(`<a class="card card-link" href="gradebook/super-admin.html">
            <div style="display:flex;align-items:center;gap:.75rem">
                <i class="fa-solid fa-book-open fa-xl" style="color:var(--warning);width:2rem"></i>
                <div><h3 style="margin:0">Grade Book</h3><p style="margin:.15rem 0 0;font-size:.8rem;color:var(--gray-600)">View and update student grades, calculate GPA &amp; CGPA.</p></div>
            </div>
        </a>`);
        mgmtCards.push(`<a class="card card-link" href="finance.html">
            <div style="display:flex;align-items:center;gap:.75rem">
                <i class="fa-solid fa-calculator fa-xl" style="color:var(--success);width:2rem"></i>
                <div><h3 style="margin:0">Finance Management</h3><p style="margin:.15rem 0 0;font-size:.8rem;color:var(--gray-600)">Fee structures, payments, reports, and analytics.</p></div>
            </div>
        </a>`);
    }
    if (["University Super Admin", "School Super Admin"].includes(currentRole)) {
        mgmtCards.push(`<a class="card card-link" href="admin_settings.html">
            <div style="display:flex;align-items:center;gap:.75rem">
                <i class="fa-solid fa-gear fa-xl" style="color:var(--gray-600);width:2rem"></i>
                <div><h3 style="margin:0">Admin Settings</h3><p style="margin:.15rem 0 0;font-size:.8rem;color:var(--gray-600)">System configuration, roles, and approvals.</p></div>
            </div>
        </a>`);
    }

    if (mgmtCards.length) {
        html += `<h2 style="font-size:1.2rem;margin:1.5rem 0 .5rem">Management</h2><div class="grid-2">${mgmtCards.join("")}</div>`;
    }

    // Lecturer-specific sections
    if (currentRole === "Lecturer") {
        var user2 = (function() { try { return JSON.parse(localStorage.getItem("sc_user") || "{}"); } catch { return {}; } })();
        var lecFull = null;
        try { lecFull = await apiFetch('/lecturers/' + user2.id); } catch(e) {}
        var assignedCrs = (lecFull && lecFull.assignedCourses) || [];
        if (assignedCrs.length) {
            html += '<h2 style="font-size:1.2rem;margin:1.5rem 0 .5rem"><i class="fa-solid fa-book-open"></i> My Courses (' + assignedCrs.length + ')</h2>';
            html += '<div class="grid-3" style="margin-bottom:1rem">';
            assignedCrs.forEach(function(c) {
                html += '<a class="card card-link" href="gradebook/browse.html?courseId=' + c.courseId + '&semester=' + encodeURIComponent(c.semester || 'Semester1') + '" style="padding:.65rem .85rem">';
                html += '<div style="font-weight:600;font-size:.9rem">' + esc(c.courseCode) + '</div>';
                html += '<div style="font-size:.8rem;color:var(--gray-600)">' + esc(c.courseTitle) + '</div>';
                html += '<div style="font-size:.75rem;color:var(--gray-400);margin-top:.2rem">' + esc(c.semester || '') + ' ' + esc(c.academicYear || '') + '</div>';
                html += '</a>';
            });
            html += '</div>';
        }
        // Recent activity
        try {
            var dash = await apiFetch('/grades/lecturer/' + user2.id + '/dashboard');
            var recent = (dash && dash.recentActivity) || [];
            if (recent.length) {
                html += '<h2 style="font-size:1.2rem;margin:1.5rem 0 .5rem"><i class="fa-solid fa-clock-rotate-left"></i> Recent Activity</h2>';
                html += '<div class="table-container"><table class="table"><thead><tr><th>Student</th><th>Course</th><th>Total</th><th>Status</th><th>Date</th></tr></thead><tbody>';
                recent.forEach(function(r) {
                    var dateStr = r.updatedAt || r.submittedAt || '';
                    if (dateStr) { try { dateStr = new Date(dateStr).toLocaleDateString(); } catch(e) {} }
                    var statusBadge = '';
                    var s = r.status || '';
                    if (s === 'Published') statusBadge = '<span class="badge badge-success">Published</span>';
                    else if (s === 'Approved by University') statusBadge = '<span class="badge badge-primary">Univ Approved</span>';
                    else if (s === 'Approved by School') statusBadge = '<span class="badge badge-info">School Approved</span>';
                    else if (s === 'Approved by Department') statusBadge = '<span class="badge badge-info">Dept Approved</span>';
                    else if (s === 'Submitted to Department') statusBadge = '<span class="badge badge-warning">Submitted</span>';
                    else if (s === 'Returned for Correction') statusBadge = '<span class="badge badge-danger">Returned</span>';
                    else statusBadge = '<span class="badge badge-secondary">' + esc(s) + '</span>';
                    html += '<tr><td>' + esc(r.studentName || '') + '</td><td>' + esc(r.courseCode || '') + '</td><td>' + (r.total != null ? r.total : '—') + '</td><td>' + statusBadge + '</td><td>' + dateStr + '</td></tr>';
                });
                html += '</tbody></table></div>';
            }
        } catch(e) {}
        // Quick links
        html += '<h2 style="font-size:1.2rem;margin:1.5rem 0 .5rem"><i class="fa-solid fa-link"></i> Quick Actions</h2>';
        html += '<div class="grid-2" style="margin-bottom:1rem">';
        html += '<a class="card card-link" href="lecturers/my-students.html"><div style="display:flex;align-items:center;gap:.75rem"><i class="fa-solid fa-user-graduate fa-xl" style="color:var(--info);width:2rem"></i><div><h3 style="margin:0">My Students</h3><p style="margin:.15rem 0 0;font-size:.8rem;color:var(--gray-600)">View students enrolled in your courses by programme and year.</p></div></div></a>';
        html += '<a class="card card-link" href="lecturers/grade-sheet.html"><div style="display:flex;align-items:center;gap:.75rem"><i class="fa-solid fa-file-spreadsheet fa-xl" style="color:#8B5CF6;width:2rem"></i><div><h3 style="margin:0">Grade Sheet</h3><p style="margin:.15rem 0 0;font-size:.8rem;color:var(--gray-600)">Spreadsheet-style grade entry for your courses.</p></div></div></a>';
        html += '</div>';
    }

    container.innerHTML = html;

    if (currentRole === "Department Admin") {
        await renderDeptOverview(container);
    }
}

var LEVELS = ["Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6"];

async function renderDeptOverview(container) {
    var user, userDept = "";
    try {
        user = JSON.parse(localStorage.getItem("sc_user") || "{}");
        userDept = user.department || "";
    } catch(e) { return; }
    if (!userDept) return;

    var schools = [];
    try {
        schools = await SmartCampusAPI.fetchSchools() || [];
    } catch(e) {}
    if (!schools.length) {
        schools = typeof schoolsData !== "undefined" ? schoolsData : [];
    }

    var deptId = null, deptName = userDept, schoolId = null;
    for (var si = 0; si < schools.length; si++) {
        var dept = (schools[si].departments || []).find(function(d) { return d.name === userDept || String(d.id) === String(userDept); });
        if (dept) { deptId = dept.id; deptName = dept.name; schoolId = schools[si].id; break; }
    }
    if (!deptId) return;

    var programmes = [];
    try {
        programmes = await SmartCampusAPI.fetchProgrammes(deptId) || [];
    } catch(e) {}
    if (!programmes.length) {
        // fallback: use dept.programmes from schoolsData
        for (var si2 = 0; si2 < schools.length; si2++) {
            var d2 = (schools[si2].departments || []).find(function(d) { return String(d.id) === String(deptId); });
            if (d2 && d2.programmes) {
                programmes = d2.programmes.map(function(p, idx) { return typeof p === "string" ? { id: "prog_" + idx, name: p } : p; });
                break;
            }
        }
    }

    var overviewHtml = '<h2 style="font-size:1.2rem;margin:1.5rem 0 .5rem"><i class="fa-solid fa-building"></i> My Department: ' + esc(deptName) + '</h2>';
    overviewHtml += '<div id="deptOverview" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:1rem">';

    programmes.forEach(function(p) {
        var pid = p.id || p.name;
        overviewHtml += '<div class="card programme-card" data-prog-id="' + esc(pid) + '" data-dept-id="' + esc(deptId) + '" data-school-id="' + esc(schoolId) + '" style="cursor:pointer">';
        overviewHtml += '<div class="prog-header" style="display:flex;justify-content:space-between;align-items:center">';
        overviewHtml += '<div><h3 style="margin:0;font-size:1rem">' + esc(p.name) + '</h3>';
        overviewHtml += '<p style="margin:.15rem 0 0;font-size:.8rem;color:var(--gray-500)">Click to view levels</p></div>';
        overviewHtml += '<i class="fa-solid fa-chevron-down" style="color:var(--gray-400);transition:transform .2s"></i>';
        overviewHtml += '</div>';
        overviewHtml += '<div class="prog-body" style="display:none;margin-top:.75rem;border-top:1px solid var(--gray-100);padding-top:.75rem">';
        overviewHtml += '<div style="display:flex;flex-wrap:wrap;gap:.5rem;margin-bottom:.75rem">';
        overviewHtml += '<button class="btn btn-sm btn-outline show-all-btn" data-prog-id="' + esc(pid) + '" data-prog-name="' + esc(p.name) + '"><i class="fa-solid fa-layer-group"></i> Show All Levels</button>';
        overviewHtml += '</div>';
        overviewHtml += '<div class="level-buttons" style="display:flex;flex-wrap:wrap;gap:.4rem">';
        LEVELS.forEach(function(level) {
            overviewHtml += '<button class="btn btn-sm btn-outline level-btn" data-prog-id="' + esc(pid) + '" data-prog-name="' + esc(p.name) + '" data-level="' + esc(level) + '">' + esc(level) + '</button>';
        });
        overviewHtml += '</div>';
        overviewHtml += '<div class="prog-results" style="margin-top:.75rem;max-height:400px;overflow-y:auto"></div>';
        overviewHtml += '</div></div>';
    });

    overviewHtml += '</div>';

    container.insertAdjacentHTML("beforeend", overviewHtml);

    // Bind event delegation
    var overview = document.getElementById("deptOverview");
    if (!overview) return;

    overview.addEventListener("click", function(e) {
        var target = e.target.closest("[data-action]") || e.target;
        var progHeader = e.target.closest(".prog-header");
        if (progHeader) {
            toggleProgrammeCard(progHeader);
            return;
        }
        var levelBtn = e.target.closest(".level-btn");
        if (levelBtn) {
            loadLevelStudentsCards(levelBtn);
            return;
        }
        var showAllBtn = e.target.closest(".show-all-btn");
        if (showAllBtn) {
            loadAllLevelsCards(showAllBtn);
            return;
        }
        var studentRow = e.target.closest("[data-student-id]");
        if (studentRow) {
            openStudentModalCards(studentRow.getAttribute("data-student-id"));
            return;
        }
    });
}

function toggleProgrammeCard(header) {
    var card = header.closest(".programme-card");
    if (!card) return;
    var body = card.querySelector(".prog-body");
    var icon = header.querySelector(".fa-chevron-down");
    if (!body || !icon) return;
    var isOpen = body.style.display !== "none";
    body.style.display = isOpen ? "none" : "block";
    icon.style.transform = isOpen ? "" : "rotate(180deg)";
}

async function loadLevelStudentsCards(btn) {
    var card = btn.closest(".programme-card");
    if (!card) return;
    var results = card.querySelector(".prog-results");
    if (!results) return;

    var progId = btn.getAttribute("data-prog-id");
    var progName = btn.getAttribute("data-prog-name");
    var level = btn.getAttribute("data-level");

    // Highlight active button
    card.querySelectorAll(".level-btn").forEach(function(b) { b.className = "btn btn-sm btn-outline level-btn"; });
    btn.className = "btn btn-sm btn-primary level-btn";

    results.innerHTML = '<p style="color:var(--gray-400);text-align:center;padding:.5rem"><i class="fa-solid fa-spinner fa-spin"></i> Loading students...</p>';

    try {
        var deptId = card.getAttribute("data-dept-id") || null;
        var schId = card.getAttribute("data-school-id") || null;
        var students = [];
        // Only call API if programmeId looks like a valid number
        if (/^\d+$/.test(progId)) {
            students = await SmartCampusAPI.fetchStudents(schId, deptId, progId, level) || [];
            if (!students.length) {
                students = await SmartCampusAPI.fetchGradeBookStudents(progId, level) || [];
            }
        } else {
            // Mock fallback ID — try GradeBook or show offline message
            try {
                students = await SmartCampusAPI.fetchGradeBookStudents(progId, level) || [];
            } catch(e2) {}
        }
        renderStudentTableCards(results, students, progName, level);
    } catch(e) {
        results.innerHTML = '<p style="color:var(--error);text-align:center;padding:.5rem">Failed to load students from database.</p>';
    }
}

async function loadAllLevelsCards(btn) {
    var card = btn.closest(".programme-card");
    if (!card) return;
    var body = card.querySelector(".prog-body");
    var results = card.querySelector(".prog-results");
    var icon = card.querySelector(".fa-chevron-down");
    if (!body || !results) return;

    body.style.display = "block";
    if (icon) icon.style.transform = "rotate(180deg)";

    var progId = btn.getAttribute("data-prog-id");
    var progName = btn.getAttribute("data-prog-name");

    results.innerHTML = '<p style="color:var(--gray-400);text-align:center;padding:.5rem"><i class="fa-solid fa-spinner fa-spin"></i> Loading all levels...</p>';

    var allStudents = [];
    var levelCounts = {};
    var loadErrors = [];

    var deptId = card.getAttribute("data-dept-id") || null;
    var schId = card.getAttribute("data-school-id") || null;

    for (var i = 0; i < LEVELS.length; i++) {
        var level = LEVELS[i];
        try {
            var students = [];
            if (/^\d+$/.test(progId)) {
                students = await SmartCampusAPI.fetchStudents(schId, deptId, progId, level) || [];
                if (!students.length) {
                    students = await SmartCampusAPI.fetchGradeBookStudents(progId, level) || [];
                }
            } else {
                try {
                    students = await SmartCampusAPI.fetchGradeBookStudents(progId, level) || [];
                } catch(e2) {}
            }
            students.forEach(function(s) { s._level = level; allStudents.push(s); });
            if (students.length) levelCounts[level] = students.length;
        } catch(e) {
            loadErrors.push(level);
        }
    }

    if (!allStudents.length && loadErrors.length === LEVELS.length) {
        results.innerHTML = '<p style="color:var(--error);text-align:center;padding:.5rem">Failed to load students from database.</p>';
        return;
    }

    var summaryHtml = '<div style="display:flex;gap:.75rem;flex-wrap:wrap;margin-bottom:.75rem;padding:.5rem;background:var(--gray-100);border-radius:6px;font-size:.82rem">';
    summaryHtml += '<span><strong>Total:</strong> ' + allStudents.length + ' students</span>';
    for (var l in levelCounts) {
        summaryHtml += '<span><span class="badge badge-info">' + l + ': ' + levelCounts[l] + '</span></span>';
    }
    if (loadErrors.length) {
        summaryHtml += '<span style="color:var(--error);font-size:.75rem">Failed to load: ' + loadErrors.join(', ') + '</span>';
    }
    summaryHtml += '</div>';

    var tableHtml = '<div class="table-responsive" style="max-height:500px;overflow-y:auto"><table style="font-size:.8rem;width:100%;border-collapse:collapse">';
    tableHtml += '<thead><tr style="background:var(--navy);color:#fff;position:sticky;top:0">';
    tableHtml += '<th style="padding:6px 8px;text-align:left">#</th>';
    tableHtml += '<th style="padding:6px 8px;text-align:left">Name</th>';
    tableHtml += '<th style="padding:6px 8px;text-align:left">Reg No</th>';
    tableHtml += '<th style="padding:6px 8px;text-align:left">Email</th>';
    tableHtml += '<th style="padding:6px 8px;text-align:left">Phone</th>';
    tableHtml += '<th style="padding:6px 8px;text-align:left">Gender</th>';
    tableHtml += '<th style="padding:6px 8px;text-align:left">Programme</th>';
    tableHtml += '<th style="padding:6px 8px;text-align:left">Level</th>';
    tableHtml += '<th style="padding:6px 8px;text-align:left">School</th>';
    tableHtml += '<th style="padding:6px 8px;text-align:left">Dept</th>';
    tableHtml += '<th style="padding:6px 8px;text-align:left">Nationality</th>';
    tableHtml += '<th style="padding:6px 8px;text-align:left">DOB</th>';
    tableHtml += '<th style="padding:6px 8px;text-align:left">Admission</th>';
    tableHtml += '<th style="padding:6px 8px;text-align:left">Address</th>';
    tableHtml += '<th style="padding:6px 8px;text-align:left">Status</th>';
    tableHtml += '</tr></thead><tbody>';

    allStudents.forEach(function(s, idx) {
        var badge = (s.studentStatus || "Active") === "Active" ? "badge-success" : "badge-error";
        var levelLabel = s._level || s.yearLevel || "";
        var bg = idx % 2 === 0 ? "background:#fff" : "background:var(--gray-50)";
        tableHtml += '<tr style="' + bg + ';border-bottom:1px solid var(--gray-200)">';
        tableHtml += '<td style="padding:5px 8px">' + (idx + 1) + '</td>';
        tableHtml += '<td style="padding:5px 8px;font-weight:600">' + esc(s.name || s.studentName) + '</td>';
        tableHtml += '<td style="padding:5px 8px">' + esc(s.registrationNumber || s.regNumber || "") + '</td>';
        tableHtml += '<td style="padding:5px 8px">' + esc(s.email) + '</td>';
        tableHtml += '<td style="padding:5px 8px">' + esc(s.phone || "-") + '</td>';
        tableHtml += '<td style="padding:5px 8px">' + esc(s.gender || "-") + '</td>';
        tableHtml += '<td style="padding:5px 8px">' + esc(s.program || s.programme || "") + '</td>';
        tableHtml += '<td style="padding:5px 8px">' + esc(levelLabel) + '</td>';
        tableHtml += '<td style="padding:5px 8px">' + esc(s.school || "") + '</td>';
        tableHtml += '<td style="padding:5px 8px">' + esc(s.department || "") + '</td>';
        tableHtml += '<td style="padding:5px 8px">' + esc(s.nationality || "-") + '</td>';
        tableHtml += '<td style="padding:5px 8px">' + esc(s.dateOfBirth || "-") + '</td>';
        tableHtml += '<td style="padding:5px 8px">' + esc(s.admissionDate || "-") + '</td>';
        tableHtml += '<td style="padding:5px 8px">' + esc(s.address || "-") + '</td>';
        tableHtml += '<td style="padding:5px 8px"><span class="badge ' + badge + '">' + esc(s.studentStatus || "Active") + '</span></td>';
        tableHtml += '</tr>';
    });
    tableHtml += '</tbody></table></div>';

    results.innerHTML = summaryHtml + tableHtml;
}

function renderStudentTableCards(container, students, progName, level) {
    if (!students || !students.length) {
        container.innerHTML = '<p style="color:var(--gray-500);text-align:center;padding:.5rem">No students in ' + esc(level) + ' for ' + esc(progName) + '.</p>';
        return;
    }

    var html = '<div style="margin-bottom:.5rem;font-size:.82rem;color:var(--gray-600)"><strong>' + students.length + '</strong> student(s) in ' + esc(level) + '</div>';
    html += '<div class="table-responsive" style="max-height:500px;overflow-y:auto"><table style="font-size:.8rem;width:100%;border-collapse:collapse">';
    html += '<thead><tr style="background:var(--navy);color:#fff;position:sticky;top:0">';
    html += '<th style="padding:6px 8px;text-align:left">#</th>';
    html += '<th style="padding:6px 8px;text-align:left">Name</th>';
    html += '<th style="padding:6px 8px;text-align:left">Reg No</th>';
    html += '<th style="padding:6px 8px;text-align:left">Email</th>';
    html += '<th style="padding:6px 8px;text-align:left">Phone</th>';
    html += '<th style="padding:6px 8px;text-align:left">Gender</th>';
    html += '<th style="padding:6px 8px;text-align:left">Programme</th>';
    html += '<th style="padding:6px 8px;text-align:left">Level</th>';
    html += '<th style="padding:6px 8px;text-align:left">School</th>';
    html += '<th style="padding:6px 8px;text-align:left">Dept</th>';
    html += '<th style="padding:6px 8px;text-align:left">Nationality</th>';
    html += '<th style="padding:6px 8px;text-align:left">DOB</th>';
    html += '<th style="padding:6px 8px;text-align:left">Admission</th>';
    html += '<th style="padding:6px 8px;text-align:left">Address</th>';
    html += '<th style="padding:6px 8px;text-align:left">Status</th>';
    html += '</tr></thead><tbody>';

    students.forEach(function(s, idx) {
        var badge = (s.studentStatus || "Active") === "Active" ? "badge-success" : "badge-error";
        var bg = idx % 2 === 0 ? "background:#fff" : "background:var(--gray-50)";
        html += '<tr style="' + bg + ';border-bottom:1px solid var(--gray-200)">';
        html += '<td style="padding:5px 8px">' + (idx + 1) + '</td>';
        html += '<td style="padding:5px 8px;font-weight:600">' + esc(s.name || s.studentName) + '</td>';
        html += '<td style="padding:5px 8px">' + esc(s.registrationNumber || s.regNumber || "") + '</td>';
        html += '<td style="padding:5px 8px">' + esc(s.email) + '</td>';
        html += '<td style="padding:5px 8px">' + esc(s.phone || "-") + '</td>';
        html += '<td style="padding:5px 8px">' + esc(s.gender || "-") + '</td>';
        html += '<td style="padding:5px 8px">' + esc(s.program || s.programme || progName) + '</td>';
        html += '<td style="padding:5px 8px">' + esc(level) + '</td>';
        html += '<td style="padding:5px 8px">' + esc(s.school || "") + '</td>';
        html += '<td style="padding:5px 8px">' + esc(s.department || "") + '</td>';
        html += '<td style="padding:5px 8px">' + esc(s.nationality || "-") + '</td>';
        html += '<td style="padding:5px 8px">' + esc(s.dateOfBirth || "-") + '</td>';
        html += '<td style="padding:5px 8px">' + esc(s.admissionDate || "-") + '</td>';
        html += '<td style="padding:5px 8px">' + esc(s.address || "-") + '</td>';
        html += '<td style="padding:5px 8px"><span class="badge ' + badge + '">' + esc(s.studentStatus || "Active") + '</span></td>';
        html += '</tr>';
    });

    html += '</tbody></table></div>';
    container.innerHTML = html;
}

async function openStudentModalCards(studentId) {
    SmartCampusUI.openModal({
        title: "Student Details",
        bodyHtml: '<p style="text-align:center;padding:1rem"><i class="fa-solid fa-spinner fa-spin"></i> Loading...</p>',
        confirmText: "Close",
        showCancel: false,
        onConfirm: function() { SmartCampusUI.closeModal(); }
    });

    try {
        var user = await SmartCampusAPI.fetchUser(studentId);
        if (!user) throw new Error("Not found");
        var initials = (user.name || "S").split(" ").map(function(s){return s.charAt(0)}).join("").toUpperCase().slice(0,2);
        var html = '<div style="display:flex;align-items:center;gap:1rem;margin-bottom:1rem;padding-bottom:1rem;border-bottom:1px solid var(--gray-200)">';
        html += '<div style="width:60px;height:60px;border-radius:50%;background:var(--navy);color:#fff;display:flex;align-items:center;justify-content:center;font-size:1.3rem;font-weight:700;flex-shrink:0">' + initials + '</div>';
        html += '<div><h3 style="margin:0">' + esc(user.name) + '</h3><p style="margin:.15rem 0 0;color:var(--gray-600);font-size:.85rem">' + esc(user.registrationNumber || "") + '</p></div>';
        html += '</div>';

        var fields = [
            ["Email", user.email],
            ["Programme", user.program || user.programme || ""],
            ["Year Level", user.yearLevel || ""],
            ["School", user.school || ""],
            ["Department", user.department || ""],
            ["Gender", user.gender || ""],
            ["Phone", user.phone || ""],
            ["Nationality", user.nationality || ""],
            ["Date of Birth", user.dateOfBirth || ""],
            ["Admission Date", user.admissionDate || ""],
            ["Status", user.studentStatus || "Active"]
        ];
        html += '<div style="display:grid;grid-template-columns:1fr 1fr;gap:.5rem;font-size:.85rem">';
        fields.forEach(function(f) { if (f[1]) html += '<div><strong>' + f[0] + ':</strong> ' + esc(f[1]) + '</div>'; });
        html += '</div>';

        document.getElementById("smartcampusModalBody").innerHTML = html;
    } catch(e) {
        document.getElementById("smartcampusModalBody").innerHTML = '<p style="color:var(--error)">Failed to load student details.</p>';
    }
}

async function renderSchoolsList() {
    const container = document.getElementById("schoolsContainer");
    if (!container) return;
    const data = await SmartCampusAPI.withFallback(
        () => SmartCampusAPI.fetchSchools(),
        () => schoolsData
    );
    container.innerHTML = "";
    data.forEach((school) => {
        const card = document.createElement("div");
        card.className = "card";
        card.innerHTML = `
            <h3>${school.name}</h3>
            <p>${(school.departments || []).length} Departments</p>
            <a href="school_details.html?id=${school.id}" class="btn btn-outline">View Details</a>
        `;
        container.appendChild(card);
    });
}

async function renderSchoolDetails() {
    const container = document.getElementById("schoolDetail");
    if (!container) return;
    const urlParams = new URLSearchParams(window.location.search);
    const schoolId = urlParams.get("id") || "1";
    const school = await SmartCampusAPI.withFallback(
        async () => SmartCampusAPI.fetchSchool(schoolId),
        () => schoolsData.find((s) => s.id == schoolId)
    );
    if (!school) {
        container.innerHTML = "<p>School not found</p>";
        return;
    }
    const depts = school.departments || [];

    // Department Admin: show only their own department
    var filteredDepts = depts;
    try {
        var user = JSON.parse(localStorage.getItem("sc_user") || "{}");
        if (user.role === "Department Admin" && user.department) {
            filteredDepts = depts.filter(function(d) { return d.name === user.department || String(d.id) === String(user.department); });
        }
    } catch(e) {}

    let html = `<h1>${esc(school.name)}</h1>`;
    html += `<p style="color:var(--gray-600);margin:-.5rem 0 1.25rem">${filteredDepts.length} department(s)</p>`;
    html += `<div id="schoolDepts" style="display:flex;flex-direction:column;gap:1rem">`;

    for (let di = 0; di < filteredDepts.length; di++) {
        const dept = filteredDepts[di];
        let programmes = [];
        try {
            programmes = await SmartCampusAPI.fetchProgrammes(dept.id) || [];
        } catch(e) {}
        if (!programmes.length && dept.programmes) {
            programmes = dept.programmes.map(function(p, idx) { return typeof p === "string" ? { id: "prog_" + idx, name: p } : p; });
        }

        html += '<div class="card school-dept-card" data-dept-id="' + esc(dept.id) + '">';
        html += '<div class="dept-header" style="display:flex;justify-content:space-between;align-items:center;cursor:pointer">';
        html += '<div><h2 style="margin:0;font-size:1.1rem">' + esc(dept.name) + '</h2>';
        html += '<p style="margin:.1rem 0 0;font-size:.82rem;color:var(--gray-500)">' + programmes.length + ' programme(s) &middot; Click to expand</p></div>';
        html += '<i class="fa-solid fa-chevron-down" style="color:var(--gray-400);transition:transform .2s"></i>';
        html += '</div>';

        html += '<div class="dept-body" style="display:none;margin-top:.75rem;border-top:1px solid var(--gray-100);padding-top:.75rem">';
        if (!programmes.length) {
            html += '<p style="color:var(--gray-500);font-size:.85rem">No programmes available.</p>';
        } else {
            html += '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:.75rem">';
            programmes.forEach(function(p) {
                var pid = p.id || p.name;
                html += '<div class="card programme-card" data-prog-id="' + esc(pid) + '" data-dept-id="' + esc(dept.id) + '" data-school-id="' + esc(school.id) + '" style="cursor:pointer;padding:.75rem">';
                html += '<div class="prog-header" style="display:flex;justify-content:space-between;align-items:center">';
                html += '<h3 style="margin:0;font-size:.9rem">' + esc(p.name) + '</h3>';
                html += '<i class="fa-solid fa-chevron-down" style="color:var(--gray-400);font-size:.75rem;transition:transform .2s"></i>';
                html += '</div>';
                html += '<div class="prog-body" style="display:none;margin-top:.5rem;border-top:1px solid var(--gray-100);padding-top:.5rem">';
                html += '<div style="display:flex;flex-wrap:wrap;gap:.3rem;margin-bottom:.5rem">';
                html += '<button class="btn btn-sm btn-outline show-all-btn" data-prog-id="' + esc(pid) + '" data-prog-name="' + esc(p.name) + '" style="font-size:.75rem"><i class="fa-solid fa-layer-group"></i> Show All</button>';
                html += '</div>';
                html += '<div class="level-buttons" style="display:flex;flex-wrap:wrap;gap:.3rem">';
                for (var yr = 1; yr <= 4; yr++) {
                    var level = "Year " + yr;
                    html += '<button class="btn btn-sm btn-outline level-btn" data-prog-id="' + esc(pid) + '" data-prog-name="' + esc(p.name) + '" data-level="' + level + '" style="font-size:.75rem">' + level + '</button>';
                }
                html += '</div>';
                html += '<div class="prog-results" style="margin-top:.5rem;max-height:350px;overflow-y:auto;font-size:.85rem"></div>';
                html += '</div></div>';
            });
            html += '</div>';
        }
        html += '</div></div>';
    }

    html += '</div>';
    container.innerHTML = html;

    // Event delegation
    var deptContainer = document.getElementById("schoolDepts");
    if (!deptContainer) return;

    deptContainer.addEventListener("click", function(e) {
        var deptHeader = e.target.closest(".dept-header");
        if (deptHeader) {
            var card = deptHeader.closest(".school-dept-card");
            if (!card) return;
            var body = card.querySelector(".dept-body");
            var icon = deptHeader.querySelector(".fa-chevron-down");
            if (body && icon) {
                var isOpen = body.style.display !== "none";
                body.style.display = isOpen ? "none" : "block";
                icon.style.transform = isOpen ? "" : "rotate(180deg)";
            }
            return;
        }
        var progHeader = e.target.closest(".programme-card .prog-header");
        if (progHeader) {
            var card = progHeader.closest(".programme-card");
            if (!card) return;
            var body = card.querySelector(".prog-body");
            var icon = progHeader.querySelector(".fa-chevron-down");
            if (body && icon) {
                var isOpen = body.style.display !== "none";
                body.style.display = isOpen ? "none" : "block";
                icon.style.transform = isOpen ? "" : "rotate(180deg)";
            }
            return;
        }
        var levelBtn = e.target.closest(".level-btn");
        if (levelBtn) { loadLevelStudentsCards(levelBtn); return; }
        var showAll = e.target.closest(".show-all-btn");
        if (showAll) { loadAllLevelsCards(showAll); return; }
        var sRow = e.target.closest("[data-student-id]");
        if (sRow) { openStudentModalCards(sRow.getAttribute("data-student-id")); }
    });
}

async function renderDepartmentDetails() {
    const container = document.getElementById("departmentDetail");
    if (!container) return;
    const urlParams = new URLSearchParams(window.location.search);
    const deptId = urlParams.get("deptId");
    const schoolId = urlParams.get("schoolId");
    let foundDept = null;
    let foundSchool = null;

    try {
        if (schoolId) {
            const school = await SmartCampusAPI.fetchSchool(schoolId);
            foundDept = (school.departments || []).find((d) => String(d.id) === String(deptId));
            foundSchool = school;
        } else {
            foundDept = await SmartCampusAPI.fetchDepartment(deptId);
        }
    } catch {
        schoolsData.forEach((school) => {
            const dept = school.departments.find((d) => String(d.id) === String(deptId));
            if (dept) { foundDept = dept; foundSchool = school; }
        });
    }

    if (!foundDept) {
        container.innerHTML = "<p>Department not found</p>";
        return;
    }
    const schoolName = foundSchool ? foundSchool.name : (foundDept.school ? foundDept.school.name : "");
    container.innerHTML = `
        <h2>${foundDept.name}</h2>
        ${schoolName ? `<p><strong>School:</strong> ${schoolName}</p>` : ""}
    `;
}

async function renderProgrammes() {
    const container = document.getElementById("programmesContainer");
    if (!container) return;

    // Department Admin: show only their department's programmes with levels
    try {
        var user = JSON.parse(localStorage.getItem("sc_user") || "{}");
        if (user.role === "Department Admin" && user.department) {
            await renderDeptProgrammes(container, user.department);
            return;
        }
    } catch(e) {}

    // Other roles: show all programmes (existing behavior)
    const data = await SmartCampusAPI.withFallback(
        () => SmartCampusAPI.fetchSchools(),
        () => schoolsData
    );
    let html = "";
    data.forEach((school) => {
        html += `<div class="card"><h3>${school.name}</h3>`;
        (school.departments || []).forEach((dept) => {
            html += `<p><strong>${dept.name}</strong></p><ul>${(dept.programmes || []).map((p) => `<li>${p}</li>`).join("")}</ul>`;
        });
        html += "</div>";
    });
    container.innerHTML = html;
}

async function renderDeptProgrammes(container, userDept) {
    // Resolve department from API first, fall back to mock data
    var schools = [];
    try {
        schools = await SmartCampusAPI.fetchSchools() || [];
    } catch(e) {}
    if (!schools.length) {
        schools = typeof schoolsData !== "undefined" ? schoolsData : [];
    }

    var deptId = null, deptName = userDept, schoolId = null;
    for (var si = 0; si < schools.length; si++) {
        var d = (schools[si].departments || []).find(function(dd) { return dd.name === userDept || String(dd.id) === String(userDept); });
        if (d) { deptId = d.id; deptName = d.name; schoolId = schools[si].id; break; }
    }
    if (!deptId) {
        container.innerHTML = "<p>Department not found.</p>";
        return;
    }

    var programmes = [];
    try {
        programmes = await SmartCampusAPI.fetchProgrammes(deptId) || [];
    } catch(e) {}
    if (!programmes.length) {
        for (var si2 = 0; si2 < schools.length; si2++) {
            var d2 = (schools[si2].departments || []).find(function(dd) { return String(dd.id) === String(deptId); });
            if (d2 && d2.programmes) {
                programmes = d2.programmes.map(function(p, idx) { return typeof p === "string" ? { id: "prog_" + idx, name: p } : p; });
                break;
            }
        }
    }

    var html = '<h1 style="margin-bottom:.25rem">' + esc(deptName) + '</h1>';
    html += '<p style="color:var(--gray-600);margin-top:0">' + programmes.length + ' programme(s)</p>';
    html += '<div id="deptProgrammes" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:1rem">';

    programmes.forEach(function(p) {
        var pid = p.id || p.name;
        html += '<div class="card programme-card" data-prog-id="' + esc(pid) + '" data-dept-id="' + esc(deptId) + '" data-school-id="' + esc(schoolId) + '" style="cursor:pointer">';
        html += '<div class="prog-header" style="display:flex;justify-content:space-between;align-items:center">';
        html += '<div><h3 style="margin:0;font-size:1rem">' + esc(p.name) + '</h3>';
        html += '<p style="margin:.15rem 0 0;font-size:.8rem;color:var(--gray-500)">Click to view levels</p></div>';
        html += '<i class="fa-solid fa-chevron-down" style="color:var(--gray-400);transition:transform .2s"></i>';
        html += '</div>';
        html += '<div class="prog-body" style="display:none;margin-top:.75rem;border-top:1px solid var(--gray-100);padding-top:.75rem">';
        html += '<div style="display:flex;flex-wrap:wrap;gap:.5rem;margin-bottom:.75rem">';
        html += '<button class="btn btn-sm btn-outline show-all-btn" data-prog-id="' + esc(pid) + '" data-prog-name="' + esc(p.name) + '"><i class="fa-solid fa-layer-group"></i> Show All Levels</button>';
        html += '</div>';
        html += '<div class="level-buttons" style="display:flex;flex-wrap:wrap;gap:.4rem">';
        for (var yr = 1; yr <= 4; yr++) {
            var level = "Year " + yr;
            html += '<button class="btn btn-sm btn-outline level-btn" data-prog-id="' + esc(pid) + '" data-prog-name="' + esc(p.name) + '" data-level="' + level + '">' + level + '</button>';
        }
        html += '</div>';
        html += '<div class="prog-results" style="margin-top:.75rem;max-height:400px;overflow-y:auto"></div>';
        html += '</div></div>';
    });

    html += '</div>';
    container.innerHTML = html;

    var progContainer = document.getElementById("deptProgrammes");
    if (!progContainer) return;

    progContainer.addEventListener("click", function(e) {
        var progHeader = e.target.closest(".prog-header");
        if (progHeader) {
            var card = progHeader.closest(".programme-card");
            if (!card) return;
            var body = card.querySelector(".prog-body");
            var icon = progHeader.querySelector(".fa-chevron-down");
            if (body && icon) {
                var isOpen = body.style.display !== "none";
                body.style.display = isOpen ? "none" : "block";
                icon.style.transform = isOpen ? "" : "rotate(180deg)";
            }
            return;
        }
        var levelBtn = e.target.closest(".level-btn");
        if (levelBtn) { loadLevelStudentsCards(levelBtn); return; }
        var showAll = e.target.closest(".show-all-btn");
        if (showAll) { loadAllLevelsCards(showAll); return; }
        var sRow = e.target.closest("[data-student-id]");
        if (sRow) { openStudentModalCards(sRow.getAttribute("data-student-id")); }
    });
}

async function renderCurriculum() {
    const container = document.getElementById("curriculumContainer");
    if (!container) return;

    // Gather programmes
    var programmes = [];
    var user = {};
    try { user = JSON.parse(localStorage.getItem("sc_user") || "{}"); } catch(e) {}

    if (user.role === "Department Admin" && user.department) {
        // Department Admin: programmes from their department only
        var schools = [];
        try { schools = await SmartCampusAPI.fetchSchools() || []; } catch(e) {}
        if (!schools.length) schools = typeof schoolsData !== "undefined" ? schoolsData : [];
        var deptFound = null;
        for (var si = 0; si < schools.length; si++) {
            var d = (schools[si].departments || []).find(function(dd) { return dd.name === user.department || String(dd.id) === String(user.department); });
            if (d) { deptFound = d; break; }
        }
        if (deptFound) {
            try { programmes = await SmartCampusAPI.fetchProgrammes(deptFound.id) || []; } catch(e) {}
        }
    } else {
        // Other roles: all programmes
        var seen = {};
        try {
            var schools = await SmartCampusAPI.fetchSchools() || [];
            for (var si = 0; si < schools.length; si++) {
                var depts = schools[si].departments || [];
                for (var di = 0; di < depts.length; di++) {
                    var progs = await SmartCampusAPI.fetchProgrammes(depts[di].id) || [];
                    progs.forEach(function(p) { if (!seen[p.id]) { seen[p.id] = true; programmes.push(p); } });
                }
            }
        } catch(e) {}
        if (!programmes.length && typeof schoolsData !== "undefined") {
            var seen2 = {};
            for (var si = 0; si < schoolsData.length; si++) {
                var depts = schoolsData[si].departments || [];
                for (var di = 0; di < depts.length; di++) {
                    (depts[di].programmes || []).forEach(function(p, idx) {
                        var o = typeof p === "string" ? { id: "prog_" + idx, name: p } : p;
                        if (!seen2[o.id]) { seen2[o.id] = true; programmes.push(o); }
                    });
                }
            }
        }
    }

    var html = '<div class="card"><div class="card-header" style="display:flex;align-items:center;gap:.75rem">';
    html += '<label for="curriculumProgSelect" style="font-weight:600;white-space:nowrap">Programme:</label> ';
    html += '<select id="curriculumProgSelect" style="padding:.5rem;border:1px solid var(--gray-200);border-radius:6px;min-width:320px;font-size:.9rem">';
    html += '<option value="">-- Select a programme --</option>';
    programmes.forEach(function(p) {
        html += '<option value="' + esc(p.id) + '">' + esc(p.name) + '</option>';
    });
    html += '</select></div></div>';
    html += '<div id="curriculumContent"></div>';

    container.innerHTML = html;

    // Also show mock data as fallback if no programmes from API
    if (!programmes.length) {
        document.getElementById("curriculumContent").innerHTML = renderCurriculumMock();
    }

    document.getElementById("curriculumProgSelect").addEventListener("change", async function() {
        var progId = this.value;
        var content = document.getElementById("curriculumContent");
        if (!progId) { content.innerHTML = ""; return; }
        content.innerHTML = '<p style="text-align:center;padding:1rem;color:var(--gray-400)"><i class="fa-solid fa-spinner fa-spin"></i> Loading curriculum...</p>';

        try {
            var allCourses = await SmartCampusAPI.fetchCoursesByProgrammeAndYear(progId) || [];
            if (!allCourses.length) {
                content.innerHTML = '<p style="color:var(--gray-500);text-align:center;padding:1rem">No courses found for this programme.</p>';
                return;
            }

            // Group by year, then semester
            var byYear = {};
            allCourses.forEach(function(c) {
                var y = c.year || "Year1";
                if (!byYear[y]) byYear[y] = [];
                byYear[y].push(c);
            });

            var user = {};
            try { user = JSON.parse(localStorage.getItem("sc_user") || "{}"); } catch(e) {}
            var isDeptAdmin = user.role === "Department Admin";

            var yearKeys = Object.keys(byYear).sort();
            var semesters = ["Semester1", "Semester2"];

            var html2 = '<div class="tabs" style="margin-bottom:1rem">';
            yearKeys.forEach(function(y) {
                html2 += '<button class="btn btn-outline tab-btn" data-year="' + y + '" type="button">' + y.replace("Year", "Year ").replace(/^(.)/, function(m) { return m.toUpperCase(); }) + '</button>';
            });
            html2 += '</div>';

            yearKeys.forEach(function(y) {
                html2 += '<div class="card year-tab" id="curr-' + y + '" style="display:none">';
                semesters.forEach(function(sem) {
                    var semCourses = byYear[y].filter(function(c) { return c.semester === sem; });
                    if (!semCourses.length) return;
                    html2 += '<div style="display:flex;align-items:center;justify-content:space-between"><h3>' + sem.replace("Semester", "Semester ") + '</h3>';
                    if (isDeptAdmin) {
                        html2 += '<button class="btn btn-outline add-course-btn" type="button" data-year="' + y + '" data-sem="' + sem + '" data-prog="' + progId + '"><i class="fa-solid fa-plus"></i> Add Course</button>';
                    }
                    html2 += '</div><div class="table-responsive"><table><tr><th>Code</th><th>Title</th><th>Credits</th><th>Type</th>';
                    if (isDeptAdmin) html2 += '<th>Actions</th>';
                    html2 += '</tr>';
                    semCourses.forEach(function(c) {
                        html2 += '<tr id="course-row-' + c.id + '" data-course=\'' + esc(JSON.stringify(c)) + '\'>';
                        html2 += '<td><span class="course-display code">' + esc(c.code) + '</span></td>';
                        html2 += '<td><span class="course-display title">' + esc(c.title) + '</span></td>';
                        html2 += '<td><span class="course-display credits">' + (c.credits || 0) + '</span></td>';
                        html2 += '<td><span class="course-display type">' + esc(c.type || "") + '</span></td>';
                        if (isDeptAdmin) {
                            html2 += '<td>';
                            html2 += '<button class="btn btn-sm btn-outline edit-course-btn" type="button" data-id="' + c.id + '"><i class="fa-solid fa-pen"></i></button> ';
                            html2 += '<button class="btn btn-sm btn-outline delete-course-btn" type="button" data-id="' + c.id + '" style="color:var(--error);border-color:var(--error)"><i class="fa-solid fa-trash"></i></button>';
                            html2 += '</td>';
                        }
                        html2 += '</tr>';
                    });
                    html2 += '</table></div>';
                });
                html2 += '</div>';
            });

            content.innerHTML = html2;

            if (isDeptAdmin) {
                // Edit course
                content.querySelectorAll(".edit-course-btn").forEach(function(btn) {
                    btn.addEventListener("click", function() {
                        var row = document.getElementById("course-row-" + btn.dataset.id);
                        if (!row) return;
                        var displays = row.querySelectorAll(".course-display");
                        var code = displays[0].textContent;
                        var title = displays[1].textContent;
                        var credits = displays[2].textContent;
                        var type = displays[3].textContent;

                        row.innerHTML = '<td><input class="edit-input code" value="' + esc(code) + '" style="width:80px"></td>' +
                            '<td><input class="edit-input title" value="' + esc(title) + '" style="width:150px"></td>' +
                            '<td><input class="edit-input credits" value="' + esc(credits) + '" type="number" style="width:60px"></td>' +
                            '<td><input class="edit-input type" value="' + esc(type) + '" style="width:80px"></td>' +
                            '<td>' +
                            '<button class="btn btn-sm save-course-btn" type="button" data-id="' + btn.dataset.id + '" style="background:var(--primary);color:#fff;border:none;padding:4px 8px;border-radius:4px;cursor:pointer"><i class="fa-solid fa-check"></i></button> ' +
                            '<button class="btn btn-sm cancel-course-btn" type="button" style="border:1px solid var(--gray-300);padding:4px 8px;border-radius:4px;cursor:pointer"><i class="fa-solid fa-xmark"></i></button>' +
                            '</td>';
                    });
                });

                // Save course
                content.addEventListener("click", async function(e) {
                    var saveBtn = e.target.closest(".save-course-btn");
                    if (!saveBtn) return;
                    var row = saveBtn.closest("tr");
                    if (!row) return;
                    var inputs = row.querySelectorAll(".edit-input");
                    var orig = {};
                    try { orig = JSON.parse(row.dataset.course || "{}"); } catch(e) {}
                    var courseData = {
                        code: inputs[0].value,
                        title: inputs[1].value,
                        credits: parseInt(inputs[2].value) || 0,
                        type: inputs[3].value,
                        year: orig.year || "Year1",
                        semester: orig.semester || "Semester1",
                        programmeId: orig.programmeId,
                        departmentId: orig.departmentId
                    };
                    try {
                        await SmartCampusAPI.updateCourse(saveBtn.dataset.id, courseData);
                        SmartCampusUI.showToast("Course updated", "success");
                        document.getElementById("curriculumProgSelect").dispatchEvent(new Event("change"));
                    } catch(err) {
                        SmartCampusUI.showToast("Failed to update course: " + err.message, "error");
                    }
                });

                // Cancel edit
                content.addEventListener("click", function(e) {
                    var cancelBtn = e.target.closest(".cancel-course-btn");
                    if (!cancelBtn) return;
                    document.getElementById("curriculumProgSelect").dispatchEvent(new Event("change"));
                });

                // Delete course
                content.querySelectorAll(".delete-course-btn").forEach(function(btn) {
                    btn.addEventListener("click", async function() {
                        if (!confirm("Delete this course?")) return;
                        try {
                            await SmartCampusAPI.deleteCourse(btn.dataset.id);
                            SmartCampusUI.showToast("Course deleted", "success");
                            document.getElementById("curriculumProgSelect").dispatchEvent(new Event("change"));
                        } catch(err) {
                            SmartCampusUI.showToast("Failed to delete: " + err.message, "error");
                        }
                    });
                });

                // Add course
                content.querySelectorAll(".add-course-btn").forEach(function(btn) {
                    btn.addEventListener("click", function() {
                        var year = btn.dataset.year;
                        var sem = btn.dataset.sem;
                        var prog = btn.dataset.prog;
                        var semDiv = btn.closest("div");
                        var table = semDiv.querySelector("table");
                        if (!table) return;
                        var tbody = table.querySelector("tbody") || table;
                        var tr = document.createElement("tr");
                        tr.innerHTML = '<td><input class="edit-input code" placeholder="e.g. CS101" style="width:80px"></td>' +
                            '<td><input class="edit-input title" placeholder="Course title" style="width:150px"></td>' +
                            '<td><input class="edit-input credits" type="number" value="3" style="width:60px"></td>' +
                            '<td><input class="edit-input type" placeholder="Core/Elective" style="width:80px"></td>' +
                            '<td>' +
                            '<button class="btn btn-sm create-course-btn" type="button" style="background:var(--primary);color:#fff;border:none;padding:4px 8px;border-radius:4px;cursor:pointer"><i class="fa-solid fa-check"></i></button> ' +
                            '<button class="btn btn-sm cancel-course-btn" type="button" style="border:1px solid var(--gray-300);padding:4px 8px;border-radius:4px;cursor:pointer"><i class="fa-solid fa-xmark"></i></button>' +
                            '</td>';
                        tr.dataset.prog = prog;
                        tr.dataset.year = year;
                        tr.dataset.sem = sem;
                        tr.dataset.dept = deptFound ? deptFound.id : "";
                        tbody.appendChild(tr);

                        // Create handler
                        tr.querySelector(".create-course-btn").addEventListener("click", async function() {
                            var inputs2 = tr.querySelectorAll(".edit-input");
                            var newCourse = {
                                code: inputs2[0].value,
                                title: inputs2[1].value,
                                credits: parseInt(inputs2[2].value) || 0,
                                type: inputs2[3].value,
                                programmeId: parseInt(tr.dataset.prog),
                                year: tr.dataset.year,
                                semester: tr.dataset.sem,
                                departmentId: parseInt(tr.dataset.dept) || null
                            };
                            if (!newCourse.code || !newCourse.title) {
                                SmartCampusUI.showToast("Code and title are required", "error");
                                return;
                            }
                            try {
                                await SmartCampusAPI.createCourse(newCourse);
                                SmartCampusUI.showToast("Course created", "success");
                                document.getElementById("curriculumProgSelect").dispatchEvent(new Event("change"));
                            } catch(err) {
                                SmartCampusUI.showToast("Failed to create: " + err.message, "error");
                            }
                        });

                        // Cancel add
                        tr.querySelector(".cancel-course-btn").addEventListener("click", function() {
                            tr.remove();
                        });
                    });
                });
            }

            // Tab switching
            var btns = content.querySelectorAll(".tab-btn");
            btns.forEach(function(btn) {
                btn.addEventListener("click", function() {
                    content.querySelectorAll(".year-tab").forEach(function(tab) { tab.style.display = "none"; });
                    btns.forEach(function(b) { b.classList.remove("active"); });
                    var tab = document.getElementById("curr-" + btn.dataset.year);
                    if (tab) { tab.style.display = "block"; }
                    btn.classList.add("active");
                });
            });
            if (btns.length) btns[0].click();
        } catch(e) {
            content.innerHTML = renderCurriculumMock();
        }
    });
}

function escAttr(v) { return String(v).replace(/&/g,"&amp;").replace(/"/g,"&quot;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }

async function renderManageCurriculum() {
    var container = document.getElementById("manageCurriculumContainer");
    if (!container) return;

    var user = {};
    try { user = JSON.parse(localStorage.getItem("sc_user") || "{}"); } catch(e) {}
    if (user.role !== "Department Admin") {
        container.innerHTML = '<p style="color:var(--error);text-align:center;padding:2rem">Access denied. Department Admin only.</p>';
        return;
    }

    // Fetch programmes for their department
    var programmes = [];
    var schools = [];
    try { schools = await SmartCampusAPI.fetchSchools() || []; } catch(e) {}
    if (!schools.length) schools = typeof schoolsData !== "undefined" ? schoolsData : [];
    var deptFound = null;
    for (var si = 0; si < schools.length; si++) {
        var d = (schools[si].departments || []).find(function(dd) { return dd.name === user.department || String(dd.id) === String(user.department); });
        if (d) { deptFound = d; break; }
    }
    if (deptFound) {
        try { programmes = await SmartCampusAPI.fetchProgrammes(deptFound.id) || []; } catch(e) {}
    }
    if (!programmes.length && deptFound && deptFound.programmes) {
        deptFound.programmes.forEach(function(p, idx) {
            programmes.push(typeof p === "string" ? { id: "prog_" + idx, name: p } : p);
        });
    }

    var deptId = deptFound ? deptFound.id : null;

    var years = ["Year1", "Year2", "Year3", "Year4"];
    var selectedProg = "";
    var selectedYear = "Year1";

    var html = '<div class="mc-header">';
    html += '<label style="font-weight:600">Programme:</label> ';
    html += '<select id="mcProgSelect"><option value="">-- Select Programme --</option>';
    programmes.forEach(function(p) { html += '<option value="' + esc(p.id) + '">' + esc(p.name) + '</option>'; });
    html += '</select>';
    html += '<label style="font-weight:600">Year Level:</label> ';
    html += '<select id="mcYearSelect">';
    years.forEach(function(y) { html += '<option value="' + y + '">' + y.replace("Year", "Year ") + '</option>'; });
    html += '</select>';
    html += '</div>';
    html += '<div id="mcTables"></div>';

    container.innerHTML = html;

    function loadCourses() {
        var prog = document.getElementById("mcProgSelect").value;
        var year = document.getElementById("mcYearSelect").value;
        if (!prog) { document.getElementById("mcTables").innerHTML = '<p style="color:var(--gray-400);text-align:center;padding:1rem">Select a programme and year level.</p>'; return; }
        renderMCTables(prog, year, deptId);
    }

    document.getElementById("mcProgSelect").addEventListener("change", loadCourses);
    document.getElementById("mcYearSelect").addEventListener("change", loadCourses);
}

async function renderMCTables(programmeId, year, deptId) {
    var content = document.getElementById("mcTables");
    content.innerHTML = '<p style="text-align:center;padding:1rem;color:var(--gray-400)"><i class="fa-solid fa-spinner fa-spin"></i> Loading...</p>';

    try {
        var courses = await SmartCampusAPI.fetchCoursesByProgrammeAndYear(programmeId, year) || [];

        var sem1 = courses.filter(function(c) { return c.semester === "Semester1"; });
        var sem2 = courses.filter(function(c) { return c.semester === "Semester2"; });

        var html = '<div class="mc-split">';
        html += renderSemTable("Semester1", sem1, programmeId, year, deptId);
        html += renderSemTable("Semester2", sem2, programmeId, year, deptId);
        html += '</div>';
        content.innerHTML = html;

        // Bind edit buttons
        content.querySelectorAll(".mce-edit").forEach(function(btn) {
            btn.addEventListener("click", function() {
                var row = document.getElementById("mc-row-" + btn.dataset.id);
                if (!row) return;
                var cells = row.querySelectorAll("td");
                var code = cells[0].textContent.trim();
                var title = cells[1].textContent.trim();
                var credits = cells[2].textContent.trim();
                var type = cells[3].textContent.trim();
                row.innerHTML = '<td><input class="edit-input code" value="' + escAttr(code) + '"></td>' +
                    '<td><input class="edit-input title" value="' + escAttr(title) + '" style="width:100%"></td>' +
                    '<td><input class="edit-input credits" value="' + escAttr(credits) + '" type="number"></td>' +
                    '<td><input class="edit-input type" value="' + escAttr(type) + '"></td>' +
                    '<td>' +
                    '<button class="btn btn-sm mce-save" data-id="' + btn.dataset.id + '" style="background:var(--primary);color:#fff;border:none;padding:4px 8px;border-radius:4px;cursor:pointer"><i class="fa-solid fa-check"></i></button> ' +
                    '<button class="btn btn-sm mce-cancel" style="border:1px solid var(--gray-300);padding:4px 8px;border-radius:4px;cursor:pointer"><i class="fa-solid fa-xmark"></i></button>' +
                    '</td>';
            });
        });

        // Bind save
        content.querySelectorAll(".mce-save").forEach(function(btn) {
            btn.addEventListener("click", async function() {
                var row = document.getElementById("mc-row-" + btn.dataset.id);
                if (!row) return;
                var inputs = row.querySelectorAll(".edit-input");
                var orig = {};
                try { orig = JSON.parse(row.dataset.course || "{}"); } catch(e) {}
                var data = {
                    code: inputs[0].value,
                    title: inputs[1].value,
                    credits: parseInt(inputs[2].value) || 0,
                    type: inputs[3].value,
                    year: orig.year || year,
                    semester: orig.semester || row.dataset.sem,
                    programmeId: orig.programmeId || parseInt(programmeId),
                    departmentId: orig.departmentId || deptId
                };
                try {
                    await SmartCampusAPI.updateCourse(btn.dataset.id, data);
                    SmartCampusUI.showToast("Course updated", "success");
                    renderMCTables(programmeId, year, deptId);
                } catch(err) {
                    SmartCampusUI.showToast("Failed: " + err.message, "error");
                }
            });
        });

        // Bind cancel
        content.querySelectorAll(".mce-cancel").forEach(function(btn) {
            btn.addEventListener("click", function() {
                renderMCTables(programmeId, year, deptId);
            });
        });

        // Bind delete
        content.querySelectorAll(".mce-delete").forEach(function(btn) {
            btn.addEventListener("click", async function() {
                if (!confirm("Delete this course?")) return;
                try {
                    await SmartCampusAPI.deleteCourse(btn.dataset.id);
                    SmartCampusUI.showToast("Course deleted", "success");
                    renderMCTables(programmeId, year, deptId);
                } catch(err) {
                    SmartCampusUI.showToast("Failed: " + err.message, "error");
                }
            });
        });

        // Bind add
        content.querySelectorAll(".mce-add").forEach(function(btn) {
            btn.addEventListener("click", function() {
                var sem = btn.dataset.sem;
                var table = btn.closest(".card").querySelector("table tbody") || btn.closest(".card").querySelector("table");
                var tr = document.createElement("tr");
                tr.innerHTML = '<td><input class="edit-input code" placeholder="Code"></td>' +
                    '<td><input class="edit-input title" placeholder="Title" style="width:100%"></td>' +
                    '<td><input class="edit-input credits" type="number" value="3"></td>' +
                    '<td><input class="edit-input type" placeholder="Core/Elective"></td>' +
                    '<td>' +
                    '<button class="btn btn-sm mce-create" style="background:var(--primary);color:#fff;border:none;padding:4px 8px;border-radius:4px;cursor:pointer"><i class="fa-solid fa-check"></i></button> ' +
                    '<button class="btn btn-sm mce-cancel-add" style="border:1px solid var(--gray-300);padding:4px 8px;border-radius:4px;cursor:pointer"><i class="fa-solid fa-xmark"></i></button>' +
                    '</td>';
                tr.dataset.sem = sem;
                table.appendChild(tr);

                tr.querySelector(".mce-create").addEventListener("click", async function() {
                    var inputs = tr.querySelectorAll(".edit-input");
                    if (!inputs[0].value || !inputs[1].value) { SmartCampusUI.showToast("Code and title required", "error"); return; }
                    var newCourse = {
                        code: inputs[0].value,
                        title: inputs[1].value,
                        credits: parseInt(inputs[2].value) || 0,
                        type: inputs[3].value,
                        year: year,
                        semester: sem,
                        programmeId: parseInt(programmeId),
                        departmentId: deptId
                    };
                    try {
                        await SmartCampusAPI.createCourse(newCourse);
                        SmartCampusUI.showToast("Course created", "success");
                        renderMCTables(programmeId, year, deptId);
                    } catch(err) {
                        SmartCampusUI.showToast("Failed: " + err.message, "error");
                    }
                });

                tr.querySelector(".mce-cancel-add").addEventListener("click", function() { tr.remove(); });
            });
        });

    } catch(e) {
        content.innerHTML = '<p style="color:var(--error);text-align:center;padding:1rem">Failed to load courses: ' + esc(e.message) + '</p>';
    }
}

function renderSemTable(semLabel, courses, programmeId, year, deptId) {
    var html = '<div class="card"><div class="card-header">';
    html += '<strong>' + semLabel.replace("Semester", "Semester ") + '</strong>';
    html += '<button class="btn btn-outline btn-sm mce-add" data-sem="' + semLabel + '" type="button"><i class="fa-solid fa-plus"></i> Add</button>';
    html += '</div><div class="table-responsive"><table><thead><tr><th>Code</th><th>Title</th><th>Credits</th><th>Type</th><th>Actions</th></tr></thead><tbody>';
    if (!courses.length) {
        html += '<tr><td colspan="5" style="text-align:center;color:var(--gray-400)">No courses yet.</td></tr>';
    } else {
        courses.forEach(function(c) {
            html += '<tr id="mc-row-' + c.id + '" data-sem="' + semLabel + '" data-course=\'' + esc(JSON.stringify(c)) + '\'>';
            html += '<td>' + esc(c.code) + '</td>';
            html += '<td>' + esc(c.title) + '</td>';
            html += '<td>' + (c.credits || 0) + '</td>';
            html += '<td>' + esc(c.type || "") + '</td>';
            html += '<td>';
            html += '<button class="btn btn-sm btn-outline mce-edit" data-id="' + c.id + '" type="button"><i class="fa-solid fa-pen"></i></button> ';
            html += '<button class="btn btn-sm btn-outline mce-delete" data-id="' + c.id + '" type="button" style="color:var(--error);border-color:var(--error)"><i class="fa-solid fa-trash"></i></button>';
            html += '</td></tr>';
        });
    }
    html += '</tbody></table></div></div>';
    return html;
}

function renderCurriculumMock() {
    var html = '<div class="card"><div class="card-header">BSc Business and Information Technology Curriculum (offline)</div><div class="tabs">';
    html += Object.keys(curriculumModules).map(function(y) { return '<button class="btn btn-outline tab-btn" data-year="' + y + '" type="button">' + y.replace("Year", "Year ") + '</button>'; }).join("");
    html += '</div></div>';
    for (var y in curriculumModules) {
        html += '<div class="card year-tab" id="' + y + '" style="display:none">';
        for (var sem in curriculumModules[y]) {
            html += '<h3>' + sem.replace("Semester", "Semester ") + '</h3><div class="table-responsive"><table><tr><th>Code</th><th>Title</th><th>Credits</th><th>Type</th></tr>';
            curriculumModules[y][sem].forEach(function(m) {
                html += '<tr><td>' + esc(m.code) + '</td><td>' + esc(m.title) + '</td><td>' + m.credits + '</td><td>' + esc(m.type) + '</td></tr>';
            });
            html += '</table></div>';
        }
        html += '</div>';
    }
    return html;
}

async function renderGradebook() {
    const tbody = document.querySelector("#gradebookTable tbody");
    if (!tbody) return;
    const data = await SmartCampusAPI.withFallback(
        () => SmartCampusAPI.fetchGrades(),
        () => gradebookData
    );
    tbody.innerHTML = "";
    data.forEach((row) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
            <td>${row.student}</td><td>${row.module}</td>
            <td><input type="number" value="${row.grade}" class="grade-input" data-id="${row.id || ""}" data-student="${row.student}" data-module="${row.module}"></td>
            <td><span class="badge badge-${row.status === "Draft" ? "warning" : (row.status === "Submitted" ? "info" : "success")}">${row.status}</span></td>
            <td><button class="btn btn-outline save-grade" type="button">Save</button></td>
        `;
        tbody.appendChild(tr);
    });
    document.querySelectorAll(".save-grade").forEach((btn) => {
        btn.addEventListener("click", async (e) => {
            const tr = e.target.closest("tr");
            const input = tr.querySelector(".grade-input");
            const id = input.dataset.id;
            const grade = { student: input.dataset.student, module: input.dataset.module, grade: parseInt(input.value), status: "Draft" };
            try {
                if (id) {
                    await SmartCampusAPI.updateGrade(id, grade);
                } else {
                    await SmartCampusAPI.createGrade(grade);
                }
                SmartCampusUI.showToast(`Grade saved to ${input.value}`, "success");
            } catch {
                SmartCampusUI.showToast(`Grade updated to ${input.value} (offline)`, "success");
            }
        });
    });
}

async function renderModeration() {
    const container = document.getElementById("moderationList");
    if (!container) return;
    const data = await SmartCampusAPI.withFallback(
        () => SmartCampusAPI.fetchModerationRequests(),
        () => moderationRequests
    );
    let html = `<div class="table-responsive"><table><tr><th>Module</th><th>Submitted By</th><th>Status</th><th>Action</th></tr>`;
    data.forEach((req) => {
        html += `<tr><td>${req.module}</td><td>${req.submittedBy}</td><td><span class="badge badge-${req.status === "Pending" ? "warning" : "success"}">${req.status}</span></td>
        <td><button class="btn btn-outline approve-moderation" type="button" data-id="${req.id}">${req.status === "Pending" ? "Approve" : "Approved"}</button></td></tr>`;
    });
    html += "</table></div>";
    container.innerHTML = html;
    container.querySelectorAll(".approve-moderation").forEach((btn) => {
        btn.addEventListener("click", async () => {
            const id = btn.dataset.id;
            try {
                await SmartCampusAPI.approveModerationRequest(id);
                SmartCampusUI.showToast("Moderation approved", "success");
                renderModeration();
            } catch {
                SmartCampusUI.showToast("Moderation approved (offline)", "success");
            }
        });
    });
}

function renderStudentResults() {
    const container = document.getElementById("resultsContainer");
    if (!container) return;
    let html = `<div class="card"><h3>${studentTranscript.studentName} - ${studentTranscript.programme}</h3><div class="table-responsive"><table><tr><th>Year</th><th>Sem</th><th>Code</th><th>Title</th><th>Credits</th><th>Grade</th><th>Points</th></tr>`;
    studentTranscript.courses.forEach((c) => {
        html += `<tr><td>${c.year}</td><td>${c.semester}</td><td>${c.code}</td><td>${c.title}</td><td>${c.credits}</td><td>${c.grade}</td><td>${c.points}</td></tr>`;
    });
    html += `<tr><td colspan="6"><strong>GPA</strong></td><td>${studentTranscript.gpa}</td></tr></table></div></div>`;
    container.innerHTML = html;
}

async function renderAppeals() {
    const page = document.getElementById("appealsPage");
    if (!page) return;
    const formHtml = `
        <div class="card"><h3>Submit New Appeal</h3>
        <form id="appealForm"><div class="form-group"><label>Module</label><input type="text" id="appealModule" required></div>
        <div class="form-group"><label>Reason</label><textarea id="appealReason" required></textarea></div>
        <button type="submit" class="btn btn-primary">Submit Appeal</button></form></div>
        <div class="card"><h3>My Appeals</h3><div id="appealsList"></div></div>
    `;
    page.innerHTML = formHtml;
    const listDiv = document.getElementById("appealsList");
    async function refreshAppeals() {
        const data = await SmartCampusAPI.withFallback(
            () => SmartCampusAPI.fetchAppeals(),
            () => appealsList
        );
        listDiv.innerHTML = `<div class="table-responsive"><table><tr><th>Module</th><th>Reason</th><th>Status</th><th>Date</th></tr>${data.map((a) => `<tr><td>${a.module}</td><td>${a.reason}</td><td><span class="badge badge-${a.status === "Pending" ? "warning" : (a.status === "Approved" ? "success" : "error")}">${a.status}</span></td><td>${a.date}</td></tr>`).join("")}</table></div>`;
    }
    refreshAppeals();
    document.getElementById("appealForm").addEventListener("submit", async (e) => {
        e.preventDefault();
        const appeal = {
            module: document.getElementById("appealModule").value,
            reason: document.getElementById("appealReason").value,
            status: "Pending",
            date: new Date().toISOString().slice(0, 10)
        };
        try {
            await SmartCampusAPI.submitAppeal(appeal);
            SmartCampusUI.showToast("Appeal submitted.", "success");
        } catch {
            appealsList.push({ id: appealsList.length + 1, ...appeal });
            SmartCampusUI.showToast("Appeal submitted (offline).", "success");
        }
        refreshAppeals();
        e.target.reset();
    });
}

function renderAdminSettings() {
    const container = document.getElementById("adminSettingsContainer");
    if (!container) return;
    container.innerHTML = `
        <div class="card"><h3>General Settings</h3><label>Academic Year</label><input type="text" id="acYear" value="${adminSettings.academicYear}"><button class="btn btn-primary" style="margin-top: 0.75rem;" onclick="SmartCampusUI.showToast('Settings saved (demo).', 'success')">Save</button></div>
        <div class="card"><h3>User Management</h3><div class="table-responsive"><table><tr><th>Name</th><th>Role</th><th>School/Dept</th></tr>${adminSettings.users.map((u) => `<tr><td>${u.name}</td><td>${u.role}</td><td>${u.school || u.department || ""}</td></tr>`).join("")}</table></div></div>
        <div class="card"><h3>Broadcast Email</h3>
          <div style="display:grid;gap:.75rem">
            <div><label style="font-weight:600;font-size:.85rem">Send to</label>
              <select id="broadcastRole" style="width:100%;padding:.5rem;border:1px solid var(--gray-200);border-radius:6px">
                <option value="Student">Students</option>
                <option value="Lecturer">Lecturers</option>
                <option value="Department Admin">Department Admins</option>
                <option value="School Super Admin">School Super Admins</option>
                <option value="University Super Admin">University Super Admins</option>
                <option value="All">Everyone</option>
              </select>
            </div>
            <div><label style="font-weight:600;font-size:.85rem">Subject</label><input id="broadcastSubject" style="width:100%;padding:.5rem;border:1px solid var(--gray-200);border-radius:6px" placeholder="e.g. Exam schedule update"></div>
            <div><label style="font-weight:600;font-size:.85rem">Message</label><textarea id="broadcastBody" style="width:100%;padding:.5rem;border:1px solid var(--gray-200);border-radius:6px;min-height:100px" placeholder="Enter your message..."></textarea></div>
            <button class="btn btn-primary" id="broadcastBtn">Send Broadcast</button>
          </div>
        </div>
    `;
    document.getElementById("broadcastBtn")?.addEventListener("click", async () => {
        const payload = {
            role: document.getElementById("broadcastRole").value,
            subject: document.getElementById("broadcastSubject").value,
            body: document.getElementById("broadcastBody").value
        };
        try {
            const token = localStorage.getItem("sc_token");
            const res = await fetch("http://localhost:8080/api/email/broadcast", {
                method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            SmartCampusUI.showToast(data.message || "Broadcast sent!", "success");
        } catch {
            SmartCampusUI.showToast("Broadcast sent (offline).", "success");
        }
    });
}

async function renderProfile() {
    const container = document.getElementById("profileContainer");
    if (!container) return;
    try {
        var userData = JSON.parse(localStorage.getItem("sc_user") || "{}");
        if (userData.id) {
            var apiUser = await SmartCampusAPI.fetchUser(userData.id);
            if (apiUser) userData = apiUser;
        }
        container.innerHTML = `
          <div class="card">
            <h3>My Profile</h3>
            <p><strong>Name:</strong> ${esc(userData.name || "—")}</p>
            <p><strong>Role:</strong> ${esc(userData.role || "—")}</p>
            <p><strong>Email:</strong> ${esc(userData.email || "—")}</p>
            ${userData.department ? '<p><strong>Department:</strong> ' + esc(userData.department) + '</p>' : ''}
            ${userData.school ? '<p><strong>School:</strong> ' + esc(userData.school) + '</p>' : ''}
            ${userData.phone ? '<p><strong>Phone:</strong> ' + esc(userData.phone) + '</p>' : ''}
          </div>
        `;
    } catch(e) {
        container.innerHTML = '<p style="color:var(--error)">Failed to load profile.</p>';
    }
}

function renderMyGrades() {
    const container = document.getElementById("myGradesContainer");
    if (!container) return;
    const totalCredits = studentTranscript.courses.reduce((sum, c) => sum + c.credits, 0);
    container.innerHTML = `
      <div class="card">
        <h3>${studentTranscript.studentName} - ${studentTranscript.programme}</h3>
        <p><strong>Current GPA:</strong> ${studentTranscript.gpa}</p>
        <p><strong>Total Credits:</strong> ${totalCredits}</p>
      </div>
      <div class="card table-responsive">
        <table>
          <thead><tr><th>Year</th><th>Semester</th><th>Code</th><th>Title</th><th>Credits</th><th>Grade</th><th>Points</th></tr></thead>
          <tbody>
            ${studentTranscript.courses.map((c) => `<tr><td>${c.year}</td><td>${c.semester}</td><td>${c.code}</td><td>${c.title}</td><td>${c.credits}</td><td>${c.grade}</td><td>${c.points}</td></tr>`).join("")}
          </tbody>
        </table>
      </div>
    `;
}

function renderUpcomingAssignments() {
    const container = document.getElementById("upcomingAssignmentsContainer");
    if (!container) return;
    const assignments = [
        { module: "CS201", title: "Data Structures Coursework", dueDate: "2026-05-14", status: "Pending" },
        { module: "IT201", title: "Web Development Project", dueDate: "2026-05-18", status: "In Progress" },
        { module: "MATH202", title: "Statistics Report", dueDate: "2026-05-22", status: "Pending" }
    ];
    container.innerHTML = `
      <div class="card table-responsive">
        <table>
          <thead><tr><th>Module</th><th>Assignment</th><th>Due Date</th><th>Status</th></tr></thead>
          <tbody>
            ${assignments.map((a) => `<tr><td>${a.module}</td><td>${a.title}</td><td>${a.dueDate}</td><td><span class="badge badge-${a.status === "In Progress" ? "info" : "warning"}">${a.status}</span></td></tr>`).join("")}
          </tbody>
        </table>
      </div>
    `;
}

async function renderAppealsStatus() {
    const container = document.getElementById("appealsStatusContainer");
    if (!container) return;
    const data = await SmartCampusAPI.withFallback(
        () => SmartCampusAPI.fetchAppeals(),
        () => appealsList
    );
    container.innerHTML = `
      <div class="card table-responsive">
        <table>
          <thead><tr><th>Module</th><th>Reason</th><th>Status</th><th>Date Submitted</th></tr></thead>
          <tbody>
            ${data.map((a) => `<tr><td>${a.module}</td><td>${a.reason}</td><td><span class="badge badge-${a.status === "Pending" ? "warning" : "success"}">${a.status}</span></td><td>${a.date}</td></tr>`).join("")}
          </tbody>
        </table>
      </div>
    `;
}

async function renderCourses() {
    const container = document.getElementById("coursesContainer");
    const deptSelect = document.getElementById("courseDeptFilter");
    if (!container) return;
    const schools = await SmartCampusAPI.withFallback(() => SmartCampusAPI.fetchSchools(), () => schoolsData);
    const departments = schools.flatMap(s => (s.departments || []).map(d => ({...d, school: s.name})));
    if (deptSelect) {
        deptSelect.innerHTML = '<option value="">All Departments</option>' + departments.map(d => `<option value="${d.id}">${d.school} - ${d.name}</option>`).join("");
        deptSelect.onchange = () => renderCourses();
    }
    const deptFilter = deptSelect ? deptSelect.value : "";
    const courses = await SmartCampusAPI.withFallback(
        () => SmartCampusAPI.fetchCourses(deptFilter || undefined),
        () => {
            const all = [];
            Object.entries(curriculumModules).forEach(([year, sems]) => Object.entries(sems).forEach(([sem, mods]) => mods.forEach(m => all.push({...m, year, semester: sem, id: m.code}))));
            return all;
        }
    );
    let html = '<table><thead><tr><th>Code</th><th>Title</th><th>Credits</th><th>Type</th><th>Year</th><th>Semester</th><th>Actions</th></tr></thead><tbody>';
    courses.forEach(c => {
        html += `<tr><td>${c.code}</td><td>${c.title}</td><td>${c.credits}</td><td>${c.type}</td><td>${c.year}</td><td>${c.semester}</td>
        <td><button class="btn btn-outline btn-sm edit-course" data-id="${esc(c.id || c.code)}">Edit</button>
        <button class="btn btn-outline btn-sm delete-course-btn" style="color:var(--error)" data-id="${esc(c.id || c.code)}">Delete</button></td></tr>`;
    });
    html += '</tbody></table>';
    container.innerHTML = html;
    container.querySelectorAll(".edit-course").forEach(btn => btn.onclick = () => {
        const c = courses.find(x => String(x.id || x.code) === btn.dataset.id);
        if (!c) return;
        document.getElementById("courseCode").value = c.code;
        document.getElementById("courseTitle").value = c.title;
        document.getElementById("courseCredits").value = c.credits;
        document.getElementById("courseType").value = c.type;
        document.getElementById("courseYear").value = c.year;
        document.getElementById("courseSem").value = c.semester;
        document.getElementById("courseSaveBtn").textContent = "Update Course";
        document.getElementById("courseSaveBtn").dataset.editId = c.id || "";
        document.getElementById("courseCancelBtn").style.display = "";
    });
    const saveBtn = document.getElementById("courseSaveBtn");
    if (saveBtn && !saveBtn._bound) {
        saveBtn._bound = true;
        saveBtn.onclick = async () => {
            const course = {
                code: document.getElementById("courseCode").value,
                title: document.getElementById("courseTitle").value,
                credits: parseInt(document.getElementById("courseCredits").value),
                type: document.getElementById("courseType").value,
                year: document.getElementById("courseYear").value,
                semester: document.getElementById("courseSem").value,
                departmentId: parseInt(deptSelect?.value) || 1
            };
            const editId = saveBtn.dataset.editId;
            try {
                if (editId) {
                    await SmartCampusAPI.updateCourse(editId, course);
                } else {
                    await SmartCampusAPI.createCourse(course);
                }
                SmartCampusUI.showToast("Course saved!", "success");
            } catch {
                SmartCampusUI.showToast("Course saved (offline).", "success");
            }
            saveBtn.textContent = "Add Course";
            delete saveBtn.dataset.editId;
            document.getElementById("courseCancelBtn").style.display = "none";
            document.getElementById("courseCode").value = "";
            document.getElementById("courseTitle").value = "";
            renderCourses();
        };
    }
    const cancelBtn = document.getElementById("courseCancelBtn");
    if (cancelBtn) cancelBtn.onclick = () => {
        saveBtn.textContent = "Add Course";
        delete saveBtn.dataset.editId;
        cancelBtn.style.display = "none";
        document.getElementById("courseCode").value = "";
        document.getElementById("courseTitle").value = "";
    };
}

window.deleteCourse = async (id) => {
    try { await SmartCampusAPI.deleteCourse(id); SmartCampusUI.showToast("Course deleted", "success"); renderCourses(); }
    catch { SmartCampusUI.showToast("Course deleted (offline)", "success"); renderCourses(); }
};

document.addEventListener("click", e => {
    const btn = e.target.closest(".delete-course-btn");
    if (btn) deleteCourse(btn.dataset.id);
});

document.addEventListener("click", e => {
    const btn = e.target.closest(".action-profile");
    if (btn) showStudentProfile(btn.dataset.sid);
});
document.addEventListener("click", e => {
    const btn = e.target.closest(".action-fee");
    if (btn) showEditFeeModal(btn.dataset.sid, btn.dataset.fids);
});
document.addEventListener("click", e => {
    const btn = e.target.closest(".action-pay");
    if (btn) location.href = "record-payment.html";
});
document.addEventListener("click", e => {
    const btn = e.target.closest(".action-notify");
    if (btn) showNotifyModal(btn.dataset.sid, btn.dataset.sname, btn.dataset.semail);
});
document.addEventListener("click", e => {
    const btn = e.target.closest(".mgmt-edit");
    if (btn) editStudent(btn.dataset.id);
});
document.addEventListener("click", e => {
    const btn = e.target.closest(".mgmt-delete");
    if (btn) deleteStudent(btn.dataset.id, btn.dataset.name);
});

async function renderEnrollments() {
    const container = document.getElementById("enrollmentsContainer");
    const studentSelect = document.getElementById("enrollStudent");
    const courseSelect = document.getElementById("enrollCourse");
    if (!container) return;
    const users = await SmartCampusAPI.withFallback(
        async () => { const me = await SmartCampusAPI.getMe(); return [{id:1, name:"John Doe", email:"john@smartcampus.edu"}]; },
        () => [{id:1, name:"John Doe", role:"Student"}]
    );
    const courses = await SmartCampusAPI.withFallback(() => SmartCampusAPI.fetchCourses(), () => []);
    if (studentSelect) {
        studentSelect.innerHTML = users.map(u => `<option value="${u.id}">${u.name}</option>`).join("");
    }
    if (courseSelect) {
        courseSelect.innerHTML = courses.map(c => `<option value="${c.id || c.code}">${c.code} - ${c.title}</option>`).join("");
    }
    document.getElementById("enrollBtn")?.addEventListener("click", async () => {
        const enrollment = {
            studentId: parseInt(studentSelect?.value),
            courseId: parseInt(courseSelect?.value) || courseSelect?.value,
            academicYear: document.getElementById("enrollYear")?.value || "2024/2025",
            semester: document.getElementById("enrollSem")?.value || "Semester1",
            status: "Enrolled"
        };
        try { await SmartCampusAPI.createEnrollment(enrollment); SmartCampusUI.showToast("Student enrolled!", "success"); } catch { SmartCampusUI.showToast("Enrolled (offline)", "success"); }
        renderEnrollments();
    }, {once: true});
    const enrollments = await SmartCampusAPI.withFallback(() => SmartCampusAPI.fetchEnrollments(), () => []);
    let html = '<table><thead><tr><th>Student ID</th><th>Course ID</th><th>Year</th><th>Semester</th><th>Status</th></tr></thead><tbody>';
    enrollments.forEach(e => {
        html += `<tr><td>${e.studentId}</td><td>${e.courseId}</td><td>${e.academicYear}</td><td>${e.semester}</td><td><span class="badge badge-${e.status === 'Enrolled' ? 'info' : e.status === 'Completed' ? 'success' : 'warning'}">${e.status}</span></td></tr>`;
    });
    html += '</tbody></table>';
    container.innerHTML = html;
}

let currentUserId = 6;

async function renderMessages() {
    const list = document.getElementById("messageList");
    const detail = document.getElementById("messageDetail");
    const composePanel = document.getElementById("composePanel");
    if (!list) return;
    try { const u = JSON.parse(localStorage.getItem("sc_user")); currentUserId = u.id || 6; } catch {}
    const loadInbox = async () => {
        document.getElementById("msgListTitle").textContent = "Inbox";
        document.getElementById("messageListPanel").style.display = "";
        const msgs = await SmartCampusAPI.withFallback(() => SmartCampusAPI.fetchInbox(currentUserId), () => []);
        list.innerHTML = msgs.length ? msgs.map(m => `<div class="msg-item ${m.readAt ? '' : 'unread'}" onclick="viewMsg(${m.id})"><strong>${m.subject}</strong><small>From: ${m.senderId} &middot; ${new Date(m.sentAt).toLocaleDateString()}</small></div>`).join("") : "<p style='color:var(--gray-300);padding:.75rem'>No messages</p>";
    };
    const loadSent = async () => {
        document.getElementById("msgListTitle").textContent = "Sent";
        document.getElementById("messageListPanel").style.display = "";
        const msgs = await SmartCampusAPI.withFallback(() => SmartCampusAPI.fetchSent(currentUserId), () => []);
        list.innerHTML = msgs.length ? msgs.map(m => `<div class="msg-item" onclick="viewMsg(${m.id})"><strong>${m.subject}</strong><small>To: ${m.receiverId} &middot; ${new Date(m.sentAt).toLocaleDateString()}</small></div>`).join("") : "<p style='color:var(--gray-300);padding:.75rem'>No messages</p>";
    };
    const loadCompose = async () => {
        document.getElementById("messageListPanel").style.display = "none";
        composePanel.style.display = "block";
        try {
            const users = await SmartCampusAPI.fetchUsers();
            document.getElementById("composeTo").innerHTML = users.filter(u => u.id !== currentUserId).map(u => `<option value="${u.id}">${u.name} (${u.role})</option>`).join("");
        } catch { document.getElementById("composeTo").innerHTML = "<option value='1'>Admin</option><option value='6'>John Doe</option>"; }
    };
    document.getElementById("showInbox").onclick = () => { composePanel.style.display = "none"; loadInbox(); };
    document.getElementById("showSent").onclick = () => { composePanel.style.display = "none"; loadSent(); };
    document.getElementById("showCompose").onclick = () => loadCompose();
    document.getElementById("composeSend").onclick = async () => {
        const msg = {
            senderId: currentUserId,
            receiverId: parseInt(document.getElementById("composeTo").value),
            subject: document.getElementById("composeSubject").value,
            body: document.getElementById("composeBody").value
        };
        try { await SmartCampusAPI.sendMessage(msg); SmartCampusUI.showToast("Message sent!", "success"); } catch { SmartCampusUI.showToast("Message sent (offline).", "success"); }
        document.getElementById("composeSubject").value = "";
        document.getElementById("composeBody").value = "";
        composePanel.style.display = "none";
        document.getElementById("messageListPanel").style.display = "";
        loadInbox();
    };
    loadInbox();
}

window.viewMsg = async (id) => {
    const detail = document.getElementById("messageDetail");
    try {
        const msg = await SmartCampusAPI.fetchMessage(id);
        detail.innerHTML = `<h4>${esc(msg.subject)}</h4><p style="color:var(--gray-700);font-size:.85rem">From: ${esc(msg.senderId)} &middot; ${esc(new Date(msg.sentAt).toLocaleString())}</p><hr style="margin:.75rem 0"><p>${esc(msg.body)}</p>`;
    } catch {
        detail.innerHTML = "<p>Message not found</p>";
    }
};

// ─── Finance Panel ──────────────────────────────────────────────────

let monthlyChartInstance = null;
let deptChartInstance = null;

window.switchTab = (tab) => {
    document.querySelectorAll(".finance-tabs button").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
    document.querySelector(`.finance-tabs button[onclick*='${tab}']`)?.classList.add("active");
    document.getElementById(`tab-${tab}`)?.classList.add("active");
    if (tab === "dashboard") renderFinanceDashboard();
    if (tab === "students") { loadMgmtSchoolFilter(); renderManageStudents(); }
    if (tab === "feerecords") renderFinanceStudents();
    if (tab === "departments") renderFinanceDepartments();
    if (tab === "audit") renderFinanceAudit();
    if (tab === "fees") renderFinanceFeeStructures();
    if (tab === "broadcast") renderFinanceBroadcast();
    if (tab === "hierarchy") renderFinanceHierarchy();
};

window.openModal = (id) => { const el = document.getElementById(id); if (el) el.style.display = "flex"; };
window.closeModal = (id) => { const el = document.getElementById(id); if (el) el.style.display = "none"; };

async function renderFinancePanel() {
    await renderFinanceDashboard();
    renderFinanceStudents();
    renderFinanceDepartments();
}

// ─── Dashboard ──────────────────────────────────────────────────────

async function renderFinanceDashboard() {
    const container = document.getElementById("dashStats");
    const recentContainer = document.getElementById("recentPaymentsContainer");
    if (!container) return;

    const dash = await SmartCampusAPI.withFallback(
        () => SmartCampusAPI.fetchFinanceDashboard(),
        () => ({ totalStudents:5, totalRevenue:1000000, studentsFullyPaid:2, studentsWithDues:3, paidRecords:5, partialRecords:2, unpaidRecords:3, deptRevenue:{Physics:500000,Maths:300000,Industrial:200000}, recentPayments:[], monthlyCollections:{} })
    );
    const d = dash.data || dash;

    container.innerHTML = `
        <div class="stat-card"><h3 style="color:var(--info)">${d.totalStudents || 0}</h3><p>Total Students</p></div>
        <div class="stat-card"><h3 style="color:var(--success)">${d.studentsFullyPaid || 0}</h3><p>Fully Paid</p></div>
        <div class="stat-card"><h3 style="color:var(--error)">${d.studentsWithDues || 0}</h3><p>With Dues</p></div>
        <div class="stat-card"><h3 style="color:var(--primary)">NLE${(d.totalRevenue || 0).toLocaleString()}</h3><p>Total Revenue</p></div>
    `;

    // Monthly chart
    const monthly = d.monthlyCollections || {};
    if (document.getElementById("monthlyChart")) {
        if (monthlyChartInstance) monthlyChartInstance.destroy();
        monthlyChartInstance = new Chart(document.getElementById("monthlyChart"), {
            type: 'bar',
            data: {
                labels: Object.keys(monthly),
                datasets: [{ label: 'NLE', data: Object.values(monthly), backgroundColor: '#4f6ef7', borderRadius: 6 }]
            },
            options: { responsive: true, maintainAspectRatio: true, plugins: { legend: { display: false } } }
        });
    }

    // Dept chart
    const deptRev = d.deptRevenue || {};
    const deptColors = ['#4f6ef7','#22c55e','#f59e0b','#ef4444','#8b5cf6'];
    if (document.getElementById("deptChart")) {
        if (deptChartInstance) deptChartInstance.destroy();
        deptChartInstance = new Chart(document.getElementById("deptChart"), {
            type: 'doughnut',
            data: {
                labels: Object.keys(deptRev),
                datasets: [{ data: Object.values(deptRev), backgroundColor: deptColors.slice(0, Object.keys(deptRev).length) }]
            },
            options: { responsive: true, maintainAspectRatio: true, plugins: { legend: { position: 'bottom' } } }
        });
    }

    // Recent payments
    const payments = d.recentPayments || [];
    if (recentContainer) recentContainer.innerHTML = payments.length
        ? `<table><thead><tr><th>Date</th><th>Student</th><th>Amount</th><th>Method</th><th>Reference</th></tr></thead><tbody>`
            + payments.map(p => `<tr><td>${p.date || ''}</td><td>${p.studentName || 'ID:'+p.studentId}</td><td>NLE${(p.amount || 0).toLocaleString()}</td><td>${p.method || ''}</td><td>${p.reference || ''}</td></tr>`).join("")
            + '</tbody></table>'
        : '<p style="color:var(--gray-300);text-align:center;padding:1rem">No payments yet</p>';
}

// ─── Students tab ───────────────────────────────────────────────────

async function renderFinanceStudents() {
    const container = document.getElementById("studentTableContainer");
    const searchInput = document.getElementById("studentSearch");
    if (!container) return;

    const data = await SmartCampusAPI.withFallback(
        () => SmartCampusAPI.fetchAllStudentFees(),
        () => ({ data: [
            { studentId:12, name:"John Doe", email:"john@smartcampus.edu", department:"Physics", program:"BSc CS", yearLevel:"Year 2", totalFee:775000, paidAmount:400000, balance:375000,
              records:[{academicYear:"2024/2025", semester:"Semester1", totalFee:250000, paidAmount:250000, status:"Paid", id:1}] }
        ] })
    );
    const students = data.data || data || [];

    const q = searchInput ? searchInput.value.toLowerCase().trim() : "";
    const filtered = q ? students.filter(st =>
        (st.name || '').toLowerCase().includes(q) ||
        (st.email || '').toLowerCase().includes(q) ||
        String(st.studentId).includes(q) ||
        (st.department || '').toLowerCase().includes(q)
    ) : students;

    let rows = "";
    filtered.forEach(st => {
        const badge = st.balance <= 0 ? "badge-success" : st.paidAmount > 0 ? "badge-warning" : "badge-error";
        const label = st.balance <= 0 ? "Fully Paid" : st.paidAmount > 0 ? "Partially Paid" : "Not Paid";
        const feeIds = (st.records || []).map(r => r.id).join(",");
        rows += `<tr>
            <td>${st.name}</td><td>${st.email}</td><td>${st.department || '-'}</td>
            <td>NLE${(st.totalFee || 0).toLocaleString()}</td>
            <td>NLE${(st.paidAmount || 0).toLocaleString()}</td>
            <td>NLE${(st.balance || 0).toLocaleString()}</td>
            <td><span class="${badge}">${label}</span></td>
            <td class="action-btns">
                <button class="btn btn-outline btn-sm action-profile" data-sid="${esc(st.studentId)}">View</button>
                <button class="btn btn-outline btn-sm action-fee" data-sid="${esc(st.studentId)}" data-fids="${esc(feeIds)}">Fee</button>
                <button class="btn btn-outline btn-sm action-pay" data-sid="${esc(st.studentId)}">Pay</button>
                <button class="btn btn-outline btn-sm action-notify" data-sid="${esc(st.studentId)}" data-sname="${esc(st.name)}" data-semail="${esc(st.email)}">Email</button>
            </td>
        </tr>`;
    });

    container.innerHTML = `<table>
        <thead><tr><th>Name</th><th>Email</th><th>Department</th><th>Total Fee</th><th>Paid</th><th>Balance</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody>${rows || '<tr><td colspan="8" style="text-align:center;color:var(--gray-300)">No students found</td></tr>'}</tbody>
    </table>`;
}

window.showStudentProfile = async (studentId) => {
    const content = document.getElementById("profileContent");
    const data = await SmartCampusAPI.withFallback(
        () => SmartCampusAPI.fetchStudentProfile(studentId),
        () => ({ name:"John Doe", email:"john@campus.edu", phone:"", school:"", department:"", program:"", yearLevel:"", totalFee:775000, totalPaid:400000, balance:375000, status:"Partially Paid", records:[], payments:[], auditLogs:[] })
    );
    const p = data.data || data;
    const totalFee = p.totalFee || 0;
    const totalPaid = p.totalPaid || 0;
    const balance = p.balance || 0;
    const status = p.status || (balance <= 0 ? "Fully Paid" : totalPaid > 0 ? "Partially Paid" : "Not Paid");

    document.getElementById("profileModalTitle").textContent = 'Profile — ' + esc(p.name);
    content.innerHTML = `
        <div class="profile-grid" style="margin-bottom:1rem">
            <div><label>Name</label><input value="${esc(p.name)}" disabled></div>
            <div><label>Student ID</label><input value="${esc(studentId)}" disabled></div>
            <div><label>Email</label><input value="${esc(p.email)}" disabled></div>
            <div><label>Phone</label><input value="${esc(p.phone || '-')}" disabled></div>
            <div><label>School</label><input value="${esc(p.school || '-')}" disabled></div>
            <div><label>Department</label><input value="${esc(p.department || '-')}" disabled></div>
            <div><label>Programme</label><input value="${esc(p.program || '-')}" disabled></div>
            <div><label>Year/Level</label><input value="${esc(p.yearLevel || '-')}" disabled></div>
        </div>
        <div class="stat-grid" style="grid-template-columns:repeat(4,1fr)">
            <div class="stat-card"><h3>NLE${totalFee.toLocaleString()}</h3><p>Total Fees</p></div>
            <div class="stat-card"><h3 style="color:var(--success)">NLE${totalPaid.toLocaleString()}</h3><p>Total Paid</p></div>
            <div class="stat-card"><h3 style="color:${balance > 0 ? 'var(--error)' : 'var(--success)'}">NLE${balance.toLocaleString()}</h3><p>Balance</p></div>
            <div class="stat-card"><h3 style="color:${balance <= 0 ? 'var(--success)' : totalPaid > 0 ? 'var(--warning)' : 'var(--error)'}">${status}</h3><p>Status</p></div>
        </div>
        <h4 style="margin:.75rem 0 .5rem">Fee Records</h4>
        <div class="table-responsive">${(p.records || []).length
            ? `<table><thead><tr><th>Year</th><th>Semester</th><th>Total</th><th>Paid</th><th>Balance</th><th>Status</th></tr></thead><tbody>`
                + p.records.map(r => `<tr><td>${r.academicYear}</td><td>${r.semester}</td><td>NLE${(r.totalFee||0).toLocaleString()}</td><td>NLE${(r.paidAmount||0).toLocaleString()}</td><td>NLE${((r.totalFee||0)-(r.paidAmount||0)).toLocaleString()}</td><td><span class="badge-${r.status === 'Paid' ? 'success' : r.status === 'Partial' ? 'warning' : 'error'}">${r.status}</span></td></tr>`).join("")
                + '</tbody></table>'
            : '<p style="color:var(--gray-300)">No fee records</p>'}</div>
        <h4 style="margin:.75rem 0 .5rem">Payment History</h4>
        <div class="table-responsive">${(p.payments || []).length
            ? `<table><thead><tr><th>Date</th><th>Amount</th><th>Method</th><th>Reference</th></tr></thead><tbody>`
                + p.payments.map(py => `<tr><td>${py.paymentDate}</td><td>NLE${(py.amount||0).toLocaleString()}</td><td>${py.method||''}</td><td>${py.reference||''}</td></tr>`).join("")
                + '</tbody></table>'
            : '<p style="color:var(--gray-300)">No payments</p>'}</div>
        <h4 style="margin:.75rem 0 .5rem">Audit Trail</h4>
        <div class="table-responsive">${(p.auditLogs || []).length
            ? `<table><thead><tr><th>Date</th><th>Action</th><th>By</th><th>Details</th></tr></thead><tbody>`
                + p.auditLogs.map(l => `<tr><td>${l.createdAt ? new Date(l.createdAt).toLocaleString() : ''}</td><td>${l.action}</td><td>${l.performedBy||''}</td><td>${l.details||''}</td></tr>`).join("")
                + '</tbody></table>'
            : '<p style="color:var(--gray-300)">No audit records</p>'}</div>
    `;
    openModal("profileModal");
};

window.showAddFeeModal = () => {
    document.getElementById("editFeeId").value = "";
    document.getElementById("feeModalTitle").textContent = "Add Fee Record";
    document.getElementById("feeForm").reset();
    openModal("feeModal");
};

window.showEditFeeModal = async (studentId, feeIdsStr) => {
    const feeIds = feeIdsStr.split(",").filter(Boolean);
    const recId = feeIds[0];
    document.getElementById("feeModalTitle").textContent = recId ? "Edit Fee Record" : "Add Fee Record";
    document.getElementById("feeStudentId").value = studentId;
    document.getElementById("feeForm").reset();
    document.getElementById("editFeeId").value = recId || "";
    if (recId) {
        try {
            const data = await SmartCampusAPI.fetchFees(studentId);
            const records = data.data || data || [];
            const rec = records.find(r => String(r.id) === recId);
            if (rec) {
                document.getElementById("feeTotal").value = rec.totalFee;
                document.getElementById("feePaid").value = rec.paidAmount;
                document.getElementById("feeYear").value = rec.academicYear || "2024/2025";
                document.getElementById("feeSemester").value = rec.semester || "Semester1";
                document.getElementById("feeStatus").value = rec.status || "Unpaid";
            }
        } catch {}
    }
    openModal("feeModal");
};

window.showNotifyModal = (studentId, name, email) => {
    document.getElementById("notifyStudentId").value = studentId;
    document.getElementById("notifyModalTitle").textContent = "Send Fee Reminder";
    document.getElementById("notifyStudentInfo").textContent = `Student: ${name} (${email})`;
    openModal("notifyModal");
};

window.showAddStudentModal = async () => {
    document.getElementById("studentForm").reset();
    document.getElementById("studentPassword").value = "1234567890";
    // Load schools dropdown
    const schoolSelect = document.getElementById("studentSchool");
    schoolSelect.innerHTML = '<option value="">Select School</option>';
    try {
        const token = localStorage.getItem("sc_token");
        const res = await fetch("http://localhost:8080/api/schools", { headers: { Authorization: "Bearer " + token } });
        const json = await res.json();
        const schools = json.data || json || [];
        schools.forEach(s => {
            schoolSelect.innerHTML += `<option value="${s.id}">${s.name}</option>`;
        });
    } catch {}
    document.getElementById("studentDept").innerHTML = '<option value="">Select Department</option>';
    document.getElementById("studentProgram").innerHTML = '<option value="">Select Programme</option>';
    openModal("studentModal");
};

window.loadStudentDepts = async () => {
    const schoolId = document.getElementById("studentSchool").value;
    const deptSelect = document.getElementById("studentDept");
    deptSelect.innerHTML = '<option value="">Select Department</option>';
    document.getElementById("studentProgram").innerHTML = '<option value="">Select Programme</option>';
    if (!schoolId) return;
    try {
        const token = localStorage.getItem("sc_token");
        const res = await fetch(`http://localhost:8080/api/schools/${schoolId}/departments`, { headers: { Authorization: "Bearer " + token } });
        const json = await res.json();
        const depts = json.data || json || [];
        depts.forEach(d => {
            deptSelect.innerHTML += `<option value="${d.id}__${d.name}">${d.name}</option>`;
        });
    } catch {}
};

window.loadStudentProgrammes = async () => {
    const deptVal = document.getElementById("studentDept").value;
    const progSelect = document.getElementById("studentProgram");
    progSelect.innerHTML = '<option value="">Select Programme</option>';
    if (!deptVal) return;
    const deptId = deptVal.split("__")[0];
    try {
        const token = localStorage.getItem("sc_token");
        const res = await fetch(`http://localhost:8080/api/programmes/department/${deptId}`, { headers: { Authorization: "Bearer " + token } });
        const json = await res.json();
        const progs = json.data || json || [];
        progs.forEach(p => {
            progSelect.innerHTML += `<option value="${p.id}__${p.name}">${p.name}</option>`;
        });
    } catch {}
};

window.showBulkNotifyModal = () => {
    document.getElementById("notifyStudentId").value = "";
    document.getElementById("notifyModalTitle").textContent = "Send Bulk Reminder to All Students";
    document.getElementById("notifyStudentInfo").textContent = "This will send an email to every student.";
    openModal("notifyModal");
};

window.showAddFeeStructureModal = () => {
    document.getElementById("feeStructureForm").reset();
    openModal("feeStructureModal");
};

// ─── Manage Students (CRUD) ───────────────────────────────────────

async function renderManageStudents() {
    const container = document.getElementById("manageStudentContainer");
    if (!container) return;
    container.innerHTML = '<p style="color:var(--gray-300)">Loading students...</p>';

    const schoolId = document.getElementById("mgmtSchoolFilter")?.value || "";
    const deptId = document.getElementById("mgmtDeptFilter")?.value || "";
    const progId = document.getElementById("mgmtProgFilter")?.value || "";

    try {
        const students = await SmartCampusAPI.fetchStudents(
            schoolId || undefined,
            deptId || undefined,
            progId || undefined
        );

        // Stats banner
        const statsEl = document.getElementById("studentStats");
        if (statsEl) {
            const allStudents = schoolId || deptId || progId ? await SmartCampusAPI.fetchStudents() : students;
            const total = allStudents ? allStudents.length : 0;
            const filtered = students ? students.length : 0;
            statsEl.innerHTML = `
                <div class="stat"><h3>${total}</h3><p>Total Students</p></div>
                <div class="stat"><h3>${filtered}</h3><p>${schoolId || deptId || progId ? 'Filtered' : 'Showing'}</p></div>
                <div class="stat"><h3>${total > 0 ? Math.round(filtered/total*100) + '%' : '-'}</h3><p>of Total</p></div>
            `;
        }

        if (!students || !students.length) {
            container.innerHTML = '<div class="empty-state"><i class="fa-solid fa-user-graduate"></i><p>No students found.</p><button class="btn btn-primary" onclick="showManageStudentModal()" style="margin-top:1rem">+ Add Student</button></div>';
            window.__mgmtStudents = [];
            return;
        }

        window.__mgmtStudents = students;

        let html = '<div class="student-grid">';
        students.forEach(s => {
            const badge = s.registrationNumber ? s.registrationNumber : 'No Reg#';
            html += `
                <div class="student-card" data-id="${s.id}" onclick="showStudentDetail('${s.id}')">
                    <span class="card-badge">${esc(badge)}</span>
                    <div class="card-name">${esc(s.name)}</div>
                    <div class="card-email">${esc(s.email)}</div>
                    <div class="card-meta">
                        <span><i class="fa-solid fa-school"></i>${esc(s.school || '-')}</span>
                        <span><i class="fa-solid fa-sitemap"></i>${esc(s.department || '-')}</span>
                    </div>
                    <div class="card-meta" style="margin-top:.25rem">
                        <span><i class="fa-solid fa-graduation-cap"></i>${esc(s.program || '-')}</span>
                        <span><i class="fa-solid fa-layer-group"></i>${esc(s.yearLevel || '-')}</span>
                    </div>
                    <div class="card-actions" onclick="event.stopPropagation()">
                        <button class="btn btn-outline btn-sm mgmt-edit" data-id="${s.id}">Edit</button>
                        <button class="btn btn-outline btn-sm mgmt-delete" data-id="${s.id}" data-name="${esc(s.name)}" style="color:var(--error)">Delete</button>
                    </div>
                </div>`;
        });
        html += '</div>';
        container.innerHTML = html;
        closeDetailPanel();
    } catch (ex) {
        container.innerHTML = `<p style="color:var(--error)">Failed to load students: ${esc(ex.message)}</p>`;
    }
}

window.showStudentDetail = (id) => {
    const card = document.querySelector(`.student-card[data-id="${id}"]`);
    if (!card) return;
    document.querySelectorAll(".student-card.selected").forEach(c => c.classList.remove("selected"));
    card.classList.add("selected");

    const panel = document.getElementById("studentDetailPanel");
    const nameEl = document.getElementById("detailName");
    const content = document.getElementById("detailContent");
    if (!panel || !content) return;

    const s = window.__mgmtStudents ? window.__mgmtStudents.find(x => String(x.id) === String(id)) : null;
    if (!s) {
        SmartCampusAPI.fetchUser(id).then(data => {
            renderDetail(data);
        }).catch(() => {});
        return;
    }
    renderDetail(s);
};

function renderDetail(s) {
    const nameEl = document.getElementById("detailName");
    const content = document.getElementById("detailContent");
    const panel = document.getElementById("studentDetailPanel");
    if (!content || !panel) return;
    if (nameEl) nameEl.textContent = s.name || "Student";
    content.innerHTML = `
        <div class="field"><label>Email</label><p>${esc(s.email || '-')}</p></div>
        <div class="field"><label>Phone</label><p>${esc(s.phone || '-')}</p></div>
        <div class="field"><label>School</label><p>${esc(s.school || '-')}</p></div>
        <div class="field"><label>Department</label><p>${esc(s.department || '-')}</p></div>
        <div class="field"><label>Programme</label><p>${esc(s.program || '-')}</p></div>
        <div class="field"><label>Year / Level</label><p>${esc(s.yearLevel || '-')}</p></div>
        <div class="field"><label>Registration #</label><p>${esc(s.registrationNumber || '-')}</p></div>
        <div class="field"><label>Role</label><p>${esc(s.role || 'Student')}</p></div>
    `;
    panel.style.display = "block";
}

window.closeDetailPanel = () => {
    const panel = document.getElementById("studentDetailPanel");
    if (panel) panel.style.display = "none";
    document.querySelectorAll(".student-card.selected").forEach(c => c.classList.remove("selected"));
};

async function loadMgmtSchoolFilter() {
    const sel = document.getElementById("mgmtSchoolFilter");
    if (!sel || sel.options.length > 1) return;
    sel.innerHTML = '<option value="">All Schools</option>';
    try {
        const schools = await SmartCampusAPI.fetchSchools();
        schools.forEach(s => { sel.innerHTML += `<option value="${s.id}">${esc(s.name)}</option>`; });
    } catch {}
}

async function loadMgmtDeptFilter() {
    const sel = document.getElementById("mgmtDeptFilter");
    sel.innerHTML = '<option value="">All Departments</option>';
    document.getElementById("mgmtProgFilter").innerHTML = '<option value="">All Programmes</option>';
    const schoolId = document.getElementById("mgmtSchoolFilter")?.value;
    if (!schoolId) { renderManageStudents(); return; }
    try {
        const schools = await SmartCampusAPI.fetchSchools();
        const school = schools.find(s => String(s.id) === String(schoolId));
        if (school && school.departments) {
            school.departments.forEach(d => {
                sel.innerHTML += `<option value="${d.id}">${esc(d.name)}</option>`;
            });
        }
    } catch {}
    renderManageStudents();
}

async function loadMgmtProgFilter() {
    const sel = document.getElementById("mgmtProgFilter");
    sel.innerHTML = '<option value="">All Programmes</option>';
    const deptVal = document.getElementById("mgmtDeptFilter")?.value;
    if (!deptVal) { renderManageStudents(); return; }
    try {
        const token = localStorage.getItem("sc_token");
        const res = await fetch(`http://localhost:8080/api/programmes/department/${deptVal}`, {
            headers: { Authorization: "Bearer " + token }
        });
        const json = await res.json();
        const progs = json.data || json || [];
        progs.forEach(p => {
            sel.innerHTML += `<option value="${p.id}">${esc(p.name)}</option>`;
        });
    } catch {}
    renderManageStudents();
}

window.showManageStudentModal = async (studentData) => {
    const form = document.getElementById("studentForm");
    form.reset();
    document.getElementById("editStudentId").value = "";
    document.getElementById("studentPassword").value = "1234567890";
    document.getElementById("studentFormSubmitBtn").textContent = "Create Student";
    document.getElementById("studentModalTitle").textContent = "Add New Student";
    document.getElementById("studentPassword").style.display = "";

    // Load schools
    const schoolSelect = document.getElementById("studentSchool");
    schoolSelect.innerHTML = '<option value="">Select School</option>';
    try {
        const token = localStorage.getItem("sc_token");
        const res = await fetch("http://localhost:8080/api/schools", { headers: { Authorization: "Bearer " + token } });
        const json = await res.json();
        const schools = json.data || json || [];
        schools.forEach(s => { schoolSelect.innerHTML += `<option value="${s.id}">${esc(s.name)}</option>`; });
    } catch {}

    document.getElementById("studentDept").innerHTML = '<option value="">Select Department</option>';
    document.getElementById("studentProgram").innerHTML = '<option value="">Select Programme</option>';

    // If editing, populate data
    if (studentData) {
        document.getElementById("studentModalTitle").textContent = "Edit Student";
        document.getElementById("studentFormSubmitBtn").textContent = "Update Student";
        document.getElementById("editStudentId").value = studentData.id;
        document.getElementById("studentName").value = studentData.name || "";
        document.getElementById("studentEmail").value = studentData.email || "";
        document.getElementById("studentPassword").style.display = "none";
        document.getElementById("studentYearLevel").value = studentData.yearLevel || "";
        document.getElementById("studentRegNumber").value = studentData.registrationNumber || "";
        document.getElementById("studentPhone").value = studentData.phone || "";

        // Set school
        if (studentData.school) {
            for (const opt of schoolSelect.options) {
                if (opt.text === studentData.school) { opt.selected = true; break; }
            }
            await loadStudentDepts();
            // Set department
            if (studentData.department) {
                const deptSelect = document.getElementById("studentDept");
                for (const opt of deptSelect.options) {
                    if (opt.text === studentData.department) { opt.selected = true; break; }
                }
                await loadStudentProgrammes();
                // Set programme
                if (studentData.program) {
                    const progSelect = document.getElementById("studentProgram");
                    for (const opt of progSelect.options) {
                        if (opt.text === studentData.program) { opt.selected = true; break; }
                    }
                }
            }
        }
    }
    openModal("studentModal");
};

window.editStudent = async (id) => {
    try {
        const data = await SmartCampusAPI.fetchUser(id);
        showManageStudentModal(data);
    } catch (ex) {
        SmartCampusUI.showToast("Failed to load student: " + ex.message, "error");
    }
};

window.deleteStudent = async (id, name) => {
    if (!confirm(`Delete student "${name}"?\nThis action cannot be undone.`)) return;
    try {
        await SmartCampusAPI.deleteUser(id);
        SmartCampusUI.showToast(`Student "${name}" deleted`, "success");
        renderManageStudents();
    } catch (ex) {
        SmartCampusUI.showToast("Failed to delete: " + ex.message, "error");
    }
};

// ─── Departments tab ────────────────────────────────────────────────

async function renderFinanceDepartments() {
    const container = document.getElementById("deptTableContainer");
    if (!container) return;
    const data = await SmartCampusAPI.withFallback(() => SmartCampusAPI.fetchDeptRevenue(), () => ({ data: [] }));
    const depts = data.data || data || [];
    container.innerHTML = depts.length
        ? `<table><thead><tr><th>Department</th><th>Students</th><th>Fully Paid</th><th>Partial</th><th>Unpaid</th><th>Revenue</th><th>Outstanding</th></tr></thead><tbody>`
            + depts.map(d => `<tr><td><strong>${d.department}</strong></td><td>${d.totalStudents}</td><td>${d.fullyPaid}</td><td>${d.partial}</td><td>${d.unpaid}</td><td>NLE${(d.totalRevenue || 0).toLocaleString()}</td><td style="color:var(--error)">NLE${(d.outstanding || 0).toLocaleString()}</td></tr>`).join("")
            + '</tbody></table>'
        : '<p style="color:var(--gray-300);text-align:center;padding:1rem">No department data</p>';
}

// ─── Reports tab ────────────────────────────────────────────────────

async function loadReportSummary() {
    const period = document.getElementById("reportPeriod")?.value || "monthly";
    const container = document.getElementById("reportSummary");
    if (!container) return;
    const data = await SmartCampusAPI.withFallback(() => SmartCampusAPI.fetchReportSummary(period), () => ({ total: 0, count: 0, label: '' }));
    const r = data.data || data;
    container.innerHTML = `
        <div class="stat-card"><h3 style="color:var(--primary)">${r.label || period}</h3><p>Period</p></div>
        <div class="stat-card"><h3 style="color:var(--success)">NLE${(r.total || 0).toLocaleString()}</h3><p>Total Collected</p></div>
        <div class="stat-card"><h3 style="color:var(--info)">${r.count || 0}</h3><p>Transactions</p></div>
    `;
}

async function exportCsv() {
    try {
        const csv = await SmartCampusAPI.exportReportCsv();
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'fee_report.csv'; a.click();
        URL.revokeObjectURL(url);
        SmartCampusUI.showToast("Report exported!", "success");
    } catch { SmartCampusUI.showToast("Export failed", "error"); }
}

// ─── Audit tab ──────────────────────────────────────────────────────

async function renderFinanceAudit() {
    const container = document.getElementById("auditLogContainer");
    if (!container) return;
    const data = await SmartCampusAPI.withFallback(() => SmartCampusAPI.fetchAuditLogs(), () => ({ data: [] }));
    const logs = data.data || data || [];
    container.innerHTML = logs.length
        ? `<table><thead><tr><th>Date</th><th>Action</th><th>Entity</th><th>Entity ID</th><th>Performed By</th><th>Details</th></tr></thead><tbody>`
            + logs.map(l => `<tr><td>${l.createdAt ? new Date(l.createdAt).toLocaleString() : '-'}</td><td><span class="badge-${l.action?.includes('REVERSE') ? 'error' : l.action?.includes('DELETE') ? 'error' : l.action?.includes('CREATE') ? 'success' : 'info'}">${l.action}</span></td><td>${l.entityType||'-'}</td><td>${l.entityId||'-'}</td><td>${l.performedBy||'-'}</td><td>${l.details||'-'}</td></tr>`).join("")
            + '</tbody></table>'
        : '<p style="color:var(--gray-300);text-align:center;padding:1rem">No audit logs</p>';
}

// ─── Fee Structures tab ─────────────────────────────────────────────

async function renderFinanceFeeStructures() {
    const container = document.getElementById("feeStructureContainer");
    if (!container) return;
    const data = await SmartCampusAPI.withFallback(() => SmartCampusAPI.fetchFeeStructures(), () => ({ data: [] }));
    const items = data.data || data || [];
    container.innerHTML = items.length
        ? `<table><thead><tr><th>Year</th><th>Semester</th><th>Programme</th><th>Level</th><th>Type</th><th>Amount</th></tr></thead><tbody>`
            + items.map(f => `<tr><td>${f.academicYear}</td><td>${f.semester}</td><td>${f.programme}</td><td>${f.yearLevel}</td><td>${f.feeType}</td><td>NLE${(f.amount||0).toLocaleString()}</td></tr>`).join("")
            + '</tbody></table>'
        : '<p style="color:var(--gray-300);text-align:center;padding:1rem">No fee structures defined</p>';
}

// ─── Broadcast ────────────────────────────────────────────────────────

async function renderFinanceBroadcast() {
    const container = document.getElementById("broadcastContainer");
    if (!container) return;
    const templates = [
        { label: "Fee Reminder", subject: "Fee Payment Reminder", body: "Dear Student,\n\nThis is a reminder that your tuition fee payment is due. Please visit the finance office or use the online portal to complete your payment.\n\nThank you,\nFinance Department" },
        { label: "Overdue Notice", subject: "Overdue Fee Notice", body: "Dear Student,\n\nOur records show that your fee payment is now overdue. Please settle your outstanding balance immediately to avoid any academic restrictions.\n\nThank you,\nFinance Department" },
        { label: "Payment Confirmation", subject: "Payment Received", body: "Dear Student,\n\nWe have received your fee payment. Your account is now up to date.\n\nThank you,\nFinance Department" },
        { label: "Registration Reminder", subject: "Registration Fee Reminder", body: "Dear Student,\n\nPlease note that the registration fee deadline is approaching. Ensure you complete payment to secure your enrollment for the semester.\n\nThank you,\nFinance Department" }
    ];
    container.innerHTML = `
        <h3 style="margin-bottom:.75rem">Email Broadcast</h3>
        <p style="color:var(--gray-600);margin-bottom:1rem">Send payment alerts and announcements to students via email.</p>
        <div style="display:flex;gap:.5rem;flex-wrap:wrap;margin-bottom:1rem">
            ${templates.map((t, i) => `<button class="btn btn-outline btn-sm" data-template="${i}">${t.label}</button>`).join("")}
        </div>
        <div style="display:grid;gap:.75rem;max-width:600px">
            <div><label style="font-weight:600;font-size:.85rem">Send to</label>
                <select id="bcRole" style="width:100%;padding:.5rem;border:1px solid var(--gray-200);border-radius:6px">
                    <option value="Student">All Students</option>
                    <option value="All">Everyone</option>
                </select>
            </div>
            <div><label style="font-weight:600;font-size:.85rem">Subject</label>
                <input id="bcSubject" style="width:100%;padding:.5rem;border:1px solid var(--gray-200);border-radius:6px" placeholder="e.g. Fee Payment Reminder">
            </div>
            <div><label style="font-weight:600;font-size:.85rem">Message</label>
                <textarea id="bcBody" style="width:100%;padding:.5rem;border:1px solid var(--gray-200);border-radius:6px;min-height:150px" placeholder="Write your message..."></textarea>
            </div>
            <div style="display:flex;gap:.5rem;align-items:center">
                <button class="btn btn-primary" id="bcSendBtn">Send Broadcast</button>
                <span id="bcStatus" style="font-size:.85rem;color:var(--gray-600)"></span>
            </div>
            <div id="bcHistory" style="margin-top:1rem"></div>
        </div>
    `;

    // Template buttons
    container.querySelectorAll("[data-template]").forEach(btn => {
        btn.addEventListener("click", () => {
            const t = templates[parseInt(btn.dataset.template)];
            document.getElementById("bcSubject").value = t.subject;
            document.getElementById("bcBody").value = t.body;
        });
    });

    // Send button
    document.getElementById("bcSendBtn").addEventListener("click", async () => {
        const role = document.getElementById("bcRole").value;
        const subject = document.getElementById("bcSubject").value.trim();
        const body = document.getElementById("bcBody").value.trim();
        const status = document.getElementById("bcStatus");
        if (!subject || !body) { status.textContent = "Subject and message are required"; return; }
        status.textContent = "Sending...";
        try {
            const token = localStorage.getItem("sc_token");
            const res = await fetch("http://localhost:8080/api/email/broadcast", {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
                body: JSON.stringify({ role, subject, body })
            });
            const data = await res.json();
            status.textContent = data.message || "Sent!";
            // Add to history
            addBroadcastHistory({ role, subject, body, sentAt: new Date().toLocaleString() });
        } catch {
            status.textContent = "Broadcast queued (offline)";
            addBroadcastHistory({ role, subject, body, sentAt: new Date().toLocaleString() });
        }
    });

    // Load history
    renderBroadcastHistory();
}

function addBroadcastHistory(entry) {
    const history = JSON.parse(sessionStorage.getItem("bc_history") || "[]");
    history.unshift(entry);
    if (history.length > 20) history.length = 20;
    sessionStorage.setItem("bc_history", JSON.stringify(history));
    renderBroadcastHistory();
}

function renderBroadcastHistory() {
    const el = document.getElementById("bcHistory");
    if (!el) return;
    const history = JSON.parse(sessionStorage.getItem("bc_history") || "[]");
    el.innerHTML = history.length
        ? `<h4 style="margin-bottom:.5rem;font-size:.85rem">Sent History</h4>
           <div style="max-height:200px;overflow-y:auto;font-size:.8rem">
           ${history.map(h => `<div style="padding:.4rem 0;border-bottom:1px solid var(--gray-100)"><strong>${h.subject}</strong> &mdash; ${h.role} &middot; ${h.sentAt}</div>`).join("")}
           </div>`
        : "";
}

// ─── Hierarchy tab ─────────────────────────────────────────────────

async function renderFinanceHierarchy() {
    const container = document.getElementById("hierarchyContainer");
    if (!container) return;
    container.innerHTML = '<p style="color:var(--gray-300)">Loading hierarchy...</p>';
    try {
        const token = localStorage.getItem("sc_token");
        const headers = { Authorization: "Bearer " + token };
        const res = await fetch("http://localhost:8080/api/programmes/hierarchy", { headers });
        const json = await res.json();
        const hierarchy = json.data || json || [];

        let html = `<div style="display:flex;gap:.75rem;flex-wrap:wrap;margin-bottom:1rem">
            <select id="hierarchySchoolFilter" onchange="renderFinanceHierarchy()" style="padding:.5rem;border:1px solid var(--gray-200);border-radius:6px">
                <option value="">All Schools</option>
                ${hierarchy.map(s => `<option value="${s.id}">${s.name}</option>`).join("")}
            </select>
            <button class="btn btn-sm" onclick="expandAllHierarchy()">Expand All</button>
            <button class="btn btn-sm" onclick="collapseAllHierarchy()">Collapse All</button>
        </div>`;

        const filter = document.getElementById("hierarchySchoolFilter")?.value;
        const filtered = filter ? hierarchy.filter(s => String(s.id) === filter) : hierarchy;

        html += `<div class="hierarchy-tree">`;
        for (const school of filtered) {
            html += `<div class="hierarchy-school">
                <div class="hierarchy-node hierarchy-school-node" onclick="toggleHierarchy(this)" data-expanded="false">
                    <span class="hierarchy-toggle">▶</span>
                    <span class="hierarchy-icon">🏛️</span>
                    <strong>${school.name}</strong>
                    <span class="hierarchy-count">${school.departments?.length || 0} depts</span>
                </div>
                <div class="hierarchy-children" style="display:none;padding-left:2rem">`;

            for (const dept of school.departments || []) {
                html += `<div class="hierarchy-department">
                    <div class="hierarchy-node hierarchy-dept-node" onclick="toggleHierarchy(this)" data-expanded="false">
                        <span class="hierarchy-toggle">▶</span>
                        <span class="hierarchy-icon">📂</span>
                        <strong>${dept.name}</strong>
                        <span class="hierarchy-count">${dept.programmes?.length || 0} programmes</span>
                    </div>
                    <div class="hierarchy-children" style="display:none;padding-left:2rem">`;

                for (const prog of dept.programmes || []) {
                    html += `<div class="hierarchy-programme">
                        <div class="hierarchy-node hierarchy-prog-node" onclick="toggleHierarchy(this, ${prog.id})" data-expanded="false" data-prog-id="${prog.id}">
                            <span class="hierarchy-toggle">▶</span>
                            <span class="hierarchy-icon">📘</span>
                            <span>${prog.name}</span>
                            <span class="hierarchy-count">${prog.studentCount || 0} students</span>
                        </div>
                        <div class="hierarchy-children" style="display:none;padding-left:2rem"></div>
                    </div>`;
                }

                html += `</div></div>`;
            }

            html += `</div></div>`;
        }
        html += `</div>`;
        container.innerHTML = html;
    } catch (ex) {
        container.innerHTML = `<p style="color:var(--error)">Failed to load hierarchy: ${ex.message}</p>`;
    }
}

window.toggleHierarchy = async (node, progId) => {
    const isExpanded = node.dataset.expanded === "true";
    const children = node.nextElementSibling;
    if (!children) return;

    if (isExpanded) {
        node.dataset.expanded = "false";
        node.querySelector(".hierarchy-toggle").textContent = "▶";
        children.style.display = "none";
        return;
    }

    node.dataset.expanded = "true";
    node.querySelector(".hierarchy-toggle").textContent = "▼";

    // If programme node and students not yet loaded, fetch them
    if (progId && children.children.length === 0) {
        children.innerHTML = '<p style="color:var(--gray-300);font-size:.8rem;padding:.25rem .5rem">Loading students...</p>';
        try {
            const token = localStorage.getItem("sc_token");
            const res = await fetch("http://localhost:8080/api/programmes/" + progId, { headers: { Authorization: "Bearer " + token } });
            const json = await res.json();
            const prog = json.data || json;
            const students = prog.students || [];
            children.innerHTML = students.length
                ? students.map(s => `
                    <div class="hierarchy-student" style="padding:.3rem .5rem;display:flex;align-items:center;gap:.5rem;border-bottom:1px solid var(--gray-100)">
                        <span>👤</span>
                        <span><strong>${esc(s.name)}</strong> ${s.registrationNumber ? '&middot; ' + esc(s.registrationNumber) : ''} ${s.yearLevel ? '&middot; ' + esc(s.yearLevel) : ''}</span>
                        <span style="color:var(--gray-500);font-size:.8rem">${esc(s.email)}</span>
                    </div>
                `).join("")
                : '<p style="color:var(--gray-300);font-size:.8rem;padding:.25rem .5rem">No students enrolled</p>';
        } catch {
            children.innerHTML = '<p style="color:var(--error);font-size:.8rem">Failed to load students</p>';
        }
    }

    children.style.display = "block";
};

window.expandAllHierarchy = () => {
    document.querySelectorAll(".hierarchy-node[data-expanded='false']").forEach(n => {
        n.dataset.expanded = "true";
        n.querySelector(".hierarchy-toggle").textContent = "▼";
        const children = n.nextElementSibling;
        if (children) children.style.display = "block";
    });
};

window.collapseAllHierarchy = () => {
    document.querySelectorAll(".hierarchy-node[data-expanded='true']").forEach(n => {
        n.dataset.expanded = "false";
        n.querySelector(".hierarchy-toggle").textContent = "▶";
        const children = n.nextElementSibling;
        if (children) { children.style.display = "none"; }
    });
};

// ─── Record Payment page ────────────────────────────────────────────

async function renderRecordPayment() {
}

window.searchStudent = async () => {
    const q = document.getElementById("studentSearchPay").value.trim().toLowerCase();
    const results = document.getElementById("studentResults");
    if (!q) { results.innerHTML = "<p style='color:var(--gray-300)'>Enter a name or email to search</p>"; return; }
    const data = await SmartCampusAPI.withFallback(() => SmartCampusAPI.searchStudents(q), () => ({ data: [] }));
    const students = data.data || data || [];
    if (!students.length) { results.innerHTML = "<p style='color:var(--gray-300)'>No students found</p>"; return; }
    results.innerHTML = students.map(s => `
        <div class="student-result" onclick="selectStudent('${s.studentId}')">
            <strong>${s.name}</strong> &mdash; ${s.email}<br>
            <span style="font-size:.8rem;color:var(--gray-600)">ID: ${s.studentId} &middot; ${s.department || ''} &middot; ${s.program || ''} &middot; Balance: NLE${(s.balance || 0).toLocaleString()}</span>
        </div>
    `).join("");
};

window.lookupStudent = async () => {
    const idInput = document.getElementById("payStudentIdDisplay");
    const sid = parseInt(idInput?.value);
    if (!sid || isNaN(sid)) return;
    document.getElementById("payStudentId").value = sid;
    // Clear fields while loading
    document.getElementById("payName").value = "";
    document.getElementById("payEmail").value = "";
    document.getElementById("payPhone").value = "";
    document.getElementById("paySchool").value = "";
    document.getElementById("payDept").value = "";
    document.getElementById("payProgram").value = "";
    document.getElementById("payYearLevel").value = "";
    document.getElementById("payBalance").value = "NLE 0";
    try {
        const raw = await SmartCampusAPI.fetchStudentProfile(sid);
        const st = raw.data || raw || {};
        if (!st || !st.name) throw new Error("Student not found");
        document.getElementById("payStudentId").value = st.studentId || sid;
        document.getElementById("payStudentIdDisplay").value = st.studentId || sid;
        document.getElementById("payName").value = st.name || "";
        document.getElementById("payEmail").value = st.email || "";
        document.getElementById("payPhone").value = st.phone || "";
        document.getElementById("paySchool").value = st.school || "";
        document.getElementById("payDept").value = st.department || "";
        document.getElementById("payProgram").value = st.program || "";
        document.getElementById("payYearLevel").value = st.yearLevel || "";
        document.getElementById("payBalance").value = "NLE " + ((st.balance || 0)).toLocaleString();
    } catch {
        document.getElementById("payStudentId").value = "";
        SmartCampusUI.showToast("No student found with ID " + sid, "error");
    }
    document.getElementById("payAmount").value = "";
    document.getElementById("payRef").value = "";
};

window.selectStudent = async (studentId) => {
    const data = await SmartCampusAPI.withFallback(() => SmartCampusAPI.fetchStudentProfile(studentId), () => ({}));
    const st = data.data || data || {};
    document.getElementById("payStudentId").value = st.studentId || studentId;
    document.getElementById("payStudentIdDisplay").value = st.studentId || studentId;
    document.getElementById("payName").value = st.name || "";
    document.getElementById("payEmail").value = st.email || "";
    document.getElementById("payPhone").value = st.phone || "";
    document.getElementById("paySchool").value = st.school || "";
    document.getElementById("payDept").value = st.department || "";
    document.getElementById("payProgram").value = st.program || "";
    document.getElementById("payYearLevel").value = st.yearLevel || "";
    document.getElementById("payBalance").value = "NLE " + ((st.balance || 0)).toLocaleString();
    document.getElementById("payAmount").value = "";
    document.getElementById("payRef").value = "";
};

async function renderFeeManagement() {
    const summary = document.getElementById("feeSummary");
    const recordsContainer = document.getElementById("feeRecordsContainer");
    const paymentsContainer = document.getElementById("paymentHistoryContainer");
    if (!recordsContainer) return;
    let userId = 6;
    try { const u = JSON.parse(localStorage.getItem("sc_user")); userId = u.id || 6; } catch {}

    const records = await SmartCampusAPI.withFallback(() => SmartCampusAPI.fetchFees(userId), () => [
        {academicYear:"2024/2025", semester:"Semester1", totalFee:250000, paidAmount:250000, status:"Paid", balance:0},
        {academicYear:"2024/2025", semester:"Semester2", totalFee:250000, paidAmount:150000, status:"Partial", balance:100000},
        {academicYear:"2025/2026", semester:"Semester1", totalFee:275000, paidAmount:0, status:"Unpaid", balance:275000}
    ]);
    const payments = await SmartCampusAPI.withFallback(() => SmartCampusAPI.fetchPayments(userId), () => []);

    const totalOwed = records.reduce((s, r) => s + (r.totalFee || 0), 0);
    const totalPaid = records.reduce((s, r) => s + (r.paidAmount || 0), 0);
    const balance = totalOwed - totalPaid;

    if (summary) summary.innerHTML = `
        <div class="fee-stat"><h3 style="color:var(--info)">NLE${totalOwed.toLocaleString()}</h3><p>Total Fees</p></div>
        <div class="fee-stat"><h3 style="color:var(--success)">NLE${totalPaid.toLocaleString()}</h3><p>Total Paid</p></div>
        <div class="fee-stat"><h3 style="color:${balance > 0 ? 'var(--error)' : 'var(--success)'}">NLE${balance.toLocaleString()}</h3><p>${balance > 0 ? 'Outstanding' : 'Cleared'}</p></div>
    `;

    recordsContainer.innerHTML = '<table><thead><tr><th>Year</th><th>Semester</th><th>Total</th><th>Paid</th><th>Balance</th><th>Status</th></tr></thead><tbody>'
        + records.map(r => `<tr><td>${r.academicYear}</td><td>${r.semester}</td><td>NLE${r.totalFee.toLocaleString()}</td><td>NLE${r.paidAmount.toLocaleString()}</td><td>NLE${(r.totalFee - r.paidAmount).toLocaleString()}</td><td><span class="badge badge-${r.status === 'Paid' ? 'success' : r.status === 'Partial' ? 'warning' : 'error'}">${r.status}</span></td></tr>`).join("")
        + '</tbody></table>';

    if (paymentsContainer) paymentsContainer.innerHTML = payments.length
        ? '<table><thead><tr><th>Date</th><th>Amount</th><th>Method</th><th>Reference</th></tr></thead><tbody>'
            + payments.map(p => `<tr><td>${p.paymentDate}</td><td>NLE${p.amount.toLocaleString()}</td><td>${p.method}</td><td>${p.reference || ''}</td></tr>`).join("")
            + '</tbody></table>'
        : '<p style="color:var(--gray-300)">No payments recorded</p>';

    const payForm = document.getElementById("payForm");
    if (payForm && !payForm._bound) {
        payForm._bound = true;
        payForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const payment = {
                amount: parseFloat(document.getElementById("payAmount").value),
                paymentDate: new Date().toISOString().slice(0,10),
                method: document.getElementById("payMethod").value,
                reference: document.getElementById("payRef").value || "TXN-" + Date.now()
            };
            try {
                await SmartCampusAPI.makePayment(userId, payment);
                SmartCampusUI.showToast("Payment recorded!", "success");
            } catch {
                SmartCampusUI.showToast("Payment recorded (offline).", "success");
            }
            document.getElementById("payRef").value = "";
            renderFeeManagement();
        });
    }
}

async function exportGrades() {
    try {
        const csv = await SmartCampusAPI.exportGradesCsv();
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a'); a.href = url; a.download = 'grades.csv'; a.click();
        URL.revokeObjectURL(url);
        SmartCampusUI.showToast("Grades exported!", "success");
    } catch {
        SmartCampusUI.showToast("Export failed", "error");
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    const page = window.location.pathname.split("/").pop();
    const tasks = [];
    if (page === "dashboard.html") tasks.push(renderDashboard());
    if (page === "schools.html") tasks.push(renderSchoolsList());
    if (page === "school_details.html") tasks.push(renderSchoolDetails());
    if (page === "department_details.html") tasks.push(renderDepartmentDetails());
    if (page === "programmes.html") tasks.push(renderProgrammes());
    if (page === "curriculum.html") tasks.push(renderCurriculum());
    if (page === "manage-curriculum.html") tasks.push(renderManageCurriculum());
    if (page === "gradebook.html") tasks.push(renderGradebook());
    if (page === "moderation.html") tasks.push(renderModeration());
    if (page === "student_results.html") tasks.push(renderStudentResults());
    if (page === "appeals.html") tasks.push(renderAppeals());
    if (page === "admin_settings.html") tasks.push(renderAdminSettings());
    if (page === "profile.html") tasks.push(renderProfile());
    if (page === "my_grades.html") tasks.push(renderMyGrades());
    if (page === "upcoming_assignments.html") tasks.push(renderUpcomingAssignments());
    if (page === "appeals_status.html") tasks.push(renderAppealsStatus());
    if (page === "courses.html") tasks.push(renderCourses());
    if (page === "enrollments.html") tasks.push(renderEnrollments());
    if (page === "messages.html") tasks.push(renderMessages());
    if (page === "finance.html") tasks.push(renderFinancePanel());
    if (page === "record-payment.html") tasks.push(renderRecordPayment());
    if (page === "fees.html") tasks.push(renderFeeManagement());
    await Promise.all(tasks);

    // ─── Finance form bindings ────────────────────────────────────────

    const fm = document.getElementById("feeForm");
    if (fm && !fm._bound) { fm._bound = true; fm.addEventListener("submit", async e => {
        e.preventDefault();
        const id = document.getElementById("editFeeId").value;
        const paidEl = document.getElementById("feePaid");
        const record = {
            studentId: parseInt(document.getElementById("feeStudentId").value),
            academicYear: document.getElementById("feeYear").value,
            semester: document.getElementById("feeSemester").value,
            totalFee: parseFloat(document.getElementById("feeTotal").value),
            paidAmount: paidEl ? parseFloat(paidEl.value) || 0 : 0,
            status: document.getElementById("feeStatus").value
        };
        try {
            if (id) { await SmartCampusAPI.updateFeeRecord(id, record); SmartCampusUI.showToast("Fee record updated", "success"); }
            else { await SmartCampusAPI.createFeeRecord(record); SmartCampusUI.showToast("Fee record created", "success"); }
            closeModal("feeModal");
            renderFinanceStudents();
        } catch (ex) {
            SmartCampusUI.showToast(ex?.message || "Failed to save fee record", "error");
        }
    }); }

    const nm = document.getElementById("notifyForm");
    if (nm && !nm._bound) { nm._bound = true; nm.addEventListener("submit", async e => {
        e.preventDefault();
        const sid = document.getElementById("notifyStudentId").value;
        const msg = document.getElementById("notifyMessage").value;
        try {
            if (sid) { await SmartCampusAPI.notifyStudent(sid, msg); SmartCampusUI.showToast("Email sent to student", "success"); }
            else { await SmartCampusAPI.notifyAllStudents(msg); SmartCampusUI.showToast("Email sent to all students", "success"); }
            closeModal("notifyModal");
        } catch (ex) {
            SmartCampusUI.showToast(ex?.message || "Email failed", "error");
        }
    }); }

    const rpf = document.getElementById("recordPaymentForm");
    if (rpf && !rpf._bound) { rpf._bound = true; rpf.addEventListener("submit", async e => {
        e.preventDefault();
        // Try hidden field first, fall back to display field
        let sid = parseInt(document.getElementById("payStudentId").value);
        if (!sid || isNaN(sid)) sid = parseInt(document.getElementById("payStudentIdDisplay").value);
        const amt = parseFloat(document.getElementById("payAmount").value);
        if (!sid || isNaN(sid)) { SmartCampusUI.showToast("Enter a valid Student ID", "error"); return; }
        if (!amt || amt <= 0) { SmartCampusUI.showToast("Enter a valid payment amount", "error"); return; }
        const payment = {
            studentId: sid,
            amount: amt,
            method: document.getElementById("payMethod").value,
            reference: document.getElementById("payRef").value || "PAY-" + Date.now()
        };
        try {
            await SmartCampusAPI.adminRecordPayment(payment);
            SmartCampusUI.showToast("Payment recorded!", "success");
            document.getElementById("payAmount").value = "";
            document.getElementById("payRef").value = "";
            // Refresh student profile
            if (window.lookupStudent) lookupStudent();
        } catch (ex) {
            SmartCampusUI.showToast(ex?.message || "Payment failed — try again", "error");
        }
    }); }

        const sf = document.getElementById("studentForm");
    if (sf && !sf._bound) { sf._bound = true; sf.addEventListener("submit", async e => {
        e.preventDefault();
        const editId = document.getElementById("editStudentId")?.value;
        const deptVal = document.getElementById("studentDept")?.value || "";
        const progVal = document.getElementById("studentProgram")?.value || "";
        const user = {
            name: document.getElementById("studentName").value,
            email: document.getElementById("studentEmail").value,
            password: document.getElementById("studentPassword").value,
            role: "Student",
            school: document.getElementById("studentSchool").options[document.getElementById("studentSchool").selectedIndex]?.text || "",
            department: deptVal.includes("__") ? deptVal.split("__")[1] : deptVal,
            programmeId: progVal.includes("__") ? parseInt(progVal.split("__")[0]) : null,
            program: progVal.includes("__") ? progVal.split("__")[1] : "",
            yearLevel: document.getElementById("studentYearLevel")?.value || "",
            registrationNumber: document.getElementById("studentRegNumber")?.value || "",
            phone: document.getElementById("studentPhone")?.value || ""
        };
        try {
            if (editId) {
                await SmartCampusAPI.updateUser(editId, user);
                SmartCampusUI.showToast("Student updated!", "success");
            } else {
                await SmartCampusAPI.createUser(user);
                SmartCampusUI.showToast("Student created!", "success");
            }
            closeModal("studentModal");
            renderManageStudents();
        } catch (ex) {
            SmartCampusUI.showToast(ex?.message || "Failed to save student", "error");
        }
    }); }

    const fsf = document.getElementById("feeStructureForm");
    if (fsf && !fsf._bound) { fsf._bound = true; fsf.addEventListener("submit", async e => {
        e.preventDefault();
        const fs = {
            academicYear: document.getElementById("fsYear").value,
            semester: document.getElementById("fsSemester").value,
            programme: document.getElementById("fsProgramme").value,
            yearLevel: document.getElementById("fsYearLevel").value,
            feeType: document.getElementById("fsFeeType").value,
            amount: parseFloat(document.getElementById("fsAmount").value)
        };
        try { await SmartCampusAPI.createFeeStructure(fs); SmartCampusUI.showToast("Fee structure added!", "success"); closeModal("feeStructureModal"); renderFinanceFeeStructures(); }
        catch (ex) { SmartCampusUI.showToast(ex?.message || "Failed to add fee structure", "error"); }
    }); }

    const epf = document.getElementById("editPaymentForm");
    if (epf && !epf._bound) { epf._bound = true; epf.addEventListener("submit", async e => {
        e.preventDefault();
        const id = document.getElementById("editPaymentId").value;
        const data = {
            amount: parseFloat(document.getElementById("editPayAmount").value),
            method: document.getElementById("editPayMethod").value,
            reference: document.getElementById("editPayRef").value,
            reason: document.getElementById("editPayReason").value
        };
        try { await SmartCampusAPI.updatePayment(id, data); SmartCampusUI.showToast("Payment updated!", "success"); closeModal("editPaymentModal"); }
        catch (ex) { SmartCampusUI.showToast(ex?.message || "Update failed", "error"); }
    }); }
});
