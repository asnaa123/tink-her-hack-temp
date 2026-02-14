/**
 * ============================================================
 * CAMPUSVOICE - PRIVATE STUDENT PORTAL (app.js)
 * ============================================================
 * 
 * This version features:
 * - User authentication (login)
 * - Private dashboard (only user's own complaints)
 * - Status tracking with progress bars
 * - Glassmorphism UI effects
 * - Mobile-responsive hamburger menu
 * 
 * ============================================================
 */

// ============================================================
// STORAGE & CONSTANTS
// ============================================================

if (typeof STORAGE_KEY === 'undefined') {
    var STORAGE_KEY = 'campusvoice_complaints';
}
if (typeof USER_STORAGE_KEY === 'undefined') {
    var USER_STORAGE_KEY = 'campusvoice_current_user';
}

// Status stages for progress tracking
const STATUS_STAGES = {
    reported: { label: 'Reported', percent: 33, color: 'reported' },
    'under-review': { label: 'Under Review', percent: 66, color: 'under-review' },
    resolved: { label: 'Resolved', percent: 100, color: 'resolved' }
};

// ============================================================
// INITIALIZATION
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('✓ CampusVoice Portal Loading...');
    
    const currentUser = getLoggedInUser();
    
    if (currentUser) {
        // User is logged in - show dashboard
        showDashboard(currentUser);
        initializeDashboard();
    } else {
        // User not logged in - show login
        showLoginModal();
        initializeLogin();
    }
});

// ============================================================
// LOGIN FUNCTIONS
// ============================================================

function initializeLogin() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
}

function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value.trim();
    const name = document.getElementById('loginName').value.trim();
    
    if (!email || !name) {
        alert('Please fill in all fields');
        return;
    }
    
    // Create user object
    const user = {
        id: generateUID(),
        email: email,
        name: name,
        joinedDate: new Date().toISOString()
    };
    
    // Save to localStorage
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    
    console.log('✓ User logged in:', user.name);
    
    // Show dashboard
    showDashboard(user);
    initializeDashboard();
}

function getLoggedInUser() {
    const user = localStorage.getItem(USER_STORAGE_KEY);
    return user ? JSON.parse(user) : null;
}

function showLoginModal() {
    const loginModal = document.getElementById('loginModal');
    const dashboardWrapper = document.getElementById('dashboardWrapper');
    
    if (loginModal) loginModal.style.display = 'flex';
    if (dashboardWrapper) dashboardWrapper.style.display = 'none';
}

function showDashboard(user) {
    const loginModal = document.getElementById('loginModal');
    const dashboardWrapper = document.getElementById('dashboardWrapper');
    
    if (loginModal) loginModal.style.display = 'none';
    if (dashboardWrapper) dashboardWrapper.style.display = 'block';
    
    // Update user name in header
    const userName = document.getElementById('userName');
    if (userName) {
        userName.textContent = `👤 ${user.name}`;
    }
}
    

// ============================================================
// DASHBOARD INITIALIZATION
// ============================================================

function initializeDashboard() {
    const currentUser = getLoggedInUser();
    
    if (!currentUser) return;
    
    // Form submission
    const complaintForm = document.getElementById('complaintForm');
    if (complaintForm) {
        complaintForm.addEventListener('submit', handleFormSubmit);
    }
    
    // Hamburger menu
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    const mobileNav = document.getElementById('mobileNav');
    if (hamburgerMenu) {
        hamburgerMenu.addEventListener('click', () => {
            hamburgerMenu.classList.toggle('active');
            mobileNav.classList.toggle('active');
        });
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    const logoutBtnHeader = document.getElementById('logoutBtnHeader');
    
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
    if (logoutBtnHeader) {
        logoutBtnHeader.addEventListener('click', handleLogout);
    }
    
    // Modal click outside to close
    const modal = document.getElementById('complaintModal');
    if (modal) {
        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                closeModal();
            }
        });
    }
    
    // Display user's complaints
    displayUserComplaints();
    
    console.log('✓ Dashboard initialized for', currentUser.name);
}

// ============================================================
// FORM SUBMISSION (User posts complaint)
// ============================================================

function handleFormSubmit(e) {
    e.preventDefault();
    
    const currentUser = getLoggedInUser();
    if (!currentUser) return;
    
    const formMessage = document.getElementById('formMessage');
    formMessage.className = 'message';
    
    // Collect form data
    const title = document.getElementById('title').value.trim();
    const category = document.getElementById('category').value;
    const severity = document.getElementById('severity').value;
    const description = document.getElementById('description').value.trim();
    const location = document.getElementById('location').value.trim();
    const isAnonymous = document.getElementById('anonymous').checked;
    
    // Validation
    if (!title || !category || !description) {
        formMessage.className = 'message error';
        formMessage.textContent = '❌ Please fill all required fields';
        return;
    }
    
    // Create complaint object
    const complaint = {
        id: generateUID(),
        userId: currentUser.id,
        userEmail: currentUser.email,
        userName: currentUser.name,
        isAnonymous: isAnonymous,
        title: title,
        category: category,
        severity: severity,
        description: description,
        location: location,
        status: 'reported',
        timestamp: new Date().toISOString(),
        createdDate: new Date().toLocaleDateString()
    };
    
    // Save to localStorage
    const complaints = getComplaints();
    complaints.push(complaint);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(complaints));
    
    // Show success message
    formMessage.className = 'message success';
    formMessage.textContent = '✅ Report submitted successfully! Thank you for speaking up.';
    
    // Reset form
    e.target.reset();
    
    // Refresh complaint list
    displayUserComplaints();
    
    // Clear message after 3 seconds
    setTimeout(() => {
        formMessage.textContent = '';
    }, 3000);
    
    console.log('✓ Complaint submitted:', complaint);
}

// ============================================================
// DISPLAY USER COMPLAINTS (PRIVATE VIEW)
// ============================================================

function displayUserComplaints() {
    const currentUser = getLoggedInUser();
    if (!currentUser) return;
    
    const complaintsList = document.getElementById('complaintsList');
    if (!complaintsList) return;
    
    // Get all complaints
    const allComplaints = getComplaints();
    
    // Filter only this user's complaints
    const userComplaints = allComplaints.filter(c => c.userId === currentUser.id);
    
    // Sort by date (newest first)
    userComplaints.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    if (userComplaints.length === 0) {
        complaintsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-inbox"></i>
                <p>No reports yet. Start by filing your first complaint.</p>
            </div>
        `;
        return;
    }
    
    // Create HTML for each complaint
    complaintsList.innerHTML = userComplaints
        .map(complaint => createComplaintCard(complaint))
        .join('');
    
    // Add click listeners to cards
    const cards = complaintsList.querySelectorAll('.complaint-card');
    cards.forEach(card => {
        card.addEventListener('click', () => {
            const complaintId = card.getAttribute('data-complaint-id');
            viewComplaint(complaintId);
        });
    });
}


function createComplaintCard(complaint) {
    const categoryEmoji = getCategoryEmoji(complaint.category);
    const displayName = complaint.isAnonymous ? 'Anonymous' : complaint.userName;
    const statusInfo = STATUS_STAGES[complaint.status] || STATUS_STAGES.reported;
    const dateObj = new Date(complaint.timestamp);
    const dateStr = dateObj.toLocaleDateString() + ' ' + dateObj.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
    
    return `
        <div class="complaint-card" data-complaint-id="${complaint.id}">
            <div class="complaint-header">
                <div style="display: flex; align-items: center; gap: 0.7rem;">
                    <span style="font-size: 1.5rem;">${categoryEmoji}</span>
                    <div>
                        <h3 style="margin: 0; color: var(--primary-color);">${complaint.title}</h3>
                        <p style="margin: 0.3rem 0 0 0; color: var(--text-light); font-size: 0.85rem;">
                            📍 ${complaint.location || 'Location not specified'}
                        </p>
                    </div>
                </div>
                <div style="display: flex; gap: 0.5rem; align-items: center;">
                    <span class="severity-badge severity-${complaint.severity}">
                        ${getSeverityIcon(complaint.severity)} ${complaint.severity.toUpperCase()}
                    </span>
                </div>
            </div>
            
            <p style="color: var(--text-light); font-size: 0.95rem; margin: 0.8rem 0 0 0;">
                ${complaint.description.substring(0, 100)}${complaint.description.length > 100 ? '...' : ''}
            </p>
            
            <div class="status-container">
                <div class="status-label" class="status-${complaint.status}">
                    <i class="fas ${getStatusIcon(complaint.status)}"></i> ${statusInfo.label}
                </div>
                <div class="progress-bar">
                    <div class="progress-fill ${complaint.status}" style="width: ${statusInfo.percent}%;"></div>
                </div>
            </div>
            
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 1rem; font-size: 0.85rem; color: var(--text-light);">
                <div>
                    <i class="far fa-calendar"></i> ${dateStr}
                </div>
                <button class="btn-delete" onclick="event.stopPropagation(); deleteComplaint('${complaint.id}')">
                    <i class="fas fa-trash-alt"></i> Delete
                </button>
            </div>
        </div>
    `;
}


// ============================================================
// MODAL FUNCTIONS
// ============================================================

function viewComplaint(complaintId) {
    const complaint = getComplaints().find(c => c.id === complaintId);
    if (!complaint) return;
    
    const modalBody = document.getElementById('modalBody');
    const modal = document.getElementById('complaintModal');
    
    const categoryEmoji = getCategoryEmoji(complaint.category);
    const displayName = complaint.isAnonymous ? 'Anonymous' : complaint.userName;
    const statusInfo = STATUS_STAGES[complaint.status] || STATUS_STAGES.reported;
    const dateObj = new Date(complaint.timestamp);
    const dateStr = dateObj.toLocaleDateString() + ' ' + dateObj.toLocaleTimeString();
    
    modalBody.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1.5rem;">
            <h2 style="color: var(--primary-color); margin: 0;">
                ${categoryEmoji} ${complaint.title}
            </h2>
            <span class="severity-badge severity-${complaint.severity}">
                ${getSeverityIcon(complaint.severity)} ${complaint.severity.toUpperCase()}
            </span>
        </div>
        
        <div style="background: rgba(99, 102, 241, 0.05); padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem;">
            <p style="margin: 0.5rem 0;">
                <strong>📁 Category:</strong> ${complaint.category.charAt(0).toUpperCase() + complaint.category.slice(1)}
            </p>
            <p style="margin: 0.5rem 0;">
                <strong>👤 Submitted by:</strong> ${displayName}
            </p>
            <p style="margin: 0.5rem 0;">
                <strong>📍 Location:</strong> ${complaint.location || 'Not specified'}
            </p>
            <p style="margin: 0.5rem 0;">
                <strong>📅 Date:</strong> ${dateStr}
            </p>
        </div>
        
        <div style="margin-bottom: 1.5rem;">
            <h3 style="color: var(--text-dark); margin-bottom: 0.5rem;">Status & Progress</h3>
            <div class="status-label" class="status-${complaint.status}">
                <i class="fas ${getStatusIcon(complaint.status)}"></i> ${statusInfo.label}
            </div>
            <div class="progress-bar" style="margin-top: 0.8rem;">
                <div class="progress-fill ${complaint.status}" style="width: ${statusInfo.percent}%;"></div>
            </div>
        </div>
        
        <div style="margin-bottom: 1.5rem;">
            <h3 style="color: var(--text-dark); margin-bottom: 0.5rem;">Full Description</h3>
            <p style="line-height: 1.6; color: var(--text-light); white-space: pre-wrap;">
                ${complaint.description}
            </p>
        </div>
        
        <button class="btn-delete" onclick="deleteComplaint('${complaint.id}'); closeModal();" style="width: 100%; padding: 0.75rem;">
            <i class="fas fa-trash-alt"></i> Delete This Report
        </button>
    `;
    
    modal.style.display = 'block';
}

function closeModal() {
    const modal = document.getElementById('complaintModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// ============================================================
// DELETE COMPLAINT
// ============================================================

function deleteComplaint(complaintId) {
    if (!confirm('Are you sure you want to delete this report? This action cannot be undone.')) {
        return;
    }
    
    const complaints = getComplaints();
    const filtered = complaints.filter(c => c.id !== complaintId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    
    displayUserComplaints();
    console.log('✓ Complaint deleted:', complaintId);
}

// ============================================================
// LOGOUT
// ============================================================

function handleLogout() {
    if (!confirm('Are you sure you want to logout?')) {
        return;
    }
    
    // Clear user session
    localStorage.removeItem(USER_STORAGE_KEY);
    
    // Close hamburger menu
    const hamburgerMenu = document.getElementById('hamburgerMenu');
    const mobileNav = document.getElementById('mobileNav');
    if (hamburgerMenu) hamburgerMenu.classList.remove('active');
    if (mobileNav) mobileNav.classList.remove('active');
    
    // Show login
    showLoginModal();
    initializeLogin();
    
    console.log('✓ User logged out');
}

// ============================================================
// UTILITY FUNCTIONS
// ============================================================

function getComplaints() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

function generateUID() {
    return 'id_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function getCategoryEmoji(category) {
    const emojis = {
        bullying: '🛡️',
        water: '💧',
        hostel: '🏛️',
        personal: '💭',
        academic: '📚',
        infrastructure: '🏗️',
        other: '❓'
    };
    return emojis[category] || '📋';
}

function getSeverityIcon(severity) {
    const icons = {
        low: 'fa-info-circle fa-lg',
        medium: 'fa-exclamation-circle fa-lg',
        high: 'fa-exclamation-triangle fa-lg',
        critical: 'fa-times-circle fa-lg'
    };
    return icons[severity] || 'fa-circle';
}

function getStatusIcon(status) {
    const icons = {
        reported: 'fa-inbox',
        'under-review': 'fa-hourglass-half',
        resolved: 'fa-check-circle'
    };
    return icons[status] || 'fa-inbox';
}