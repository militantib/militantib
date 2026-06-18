// js/api.js
const API_BASE = 'http://localhost:8080/api';

function getAuthHeaders() {
    const token = localStorage.getItem("sc_token");
    return token ? { 'Authorization': `Bearer ${token}` } : {};
}

async function apiFetch(url, options = {}) {
    const { raw, ...fetchOptions } = options;
    const headers = { 'Content-Type': 'application/json', ...getAuthHeaders(), ...fetchOptions.headers };
    const res = await fetch(`${API_BASE}${url}`, { ...fetchOptions, headers });
    if (res.status === 401) {
        localStorage.removeItem("sc_token");
        localStorage.removeItem("sc_user");
        window.location.href = "login.html";
        throw new Error("Unauthorized");
    }
    if (!res.ok) {
        let msg = `HTTP ${res.status}`;
        try { const errBody = await res.json(); if (errBody.message) msg = errBody.message; } catch {}
        throw new Error(msg);
    }
    if (raw) return res.text();
    const json = await res.json();
    if (json.success) return json.data;
    throw new Error(json.message || 'API error');
}

const SmartCampusAPI = {
    // Auth
    async login(email, password, loginType) {
        const res = await fetch(`${API_BASE}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, loginType })
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || "Invalid credentials");
        return json;
    },
    async authChangePassword(currentPassword, newPassword, confirmPassword) {
        return apiFetch('/auth/change-password', {
            method: 'POST',
            body: JSON.stringify({ currentPassword, newPassword, confirmPassword })
        });
    },
    async forgotPassword(email) {
        const res = await fetch(`${API_BASE}/auth/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || "Request failed");
        return json;
    },
    async resetPassword(token, newPassword, confirmPassword) {
        const res = await fetch(`${API_BASE}/auth/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token, newPassword, confirmPassword })
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || "Reset failed");
        return json;
    },
    async authFetchLoginHistory() {
        return apiFetch('/auth/login-history');
    },
    async getMe() {
        return apiFetch('/auth/me');
    },

    // Search
    async search(query) { return apiFetch(`/search?q=${encodeURIComponent(query)}`); },
    // Schools
    async fetchSchools() { return apiFetch('/schools'); },
    async fetchSchool(id) { return apiFetch(`/schools/${id}`); },

    // Departments
    async fetchDepartments(schoolId) { return apiFetch(`/schools/${schoolId}/departments`); },
    async fetchDepartment(id) { return apiFetch(`/departments/${id}`); },

    // Grades
    async fetchGrades() { return apiFetch('/grades'); },
    async createGrade(grade) { return apiFetch('/grades', { method: 'POST', body: JSON.stringify(grade) }); },
    async updateGrade(id, grade) { return apiFetch(`/grades/${id}`, { method: 'PUT', body: JSON.stringify(grade) }); },

    // Appeals
    async fetchAppeals() { return apiFetch('/appeals'); },
    async submitAppeal(appeal) { return apiFetch('/appeals', { method: 'POST', body: JSON.stringify(appeal) }); },

    // Moderation
    async fetchModerationRequests() { return apiFetch('/moderation-requests'); },
    async submitModerationRequest(req) { return apiFetch('/moderation-requests', { method: 'POST', body: JSON.stringify(req) }); },
    async approveModerationRequest(id) { return apiFetch(`/moderation-requests/${id}/approve`, { method: 'PATCH' }); },

    // Notifications
    async fetchNotifications() { return apiFetch('/notifications'); },
    async markNotificationRead(id) { return apiFetch(`/notifications/${id}/read`, { method: 'PATCH' }); },

    // Courses
    async fetchCourses(departmentId) { return apiFetch(`/courses${departmentId ? '?departmentId='+departmentId : ''}`); },
    async fetchCourse(id) { return apiFetch(`/courses/${id}`); },
    async createCourse(course) { return apiFetch('/courses', { method: 'POST', body: JSON.stringify(course) }); },
    async updateCourse(id, course) { return apiFetch(`/courses/${id}`, { method: 'PUT', body: JSON.stringify(course) }); },
    async deleteCourse(id) { return apiFetch(`/courses/${id}`, { method: 'DELETE' }); },

    // Enrollments
    async fetchEnrollments(studentId) { return apiFetch(`/enrollments${studentId ? '?studentId='+studentId : ''}`); },
    async createEnrollment(enrollment) { return apiFetch('/enrollments', { method: 'POST', body: JSON.stringify(enrollment) }); },
    async updateEnrollmentStatus(id, status) { return apiFetch(`/enrollments/${id}/status`, { method: 'PATCH', body: JSON.stringify({status}) }); },

    // Export
    async exportGradesCsv() {
        const token = localStorage.getItem("sc_token");
        const res = await fetch(`${API_BASE}/export/grades/csv`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error("Export failed");
        return res.text();
    },

    // Messages
    async fetchInbox(userId) { return apiFetch(`/messages/inbox/${userId}`); },
    async fetchSent(userId) { return apiFetch(`/messages/sent/${userId}`); },
    async fetchMessage(id) { return apiFetch(`/messages/${id}`); },
    async sendMessage(msg) { return apiFetch('/messages', { method: 'POST', body: JSON.stringify(msg) }); },

    // Users
    async fetchUsers() {
        const token = localStorage.getItem("sc_token");
        const res = await fetch(`${API_BASE}/users`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error("Failed to fetch users");
        const json = await res.json();
        return json.data || [];
    },

    // Fees (student)
    async fetchFees(studentId) { return apiFetch(`/fees/${studentId}`); },
    async fetchPayments(studentId) { return apiFetch(`/fees/${studentId}/payments`); },
    async makePayment(studentId, payment) { return apiFetch(`/fees/${studentId}/pay`, { method: 'POST', body: JSON.stringify(payment) }); },
    // Fees (admin / finance)
    async fetchAllStudentFees() { return apiFetch(`/fees/admin/all`); },
    async createFeeRecord(record) { return apiFetch(`/fees/admin/create`, { method: 'POST', body: JSON.stringify(record) }); },
    async updateFeeRecord(id, record) { return apiFetch(`/fees/admin/update/${id}`, { method: 'PUT', body: JSON.stringify(record) }); },
    async adminRecordPayment(payment) { return apiFetch(`/fees/admin/record-payment`, { method: 'POST', body: JSON.stringify(payment) }); },
    async notifyStudent(studentId, msg) { return apiFetch(`/fees/admin/notify/${studentId}`, { method: 'POST', body: JSON.stringify({ message: msg }) }); },
    async notifyAllStudents(msg) { return apiFetch(`/fees/admin/notify-all`, { method: 'POST', body: JSON.stringify({ message: msg }) }); },
    // Users (admin)
    async createUser(user) { return apiFetch(`/users/create`, { method: 'POST', body: JSON.stringify(user) }); },
    async fetchStudents(schoolId, departmentId, programmeId, yearLevel) {
        let q = '/users/students?';
        if (schoolId) q += 'schoolId=' + schoolId + '&';
        if (departmentId) q += 'departmentId=' + departmentId + '&';
        if (programmeId) q += 'programmeId=' + programmeId + '&';
        if (yearLevel) q += 'yearLevel=' + encodeURIComponent(yearLevel) + '&';
        return apiFetch(q);
    },
    async fetchUser(id) { return apiFetch(`/users/${id}`); },
    async updateUser(id, data) { return apiFetch(`/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }); },
    async deleteUser(id) { return apiFetch(`/users/${id}`, { method: 'DELETE' }); },
    async uploadPhoto(file) {
        const token = localStorage.getItem("sc_token");
        const formData = new FormData();
        formData.append("file", file);
        const res = await fetch(`${API_BASE}/upload/student-photo`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
            body: formData
        });
        if (!res.ok) {
            let msg = "Upload failed";
            try { const b = await res.json(); if (b.message) msg = b.message; } catch {}
            throw new Error(msg);
        }
        const json = await res.json();
        if (json.success) return json.data.path;
        throw new Error(json.message || "Upload failed");
    },
    async fetchProgrammes(departmentId) { return apiFetch(`/programmes/department/${departmentId}`); },
    async emailStudent(studentId, subject, message) { return apiFetch(`/users/${studentId}/email`, { method: 'POST', body: JSON.stringify({ subject, message }) }); },
    // Grades
    async fetchGradesByCourse(courseId, semester, academicYear) {
        let q = `/grades/by-course?courseId=${courseId}`;
        if (semester) q += '&semester=' + encodeURIComponent(semester);
        if (academicYear) q += '&academicYear=' + encodeURIComponent(academicYear);
        return apiFetch(q);
    },
    async fetchStudentGrades(studentId) { return apiFetch(`/grades/student/${studentId}`); },
    async fetchTranscript(studentId) { return apiFetch(`/grades/transcript/${studentId}`); },
    // Grade Book (Super Admin)
    async fetchGradeBookStudents(programmeId, yearLevel) {
        let q = `/gradebook/students?programmeId=${programmeId}`;
        if (yearLevel) q += '&yearLevel=' + encodeURIComponent(yearLevel);
        return apiFetch(q);
    },
    async fetchGradeBookStudentCourses(studentId, yearLevel, academicYear) {
        let q = `/gradebook/student/${studentId}/courses`;
        const params = [];
        if (yearLevel) params.push('yearLevel=' + encodeURIComponent(yearLevel));
        if (academicYear) params.push('academicYear=' + encodeURIComponent(academicYear));
        if (params.length) q += '?' + params.join('&');
        return apiFetch(q);
    },
    async saveGradeBookGrades(studentId, data) {
        return apiFetch(`/gradebook/student/${studentId}/grades`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    },
    async fetchProgressReport(studentId, academicYear) {
        let q = `/gradebook/student/${studentId}/progress-report`;
        if (academicYear) q += '?academicYear=' + encodeURIComponent(academicYear);
        return apiFetch(q);
    },
    async bulkCreateGrades(grades) { return apiFetch('/grades/bulk-create', { method: 'POST', body: JSON.stringify(grades) }); },
    async bulkUpdateGrades(grades) { return apiFetch('/grades/bulk-update', { method: 'PUT', body: JSON.stringify(grades) }); },
    async bulkDeleteGrades(ids) { return apiFetch('/grades/bulk-delete', { method: 'DELETE', body: JSON.stringify(ids) }); },
    async deleteGradesByCourse(courseId, semester, academicYear) {
        let q = `/grades/by-course?courseId=${courseId}`;
        if (semester) q += '&semester=' + encodeURIComponent(semester);
        if (academicYear) q += '&academicYear=' + encodeURIComponent(academicYear);
        return apiFetch(q, { method: 'DELETE' });
    },
    async fetchGradeAnalytics(academicYear) {
        let q = '/grades/analytics';
        if (academicYear) q += '?academicYear=' + encodeURIComponent(academicYear);
        return apiFetch(q);
    },
    // Courses by programme
    async fetchCoursesByProgrammeAndYear(programmeId, year) {
        let q = `/courses/by-programme?programmeId=${programmeId}`;
        if (year) q += '&year=' + encodeURIComponent(year);
        return apiFetch(q);
    },
    // Finance dashboard
    async fetchFinanceDashboard() { return apiFetch(`/fees/admin/dashboard`); },
    async searchStudents(q) { return apiFetch(`/fees/admin/students/search?q=${encodeURIComponent(q)}`); },
    async fetchStudentProfile(studentId) { return apiFetch(`/fees/admin/student/${studentId}/profile`); },
    async fetchDeptRevenue() { return apiFetch(`/fees/admin/departments/revenue`); },
    async fetchReportSummary(period) { return apiFetch(`/fees/admin/reports/summary?period=${period}`); },
    async exportReportCsv() { return apiFetch(`/fees/admin/reports/export?format=csv`, { raw: true }); },
    async deleteFeeRecord(id) { return apiFetch(`/fees/admin/delete/${id}`, { method: 'DELETE' }); },
    async updatePayment(paymentId, data) { return apiFetch(`/fees/admin/update-payment/${paymentId}`, { method: 'PUT', body: JSON.stringify(data) }); },
    async reversePayment(paymentId, reason) { return apiFetch(`/fees/admin/reverse-payment/${paymentId}`, { method: 'POST', body: JSON.stringify({ reason }) }); },
    async fetchAuditLogs() { return apiFetch(`/fees/admin/audit-logs`); },
    async fetchFeeStructures() { return apiFetch(`/fees/admin/fee-structures`); },
    async createFeeStructure(fs) { return apiFetch(`/fees/admin/fee-structures`, { method: 'POST', body: JSON.stringify(fs) }); },
    // Finance Management (read-only Super Admin)
    async fetchFinanceAnalytics() { return apiFetch(`/finance/analytics`); },
    async fetchFinanceReport(schoolId, departmentId, programmeId, yearLevel, academicYear, semester, paymentStatus) {
        let q = '/finance/reports?';
        if (schoolId) q += 'schoolId=' + schoolId + '&';
        if (departmentId) q += 'departmentId=' + departmentId + '&';
        if (programmeId) q += 'programmeId=' + programmeId + '&';
        if (yearLevel) q += 'yearLevel=' + encodeURIComponent(yearLevel) + '&';
        if (academicYear) q += 'academicYear=' + encodeURIComponent(academicYear) + '&';
        if (semester) q += 'semester=' + encodeURIComponent(semester) + '&';
        if (paymentStatus) q += 'paymentStatus=' + encodeURIComponent(paymentStatus) + '&';
        return apiFetch(q);
    },
    async fetchStudentFinanceProfile(studentId) { return apiFetch(`/finance/students/${studentId}/profile`); },
    async fetchRevenueBySchool() { return apiFetch(`/finance/revenue/by-school`); },
    async fetchRevenueByProgramme() { return apiFetch(`/finance/revenue/by-programme`); },
    async fetchRevenueByLevel() { return apiFetch(`/finance/revenue/by-level`); },
    async fetchRecentPayments() { return apiFetch(`/finance/recent-payments`); },
    async fetchTodayCollections() { return apiFetch(`/finance/collections/today`); },
    async fetchFinanceNotifications() { return apiFetch(`/finance/notifications`); },
    async fetchFinanceAuditLogs() { return apiFetch(`/finance/audit-logs`); },

    // Profile Management
    async fetchProfileDashboard() { return apiFetch('/profile'); },
    async updateProfile(data) { return apiFetch('/profile', { method: 'PUT', body: JSON.stringify(data) }); },
    async changePassword(currentPassword, newPassword, confirmPassword) {
        return apiFetch('/profile/password', { method: 'PUT', body: JSON.stringify({ currentPassword, newPassword, confirmPassword }) });
    },
    async fetchLoginHistory(limit, offset) {
        let q = '/profile/login-history?';
        if (limit) q += 'limit=' + limit + '&';
        if (offset) q += 'offset=' + offset + '&';
        return apiFetch(q);
    },
    async fetchActivityStats() { return apiFetch('/profile/activity-stats'); },
    async fetchPreferences() { return apiFetch('/profile/preferences'); },
    async updatePreferences(data) { return apiFetch('/profile/preferences', { method: 'PUT', body: JSON.stringify(data) }); },
    async enable2FA(method) { return apiFetch('/profile/2fa/enable', { method: 'POST', body: JSON.stringify({ method }) }); },
    async disable2FA() { return apiFetch('/profile/2fa/disable', { method: 'POST' }); },
    async updateProfilePhoto(photoUrl) { return apiFetch('/profile/photo', { method: 'POST', body: JSON.stringify({ photoUrl }) }); },

    // Approval Workflow
    async submitGradesForApproval(gradeIds, submittedBy) {
        return apiFetch('/approval/submit-grades', { method: 'POST', body: JSON.stringify({ gradeIds, submittedBy }) });
    },
    async departmentApprove(gradeIds, comments) {
        return apiFetch('/approval/department/approve', { method: 'POST', body: JSON.stringify({ gradeIds, comments }) });
    },
    async departmentReject(gradeIds, comments) {
        return apiFetch('/approval/department/reject', { method: 'POST', body: JSON.stringify({ gradeIds, comments }) });
    },
    async schoolApprove(gradeIds, comments) {
        return apiFetch('/approval/school/approve', { method: 'POST', body: JSON.stringify({ gradeIds, comments }) });
    },
    async schoolReject(gradeIds, comments) {
        return apiFetch('/approval/school/reject', { method: 'POST', body: JSON.stringify({ gradeIds, comments }) });
    },
    async universityApprove(gradeIds, comments) {
        return apiFetch('/approval/university/approve', { method: 'POST', body: JSON.stringify({ gradeIds, comments }) });
    },
    async universityReject(gradeIds, comments) {
        return apiFetch('/approval/university/reject', { method: 'POST', body: JSON.stringify({ gradeIds, comments }) });
    },
    async fetchDepartmentPending(departmentId, courseId, semester, academicYear) {
        let q = '/approval/pending/department?';
        if (departmentId) q += 'departmentId=' + departmentId + '&';
        if (courseId) q += 'courseId=' + courseId + '&';
        if (semester) q += 'semester=' + encodeURIComponent(semester) + '&';
        if (academicYear) q += 'academicYear=' + encodeURIComponent(academicYear) + '&';
        return apiFetch(q);
    },
    async fetchSchoolPending(schoolId, departmentId, courseId, semester, academicYear) {
        let q = '/approval/pending/school?';
        if (schoolId) q += 'schoolId=' + schoolId + '&';
        if (departmentId) q += 'departmentId=' + departmentId + '&';
        if (courseId) q += 'courseId=' + courseId + '&';
        if (semester) q += 'semester=' + encodeURIComponent(semester) + '&';
        if (academicYear) q += 'academicYear=' + encodeURIComponent(academicYear) + '&';
        return apiFetch(q);
    },
    async fetchUniversityPending(schoolId, departmentId, courseId, semester, academicYear) {
        let q = '/approval/pending/university?';
        if (schoolId) q += 'schoolId=' + schoolId + '&';
        if (departmentId) q += 'departmentId=' + departmentId + '&';
        if (courseId) q += 'courseId=' + courseId + '&';
        if (semester) q += 'semester=' + encodeURIComponent(semester) + '&';
        if (academicYear) q += 'academicYear=' + encodeURIComponent(academicYear) + '&';
        return apiFetch(q);
    },
    async fetchApprovalHistory(gradeId) { return apiFetch(`/approval/history/${gradeId}`); },
    async fetchApprovalStats() { return apiFetch('/approval/stats'); },
    async fetchApprovalDashboard(schoolId, departmentId, programmeId, yearLevel, semester, academicYear, courseId, lecturerId, status) {
        let q = '/approval/dashboard?';
        if (schoolId) q += 'schoolId=' + schoolId + '&';
        if (departmentId) q += 'departmentId=' + departmentId + '&';
        if (programmeId) q += 'programmeId=' + programmeId + '&';
        if (yearLevel) q += 'yearLevel=' + encodeURIComponent(yearLevel) + '&';
        if (semester) q += 'semester=' + encodeURIComponent(semester) + '&';
        if (academicYear) q += 'academicYear=' + encodeURIComponent(academicYear) + '&';
        if (courseId) q += 'courseId=' + courseId + '&';
        if (lecturerId) q += 'lecturerId=' + lecturerId + '&';
        if (status) q += 'status=' + encodeURIComponent(status) + '&';
        return apiFetch(q);
    },
    async fetchWorkflow(gradeId) { return apiFetch(`/approval/workflow/${gradeId}`); },
    async searchApprovalGrades(q, schoolId, departmentId, status, semester, academicYear) {
        let url = `/approval/search?q=${encodeURIComponent(q)}`;
        if (schoolId) url += '&schoolId=' + schoolId;
        if (departmentId) url += '&departmentId=' + departmentId;
        if (status) url += '&status=' + encodeURIComponent(status);
        if (semester) url += '&semester=' + encodeURIComponent(semester);
        if (academicYear) url += '&academicYear=' + encodeURIComponent(academicYear);
        return apiFetch(url);
    },
    async fetchApprovalNotifications() { return apiFetch('/approval/notifications'); },
    async markApprovalNotificationRead(id) { return apiFetch(`/approval/notifications/read/${id}`, { method: 'POST' }); },
    // Grade submit/resubmit
    async submitGrades(gradeIds, submittedBy) {
        return apiFetch('/grades/submit', { method: 'POST', body: JSON.stringify({ gradeIds, submittedBy }) });
    },
    async resubmitGrades(gradeIds, updatedBy) {
        return apiFetch('/grades/resubmit', { method: 'POST', body: JSON.stringify({ gradeIds, updatedBy }) });
    },

    // Audit Logs
    async fetchSystemAuditLogs(params = {}) {
        let q = '/audit-logs?';
        if (params.action) q += 'action=' + encodeURIComponent(params.action) + '&';
        if (params.entityType) q += 'entityType=' + encodeURIComponent(params.entityType) + '&';
        if (params.userId) q += 'userId=' + params.userId + '&';
        if (params.fromDate) q += 'fromDate=' + encodeURIComponent(params.fromDate) + '&';
        if (params.toDate) q += 'toDate=' + encodeURIComponent(params.toDate) + '&';
        if (params.page != null) q += 'page=' + params.page + '&';
        if (params.size != null) q += 'size=' + params.size + '&';
        return apiFetch(q);
    },
    async fetchAuditLogById(id) { return apiFetch(`/audit-logs/${id}`); },

    // Timetable
    async fetchTimetable(params = {}) {
        let q = '/timetable?';
        if (params.semester) q += 'semester=' + encodeURIComponent(params.semester) + '&';
        if (params.academicYear) q += 'academicYear=' + encodeURIComponent(params.academicYear) + '&';
        if (params.departmentId) q += 'departmentId=' + params.departmentId + '&';
        if (params.day) q += 'day=' + encodeURIComponent(params.day) + '&';
        return apiFetch(q);
    },
    async createTimetableSlot(slot) { return apiFetch('/timetable', { method: 'POST', body: JSON.stringify(slot) }); },
    async updateTimetableSlot(id, slot) { return apiFetch(`/timetable/${id}`, { method: 'PUT', body: JSON.stringify(slot) }); },
    async deleteTimetableSlot(id) { return apiFetch(`/timetable/${id}`, { method: 'DELETE' }); },

    // Exam Schedules
    async fetchExamSchedules(params = {}) {
        let q = '/exam-schedules?';
        if (params.semester) q += 'semester=' + encodeURIComponent(params.semester) + '&';
        if (params.academicYear) q += 'academicYear=' + encodeURIComponent(params.academicYear) + '&';
        return apiFetch(q);
    },
    async createExamSchedule(entry) { return apiFetch('/exam-schedules', { method: 'POST', body: JSON.stringify(entry) }); },

    // Attendance
    async fetchStudentAttendance(studentId) { return apiFetch(`/attendance/student/${studentId}`); },
    async fetchStudentAttendanceStats(studentId) { return apiFetch(`/attendance/student/${studentId}/stats`); },
    async fetchCourseAttendance(courseId) { return apiFetch(`/attendance/course/${courseId}`); },
    async fetchSessionAttendance(courseId, sessionDate) { return apiFetch(`/attendance/course/${courseId}/session/${encodeURIComponent(sessionDate)}`); },
    async markAttendance(records) { return apiFetch('/attendance/mark', { method: 'POST', body: JSON.stringify(records) }); },
    async markBulkAttendance(records) { return apiFetch('/attendance/mark-bulk', { method: 'POST', body: JSON.stringify(records) }); },

    // Registration
    async fetchRegistrationPeriod() { return apiFetch('/registrations/period'); },
    async fetchMyRegistration(studentId, semester, year) {
        let q = `/registrations/my?studentId=${studentId}`;
        if (semester) q += '&semester=' + encodeURIComponent(semester);
        if (year) q += '&year=' + encodeURIComponent(year);
        return apiFetch(q);
    },
    async fetchRegistrationHistory(studentId) { return apiFetch(`/registrations/history?studentId=${studentId}`); },
    async saveRegistrationDraft(reg) { return apiFetch('/registrations/save-draft', { method: 'POST', body: JSON.stringify(reg) }); },
    async submitRegistration(reg) { return apiFetch('/registrations/submit', { method: 'POST', body: JSON.stringify(reg) }); },
    async approveRegistration(id, comment) { return apiFetch(`/registrations/${id}/approve`, { method: 'PUT', body: JSON.stringify({ comment }) }); },
    async rejectRegistration(id, comment) { return apiFetch(`/registrations/${id}/reject`, { method: 'PUT', body: JSON.stringify({ comment }) }); },
    async fetchPendingRegistrations() { return apiFetch('/registrations/pending'); },
    async createRegistrationPeriod(period) { return apiFetch('/registration-periods', { method: 'POST', body: JSON.stringify(period) }); },

    // Student Dashboard
    async fetchStudentDashboard(studentId) { return apiFetch(`/students/${studentId}/dashboard`); },

    // Admin Management
    async fetchAdminManagement(params = {}) {
        let q = '/admin-management?';
        if (params.role) q += 'role=' + encodeURIComponent(params.role) + '&';
        if (params.status) q += 'status=' + encodeURIComponent(params.status) + '&';
        if (params.schoolId) q += 'schoolId=' + params.schoolId + '&';
        return apiFetch(q);
    },
    async fetchAdminManagementStats() { return apiFetch('/admin-management/stats'); },
    async getAdmin(id) { return apiFetch(`/admin-management/${id}`); },
    async registerAdmin(data) {
        const res = await fetch(`${API_BASE}/admin-management/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.message || "Registration failed");
        return json;
    },
    async approveAdmin(id, approvedBy) { return apiFetch(`/admin-management/${id}/approve`, { method: 'PUT', body: JSON.stringify({ approvedBy }) }); },
    async rejectAdmin(id, reason) { return apiFetch(`/admin-management/${id}/reject`, { method: 'PUT', body: JSON.stringify({ reason }) }); },
    async suspendAdmin(id) { return apiFetch(`/admin-management/${id}/suspend`, { method: 'PUT' }); },
    async activateAdmin(id) { return apiFetch(`/admin-management/${id}/activate`, { method: 'PUT' }); },
    async updateAdmin(id, data) { return apiFetch(`/admin-management/${id}`, { method: 'PUT', body: JSON.stringify(data) }); },
    async deleteAdmin(id) { return apiFetch(`/admin-management/${id}`, { method: 'DELETE' }); },
    async resetAdminPassword(id, password) { return apiFetch(`/admin-management/${id}/reset-password`, { method: 'PUT', body: JSON.stringify({ password }) }); },

    // Generic fallback: call API, on error run fallbackFn
    async withFallback(apiFn, fallbackFn) {
        try {
            return await apiFn();
        } catch {
            return fallbackFn();
        }
    }
};
