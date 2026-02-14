/**
 * ============================================================
 * CAMPUSVOICE - SUPABASE DATABASE SETUP & INTEGRATION
 * ============================================================
 * 
 * This file sets up Supabase client and provides functions
 * to save complaints and user data to the database.
 * 
 * YOUR CREDENTIALS (from config.js):
 * - SUPABASE_URL = 'https://pbblscnyzfqshrqdzxkq.supabase.co'
 * - SUPABASE_ANON_KEY = 'sb_publishable_jGt1c4FKIZWPal_jp0e4eQ_07L6YizJ'
 */

// ============================================================
// SUPABASE CLIENT INITIALIZATION
// ============================================================

const SUPABASE_URL = 'https://pbblscnyzfqshrqdzxkq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_jGt1c4FKIZWPal_jp0e4eQ_07L6YizJ';

// Initialize Supabase client
let supabase = null;
let supabaseReady = false;

// Function to initialize Supabase when library is available
function initializeSupabase() {
    if (window.supabase && window.supabase.createClient) {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        supabaseReady = true;
        console.log('✅ Supabase client initialized successfully');
        console.log('📍 Connected to:', SUPABASE_URL);
        exportFunctionsToWindow();
        return true;
    }
    return false;
}

// Wait for Supabase library to load from CDN
if (window.supabase && window.supabase.createClient) {
    initializeSupabase();
} else {
    // Try again after a short delay (CDN might still be loading)
    console.log('⏳ Waiting for Supabase library to load from CDN...');
    setTimeout(() => {
        if (!supabaseReady) {
            initializeSupabase();
        }
    }, 100);
    
    // Try again at 300ms if still not ready
    setTimeout(() => {
        if (!supabaseReady) {
            initializeSupabase();
        }
    }, 300);
    
    // Try again at 500ms if still not ready
    setTimeout(() => {
        if (!supabaseReady) {
            if (window.supabase && window.supabase.createClient) {
                initializeSupabase();
            } else {
                console.error('❌ ERROR: Supabase library failed to load. Check CDN connection.');
                exportFunctionsToWindow(); // Export anyway so fallback works
            }
        }
    }, 500);
}

// ============================================================
// SQL SETUP CODE FOR SUPABASE
// ============================================================

/**
 * COPY ALL SQL BELOW AND RUN IN SUPABASE DASHBOARD
 * 
 * STEPS:
 * 1. Go to: https://app.supabase.com/projects
 * 2. Select your project
 * 3. Click "SQL Editor" → "New Query"
 * 4. Copy entire SQL below and paste
 * 5. Click "Run"
 */

const SQL_SETUP = `
-- ============================================================
-- 1. CREATE USERS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  password TEXT NOT NULL,
  joined_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT email_valid CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}$')
);

CREATE INDEX idx_users_student_id ON users(student_id);
CREATE INDEX idx_users_email ON users(email);

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own data" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Anyone can create users" ON users
  FOR INSERT WITH CHECK (true);

-- ============================================================
-- 2. CREATE COMPLAINTS TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS complaints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_id TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  user_email TEXT NOT NULL,
  user_name TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  category TEXT NOT NULL CHECK (category IN ('harassment', 'water', 'hostel', 'infrastructure', 'academic', 'unsafe')),
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT DEFAULT 'reported' CHECK (status IN ('reported', 'under-review', 'resolved')),
  status_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_complaints_user_id ON complaints(user_id);
CREATE INDEX idx_complaints_email ON complaints(user_email);
CREATE INDEX idx_complaints_status ON complaints(status);
CREATE INDEX idx_complaints_category ON complaints(category);
CREATE INDEX idx_complaints_priority ON complaints(priority);
CREATE INDEX idx_complaints_created_at ON complaints(created_at DESC);
CREATE INDEX idx_complaints_reference_id ON complaints(reference_id);

ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view complaints" ON complaints
  FOR SELECT USING (true);

CREATE POLICY "Anyone can create complaints" ON complaints
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can delete own complaints" ON complaints
  FOR DELETE USING (user_id = auth.uid() OR user_id IS NULL);

-- ============================================================
-- 3. CREATE STATUS HISTORY TABLE
-- ============================================================

CREATE TABLE IF NOT EXISTS status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT NOT NULL CHECK (new_status IN ('reported', 'under-review', 'resolved')),
  changed_by_admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
  change_reason TEXT,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_status_history_complaint_id ON status_history(complaint_id);
CREATE INDEX idx_status_history_changed_at ON status_history(changed_at DESC);

ALTER TABLE status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view status history" ON status_history
  FOR SELECT USING (true);

-- ============================================================
-- 4. CREATE ATTACHMENTS TABLE (Optional)
-- ============================================================

CREATE TABLE IF NOT EXISTS attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  file_type TEXT,
  storage_path TEXT NOT NULL,
  uploaded_by_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_attachments_complaint_id ON attachments(complaint_id);

ALTER TABLE attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view attachments" ON attachments
  FOR SELECT USING (true);

-- ============================================================
-- Tables created successfully!
-- ============================================================
`;

// ============================================================
// JAVASCRIPT FUNCTIONS TO SAVE DATA
// ============================================================

/**
 * SAVE USER (Registration)
 */
async function saveUserToSupabase(userData) {
    if (!supabase) {
        console.error('❌ Supabase not initialized');
        alert('Database connection not available. Using local storage.');
        return null;
    }

    try {
        console.log('📝 Saving user to Supabase...');
        console.log('👤 User data received:', userData);

        // Handle both camelCase and snake_case input
        const studentId = userData.student_id || userData.studentId;
        const email = userData.email;
        const fullName = userData.full_name || userData.fullName;
        const password = userData.password;

        console.log('📝 Normalized user data:');
        console.log('  Student ID:', studentId);
        console.log('  Email:', email);
        console.log('  Full Name:', fullName);
        console.log('  Password: [HIDDEN]');

        // Validate required fields
        if (!studentId) {
            throw new Error('Student ID is required');
        }
        if (!email) {
            throw new Error('Email is required');
        }
        if (!fullName) {
            throw new Error('Full Name is required');
        }
        if (!password) {
            throw new Error('Password is required');
        }

        console.log('🔌 Attempting to insert into "users" table...');

        const { data, error } = await supabase
            .from('users')
            .insert([{
                student_id: studentId,
                email: email,
                full_name: fullName,
                password: password,  // ⚠️ HASH THIS ON BACKEND!
                joined_date: new Date().toISOString()
            }])
            .select();

        if (error) {
            console.error('❌ SUPABASE ERROR:');
            console.error('Error Code:', error.code);
            console.error('Error Message:', error.message);
            console.error('Error Details:', error.details);
            throw new Error(`User Registration Error: ${error.message}${error.details ? ' (' + error.details + ')' : ''}`);
        }

        if (!data || data.length === 0) {
            throw new Error('No data returned after user registration');
        }

        console.log('✅ User saved successfully!');
        console.log('✅ User object:', data[0]);
        return data[0];

    } catch (error) {
        console.error('❌ Error in saveUserToSupabase:');
        console.error('Error message:', error.message);
        console.error('Full error:', error);
        throw error;
    }
}

/**
 * SAVE COMPLAINT - MAIN FUNCTION
 * Called when user submits complaint from form
 */
async function saveComplaintToSupabase(complaintData, userData, isAnonymous = false) {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🚀 COMPLAINT SUBMISSION STARTED');
    console.log('═══════════════════════════════════════════════════════════');
    
    // STEP 1: Check Supabase initialization
    console.log('\n📋 STEP 1: Checking Supabase Client...');
    if (!supabase) {
        console.error('❌ CRITICAL: Supabase client NOT initialized!');
        console.error('Possible causes:');
        console.error('  1. Supabase CDN library failed to load');
        console.error('  2. Network error accessing CDN');
        console.error('  3. Browser blocking external scripts');
        console.error('  4. Invalid credentials in SUPABASE_URL or SUPABASE_ANON_KEY');
        console.log('⚠️ Falling back to localStorage (will not sync to Supabase)');
        return saveComplaintLocally(complaintData, userData, isAnonymous);
    }
    console.log('✅ Supabase client is initialized');

    try {
        // STEP 2: Log input data
        console.log('\n📋 STEP 2: Input Data Received');
        console.log('  Complaint Data:', complaintData);
        console.log('  User Data:', userData);
        console.log('  Is Anonymous:', isAnonymous);

        // STEP 3: Generate reference ID
        console.log('\n📋 STEP 3: Generating Reference ID...');
        const referenceId = generateReferenceId();
        console.log('  ✓ Reference ID generated:', referenceId);

        // STEP 4: Validate all required fields
        console.log('\n📋 STEP 4: Validating Required Fields...');
        const validationErrors = [];
        
        if (!complaintData.category) {
            validationErrors.push('Category is required');
        } else {
            console.log('  ✓ Category:', complaintData.category);
        }
        
        if (!complaintData.priority) {
            validationErrors.push('Priority is required');
        } else {
            console.log('  ✓ Priority:', complaintData.priority);
        }
        
        if (!complaintData.title) {
            validationErrors.push('Title is required');
        } else {
            console.log('  ✓ Title:', complaintData.title);
        }
        
        if (!complaintData.description) {
            validationErrors.push('Description is required');
        } else {
            console.log('  ✓ Description length:', complaintData.description.length, 'chars');
        }
        
        const userEmail = userData?.email || complaintData.userEmail || '';
        if (!userEmail) {
            validationErrors.push('Email is required');
        } else {
            console.log('  ✓ Email:', userEmail);
        }
        
        if (validationErrors.length > 0) {
            throw new Error('Validation failed: ' + validationErrors.join(', '));
        }
        console.log('  ✓ All validations passed!');

        // STEP 5: Build complaint object
        console.log('\n📋 STEP 5: Building Complaint Object...');
        const complaintToSave = {
            reference_id: referenceId,
            user_id: userData?.id || null,
            user_email: userEmail,
            user_name: isAnonymous ? null : (userData?.fullName || userData?.full_name || complaintData.userName || 'Anonymous'),
            is_anonymous: isAnonymous,
            category: complaintData.category,
            priority: complaintData.priority,
            title: complaintData.title || 'Complaint',
            description: complaintData.description,
            status: 'reported',
            status_updated_at: new Date().toISOString(),
            created_at: new Date().toISOString()
        };

        console.log('  Object to save:');
        console.log('    - reference_id:', complaintToSave.reference_id);
        console.log('    - user_id:', complaintToSave.user_id);
        console.log('    - user_email:', complaintToSave.user_email);
        console.log('    - user_name:', complaintToSave.user_name);
        console.log('    - is_anonymous:', complaintToSave.is_anonymous);
        console.log('    - category:', complaintToSave.category);
        console.log('    - priority:', complaintToSave.priority);
        console.log('    - title:', complaintToSave.title);
        console.log('    - description:', complaintToSave.description.substring(0, 50) + '...');
        console.log('    - status:', complaintToSave.status);

        // STEP 6: Check if complaints table exists by testing a query
        console.log('\n📋 STEP 6: Checking Database Table...');
        try {
            const { data: testData, error: testError } = await supabase
                .from('complaints')
                .select('*')
                .limit(1);
            
            if (testError) {
                console.error('❌ TABLE CHECK FAILED:', testError.message);
                console.error('Error Code:', testError.code);
                if (testError.code === 'PGRST205') {
                    console.error('⚠️ The "complaints" table does not exist!');
                    console.error('ACTION REQUIRED: Run the SQL setup in Supabase.');
                    console.error('See SUPABASE_SETUP.md for instructions.');
                }
                throw new Error(`Table check failed: ${testError.message}`);
            }
            console.log('  ✓ Table exists and is accessible');
            console.log('  ✓ Current records in table:', testData?.length || 0);
        } catch (tableCheckError) {
            console.error('❌ Could not verify table:', tableCheckError.message);
            throw tableCheckError;
        }

        // STEP 7: Insert into Supabase
        console.log('\n📋 STEP 7: Inserting Complaint into Supabase...');
        console.log('  🔌 Sending INSERT request to "complaints" table...');
        
        const { data, error } = await supabase
            .from('complaints')
            .insert([complaintToSave])
            .select();

        if (error) {
            console.error('\n❌ ❌ ❌ SUPABASE INSERT FAILED ❌ ❌ ❌');
            console.error('Full Error Object:', error);
            console.error('  Error Code:', error.code);
            console.error('  Error Message:', error.message);
            console.error('  Error Details:', error.details);
            console.error('  Error Hint:', error.hint);
            
            // Provide helpful diagnostics
            if (error.code === 'PGRST205') {
                console.error('\n💡 DIAGNOSIS: Table does not exist!');
                console.error('ACTION: Run SQL setup in SUPABASE_SETUP.md');
            } else if (error.code === 'PGRST301') {
                console.error('\n💡 DIAGNOSIS: RLS policy is blocking INSERT!');
                console.error('ACTION: Check RLS policies allow INSERT for anonymous users');
            } else if (error.message.includes('permission denied')) {
                console.error('\n💡 DIAGNOSIS: Permission denied');
                console.error('ACTION: Check RLS policies and table permissions');
            }
            
            throw new Error(`INSERT failed: ${error.message}`);
        }

        if (!data || data.length === 0) {
            console.error('❌ INSERT returned no data!');
            throw new Error('No data returned after insert');
        }

        // STEP 8: Success!
        console.log('\n✅ ✅ ✅ SUCCESS! COMPLAINT SAVED TO SUPABASE ✅ ✅ ✅');
        console.log('📊 Saved complaint details:');
        console.log('  ✓ Reference ID:', data[0].reference_id);
        console.log('  ✓ Status:', data[0].status);
        console.log('  ✓ Created at:', data[0].created_at);
        console.log('  ✓ Full record:', data[0]);
        console.log('\n═══════════════════════════════════════════════════════════\n');
        return data[0];

    } catch (error) {
        console.error('\n❌ ❌ ❌ EXCEPTION IN SAVECOMPLAINT ❌ ❌ ❌');
        console.error('Error Type:', error.constructor.name);
        console.error('Error Message:', error.message);
        console.error('Stack Trace:', error.stack);
        console.log('\n⚠️ Falling back to localStorage (data will not sync to Supabase)');
        
        // Still try to save locally
        const localResult = saveComplaintLocally(complaintData, userData, isAnonymous);
        console.log('📱 Complaint saved to browser storage instead');
        console.log('═══════════════════════════════════════════════════════════\n');
        return localResult;
    }
}

/**
 * FALLBACK: Save to localStorage if Supabase fails
 */
function saveComplaintLocally(complaintData, userData, isAnonymous) {
    console.log('💾 Saving complaint to localStorage as fallback...');
    const complaint = {
        id: generateReferenceId(),
        user_id: userData?.id || null,
        user_email: userData?.email || complaintData.userEmail || '',
        user_name: isAnonymous ? null : (userData?.fullName || complaintData.userName || ''),
        is_anonymous: isAnonymous,
        category: complaintData.category,
        priority: complaintData.priority,
        title: complaintData.title,
        description: complaintData.description,
        status: 'reported',
        created_at: new Date().toISOString()
    };

    let complaints = JSON.parse(localStorage.getItem('campusvoice_complaints') || '[]');
    complaints.push(complaint);
    localStorage.setItem('campusvoice_complaints', JSON.stringify(complaints));

    console.log('💾 Successfully saved complaint to localStorage');
    console.log('📊 Total complaints in localStorage:', complaints.length);
    console.log('💾 Complaint saved:', complaint);
    return complaint;
}

/**
 * GET ALL COMPLAINTS
 */
async function getAllComplaintsFromSupabase(limit = 50, offset = 0) {
    if (!supabase) return [];

    try {
        const { data, error } = await supabase
            .from('complaints')
            .select('*')
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);

        if (error) throw error;
        return data || [];

    } catch (error) {
        console.error('Error fetching complaints:', error);
        return [];
    }
}

/**
 * GET USER'S COMPLAINTS
 */
async function getUserComplaintsFromSupabase(userId) {
    if (!supabase) return [];

    try {
        const { data, error } = await supabase
            .from('complaints')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];

    } catch (error) {
        console.error('Error fetching user complaints:', error);
        return [];
    }
}

/**
 * UPDATE COMPLAINT STATUS
 */
async function updateComplaintStatusInSupabase(complaintId, newStatus, changeReason = '') {
    if (!supabase) return null;

    try {
        const { data, error } = await supabase
            .from('complaints')
            .update({
                status: newStatus,
                status_updated_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            })
            .eq('id', complaintId)
            .select();

        if (error) throw error;

        console.log('✅ Status updated to:', newStatus);
        return data[0];

    } catch (error) {
        console.error('Error updating status:', error);
        throw error;
    }
}

/**
 * SEARCH COMPLAINTS
 */
async function searchComplaintsInSupabase(query) {
    if (!supabase) return [];

    try {
        const { data, error } = await supabase
            .from('complaints')
            .select('*')
            .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];

    } catch (error) {
        console.error('Error searching:', error);
        return [];
    }
}

/**
 * GENERATE REFERENCE ID like CV-20260214456
 */
function generateReferenceId() {
    const now = new Date();
    const date = now.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, '0');
    return `CV-${date}${random}`;
}

// ============================================================
// TEST SUPABASE CONNECTION
// ============================================================

/**
 * Test if Supabase is properly connected
 * Call this from browser console: testSupabaseConnection()
 */
async function testSupabaseConnection() {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🧪 COMPREHENSIVE SUPABASE DIAGNOSTIC TEST');
    console.log('═══════════════════════════════════════════════════════════\n');
    
    // TEST 1: Supabase library loaded
    console.log('TEST 1: Supabase Library...');
    if (!window.supabase) {
        console.error('❌ FAIL: Supabase library not loaded');
        console.error('ACTION: Verify Supabase CDN script is loaded in index.html');
        return false;
    }
    console.log('✅ PASS: Supabase library available\n');

    // TEST 2: Client initialized
    console.log('TEST 2: Supabase Client Initialization...');
    if (!supabase) {
        console.error('❌ FAIL: Supabase client not initialized');
        console.error('Causes:');
        console.error('  - Credentials invalid (check SUPABASE_URL and SUPABASE_ANON_KEY)');
        console.error('  - Network error connecting to Supabase');
        console.error('  - Supabase service down');
        return false;
    }
    console.log('✅ PASS: Supabase client initialized');
    console.log('   URL:', SUPABASE_URL);
    console.log('   Key loaded:', SUPABASE_ANON_KEY.substring(0, 20) + '...\n');

    // TEST 3: Network connectivity
    console.log('TEST 3: Network Connectivity...');
    try {
        const testResponse = await fetch(SUPABASE_URL + '/rest/v1/', {
            method: 'GET',
            headers: {
                'apikey': SUPABASE_ANON_KEY
            }
        });
        console.log('✅ PASS: Network connection established (HTTP', testResponse.status, ')\n');
    } catch (error) {
        console.error('❌ FAIL: Cannot reach Supabase server');
        console.error('Error:', error.message);
        console.error('Check your internet connection and firewall\n');
        return false;
    }

    // TEST 4: Complaints table exists
    console.log('TEST 4: Checking "complaints" Table...');
    try {
        const { data, error } = await supabase
            .from('complaints')
            .select('*')
            .limit(1);

        if (error) {
            if (error.code === 'PGRST205') {
                console.error('❌ FAIL: "complaints" table does not exist');
                console.error('ACTION REQUIRED:');
                console.error('  1. Open: https://app.supabase.com');
                console.error('  2. Select project: pbblscnyzfqshrqdzxkq');
                console.error('  3. Go to SQL Editor → New Query');
                console.error('  4. Copy SQL from SUPABASE_SETUP.md');
                console.error('  5. Click Run');
                console.error('  6. Come back and test again\n');
            } else {
                console.error('❌ FAIL: Table query error');
                console.error('Error:', error.message);
                console.error('Code:', error.code, '\n');
            }
            return false;
        }
        console.log('✅ PASS: "complaints" table exists');
        console.log('   Records in table:', data?.length || 0, '\n');
    } catch (error) {
        console.error('❌ FAIL: Exception querying table');
        console.error('Error:', error.message, '\n');
        return false;
    }

    // TEST 5: Users table exists
    console.log('TEST 5: Checking "users" Table...');
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .limit(1);

        if (error && error.code === 'PGRST205') {
            console.error('⚠️  WARNING: "users" table does not exist');
            console.error('   Run SQL setup to create it\n');
        } else if (error) {
            console.error('⚠️  WARNING: Error checking users table');
            console.error('   Error:', error.message, '\n');
        } else {
            console.log('✅ PASS: "users" table exists');
            console.log('   Records:', data?.length || 0, '\n');
        }
    } catch (error) {
        console.error('⚠️  WARNING: Exception querying users table\n');
    }

    // TEST 6: INSERT permission (the critical test)
    console.log('TEST 6: INSERT Permission (Critical for Complaints)...');
    try {
        // Create a test complaint
        const testComplaint = {
            reference_id: 'TEST-' + Date.now(),
            user_email: 'test@campusvoice.test',
            user_name: 'Test User',
            is_anonymous: false,
            category: 'academic',
            priority: 'low',
            title: 'Test Complaint',
            description: 'This is a test to verify INSERT permissions.',
            status: 'reported',
            created_at: new Date().toISOString(),
            status_updated_at: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from('complaints')
            .insert([testComplaint])
            .select();

        if (error) {
            console.error('❌ FAIL: Cannot INSERT into complaints table');
            console.error('Error Code:', error.code);
            console.error('Error Message:', error.message);
            console.error('Possible causes:');
            if (error.code === 'PGRST301') {
                console.error('  - RLS policy blocking INSERT');
                console.error('  - Fix: Check RLS policies allow INSERT for anonymous');
            } else if (error.message.includes('permission denied')) {
                console.error('  - Permission denied by database');
            } else if (error.message.includes('UNIQUE')) {
                console.error('  - Reference ID already exists (can delete test record)');
            }
            console.error('Details:', error.details, '\n');
            return false;
        }

        if (data && data.length > 0) {
            console.log('✅ PASS: Can INSERT into complaints table');
            console.log('   Test complaint created with ID:', data[0].id);
            console.log('   Reference ID:', data[0].reference_id);
            console.log('   (It\'s safe to ignore this test record)\n');
        }
    } catch (error) {
        console.error('❌ FAIL: Exception during INSERT test');
        console.error('Error:', error.message, '\n');
        return false;
    }

    // TEST 7: SELECT permission
    console.log('TEST 7: SELECT Permission...');
    try {
        const { data, error } = await supabase
            .from('complaints')
            .select('*')
            .limit(5);

        if (error) {
            console.error('❌ FAIL: Cannot SELECT from complaints table');
            console.error('Error:', error.message, '\n');
            return false;
        }
        console.log('✅ PASS: Can SELECT from complaints table');
        console.log('   Found', data?.length || 0, 'records\n');
    } catch (error) {
        console.error('❌ FAIL: Exception during SELECT');
        console.error('Error:', error.message, '\n');
        return false;
    }

    console.log('═══════════════════════════════════════════════════════════');
    console.log('✅ ✅ ✅ ALL TESTS PASSED - SUPABASE IS READY ✅ ✅ ✅');
    console.log('═══════════════════════════════════════════════════════════\n');
    return true;
}

// ============================================================
// EXPORT ALL FUNCTIONS TO WINDOW (For global access)
// ============================================================

function exportFunctionsToWindow() {
    // Only log once
    if (window.saveComplaintToSupabase) {
        return; // Already exported
    }
    
    console.log('📦 Exporting Supabase functions to window...');

    window.saveUserToSupabase = saveUserToSupabase;
    window.saveComplaintToSupabase = saveComplaintToSupabase;
    window.getAllComplaintsFromSupabase = getAllComplaintsFromSupabase;
    window.getUserComplaintsFromSupabase = getUserComplaintsFromSupabase;
    window.updateComplaintStatusInSupabase = updateComplaintStatusInSupabase;
    window.searchComplaintsInSupabase = searchComplaintsInSupabase;
    window.generateReferenceId = generateReferenceId;
    window.testSupabaseConnection = testSupabaseConnection;

    console.log('✅ All Supabase functions exported and ready to use!');
    console.log('📍 Supabase Status:', {
        initialized: supabase ? '✅ Connected' : '❌ Not connected',
        url: SUPABASE_URL,
        methods: [
            'saveUserToSupabase',
            'saveComplaintToSupabase',
            'getAllComplaintsFromSupabase',
            'getUserComplaintsFromSupabase',
            'updateComplaintStatusInSupabase',
            'searchComplaintsInSupabase',
            'generateReferenceId',
            'testSupabaseConnection'
        ]
    });

    // Auto-test connection on load (after a slight delay to ensure DOM ready)
    console.log('🔗 Running automatic connection test...');
    setTimeout(() => {
        if (window.testSupabaseConnection) {
            window.testSupabaseConnection();
        }
    }, 1500);
}

// Export immediately and also try on a schedule to ensure it happens
exportFunctionsToWindow();

// Retry exports if DOM is still loading
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        setTimeout(exportFunctionsToWindow, 50);
    });
} else {
    // DOM is already loaded, make sure we exported
    setTimeout(exportFunctionsToWindow, 50);
}