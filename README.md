<p align="center">
  <img src="./img.png" alt="Project Banner" width="100%">
</p>

# CampusvoiceLite 🎯

## Basic Details

### Team Name: Asnnah

### Team Members
- Member 1: Asna A - Jyothi Engineering College
- Member 2: Hannah Margret M S - Jyothi Engineering College

### Hosted Project Link
[mention your project hosted link here]

### Project Description


### The Problem statement
The Problem statement
On many campuses, reporting issues like harassment, hostel maintenance, or academic grievances involves tedious paperwork, long wait times, and a lack of transparency. Students often feel their "voice" is lost in administrative loops, and there is no clear way to track if a complaint is actually being resolved.

### The Solution
The Solution
CampusVoice is a digital Single Page Application (SPA) that centralizes student grievances. It provides a secure, tiered reporting system where students can file complaints under specific categories (Hostel, Academic, etc.) with priority levels. The system provides a unique Reference ID for every report, allowing students to track the status from "Reported" to "Resolved" in real-time.

---

## Technical Details

### Technologies/Components Used

For Software:

Languages used: HTML5, CSS3, JavaScript (ES6+)

Frameworks used: Single Page Application (SPA) Architecture (Vanilla JS)

Libraries used: Font-Awesome (Icons), Supabase (Backend/Auth)

Tools used: VS Code, Git, Supabase Dashboardal specifications]

---

## Features

List the key features of your project:
- Feature 1: Secure Registration/Login: A dedicated gateway for students to create accounts using college credentials.
- Feature 2: Categorized Reporting: Intuitive icon-based selection for issue types (Harassment, Water, Hostel, Academic).
- Feature 3: Priority Management: Ability to flag issues as Low, Medium, or High to assist administration in triaging.
- Feature 4: Real-time Progress Tracker: A visual progress bar that updates as the administration reviews and resolves the ticket.

---

## Implementation

### For Software:

#### Installation
```bash
# Clone the repository
git clone https://github.com/yourusername/campusvoice.git

# No heavy dependencies required for the frontend
# Just ensure you have your Supabase keys in supabaseClient.js
```

#### Run
```bash
# Open index.html in any modern browser
# Or use VS Code Live Server
```

### For Hardware:

#### Components Required
[List all components needed with specifications]

#### Circuit Setup
[Explain how to set up the circuit]

---

## Project Documentation

### For Software:

#### Screenshots (Add at least 3)

<img width="585" height="883" alt="image" src="https://github.com/user-attachments/assets/394a2f8e-ea5d-4d03-ad47-9fdbcb2e37cf" />
Shows the initial registration form with validation for Student ID and Password.

<img width="728" height="652" alt="image" src="https://github.com/user-attachments/assets/0c05f866-3b76-4b99-b608-3b75339075c4" />
The landing page after login where users can start a new complaint or view existing ones.

<img width="544" height="791" alt="image" src="https://github.com/user-attachments/assets/58299b00-92f0-41bc-96ab-813fa5fbc4be" />
The core reporting interface showing the category selection and priority toggle.

#### Diagrams

**System Architecture:**

![Architecture Diagram](docs/architecture.png)
*Explain your system architecture - components, data flow, tech stack interaction*

**Application Workflow:**

User registers → Logs in → Selects Category/Priority → Writes Description → Receives Reference ID.
---


---

## Additional Documentation

### For Web Projects with Backend:

#### API Documentation

**Base URL:**(https://pbblscnyzfqshrqdzxkq.supabase.co)`
  API KEY :  'sb_publishable_jGt1c4FKIZWPal_jp0e4eQ_07L6YizJ' 

##### Endpoints

**GET /api/endpoint**
- **Description:** [What it does]
- **Parameters:**
  - `param1` (string): [Description]
  - `param2` (integer): [Description]
- **Response:**
```json
{
  "status": "success",
  "data": {}
}
```

**POST /api/endpoint**
- **Description:** [What it does]
- **Request Body:**
```json
{
  "field1": "value1",
  "field2": "value2"
}
```
- **Response:**
```json
{
  "status": "success",
  "message": "Operation completed"
}
```

[Add more endpoints as needed...]

---

### For Mobile Apps:

#### App Flow Diagram

![App Flow](docs/app-flow.png)
*Explain the user flow through your application*

#### Installation Guide

**For Android (APK):**
1. Download the APK from [Release Link]
2. Enable "Install from Unknown Sources" in your device settings:
   - Go to Settings > Security
   - Enable "Unknown Sources"
3. Open the downloaded APK file
4. Follow the installation prompts
5. Open the app and enjoy!

**For iOS (IPA) - TestFlight:**
1. Download TestFlight from the App Store
2. Open this TestFlight link: [Your TestFlight Link]
3. Click "Install" or "Accept"
4. Wait for the app to install
5. Open the app from your home screen

**Building from Source:**
```bash
# For Android
flutter build apk
# or
./gradlew assembleDebug

# For iOS
flutter build ios
# or
xcodebuild -workspace App.xcworkspace -scheme App -configuration Debug
``



### For Scripts/CLI Tools:

#### Command Reference

**Basic Usage:**
```bash
python script.py [options] [arguments]
```

**Available Commands:**
- `command1 [args]` - Description of what command1 does
- `command2 [args]` - Description of what command2 does
- `command3 [args]` - Description of what command3 does

**Options:**
- `-h, --help` - Show help message and exit
- `-v, --verbose` - Enable verbose output
- `-o, --output FILE` - Specify output file path
- `-c, --config FILE` - Specify configuration file
- `--version` - Show version information

**Examples:**

```bash
# Example 1: Basic usage
python script.py input.txt

# Example 2: With verbose output
python script.py -v input.txt

# Example 3: Specify output file
python script.py -o output.txt input.txt

# Example 4: Using configuration
python script.py -c config.json --verbose input.txt
```

#### Demo Output

**Example 1: Basic Processing**

**Input:**
```
This is a sample input file
with multiple lines of text
for demonstration purposes
```

**Command:**
```bash
python script.py sample.txt
```

**Output:**
```
Processing: sample.txt
Lines processed: 3
Characters counted: 86
Status: Success
Output saved to: output.txt
```

**Example 2: Advanced Usage**

**Input:**
```json
{
  "name": "test",
  "value": 123
}
```

**Command:**
```bash
python script.py -v --format json data.json
```

**Output:**
```
[VERBOSE] Loading configuration...
[VERBOSE] Parsing JSON input...
[VERBOSE] Processing data...
{
  "status": "success",
  "processed": true,
  "result": {
    "name": "test",
    "value": 123,
    "timestamp": "2024-02-07T10:30:00"
  }
}
[VERBOSE] Operation completed in 0.23s
```

---

## Project Demo

### Video
[Add your demo video link here - YouTube, Google Drive, etc.]

*Explain what the video demonstrates - key features, user flow, technical highlights*

### Additional Demos
[Add any extra demo materials/links - Live site, APK download, online demo, etc.]

---

## AI Tools Used (Optional - For Transparency Bonus)

If you used AI tools during development, document them here for transparency:

Tool Used: Gemini, ChatGPT

Purpose: - Generating boilerplate SPA navigation logic (handling page transitions).

Debugging CSS flexbox layouts for the category grid.

Structuring the project documentation.

Percentage of AI-generated code: 30%

Human Contributions:

UI/UX Design decisions (choosing icons and color palette).

Integrating the Supabase client logic.

Designing the multi-step form flow.
*Note: Proper documentation of AI usage demonstrates transparency and earns bonus points in evaluation!*

---

## Team Contributions

- Asna A:Frontend development (HTML/CSS) and UI Design.
- Hannah Margret M S:Backend integration (Supabase) and Auth logic.

---

## License

This project is licensed under the [LICENSE_NAME] License - see the [LICENSE](LICENSE) file for details.

**Common License Options:**
- MIT License (Permissive, widely used)
- Apache 2.0 (Permissive with patent grant)
- GPL v3 (Copyleft, requires derivative works to be open source)

---

Made with ❤️ at TinkerHub
