# ELIMU PRO — Smart School Management System
> Modern, secure, and production-grade school management platform for Tanzanian secondary schools (O-Level Form I–IV & A-Level Form V–VI).

---

## 🌟 Concept Creator & Software Architect
- **Name:** Mimi_SEVELINA DEUS
- **Description:** Software student at **MUST** (Mbeya University of Science and Technology), studying Computer Science.
- **Location:** Ukerewe District, Mwanza Region, Tanzania.
- **Mission:** Streamlining Tanzanian school administration, eliminating paper duplication, safeguarding academic records under the *Tanzania Personal Data Protection Act, 2022*, and ensuring transparent guardian-teacher communication.

---

## 🏛️ Platform Architecture & Features

### 1. Tanzanian Curriculum & Combinations (Section 9 & 10)
- **O-Level (Form I – IV):** Core subjects (Basic Mathematics, Physics, Chemistry, Biology, Kiswahili, English, Geography, History, Civics).
- **A-Level (Form V – VI):** Full combination mapping:
  - `PCM` (Physics, Chemistry, Advanced Mathematics)
  - `PCB` (Physics, Chemistry, Biology)
  - `HGL` (History, Geography, English Language)
  - `EGM` (Economics, Geography, Advanced Mathematics)
  - `CBG` (Chemistry, Biology, Geography)
  - Plus compulsory `General Studies (GS)` and `BAM` where configured.
- **A-Level Combination Change Workflow (Section 10):** Audited student transition wizard that migrates subject enrolment without deleting previous marks or compromising historical broadsheets.

### 2. Tanzania-Aligned Grading Engine (Section 17)
- **Configurable Standard O-Level:**
  - `A`: 75% – 100% (1 Point)
  - `B`: 65% – 74% (2 Points)
  - `C`: 45% – 64% (3 Points)
  - `D`: 30% – 44% (4 Points)
  - `F`: 0% – 29% (5 Points)
  - **Division Calculation:** Best 7 subjects points sum:
    - Division I: 7 – 17 pts
    - Division II: 18 – 21 pts
    - Division III: 22 – 25 pts
    - Division IV: 26 – 33 pts
    - Division 0: 34 – 35 pts
- **Standard A-Level:** Principal passes calculation across 3 principal subjects (`A`=1, `B`=2, `C`=3, `D`=4, `E`=5, `S`=6, `F`=7).
- Absent students marked explicitly as `ABS` (never silently converted to 0).

### 3. Multi-Stage Academic Approval & Publishing Lifecycle (Section 16)
- **Workflow:** `Draft` ➔ `Teacher Submitted` ➔ `Academic Review` ➔ `Approved` ➔ `Published` ➔ `Locked`
- **Result Privacy Guarantee:** Unapproved or draft marks are strictly hidden from students and parents. Only officially published results appear on student portals and parent report cards.

### 4. Role-Based Access Control (RBAC) (Section 6)
10 dedicated roles with realistic permission matrices:
- **SUPER_ADMIN**: Global system configuration & multi-school management
- **SCHOOL_ADMIN**: Student registration, faculty management, audit logs
- **HEAD_TEACHER (Headmaster)**: School performance analytics, broadsheets, executive oversight
- **DEPUTY_HEAD**: Daily operational monitoring & discipline
- **ACADEMIC_MASTER**: Marks review, approval, publishing, and grading configuration
- **HEAD_OF_DEPARTMENT (HoD)**: Departmental curriculum coverage and teacher assignments
- **CLASS_TEACHER**: Assigned class roll-call attendance, comments, and absence alerts
- **SUBJECT_TEACHER**: Scoped mark entry with draft auto-save and submission
- **PARENT / GUARDIAN**: Access only verified linked children's published results & direct teacher messaging
- **STUDENT**: View personal published results, timetable, and announcements

### 5. Parent-Teacher Comms & Tanzanian SMS Gateway (Section 19 & 20)
- Moderated class forums and school-wide announcements
- **SMS Gateway Adapter:** Live simulation and API adapter for Tanzanian telcos (Vodacom, Tigo, Airtel, Halotel via Beem Africa / NextSMS)
- Bilingual Kiswahili and English SMS templates with delivery logs and cost accounting (25 TZS/sms).

### 6. Official Printable Reports (Section 18)
- NECTA-styled student report cards featuring school crest, registration number, motto, marks breakdown, division, class teacher & headmaster remarks, stamp block, and print media styling (`@media print`).
- Class academic broadsheets for end-of-term board reviews.

---

## 🧪 12 System Verification & Acceptance Tests (Section 30)
ELIMU PRO includes a live automated QA verification runner built into the UI:
1. **TEST 1:** Teacher Login & Scoped Permissions
2. **TEST 2:** Class Teacher Attendance Submission & Register Summary
3. **TEST 3:** Subject Teacher Mark Entry Bounds & Draft Integrity
4. **TEST 4:** Academic Master Multi-Stage Review, Return & Publishing
5. **TEST 5:** Result Privacy Barrier (Unpublished marks hidden from parents)
6. **TEST 6:** Guardian Access Linkage (Only verified children accessible)
7. **TEST 7:** Combination Change Preserving Historical Marks & Audit Trail
8. **TEST 8:** Least-Privilege Rejection of Unauthorized Actions
9. **TEST 9:** CSV Ingestion & Duplicate Admission Number Detection
10. **TEST 10:** Tanzanian SMS Phone (+255) Validation & Simulator Dispatch
11. **TEST 11:** Small Smartphone Viewport Touch Responsiveness
12. **TEST 12:** Multi-Tenant School Record Isolation (`S.4520`)

---

## 🚀 Running the Project

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Build for production
npm run build
```

---

## 🔒 Security & Privacy (PDP Act 2022)
- Comprehensive `firestore.rules` file with role checks preventing cross-family result snooping.
- Immutable `auditLogs` collection tracking all logins, approvals, mark submissions, and combination changes.
- Soft-deletion / archiving to preserve official academic integrity.
