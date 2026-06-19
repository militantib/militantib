// js/main.js
// Role-based UI and sidebar toggle

// Auth check
(function() {
    const token = localStorage.getItem("sc_token");
    const page = window.location.pathname.split("/").pop();
    if (!token && page !== "login.html" && page !== "") {
        window.location.href = "login.html";
        return;
    }
    // Remove force password change flag after redirect
    if (token && page !== "change-password.html") {
        localStorage.removeItem("sc_force_password_change");
    }
    // Redirect finance roles to finance dashboard, students to student dashboard
    if (token && page === "dashboard.html") {
        try {
            const u = JSON.parse(localStorage.getItem("sc_user"));
            if (u) {
                if (u.role === "Finance Officer" || u.role === "Finance Manager") {
                    window.location.href = "finance-dashboard.html";
                } else if (u.role === "Student") {
                    window.location.href = "student-dashboard.html";
                }
            }
        } catch {}
    }
})();

// Session timeout monitor
(function() {
    const token = localStorage.getItem("sc_token");
    if (!token) return;
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const exp = payload.exp * 1000;
        const now = Date.now();
        const remaining = exp - now;

        if (remaining <= 0) {
            localStorage.removeItem('sc_token');
            localStorage.removeItem('sc_user');
            window.location.href = 'login.html?expired=true';
            return;
        }

        // Show warning 10 minutes before expiry
        const warnAt = remaining - (10 * 60 * 1000);
        if (warnAt > 0) {
            setTimeout(() => {
                if (typeof SmartCampusUI !== 'undefined' && SmartCampusUI.showToast) {
                    SmartCampusUI.showToast(
                        'Your session will expire in 10 minutes. Please save your work.',
                        'warning',
                        10000
                    );
                }
            }, warnAt);
        }

        // Force logout at expiry
        setTimeout(() => {
            localStorage.removeItem('sc_token');
            localStorage.removeItem('sc_user');
            window.location.href = 'login.html?expired=true';
        }, remaining);
    } catch (e) {
        // Invalid token — ignore
    }
})();

// Current role (default: Student)
let currentRole = (function() {
    try {
        const u = JSON.parse(localStorage.getItem("sc_user"));
        return u ? u.role : "Student";
    } catch { return "Student"; }
})();

// Allowed roles
const roles = ["University Super Admin", "School Super Admin", "Department Admin", "Lecturer", "Student", "Finance Officer", "Finance Manager"];
const FINANCE_ROLES = "Finance Officer,Finance Manager";
const ACADEMIC_ROLES = "Lecturer,Department Admin,School Super Admin,University Super Admin";

const navItems = [
    // Academic / Admin nav
    { href: "dashboard.html", label: "Dashboard", icon: "fa-chart-pie", roles: ACADEMIC_ROLES },
    { href: "student-dashboard.html", label: "Student Dashboard", icon: "fa-chart-pie", roles: "Student" },
    { href: "finance-dashboard.html", label: "Finance Dashboard", icon: "fa-chart-pie", roles: FINANCE_ROLES },
    { href: "schools.html", label: "Schools", icon: "fa-school", roles: "Lecturer,School Super Admin,University Super Admin" },
    { href: "programmes.html", label: "Programmes", icon: "fa-graduation-cap", roles: ACADEMIC_ROLES },
    { href: "curriculum.html", label: "Curriculum", icon: "fa-book-open", roles: "School Super Admin,University Super Admin" },
    { href: "gradebook.html", label: "Gradebook", icon: "fa-table", roles: "Lecturer,Department Admin,School Super Admin,University Super Admin" },
    { href: "manage-lecturers.html", label: "Manage Lecturers", icon: "fa-chalkboard-user", roles: "University Super Admin,School Super Admin,Department Admin" },
    { href: "gradebook/department-approval.html", label: "Dept Approval", icon: "fa-check-double", roles: "Department Admin" },
    { href: "gradebook/school-approval.html", label: "School Approval", icon: "fa-school", roles: "School Super Admin" },
    { href: "gradebook/university-approval.html", label: "Univ Approval", icon: "fa-crown", roles: "University Super Admin" },
    { href: "student_results.html", label: "My Results", icon: "fa-chart-bar", roles: "Student" },
    { href: "transcript.html", label: "Transcript", icon: "fa-file-lines", roles: "Student,University Super Admin,School Super Admin,Department Admin" },
    { href: "my_grades.html", label: "My Grades", icon: "fa-medal", roles: "Student" },
    { href: "appeals_status.html", label: "Appeals Status", icon: "fa-flag", roles: "Student" },
    { href: "appeals.html", label: "Appeals", icon: "fa-message", roles: "Student" },
    { href: "courses.html", label: "Courses", icon: "fa-book", roles: "Department Admin,School Super Admin" },
    { href: "enrollments.html", label: "Enrollments", icon: "fa-user-plus", roles: "Department Admin,School Super Admin" },
    { href: "course-registration.html", label: "Course Registration", icon: "fa-pen-to-square", roles: "Student" },
    { href: "timetable.html", label: "Timetable", icon: "fa-calendar-days", roles: "*" },
    { href: "attendance.html", label: "Attendance", icon: "fa-user-check", roles: "Lecturer,School Super Admin" },
    { href: "audit-log.html", label: "Audit Log", icon: "fa-clipboard-list", roles: "University Super Admin,School Super Admin" },
    { href: "admin_settings.html", label: "Admin", icon: "fa-gear", roles: "University Super Admin,School Super Admin" },
    { href: "admin-management.html", label: "Admin Management", icon: "fa-user-shield", roles: "University Super Admin,School Super Admin" },
    { href: "manage-students.html", label: "Student Management", icon: "fa-users-gear", roles: "University Super Admin,School Super Admin" },
    { href: "messages.html", label: "Messages", icon: "fa-envelope", roles: "*" },
    // Finance nav
    { href: "finance.html", label: "Finance Management", icon: "fa-calculator", roles: "University Super Admin,School Super Admin" },
    { href: "finance-portal.html", label: "Finance Portal", icon: "fa-coins", roles: "Finance Officer,Finance Manager" },
    { href: "record-payment.html", label: "Record Payment", icon: "fa-credit-card", roles: "Finance Officer,Finance Manager" },
    // Student fees
    { href: "fees.html", label: "My Fees", icon: "fa-money-bill-wave", roles: "Student" },
    // General
    { href: "profile.html", label: "Profile", icon: "fa-user", roles: "*" }
];

// Initialize on page load
document.addEventListener("DOMContentLoaded", () => {
    mountReusableSidebar();
    bindSidebarToggle();
    mountGlobalOverlays();
    enhanceTopBarsWithChrome();
    setupRoleSelector();
    bindRoleChange();
    bindNotificationPanel();
    highlightActiveNav();
    applyRoleBasedVisibility();
    initSidebarState();
    loadNotificationsFromApi();
});

function initSidebarState() {
    const sidebar = document.querySelector(".sidebar");
    if (!sidebar) return;
    const setMobile = () => {
        if (window.innerWidth <= 768) {
            sidebar.classList.add("collapsed");
        }
    };
    setMobile();
    let resizeTimer;
    window.addEventListener("resize", () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(setMobile, 150);
    });
}

function bindRoleChange() {
    // Role is now determined from JWT token, not a dropdown
}

function resolveDeptContext(deptId) {
    if (typeof schoolsData === "undefined" || deptId == null) return null;
    for (const school of schoolsData) {
        const dept = school.departments.find((d) => String(d.id) === String(deptId));
        if (dept) return { school, dept };
    }
    return null;
}

function buildBreadcrumbItems(pageFile, params) {
    const crumbs = [{ href: "dashboard.html", label: "Dashboard" }];
    if (pageFile === "dashboard.html") {
        crumbs[0].current = true;
        crumbs[0].href = null;
        return crumbs;
    }

    switch (pageFile) {
        case "schools.html":
            crumbs.push({ label: "Schools", current: true });
            break;
        case "school_details.html": {
            const sid = params.get("id");
            const sch = typeof getSchoolById === "function" ? getSchoolById(sid) : null;
            crumbs.push({ href: "schools.html", label: "Schools" });
            crumbs.push({ label: sch ? sch.name : "School details", current: true });
            break;
        }
        case "department_details.html": {
            const deptId = params.get("deptId");
            const schoolId = params.get("schoolId");
            const ctx = resolveDeptContext(deptId);
            crumbs.push({ href: "schools.html", label: "Schools" });
            const schHref = ctx
                ? `school_details.html?id=${ctx.school.id}`
                : schoolId
                  ? `school_details.html?id=${schoolId}`
                  : "schools.html";
            crumbs.push({ href: schHref, label: ctx ? ctx.school.name : "School" });
            crumbs.push({ label: ctx ? ctx.dept.name : "Department", current: true });
            break;
        }
        case "programmes.html":
            crumbs.push({ label: "Programmes", current: true });
            break;
        case "curriculum.html":
            crumbs.push({ label: "Curriculum", current: true });
            break;
        case "gradebook.html":
            crumbs.push({ label: "Gradebook", current: true });
            break;
        case "moderation.html":
        case "manage-lecturers.html":
            crumbs.push({ label: "Manage Lecturers", current: true });
            break;
        case "student-dashboard.html":
            crumbs.push({ label: "Student Dashboard", current: true });
            break;
        case "student_results.html":
            crumbs.push({ label: "My Results", current: true });
            break;
        case "timetable.html":
            crumbs.push({ label: "Timetable", current: true });
            break;
        case "transcript.html":
            crumbs.push({ label: "Transcript", current: true });
            break;
        case "appeals.html":
            crumbs.push({ label: "Appeals", current: true });
            break;
        case "appeals_status.html":
            crumbs.push({ label: "Appeals status", current: true });
            break;
        case "attendance.html":
            crumbs.push({ label: "Attendance", current: true });
            break;
        case "audit-log.html":
            crumbs.push({ label: "Audit Log", current: true });
            break;
        case "course-registration.html":
            crumbs.push({ label: "Course Registration", current: true });
            break;
        case "my_grades.html":
            crumbs.push({ label: "My grades", current: true });
            break;
        case "upcoming_assignments.html":
            crumbs.push({ label: "Assignments", current: true });
            break;
        case "admin_settings.html":
            crumbs.push({ label: "Admin settings", current: true });
            break;
        case "profile.html":
            crumbs.push({ label: "Profile", current: true });
            break;
        default:
            crumbs.push({
                label: pageFile.replace(".html", "").replace(/-/g, " ").replace(/^./, (s) => s.toUpperCase()),
                current: true
            });
            break;
    }

    crumbs.forEach((c, i) => {
        const isLast = i === crumbs.length - 1;
        if (isLast) {
            c.current = true;
            delete c.href;
        } else {
            delete c.current;
            if (i === 0) {
                c.label = "Dashboard";
                c.href = "dashboard.html";
            }
        }
    });
    return crumbs;
}

function renderBreadcrumbsHtml(items) {
    const li = items
        .map((c) => {
            if (c.current) {
                return `<li><span class="breadcrumb-current" aria-current="page">${escapeHtmlSafe(c.label)}</span></li>`;
            }
            return `<li><a href="${c.href}">${escapeHtmlSafe(c.label)}</a></li>`;
        })
        .join("");
    return `<ol class="breadcrumbs">${li}</ol>`;
}

function escapeHtmlSafe(text) {
    const d = document.createElement("div");
    d.textContent = text || "";
    return d.innerHTML;
}

let liveNotifications = null;

async function loadNotificationsFromApi() {
    try {
        liveNotifications = await SmartCampusAPI.fetchNotifications();
    } catch {
        liveNotifications = null;
    }
}

function unreadNotificationCount() {
    const list = liveNotifications || (typeof mockNotifications !== "undefined" ? mockNotifications : []);
    return list.filter((n) => !n.read).length;
}

function renderNotificationListHtml() {
    const list = liveNotifications || (typeof mockNotifications !== "undefined" ? mockNotifications : []);
    if (!list.length) return "<p>No notifications.</p>";
    return list
        .slice(0, 8)
        .map(
            (n) =>
                `<article class="notification-item ${n.read ? "notification-item--read" : ""}">
                    <strong>${escapeHtmlSafe(n.title)}</strong>
                    <p>${escapeHtmlSafe(n.message)}</p>
                    <small>${escapeHtmlSafe(n.time)}</small>
                </article>`
        )
        .join("");
}

function notificationPanelMarkup() {
    const count = unreadNotificationCount();
    return `
      <div class="notifications-cluster">
        <button type="button" class="notifications-bell btn-icon btn-icon-plain" aria-label="Notifications" id="notificationsToggle" aria-expanded="false" aria-haspopup="true">
          <i class="fa-solid fa-bell"></i>
          ${count ? `<span class="notification-badge">${count > 9 ? "9+" : count}</span>` : ""}
        </button>
        <div id="notificationsPanel" class="notifications-panel" role="region" aria-label="Notifications" hidden>
          <div class="notifications-panel-head">
            <span>Notifications</span>
            <button type="button" class="btn-link" id="markAllReadBtn">Mark all read</button>
          </div>
          <div class="notifications-scroll">${renderNotificationListHtml()}</div>
        </div>
      </div>
    `;
}

function bindNotificationPanel() {
    const toggle = document.getElementById("notificationsToggle");
    const panel = document.getElementById("notificationsPanel");
    const markAll = document.getElementById("markAllReadBtn");
    if (!toggle || !panel) return;

    const closeOnOutside = (e) => {
        const cluster = e.target.closest(".notifications-cluster");
        if (!cluster && panel.hidden === false) {
            panel.hidden = true;
            toggle.setAttribute("aria-expanded", "false");
            document.removeEventListener("click", closeOnOutside);
        }
    };

    toggle.addEventListener("click", (ev) => {
        ev.stopPropagation();
        panel.hidden = !panel.hidden;
        toggle.setAttribute("aria-expanded", String(!panel.hidden));
        if (!panel.hidden) {
            queueMicrotask(() => document.addEventListener("click", closeOnOutside));
        } else {
            document.removeEventListener("click", closeOnOutside);
        }
    });

    markAll?.addEventListener("click", async () => {
        const list = liveNotifications || mockNotifications;
        if (list) {
            for (const n of list) {
                n.read = true;
                if (liveNotifications && n.id) {
                    try { await SmartCampusAPI.markNotificationRead(n.id); } catch {}
                }
            }
        }
        panel.querySelector(".notifications-scroll").innerHTML = renderNotificationListHtml();
        const badge = toggle.querySelector(".notification-badge");
        if (badge) badge.remove();
        SmartCampusUI.showToast("All notifications marked as read.", "success");
    });
}

function enhanceTopBarsWithChrome() {
    document.querySelectorAll(".main-content .top-bar").forEach((bar) => {
        const pageFile = window.location.pathname.split("/").pop() || "";
        const params = new URLSearchParams(window.location.search);
        const crumbs = buildBreadcrumbItems(pageFile, params);

        bar.classList.add("top-bar-enhanced");

        bar.innerHTML = `
            <div class="top-bar-row-main">
              <div class="top-bar-left-cluster">
                <button type="button" class="btn-back-arrow" id="smartcampusBackBtn" aria-label="Go back" ${pageFile === "dashboard.html" ? "disabled data-disabled-dashboard" : ""} title="Back">
                  <i class="fa-solid fa-arrow-left-long"></i>
                </button>
              </div>
              <div class="top-bar-actions-cluster">
                ${notificationPanelMarkup()}
                <div class="top-bar-search">
                  <i class="fa-solid fa-search search-icon"></i>
                  <input type="text" id="globalSearch" placeholder="Search schools, departments..." class="search-input">
                  <div id="searchResults" class="search-results"></div>
                </div>
                <div class="user-badge" id="userBadge">
                  <i class="fa-solid fa-user-circle"></i>
                  <span id="userBadgeName">User</span>
                  <button class="btn-link logout-btn" id="logoutBtn" title="Sign out"><i class="fa-solid fa-right-from-bracket"></i></button>
                </div>
              </div>
            </div>
            <div class="top-bar-meta">
              ${renderBreadcrumbsHtml(crumbs)}
            </div>
        `;

        const backBtn = bar.querySelector("#smartcampusBackBtn");
        if (backBtn && !backBtn.disabled) {
            backBtn.addEventListener("click", () => {
                if (window.history.length > 1) window.history.back();
                else window.location.href = "dashboard.html";
            });
        }
    });
}

function mountGlobalOverlays() {
    if (document.getElementById("smartcampus-modal-root")) return;
    document.body.insertAdjacentHTML(
        "beforeend",
        `
    <div id="smartcampus-modal-root" class="modal-root" aria-hidden="true">
      <div class="modal-backdrop" data-modal-close tabindex="-1"></div>
      <div class="modal-dialog" role="dialog" aria-modal="true" aria-labelledby="smartcampusModalTitle">
        <div class="modal-dialog-header">
          <h3 id="smartcampusModalTitle"></h3>
          <button type="button" class="btn-icon btn-icon-plain modal-close-btn" aria-label="Close" data-modal-close>
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div class="modal-dialog-body" id="smartcampusModalBody"></div>
        <div class="modal-dialog-footer">
          <button type="button" class="btn btn-outline" data-modal-cancel>Cancel</button>
          <button type="button" class="btn btn-primary" id="smartcampusModalConfirm">Confirm</button>
        </div>
      </div>
    </div>
    <div id="smartcampus-toast-stack" class="toast-stack" aria-live="polite"></div>`
    );

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") SmartCampusUI.closeModal();
    });

    document.getElementById("smartcampus-modal-root").addEventListener("click", (e) => {
        if (
            e.target.matches("[data-modal-close], [data-modal-cancel]") ||
            e.target.classList.contains("modal-backdrop")
        ) {
            SmartCampusUI.closeModal();
        }
    });
}

window.SmartCampusUI = {
    showToast(message, type = "info", durationMs = 4200) {
        let stack = document.getElementById("smartcampus-toast-stack");
        if (!stack) {
            mountGlobalOverlays();
            stack = document.getElementById("smartcampus-toast-stack");
        }
        const t = document.createElement("div");
        t.className = `toast toast-${type}`;
        t.innerHTML = `<span class="toast-icon"><i class="fa-solid fa-${type === "success" ? "circle-check" : type === "error" ? "circle-xmark" : type === "warning" ? "triangle-exclamation" : "circle-info"}"></i></span><span class="toast-text">${escapeHtmlSafe(message)}</span><button type="button" class="toast-dismiss" aria-label="Dismiss">&times;</button>`;
        const dismiss = () => {
            t.classList.add("toast-out");
            setTimeout(() => t.remove(), 200);
        };
        t.querySelector(".toast-dismiss").addEventListener("click", dismiss);
        stack.appendChild(t);
        if (durationMs > 0) setTimeout(dismiss, durationMs);
    },

    openModal(opts = {}) {
        const root = document.getElementById("smartcampus-modal-root");
        if (!root) return;
        const titleEl = root.querySelector("#smartcampusModalTitle");
        const bodyEl = root.querySelector("#smartcampusModalBody");
        const confirmBtn = root.querySelector("#smartcampusModalConfirm");

        SmartCampusUI.closeModalListeners();

        titleEl.textContent = opts.title || "Notice";
        bodyEl.innerHTML = opts.bodyHtml || "";
        confirmBtn.textContent = opts.confirmText || "OK";

        SmartCampusUI._onConfirm =
            opts.onConfirm ||
            (() => {
                SmartCampusUI.closeModal();
            });

        const cancelBtn = root.querySelector("[data-modal-cancel]");
        if (opts.showCancel === false) cancelBtn.style.display = "none";
        else cancelBtn.style.display = "";

        confirmBtn.onclick = () => SmartCampusUI._onConfirm();
        const footerEl = confirmBtn.closest(".modal-dialog-footer");
        if (footerEl) footerEl.style.display = opts.hideFooter === true ? "none" : "flex";

        root.classList.add("is-open");
        root.setAttribute("aria-hidden", "false");
        document.body.classList.add("modal-open");

        SmartCampusUI._focusBefore = document.activeElement;
        confirmBtn.focus();
    },

    closeModal() {
        const root = document.getElementById("smartcampus-modal-root");
        if (!root) return;
        root.classList.remove("is-open");
        root.setAttribute("aria-hidden", "true");
        document.body.classList.remove("modal-open");
        const fb = SmartCampusUI._focusBefore;
        if (fb && typeof fb.focus === "function") fb.focus();
        SmartCampusUI.closeModalListeners();
    },

    closeModalListeners() {}, // reserved for teardown if needed

    openModerationMock() {
        SmartCampusUI.openModal({
            title: "Moderation request",
            bodyHtml: "<p>You are submitting a moderation request for this module.</p>",
            confirmText: "Submit (mock)",
            onConfirm() {
                SmartCampusUI.closeModal();
                SmartCampusUI.showToast("Moderation submitted (demo).", "success");
            }
        });
    },

    confirmSaveMock(message) {
        SmartCampusUI.openModal({
            title: "Save changes",
            bodyHtml: `<p>${escapeHtmlSafe(message)}</p>`,
            confirmText: "Save",
            onConfirm() {
                SmartCampusUI.closeModal();
                SmartCampusUI.showToast("Saved (demo).", "success");
            }
        });
    }
};

function mountReusableSidebar() {
    const mount = document.getElementById("sidebarMount");
    if (!mount) return;
    const navHtml = navItems.map((item) => {
        const roleAttr = item.roles === "*" ? "*" : item.roles;
        return `<li data-role="${roleAttr}"><a href="${item.href}" title="${item.label}"><i class="fa-solid ${item.icon}"></i> <span class="nav-label">${item.label}</span></a></li>`;
    }).join("");

    mount.innerHTML = `
        <div class="sidebar">
            <div class="sidebar-header">
                <div class="brand-block">
                    <div class="logo-slot">
                        <img class="logo-image" src="img/Njala_university_logo.png" alt="Njala University Logo">
                        <span class="logo-text-fallback">NJ</span>
                    </div>
                    <div class="brand-text">
                        <p class="brand-title">Njala University</p>
                        <p class="brand-subtitle">SmartCampus Grading Portal</p>
                    </div>
                </div>
            </div>
            <ul class="sidebar-nav">${navHtml}</ul>
        </div>
    `;
}

function setupRoleSelector() {
    try {
        const user = JSON.parse(localStorage.getItem("sc_user"));
        const badge = document.getElementById("userBadge");
        const nameSpan = document.getElementById("userBadgeName");
        if (badge && user) {
            badge.setAttribute("data-role", user.role);
            if (nameSpan) nameSpan.textContent = `${user.name} (${user.role.replace(/_/g, " ")})`;
        }
    } catch {}
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
        logoutBtn.addEventListener("click", () => {
            localStorage.removeItem("sc_token");
            localStorage.removeItem("sc_user");
            window.location.href = "login.html";
        });
    }
    bindGlobalSearch();
}

function bindGlobalSearch() {
    const input = document.getElementById("globalSearch");
    const results = document.getElementById("searchResults");
    if (!input || !results) return;
    let timer;
    input.addEventListener("input", () => {
        clearTimeout(timer);
        const q = input.value.trim();
        if (q.length < 2) { results.innerHTML = ""; results.classList.remove("open"); return; }
        timer = setTimeout(async () => {
            try {
                const schools = await SmartCampusAPI.search(q);
                if (!schools.length) { results.innerHTML = "<div class='sr-item'>No results</div>"; results.classList.add("open"); return; }
                let html = "";
                schools.forEach(s => {
                    html += `<div class="sr-item" onclick="window.location.href='school_details.html?id=${s.id}'"><strong>${s.name}</strong></div>`;
                    (s.departments || []).forEach(d => {
                        if (d.name.toLowerCase().includes(q) || (d.programmes || []).some(p => p.toLowerCase().includes(q))) {
                            html += `<div class="sr-item sub" onclick="window.location.href='department_details.html?deptId=${d.id}&schoolId=${s.id}'">${d.name}</div>`;
                        }
                    });
                });
                results.innerHTML = html;
                results.classList.add("open");
            } catch { results.innerHTML = "<div class='sr-item'>Search unavailable</div>"; results.classList.add("open"); }
        }, 300);
    });
    document.addEventListener("click", (e) => {
        if (!e.target.closest(".top-bar-search")) results.classList.remove("open");
    });
}

function adjustContentMargin() {
    const sidebar = document.querySelector(".sidebar");
    const main = document.querySelector(".main-content");
    if (!sidebar || !main) return;
    main.style.marginLeft = sidebar.classList.contains("collapsed") ? "70px" : "260px";
}

function bindSidebarToggle() {
    const logoSlot = document.querySelector(".logo-slot");
    const sidebar = document.querySelector(".sidebar");
    if (logoSlot && sidebar) {
        logoSlot.addEventListener("click", () => {
            sidebar.classList.remove("collapsed");
        });
    }
    document.addEventListener("click", (e) => {
        if (!sidebar || sidebar.classList.contains("collapsed")) return;
        if (sidebar.contains(e.target)) return;
        sidebar.classList.add("collapsed");
    });
    if (sidebar) {
        const obs = new MutationObserver(() => adjustContentMargin());
        obs.observe(sidebar, { attributes: true, attributeFilter: ["class"] });
        adjustContentMargin();
    }
}

function highlightActiveNav() {
    const currentPage = window.location.pathname.split("/").pop();
    const navLinks = document.querySelectorAll(".sidebar-nav a");
    navLinks.forEach((link) => {
        const href = link.getAttribute("href");
        if (href === currentPage) {
            link.classList.add("active");
        } else {
            link.classList.remove("active");
        }
    });
}

function applyRoleBasedVisibility() {
    // Hide/show entire sections based on role
    // Elements with data-role attribute: e.g., <div data-role="School Super Admin,Department Admin">
    const roleElements = document.querySelectorAll("[data-role]");
    roleElements.forEach((el) => {
        const allowedRoles = el.getAttribute("data-role").split(",").map((r) => r.trim());
        if (allowedRoles.includes(currentRole) || allowedRoles.includes("*")) {
            el.style.display = "";
        } else {
            el.style.display = "none";
        }
    });

    // Also handle specific page elements (e.g., school selector in dashboard)
    const schoolAdminSelect = document.getElementById("schoolSelect");
    if (schoolAdminSelect && currentRole !== "University Super Admin" && currentRole !== "School Super Admin") {
        schoolAdminSelect.disabled = true;
    }
}
