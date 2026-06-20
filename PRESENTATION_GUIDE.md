# SmartCampus Presentation Guide

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Lecturer | jones@smartcampus.edu | 1234567890 |
| Department Admin | lee@smartcampus.edu | 1234567890 |
| School Super Admin | smith@smartcampus.edu | 1234567890 |
| University Super Admin | admin@smartcampus.edu | Admin@12345 |

## System URLs
- **Frontend**: http://localhost:3000
- **Login Page**: http://localhost:3000/login.html
- **Backend API**: http://localhost:8080

## Demo Flow 1: Lecturer Grade Entry (5 min)

1. **Login as Lecturer Jones**: `jones@smartcampus.edu` / `1234567890`
2. **Dashboard**: Shows 8 total grades, 3 drafts, 2 submitted, 4 unique courses, 6 unique students, 81.25% avg
3. **My Courses section**: Shows 7 assigned courses (CS101, CS102, CS201, CS202, CS302, IT201, CS401)
4. **Recent Activity**: Shows last 5 grade changes
5. **Quick Actions**: Click "Grade Sheet"
6. **Grade Sheet** (`lecturers/grade-sheet.html`):
   - Select Programme: Computer Science
   - Select Course: CS101 - Introduction to Computing
   - Year: All Years / Semester: Semester One / Academic Year: 2025/2026
   - Click "Load Sheet"
   - Shows 4 students with existing grades (A=80, A=91, B=75, A=97)
   - Modify a score (e.g., change a student's CA from 20 to 25)
   - See auto-computed Total and Grade
   - Click "Save All Grades"
   - Grades saved with recalculated letter grade and GPA
7. Click "Submit for Approval" to move grades from Draft → Submitted to Department

## Demo Flow 2: Approval Chain (5 min)

1. **Dept Admin** (`lee@smartcampus.edu` / `1234567890`):
   - Dashboard shows approval queue
   - Navigate to grade approval section
   - View submitted grades for department
   - Approve → status becomes "Approved by Department"
   
2. **School Super Admin** (`smith@smartcampus.edu` / `1234567890`):
   - View grades approved by department
   - Approve → status becomes "Approved by School" / "Approved by University"
   
3. **University Super Admin** (`admin@smartcampus.edu` / `Admin@12345`):
   - Final approval / Publish grades
   - Status becomes "Published"

## Demo Flow 3: My Students (2 min)

1. Login as Lecturer Jones
2. Dashboard → "My Students" quick action
3. Select Programme: Computer Science, Course: CS101, Year: Year 1
4. Shows enrolled students with registration numbers

## Demo Flow 4: Gradebook Browse (2 min)

1. Login as any role
2. Navigate to Gradebook → Browse Grades
3. Select School → Department → Programme → Year → Semester
4. View grade records with letter grades and GPA (5.0 scale)

## Pre-loaded Demo Data

| Student | Course | Score | Grade | GPA | Status |
|---------|--------|-------|-------|-----|--------|
| Test Student 2 | CS101 | 80 | A | 5.0 | Draft |
| Test Student | CS101 | 91 | A | 5.0 | Draft |
| Alice Student Updated | CS101 | 75 | B | 4.0 | Draft |
| Alice Kamara | CS201 | 85 | A | 5.0 | Submitted to Department |
| Test Frontend Updated | CS201 | 74 | B | 4.0 | Submitted to Department |
| Alice Kamara | IT201 | 58 | D | 2.0 | Approved by Department |
| Alice Kamara | CS202 | 98 | A | 5.0 | Approved by University |
| Test | CS101 | 97 | A | 5.0 | Published |

## Grading Scale (5.0)

| Letter | Range | GPA | Remarks |
|--------|-------|-----|---------|
| A | ≥ 80 | 5.0 | Excellent |
| B | ≥ 70 | 4.0 | Very Good |
| C | ≥ 60 | 3.0 | Good |
| D | ≥ 50 | 2.0 | Average |
| E | ≥ 40 | 1.0 | Below Average |
| F | < 40 | 0.0 | Fail |

## Troubleshooting

- **Backend not starting**: Check port 8080 is free; run `netstat -ano | findstr :8080`
- **Frontend blank**: Ensure backend is running; check browser console for CORS errors
- **Login fails**: Verify credentials above; password must be ≥8 chars with upper, lower, digit, special
- **No students in grade sheet**: Check programme matches student programmeId (1 = Computer Science)
- **Course dropdown empty**: Lecturer must have assignedCourses; check `/api/lecturers/{id}` returns them
