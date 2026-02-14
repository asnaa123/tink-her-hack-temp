<p align="center">
  <img src="./img.png" alt="Project Banner" width="100%">
</p>

# CampusVoice🎯

## Basic Details

### Team Name: ASNNAH

### Team Members
- Member 1: Asna A - jyothi engineering college
- Member 2: Hannah Margret M S  - jyothi engineering college

### Hosted Project Link
https://classy-kangaroo-ef1214.netlify.app/

### Project Description
CampusVoice is a centralized web platform designed for students to report and track campus-related issues (maintenance, safety, or academic) in real-time. It bridges the communication gap between the student body and campus administration.
### The Problem statement
On many campuses, reporting issues like broken facilities or safety concerns is a slow, opaque process involving physical forms or ignored emails. Students often don't know if their complaint has been seen or if action is being taken.

### The Solution
We built a responsive web portal that allows students to submit categorized complaints with varying severity levels. By using Supabase as a backend, we provide an instant data flow where students can track the status of their reports from "Reported" to "Resolved" through a personal dashboard.

---

## Technical Details

### Technologies/Components Used

**For Software:**
Languages: HTML5, CSS3, JavaScript (ES6+)

Backend-as-a-Service: Supabase (PostgreSQL Database)

Icons/Styling: FontAwesome (for severity icons), Google Fonts

Tools: VS Code, Git
---

## Features

Anonymous Reporting: Students can toggle "Post as Anonymous" to report sensitive issues without revealing their identity.

Severity Classification: Users can tag issues as Low, Medium, or High to help administration prioritize tasks.

Live Status Tracking: A dedicated "My Complaints" section shows a progress bar for every submitted issue.

Direct Database Integration: Real-time data insertion into Supabase without needing a middle-tier server.
---

## Implementation
Supabase Table Setup (SQL)
To replicate the backend for this project, run the following in your Supabase SQL Editor:

SQL
CREATE TABLE complaints (
  id bigint generated always as identity primary key,
  created_at timestamp with time zone default now(),
  title text,
  category text,
  severity text,
  description text,
  location text,
  is_anonymous boolean default false
);

-- RLS Disabled for testing phase
ALTER TABLE complaints DISABLE ROW LEVEL SECURITY;
Frontend Integration (JavaScript)
Add the following to your script to connect the "Submit" button to your database:

JavaScript
const SUPABASE_URL = 'https://pbblscnyzfqshrqdzxkq.supabase.co';
const SUPABASE_KEY = 'sb_publishable_jGt1c4FKIZWPal_jp0e4eQ_07L6YizJ';
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const form = document.getElementById('complaint-form');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const { error } = await supabase
        .from('complaints')
        .insert([{
            title: document.getElementById('title').value,
            category: document.getElementById('category').value,
            severity: document.getElementById('severity').value,
            description: document.getElementById('description').value,
            location: document.getElementById('location').value,
            is_anonymous: document.getElementById('anonymous-toggle').checked
        }]);

    if (error) alert('Error: ' + error.message);
    else alert('Complaint Submitted!');
});

### For Software:

#### Installation
# Clone the repository
git clone https://github.com/your-repo/campusvoice.git

# Navigate to the project directory
cd campusvoice

# Open index.html in your preferred browser
# Or use a live server (if using VS Code)
code .

#### Run
# Since this is a frontend-driven application:
# Simply open index.html in a web browser.

## Project Documentation

### For Software:

#### Screenshots (Add at least 3)

<img width="840" height="928" alt="image" src="https://github.com/user-attachments/assets/53ab2d7c-84d5-46db-83dc-3a683e52378d" />
The Secure Login Gateway: Students can log in with their ID, create a new account, or choose the "Report Anonymously" path


<img width="1847" height="961" alt="image" src="https://github.com/user-attachments/assets/2946d68c-89e7-4afa-92a5-95aa6cc31269" />
Information Gathering: A clean, validated form to collect basic issue details and user contact info.

<img width="577" height="860" alt="image" src="https://github.com/user-attachments/assets/261650f4-c405-41de-820f-a9b5a269ba85" />
Category and Priority Selector: A grid-based UI allowing users to visually select the type of issue (Harassment, Water, Hostel, etc.) and its urgency.

#### Diagrams

**System Architecture:**

<img width="3000" height="2500" alt="image" src="https://github.com/user-attachments/assets/1850a608-70d7-4f1d-a3e3-58e78ea4931d" />
Frontend: Built using HTML5, CSS3 (Custom Variables/Animations), and Vanilla JavaScript.

State Management: Local JS objects manage multi-step form data before submission.

Security: Client-side validation for passwords (min-length) and required fields.

**Application Workflow:**
<img width="3999" height="2999" alt="image" src="https://github.com/user-attachments/assets/b0a791bb-3e17-4ac0-8059-71020065562f" />

Step 1: Authentication (Login/Register) or Anonymous bypass.

Step 2: Personal/Issue detail collection.

Step 3: Categorization and Priority assignment.

Step 4: Reference number generation and success tracking.

## Additional Documentation

### For Web Projects with Backend:

#### API Documentation

For Web Projects with Backend:
API Documentation (Proposed)
Base URL: https://api.campusvoice.edu

##### Endpoints

**GET /api/endpoint**
POST /api/complaints

Description: Submits a new student complaint.

Parameters:

studentId (string): Unique identifier.

category (string): harassment, water, hostel, etc.

priority (string): low, medium, high.

Response:

JSON
{
  "status": "success",
  "data": {
    "refNumber": "CV-2026-4829",
    "timestamp": "2026-02-14T09:30:00Z"
  }
}




#### Demo Output

**Example 1: Basic Processing**

**Input:**
Auth: Selects "Report Anonymously".

Details: Enters "Broken pipe in Block B" as the description.

Category: Selects Water (Category ID: 02).

Priority: Selects High.
```

**Command:**
// Internal state processing
{
  "user": "Anonymous",
  "issue": "Broken pipe in Block B",
  "category": "Water",
  "urgency": "High",
  "timestamp": "2026-02-14 09:45:00"
}

**Output:**
```
Success! Your voice has been heard.
Reference ID: CV-2026-8842
Status: Forwarded to Maintenance Department
Priority Level: High (Expected response within 24 hours)



## Project Demo

### Video
https://youtu.be/t9XEUYmgEvg

*this is how our website work.


---

## AI Tools Used (Optional - For Transparency Bonus)

Tools Used: Claude Haiku & Gemini

Purpose:

Claude Haiku: Primarily used for generating efficient, low-latency boilerplate code and debugging complex JavaScript functions. Its speed allowed for rapid iteration on the form logic.

Gemini: Used for architectural planning, refining the UI/UX copy, and generating the system architecture descriptions. Gemini also helped in cross-referencing documentation for the external libraries used.

Key Prompts Used:

"Optimize this JavaScript for minimum latency in a multi-step form using Claude Haiku."

"Help me design a user-friendly color palette for a college complaint portal that feels both professional and approachable."

"Write a detailed explanation for a system architecture involving a frontend-only state management system."

Percentage of AI-generated code: ~45%

**Human Contributions:**
Logical Flow: Defining the specific steps for the complaint submission process.

Category Design: Tailoring the complaint types (Water, Hostel, Harassment) to the actual needs of our campus.

Final Review: Ensuring all AI-generated code adhered to standard security practices and remained bug-free during manual testing.

---

## Team Contributions

Member 1: Lead Frontend Developer — Responsible for HTML/CSS architecture, custom animations, and UI components.

Member 2: Systems & Logic — Responsible for JavaScript functionality, form state management, and project documentation.

---

## License

Licensed under the MIT License. file for details.

**Common License Options:**
- MIT License (Permissive, widely used)
- Apache 2.0 (Permissive with patent grant)
- GPL v3 (Copyleft, requires derivative works to be open source)

---

Made with ❤️ at TinkerHub
