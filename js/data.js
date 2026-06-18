// js/data.js
// ============================================
// MOCK DATA FOR SMARTCAMPUS GRADING PORTAL
// 5 schools with full departments & programmes
// ============================================

// Schools array
const schoolsData = [
    {
        id: 1,
        name: "School of Technology",
        departments: [
            {
                id: 101,
                name: "Department of Physics & Computer Science",
                programmes: [
                    "Computer Science",
                    "Electronics and Telecommunication",
                    "Energy Studies",
                    "Physics with Computer Science",
                    "Business and Information Technology"
                ]
            },
            {
                id: 102,
                name: "Department of Industrial Technology",
                programmes: ["BSc (Hons) Industrial Technology"]
            },
            {
                id: 103,
                name: "Department of Agricultural and Biosystems Engineering",
                programmes: ["Soil & Water Engineering", "Postharvest Technology", "Farm Machinery & Mechanization"]
            },
            {
                id: 104,
                name: "Department of Maths and Statistics",
                programmes: [
                    "BSc (Hons) Statistics",
                    "BSc (Hons) Mathematics",
                    "BSc Statistics General",
                    "BSc Mathematics General",
                    "BSc Education (Mathematics Major)"
                ]
            }
        ]
    },
    {
        id: 2,
        name: "School of Natural Resources",
        departments: [
            {
                id: 201,
                name: "Department of Fisheries and Aquaculture",
                programmes: ["BSc Natural Resources Management General (Aquaculture bias)", "BSc (Hons) Aquaculture and Fisheries Management"]
            },
            { id: 202, name: "Department of Forestry", programmes: ["BSc Forestry"] },
            { id: 203, name: "Department of Horticulture", programmes: ["BSc Horticulture"] },
            { id: 204, name: "Department of Wood Science", programmes: ["BSc Wood Science"] },
            { id: 205, name: "Department of Wildlife Management and Conservation", programmes: ["BSc Wildlife Management"] }
        ]
    },
    {
        id: 3,
        name: "School of Agriculture and Food Sciences",
        departments: [
            {
                id: 301,
                name: "Department of Agricultural Extension & Rural Sociology",
                programmes: ["BSc (Hons) Agricultural Extension and Rural Sociology", "BSc Agricultural Extension (Crop/Animal Production options)", "BSc (Hons) Agricultural Communication and Media"]
            },
            {
                id: 302,
                name: "Institute of Food Technology, Nutrition and Consumer Studies",
                programmes: ["BSc (Hons) Nutrition & Dietetics", "BSc (Hons) Home Economics & Community Development Studies", "BSc (Hons) Food Technology & Nutrition", "BSc (Hons) Clothing Construction & Design", "BSc Home Economics Education"]
            },
            { id: 303, name: "Department of Agric-Business Management", programmes: ["BSc Agric-Business Management"] },
            { id: 304, name: "Department of Soil Science", programmes: ["BS Soil Science"] },
            { id: 305, name: "Department of Crop Science", programmes: ["BS Crop Science"] },
            { id: 306, name: "Department of Animal Science", programmes: ["BSc Animal Health and Production"] },
            { id: 307, name: "Department of Agricultural Extension and Rural Sociology", programmes: ["BS Agricultural Extension and Rural Sociology"] }
        ]
    },
    {
        id: 4,
        name: "School of Basic Sciences",
        departments: [
            { id: 401, name: "Department of Biological Sciences", programmes: ["BSc Biology", "BSc Chemistry"] }
        ]
    },
    {
        id: 5,
        name: "School of Environmental Sciences",
        departments: [
            { id: 501, name: "Department of Survey and Geo-Informatics", programmes: ["BSc (Hons) Surveying and Geo-informatics"] },
            { id: 502, name: "Department of Land Management and Administration", programmes: ["BSc (Hons) Land Resources Management"] },
            {
                id: 503,
                name: "Institute of Environmental Management and Quality Control",
                programmes: ["BSc (Hons) Environmental Management and Quality Control", "BSc (Hons) Environment and Occupational Health", "BSc (Hons) Disaster Management and Climate Change Adaptation"]
            },
            {
                id: 504,
                name: "Institute of Geography and Development Studies",
                programmes: ["BSc (Hons) Development Studies", "BSc (Hons) Rural Development Studies"]
            }
        ]
    }
];

// Sample modules for curriculum (for BSc Business and IT as example)
const curriculumModules = {
    "Year1": {
        "Semester1": [
            { code: "CS101", title: "Introduction to Computing", credits: 3, type: "Core" },
            { code: "IT101", title: "Information Systems", credits: 3, type: "Core" },
            { code: "MATH101", title: "Discrete Mathematics", credits: 4, type: "Core" }
        ],
        "Semester2": [
            { code: "CS102", title: "Programming Fundamentals", credits: 4, type: "Core" },
            { code: "IT102", title: "Database Management", credits: 3, type: "Core" }
        ]
    },
    "Year2": {
        "Semester1": [
            { code: "CS201", title: "Data Structures", credits: 4, type: "Core" },
            { code: "IT201", title: "Web Development", credits: 3, type: "Elective" }
        ],
        "Semester2": [
            { code: "CS202", title: "Algorithms", credits: 4, type: "Core" }
        ]
    },
    "Year3": {
        "Semester1": [ { code: "CS301", title: "Software Engineering", credits: 4, type: "Core" } ],
        "Semester2": [ { code: "CS302", title: "Operating Systems", credits: 3, type: "Core" } ]
    },
    "Year4": {
        "Semester1": [ { code: "CS401", title: "Project", credits: 6, type: "Core" } ],
        "Semester2": [ { code: "CS402", title: "Entrepreneurship", credits: 3, type: "Core" } ]
    }
};

// Mock gradebook for a lecturer (for Gradebook page)
let gradebookData = [
    { student: "Alice Johnson", module: "CS101", grade: 85, status: "Draft" },
    { student: "Bob Smith", module: "CS101", grade: 72, status: "Submitted" },
    { student: "Carol Davis", module: "IT201", grade: 68, status: "Moderation" }
];

// Moderation requests
let moderationRequests = [
    { id: 1, module: "CS101", submittedBy: "Lecturer Jones", status: "Pending", school: "Technology" },
    { id: 2, module: "IT201", submittedBy: "Dr. Adams", status: "Approved", school: "Technology" }
];

// Student results (transcript) - for current student "demo"
const studentTranscript = {
    studentName: "John Doe",
    programme: "BSc Business and Information Technology",
    courses: [
        { year: 1, semester: 1, code: "CS101", title: "Intro to Computing", credits: 3, grade: "B", points: 3.0 },
        { year: 1, semester: 1, code: "MATH101", title: "Discrete Math", credits: 4, grade: "A", points: 4.0 },
        { year: 1, semester: 2, code: "CS102", title: "Programming", credits: 4, grade: "B+", points: 3.3 }
    ],
    gpa: 3.43
};

// Appeals list
let appealsList = [
    { id: 1, module: "CS101", reason: "Miscalculated total", status: "Pending", date: "2025-04-01" },
    { id: 2, module: "IT201", reason: "Missed submission due to illness", status: "Approved", date: "2025-03-15" }
];

// In-app notifications (mock)
let mockNotifications = [
    { id: 1, title: "Results published", message: "CS101 grades are available for viewing.", time: "2 hours ago", read: false, type: "info" },
    { id: 2, title: "Moderation required", message: "IT201 gradebook awaits school-level review.", time: "Yesterday", read: false, type: "warning" },
    { id: 3, title: "Deadline reminder", message: "Programming assignment closes in 3 days.", time: "Yesterday", read: true, type: "info" }
];

// Admin settings (mock)
let adminSettings = {
    academicYear: "2024/2025",
    gradingScheme: "Percentage (0-100)",
    users: [
        { name: "Dr. Smith", role: "School Super Admin", school: "Technology" },
        { name: "Prof. Lee", role: "Department Admin", department: "Physics & CS" }
    ]
};

// Helper function to get school by id
function getSchoolById(id) {
    return schoolsData.find((s) => s.id == id);
}
