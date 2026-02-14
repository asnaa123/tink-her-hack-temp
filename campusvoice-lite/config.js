/**
 * ============================================================
 * CAMPUSVOICE - SUPABASE CONFIGURATION
 * ============================================================
 * Supabase Client Initialization for Complaint Management
 * ============================================================
 */

// ============================================================
// SUPABASE CREDENTIALS
// ============================================================

const SUPABASE_CONFIG = {
    url: 'https://pbblscnyzfqshrqdzxkq.supabase.co',
    anonKey: 'sb_publishable_jGt1c4FKIZWPal_jp0e4eQ_07L6YizJ'
};

// ============================================================
// SUPABASE CLIENT INITIALIZATION
// ============================================================

/**
 * Initialize Supabase client
 * Uses the global supabase object from CDN
 * 
 * The Supabase JS library must be loaded via CDN first:
 * <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
 */

if (typeof window.supabaseClient === 'undefined') {
    window.supabaseClient = null;
}

// Wait for Supabase library to load
function initializeSupabaseClient() {
    if (typeof window.supabase === 'undefined') {
        console.error('❌ Supabase library not loaded. Make sure to include CDN script.');
        return null;
    }

    // Create Supabase client
    window.supabaseClient = window.supabase.createClient(
        SUPABASE_CONFIG.url,
        SUPABASE_CONFIG.anonKey
    );

    console.log('✅ Supabase client initialized successfully');
    return window.supabaseClient;
}

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            const client = initializeSupabaseClient();
            if (client) {
                window.submitComplaintToSupabase = submitComplaintToSupabase;
                window.fetchAllComplaints = fetchAllComplaints;
                window.updateComplaintStatus = updateComplaintStatus;
                window.deleteComplaint = deleteComplaint;
                console.log('✅ All Supabase functions registered globally');
            }
        }, 100);
    });
} else {
    // DOM already loaded
    setTimeout(() => {
        const client = initializeSupabaseClient();
        if (client) {
            window.submitComplaintToSupabase = submitComplaintToSupabase;
            window.fetchAllComplaints = fetchAllComplaints;
            window.updateComplaintStatus = updateComplaintStatus;
            window.deleteComplaint = deleteComplaint;
            console.log('✅ All Supabase functions registered globally');
        }
    }, 100);
}

// ============================================================
// COMPLAINT SUBMISSION FUNCTION
// ============================================================

/**
 * Submit complaint to Supabase
 * @param {Object} complaintData - Complaint object with fields: name, email, message, title, category, severity, location, is_anonymous, status
 * @returns {Promise<Object>} - Result object with success status and data/error
 */
async function submitComplaintToSupabase(complaintData) {
    try {
        // Check if Supabase is initialized
        if (!window.supabaseClient) {
            console.log('⏳ Supabase not yet initialized, initializing now...');
            window.supabaseClient = initializeSupabaseClient();
        }

        if (!window.supabaseClient) {
            throw new Error('Supabase client is not available');
        }

        // Validate required fields
        const requiredFields = ['name', 'email', 'title', 'message', 'category', 'severity'];
        for (const field of requiredFields) {
            if (!complaintData[field]) {
                throw new Error(`Missing required field: ${field}`);
            }
        }

        console.log('📤 Submitting complaint to Supabase:', complaintData);

        // Insert data into complaints table
        // Supabase will auto-generate: id (UUID), created_at, updated_at
        const { data, error } = await window.supabaseClient
            .from('complaints')
            .insert([complaintData])
            .select();

        if (error) {
            console.error('❌ Supabase Error:', error);
            return {
                success: false,
                error: error.message || 'Failed to submit complaint',
                details: error
            };
        }

        console.log('✅ Complaint submitted successfully:', data);
        console.log('✅ Complaint ID:', data[0]?.id);
        return {
            success: true,
            data: data,
            message: 'Complaint submitted successfully'
        };

    } catch (err) {
        console.error('❌ Submission Error:', err);
        return {
            success: false,
            error: err.message || 'An error occurred while submitting',
            details: err
        };
    }
}

// Make globally available
window.submitComplaintToSupabase = submitComplaintToSupabase;

// ============================================================
// UTILITY FUNCTIONS FOR COMPLAINT MANAGEMENT
// ============================================================

/**
 * Fetch all complaints (for testing)
 */
async function fetchAllComplaints() {
    try {
        if (!window.supabaseClient) return null;

        const { data, error } = await window.supabaseClient
            .from('complaints')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        console.log('✅ Fetched complaints:', data);
        return data;

    } catch (err) {
        console.error('❌ Error fetching complaints:', err);
        return null;
    }
}

// Make globally available
window.fetchAllComplaints = fetchAllComplaints;

/**
 * Update complaint status
 */
async function updateComplaintStatus(complaintId, status) {
    try {
        if (!window.supabaseClient) return null;

        const { data, error } = await window.supabaseClient
            .from('complaints')
            .update({ status: status })
            .eq('id', complaintId)
            .select();

        if (error) throw error;
        console.log('✅ Status updated:', data);
        return data;

    } catch (err) {
        console.error('❌ Error updating status:', err);
        return null;
    }
}

// Make globally available
window.updateComplaintStatus = updateComplaintStatus;

/**
 * Delete complaint (for testing)
 */
async function deleteComplaint(complaintId) {
    try {
        if (!window.supabaseClient) return null;

        const { error } = await window.supabaseClient
            .from('complaints')
            .delete()
            .eq('id', complaintId);

        if (error) throw error;
        console.log('✅ Complaint deleted');
        return true;

    } catch (err) {
        console.error('❌ Error deleting complaint:', err);
        return false;
    }
}

// Make globally available
window.deleteComplaint = deleteComplaint;

// ============================================================
// HELPER FUNCTION TO FORMAT COMPLAINT ID
// ============================================================

/**
 * Format complaint response for display
 */
function formatComplaintId(id) {
    if (!id) return 'CV-' + Date.now();
    // UUID format or custom format
    return id.substring(0, 8).toUpperCase();
}

// Make globally available
window.formatComplaintId = formatComplaintId;

/**
 * Display complaint success with ID
 */
function showComplaintSuccess(result) {
    if (result.success && result.data && result.data[0]) {
        const complaintId = result.data[0].id;
        console.log('✅ New complaint ID:', complaintId);
        return {
            success: true,
            id: complaintId,
            message: `Complaint submitted successfully!\n\nReference ID: ${formatComplaintId(complaintId)}`
        };
    }
    return {
        success: false,
        message: 'Complaint submitted but could not retrieve ID'
    };
}

// Make globally available
window.showComplaintSuccess = showComplaintSuccess;

// ============================================================

/**
 * 🛡️ IMPORTANT: TABLE SETUP INSTRUCTIONS
 * ════════════════════════════════════════════════════════════════
 * 
 * Follow these steps to create the complaints table in Supabase:
 * 
 * STEP 1: Go to Supabase Dashboard
 * ├─ Visit: https://app.supabase.com
 * ├─ Select your project
 * └─ Go to: SQL Editor (left sidebar)
 * 
 * STEP 2: Create New Query
 * ├─ Click: "New Query"
 * └─ Clear the template
 * 
 * STEP 3: Copy ALL the SQL code below
 * STEP 4: Paste into the SQL editor
 * STEP 5: Click "Run" button
 * STEP 6: Done! Table is created
 * 
 * ════════════════════════════════════════════════════════════════
 * 
 * 📋 SQL QUERY TO CREATE COMPLAINTS TABLE:
 * ════════════════════════════════════════════════════════════════
 * 
   -- Create complaints table
   CREATE TABLE IF NOT EXISTS complaints (
       id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
       name VARCHAR(255) NOT NULL DEFAULT 'Anonymous',
       email VARCHAR(255) NOT NULL,
       message TEXT NOT NULL,
       title VARCHAR(255),
       category VARCHAR(50),
       severity VARCHAR(20),
       location VARCHAR(255),
       is_anonymous BOOLEAN DEFAULT FALSE,
       status VARCHAR(50) DEFAULT 'reported',
       created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
       updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
   );

   -- Enable Row Level Security (optional - for testing it's disabled)
   -- ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;

   -- Create public access policy (for testing without auth)
   -- Allow anyone to view complaints
   CREATE POLICY IF NOT EXISTS "Allow public read"
       ON complaints
       FOR SELECT
       USING (true);

   -- Allow anyone to insert complaints
   CREATE POLICY IF NOT EXISTS "Allow public insert"
       ON complaints
       FOR INSERT
       WITH CHECK (true);

   -- Allow updating own complaints
   CREATE POLICY IF NOT EXISTS "Allow update own"
       ON complaints
       FOR UPDATE
       USING (true);

   -- Create index for faster lookups
   CREATE INDEX IF NOT EXISTS idx_complaints_email ON complaints(email);
   CREATE INDEX IF NOT EXISTS idx_complaints_category ON complaints(category);
   CREATE INDEX IF NOT EXISTS idx_complaints_created_at ON complaints(created_at);

 * ════════════════════════════════════════════════════════════════
 * 
 * ✅ VERIFICATION:
 * After running the SQL:
 * 1. Go to "Table Editor" in left sidebar
 * 2. You should see "complaints" table listed
 * 3. Click on it to verify columns are created
 * 4. Now your app can submit complaints!
 * 
 * 🔍 TROUBLESHOOTING:
 * If you see an error "relation does not exist":
 * ├─ Make sure you ran the SQL_QUERY above
 * ├─ Check spelling of table name (should be "complaints")
 * └─ Try in a private/incognito browser window
 * 
 * 📝 TABLE STRUCTURE:
 * ├─ id: Auto-generated unique ID
 * ├─ name: Submitter name (or 'Anonymous')
 * ├─ email: Submitter email
 * ├─ message: Main complaint details
 * ├─ title: Short complaint title
 * ├─ category: Type of complaint (bullying, water, hostel, etc.)
 * ├─ severity: Priority level (low, medium, high, critical)
 * ├─ location: Where the issue occurred
 * ├─ is_anonymous: Whether posted anonymously
 * ├─ status: Current status (reported, under-review, resolved)
 * ├─ created_at: Submission timestamp (auto)
 * └─ updated_at: Last update timestamp (auto)
 * 
 * ════════════════════════════════════════════════════════════════
 */
// const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
// export { supabase };



// ============================================================
// IMPORTANT NOTES FOR BEGINNERS
// ============================================================

/**
 * WHY SEPARATE CONFIG FILE?
 * 
 * ❌ WRONG APPROACH:
 * - Put API keys directly in app.js
 * - Have to edit main code
 * - Easy to accidentally commit to GitHub
 * - If key changes, edit multiple files
 * 
 * ✅ RIGHT APPROACH:
 * - Separate config.js for credentials
 * - One place to manage secrets
 * - Easy to add to .gitignore
 * - Import in app.js (one line)
 * - Professional structure
 * 
 * ============================================================
 */

/**
 * WHAT IS AN API KEY?
 * 
 * API Key = Password to your database
 * 
 * ANALOGY:
 * - Your house = Supabase server
 * - Your lock = Database authentication
 * - Your key = API key
 * 
 * SECURITY:
 * - Don't share your key (like don't share house key)
 * - Don't put in public code (like GitHub)
 * - If leaked: Regenerate (get new key)
 * - Can restrict key permissions (anon key = limited access)
 * 
 * TWO TYPES OF KEYS:
 * 
 * 1. ANON_KEY (Anonymous/Public Key)
 *    - Limited access (most things blocked)
 *    - Safe to share in client-side code
 *    - Frontend uses this
 *    - Use: const supabase = createClient(URL, ANON_KEY)
 * 
 * 2. SERVICE_KEY (Secret/Protected Key)
 *    - Full access (everything allowed)
 *    - NEVER use in frontend code
 *    - Only use in backend/server
 *    - Anyone with this can delete database!
 * 
 * FOR THIS PROJECT:
 * - Use ANON_KEY in frontend (safe)
 * - Setup server permissions in Supabase dashboard
 * - Restrict what users can do
 * 
 * ============================================================
 */


// ============================================================
// SUPABASE DATABASE TABLE SQL
// ============================================================

/**
 * Copy this SQL code into Supabase SQL Editor when you're ready
 * 
 * This creates the table to store complaints
 * 
 * COPY-PASTE INTO SUPABASE SQL EDITOR:
 * ════════════════════════════════════════════════════════════════
 * 
 * CREATE TABLE IF NOT EXISTS complaints (
 *     id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
 *     name VARCHAR(255) NOT NULL,
 *     email VARCHAR(255) NOT NULL,
 *     category VARCHAR(50) NOT NULL,
 *     severity VARCHAR(20) NOT NULL,
 *     title VARCHAR(255) NOT NULL,
 *     description TEXT NOT NULL,
 *     location VARCHAR(255),
 *     is_anonymous BOOLEAN NOT NULL DEFAULT false,
 *     created_at TIMESTAMP NOT NULL DEFAULT NOW(),
 *     updated_at TIMESTAMP NOT NULL DEFAULT NOW()
 * );
 * 
 * -- Enable Row Level Security
 * ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
 * 
 * -- Allow anyone to select complaints
 * CREATE POLICY "Allow public read" ON complaints 
 *     FOR SELECT USING (true);
 * 
 * -- Allow anyone to insert complaints
 * CREATE POLICY "Allow public insert" ON complaints 
 *     FOR INSERT WITH CHECK (true);
 * 
 * -- Allow anyone to delete their own complaints
 * CREATE POLICY "Allow delete own" ON complaints 
 *     FOR DELETE USING (true);
 * 
 * ════════════════════════════════════════════════════════════════
 * 
 * EXPLANATION OF TABLE STRUCTURE:
 * 
 * id:         Unique number (auto-generated by Supabase)
 * name:       Student name (can be "Anonymous")
 * email:      Student email
 * category:   Type (bullying, water, hostel, etc.)
 * severity:   Level (low, medium, high, critical)
 * title:      Short complaint title
 * description: Full complaint details
 * location:   Where issue happened
 * is_anonymous: Was posted anonymously? (true/false)
 * created_at: When created (auto)
 * updated_at: When updated (auto)
 * 
 * ════════════════════════════════════════════════════════════════
 */


// ============================================================
// ENVIRONMENT VARIABLES (Advanced)
// ============================================================

/**
 * FOR PRODUCTION/DEPLOYMENT (Advanced topic):
 * 
 * Never hardcode credentials! Use .env file instead
 * 
 * Create .env file:
 * ────────────────────────────────────
 * VITE_SUPABASE_URL=https://your.supabase.co
 * VITE_SUPABASE_KEY=your-key-here
 * ────────────────────────────────────
 * 
 * In config.js:
 * ────────────────────────────────────
 * const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
 * const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY;
 * ────────────────────────────────────
 * 
 * Add to .gitignore:
 * ────────────────────────────────────
 * .env
 * .env.local
 * ────────────────────────────────────
 * 
 * Now deployed safely (keys never in GitHub!)
 * 
 * This is beyond scope of this tutorial but good to know!
 * 
 * ============================================================
 */


// ============================================================
// CHECKLIST: BEFORE DEPLOYING
// ============================================================

/**
 * Before putting app on web:
 * 
 * ☐ Test form submission (works?)
 * ☐ Test data saves to Supabase (check dashboard)
 * ☐ Test filtering/search (works?)
 * ☐ Test view details modal (works?)
 * ☐ Test delete (works?)
 * ☐ Test on phone (responsive?)
 * ☐ Setup .gitignore (config.js protected?)
 * ☐ Setup Supabase RLS policies (security)
 * ☐ Add email validation (real emails only)
 * ☐ Add spam protection (CAPTCHA?)
 * ☐ Add moderation system (review complaints?)
 * ☐ Test error handling (what if network fails?)
 * ☐ Check performance (page load time)
 * ☐ Check accessibility (works with screen readers)
 * ☐ Test across browsers (Chrome, Firefox, Safari)
 * 
 * Many of these are advanced topics!
 * Focus on getting basics working first.
 * 
 * ============================================================
 */


// ============================================================
// COMMON BEGINNER MISTAKES
// ============================================================

/**
 * ❌ MISTAKE 1: Hardcoding secrets in public code
 * Problem: Anyone can see your API key in GitHub
 * Solution: Use .env file, never commit it
 * 
 * ❌ MISTAKE 2: Mixing frontend & backend code
 * Problem: Hard to understand, security issues
 * Solution: Backend = server, Frontend = browser (separate)
 * 
 * ❌ MISTAKE 3: No error handling for API calls
 * Problem: App breaks if internet fails
 * Solution: Use try/catch, tell user about errors
 * 
 * ❌ MISTAKE 4: Exposing service key in frontend
 * Problem: Anyone can delete/modify database
 * Solution: Only use anon key in frontend
 * 
 * ❌ MISTAKE 5: No validation before saving
 * Problem: Junk data fills database
 * Solution: Validate on frontend AND backend
 * 
 * ============================================================
 */


// ============================================================
// NEXT STEPS
// ============================================================

/**
 * 1. ✓ You have working app with localStorage
 * 2. → Test everything works
 * 3. → Create Supabase account
 * 4. → Get credentials and paste here
 * 5. → Uncomment Supabase code above
 * 6. → Update app.js TODO sections
 * 7. → Replace localStorage with Supabase calls
 * 8. → Test with Supabase
 * 9. → Deploy to web!
 * 10. → Add more features (ratings, replies, etc.)
 * 
 * Learning path:
 * Beginner → (You are here) Frontend only
 *   ↓
 * Intermediate → Add backend (Supabase)
 *   ↓
 * Advanced → Custom backend (Node.js, Python)
 *   ↓
 * Expert → Scale to millions, DevOps, etc.
 * 
 * ============================================================
 */

console.log('✓ config.js loaded (ready for Supabase credentials)');