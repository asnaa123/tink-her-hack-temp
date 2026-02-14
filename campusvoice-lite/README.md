# CampusVoice - Student Complaint Platform

A modern web application for college students to post and track complaints about campus issues including bullying, water problems, hostel facilities, and personal concerns.

## Features

✅ **Complete Frontend Implementation**
- Responsive HTML5 structure
- Modern gradient UI with CSS3
- Form validation and error handling
- Local storage for persistence (before Supabase integration)
- Real-time filtering and search
- Modal view for complaint details
- Severity badges and category icons

### Core Functionality
- **Post Complaints**: Submit detailed complaints with categories, severity levels, and optional anonymity
- **View Complaints**: Browse all submitted complaints with filtering and search
- **Categorization**: Organized by Bullying, Water Issues, Hostel, Personal, Academic, Infrastructure, and Other
- **Severity Levels**: Low, Medium, High, Critical
- **Search & Filter**: Real-time filtering by keyword, category, and severity
- **Anonymous Posting**: Option to post anonymously
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile

## Project Structure

```
campusvoice-lite/
├── index.html      # Main HTML structure
├── styles.css      # Complete styling system
├── main.js         # Application logic and storage
├── firebase.js     # (To be configured with Supabase)
└── README.md       # This file
```

## How to Run

### Option 1: Using VS Code Live Server (Recommended for Development)
1. Install the "Live Server" extension in VS Code
2. Right-click on `index.html` and select "Open with Live Server"
3. The application will open at `http://localhost:5500`

### Option 2: Using Python
```bash
cd campusvoice-lite
python -m http.server 8000
```
Then visit: `http://localhost:8000`

### Option 3: Using Node.js (http-server)
```bash
cd campusvoice-lite
npx http-server -p 8000
```
Then visit: `http://localhost:8000`

### Option 4: Using Node.js (Express - if needed)
```bash
npm init -y
npm install express
# Create a server.js file and run it
```

### Option 5: Direct File Opening
For simple testing, you can also directly open `index.html` in your browser:
- Windows: Double-click the file or use `start index.html` in PowerShell
- Mac: Use `open index.html` in Terminal

## Current State

### ✅ What's Implemented
1. **HTML** - Complete form and complaint display structure
2. **CSS** - Professional styling with:
   - Gradient color scheme (Indigo & Pink)
   - Responsive grid layout
   - Card-based design
   - Modal popups
   - Badge system for categories and severity
   - Mobile-first responsive design

3. **JavaScript** - Full functionality:
   - Form submission with validation
   - LocalStorage for data persistence
   - Real-time search and filtering
   - Modal viewer for detailed complaints
   - Delete functionality
   - Sample data loader (optional)

## Data Structure

Each complaint object contains:
```javascript
{
  id: timestamp,
  name: "Student Name",
  email: "student@college.edu",
  category: "bullying|water|hostel|personal|academic|infrastructure|other",
  severity: "low|medium|high|critical",
  title: "Complaint Title",
  description: "Detailed description",
  location: "Location if applicable",
  isAnonymous: boolean,
  timestamp: "Human readable date",
  date: "ISO date string"
}
```

## Next Steps: Supabase Integration

To integrate with Supabase as backend:

1. **Create a Supabase Project**
   ```
   - Go to https://supabase.com
   - Create a new project
   - Get your API URL and API Key
   ```

2. **Create Database Table**
   ```sql
   CREATE TABLE complaints (
     id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
     name VARCHAR(255),
     email VARCHAR(255),
     category VARCHAR(50),
     severity VARCHAR(20),
     title VARCHAR(255),
     description TEXT,
     location VARCHAR(255),
     is_anonymous BOOLEAN,
     created_at TIMESTAMP DEFAULT NOW(),
     updated_at TIMESTAMP DEFAULT NOW()
   );
   ```

3. **Update main.js** to use Supabase client:
   ```javascript
   // Install Supabase client
   // npm install @supabase/supabase-js
   
   import { createClient } from '@supabase/supabase-js'
   
   const supabase = createClient(
     'YOUR_SUPABASE_URL',
     'YOUR_SUPABASE_ANON_KEY'
   )
   ```

4. **Replace localStorage calls** with Supabase API calls for:
   - `saveComplaintToStorage()` → `supabase.from('complaints').insert()`
   - `getComplaintsFromStorage()` → `supabase.from('complaints').select()`
   - `deleteComplaintFromStorage()` → `supabase.from('complaints').delete()`

## Usage Examples

### Submitting a Complaint
1. Click "Post a Complaint" button
2. Fill in your name and email
3. Select a category and severity
4. Provide a title and detailed description
5. (Optional) Add location and checkbox for anonymous posting
6. Accept terms and submit

### Filtering Complaints
1. Use the search bar to find keywords
2. Select category filter
3. Select severity level filter
4. Click "Reset Filters" to clear all filters

### Viewing Details
- Click "View Details" on any complaint card to see full information
- Delete button available in modal (with confirmation)

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome Android)

## Styling Features

- **Color Scheme**: Professional gradient (Indigo #6366f1 to Pink #ec4899)
- **Typography**: Modern sans-serif with clear hierarchy
- **Spacing**: 8px-based scale for consistency
- **Shadows**: Subtle elevation shadows for depth
- **Animations**: Smooth transitions and hover effects
- **Accessibility**: Good contrast ratios, semantic HTML

## Local Data Storage

Currently, all complaints are stored in the browser's LocalStorage:
- Data persists across sessions
- No internet connection required for basic functionality
- Data is cleared only when cache is cleared
- **Note**: Data is not shared across browsers/devices

## Customization

You can easily customize:
- Colors: Edit CSS root variables in `styles.css` (lines 1-13)
- Complaint categories: Modify options in `index.html` select element
- Severity levels: Edit severity options
- Page title and branding: Update in HTML header

## Security Notes

- Client-side validation is implemented, but server-side validation is required for production
- When integrated with Supabase, implement proper authentication
- Consider rate limiting to prevent spam
- Add CAPTCHA for anonymous submissions
- Implement moderation/review workflow

## Troubleshooting

**Issue**: Complaints not saving
- **Solution**: Check browser's LocalStorage is enabled (not in private mode)

**Issue**: Form validation errors
- **Solution**: Ensure all required fields are filled correctly (valid email format)

**Issue**: Styling looks broken
- **Solution**: Clear browser cache and refresh, or open in incognito mode

## Support & Feedback

For issues or feature requests, contact the development team.

---

**Version**: 1.0.0  
**Last Updated**: February 13, 2026  
**Status**: Ready for Supabase integration
