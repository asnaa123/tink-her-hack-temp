// ==================== LOCAL STORAGE KEY ====================
if (typeof STORAGE_KEY === 'undefined') {
    var STORAGE_KEY = 'campusvoice_complaints';
}

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    // Load existing complaints from localStorage
    displayComplaintsFromStorage();
    
    // Add event listeners only if elements exist
    const complaintForm = document.getElementById('complaintForm');
    if (complaintForm) {
        complaintForm.addEventListener('submit', handleFormSubmit);
    }
    
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', filterComplaints);
    }
    
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', filterComplaints);
    }
    
    const severityFilter = document.getElementById('severityFilter');
    if (severityFilter) {
        severityFilter.addEventListener('change', filterComplaints);
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', (event) => {
        const modal = document.getElementById('complaintModal');
        if (modal && event.target === modal) {
            closeModal();
        }
    });
}

// ==================== FORM SUBMISSION ====================
function handleFormSubmit(e) {
    e.preventDefault();
    
    const formMessage = document.getElementById('formMessage');
    if (!formMessage) return;
    
    formMessage.className = 'message';
    
    // Get form data
    const nameEl = document.getElementById('name');
    const emailEl = document.getElementById('email');
    const categoryEl = document.getElementById('category');
    const severityEl = document.getElementById('severity');
    const titleEl = document.getElementById('title');
    const descriptionEl = document.getElementById('description');
    const locationEl = document.getElementById('location');
    const anonymousEl = document.getElementById('anonymous');
    const termsEl = document.getElementById('terms');
    
    if (!nameEl || !emailEl || !categoryEl || !severityEl || !titleEl || !descriptionEl) {
        formMessage.textContent = 'Form elements not found';
        formMessage.className = 'message error';
        return;
    }
    
    const name = nameEl.value.trim();
    const email = emailEl.value.trim();
    const category = categoryEl.value;
    const severity = severityEl.value;
    const title = titleEl.value.trim();
    const description = descriptionEl.value.trim();
    const location = locationEl ? locationEl.value.trim() : '';
    const isAnonymous = anonymousEl ? anonymousEl.checked : false;
    const terms = termsEl ? termsEl.checked : false;
    
    // Validation
    if (!name || !email || !category || !title || !description || !terms) {
        formMessage.textContent = 'Please fill in all required fields.';
        formMessage.className = 'message error';
        return;
    }
    
    if (!validateEmail(email)) {
        formMessage.textContent = 'Please enter a valid email address.';
        formMessage.className = 'message error';
        return;
    }
    
    // Create complaint object
    const complaint = {
        id: Date.now(),
        name: isAnonymous ? 'Anonymous' : name,
        email: email,
        category: category,
        severity: severity,
        title: title,
        description: description,
        location: location || 'Not specified',
        isAnonymous: isAnonymous,
        timestamp: new Date().toLocaleString(),
        date: new Date().toISOString()
    };
    
    // Save to localStorage
    saveComplaintToStorage(complaint);
    
    // Show success message
    formMessage.textContent = '✓ Complaint submitted successfully! Thank you for your voice.';
    formMessage.className = 'message success';
    
    // Reset form
    document.getElementById('complaintForm').reset();
    
    // Clear message after 5 seconds
    setTimeout(() => {
        formMessage.className = 'message';
    }, 5000);
    
    // Refresh complaints list
    displayComplaintsFromStorage();
}

// ==================== STORAGE OPERATIONS ====================
function saveComplaintToStorage(complaint) {
    const complaints = getComplaintsFromStorage();
    complaints.push(complaint);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(complaints));
}

function getComplaintsFromStorage() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

function deleteComplaintFromStorage(id) {
    const complaints = getComplaintsFromStorage();
    const filteredComplaints = complaints.filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredComplaints));
    displayComplaintsFromStorage();
}

// ==================== DISPLAY COMPLAINTS ====================
function displayComplaintsFromStorage() {
    const complaints = getComplaintsFromStorage();
    const complaintsList = document.getElementById('complaintsList');
    
    if (complaints.length === 0) {
        complaintsList.innerHTML = '<p class="empty-state">No complaints yet. Be the first to voice your concerns!</p>';
        return;
    }
    
    // Sort by date (newest first)
    complaints.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Create HTML for complaints
    const complaintsHTML = complaints.map(complaint => createComplaintCard(complaint)).join('');
    complaintsList.innerHTML = complaintsHTML;
}

function createComplaintCard(complaint) {
    const categoryMap = {
        'bullying': '👥 Bullying & Harassment',
        'water': '💧 Water Issues',
        'hostel': '🏠 Hostel Facilities',
        'personal': '💭 Personal Related',
        'academic': '📚 Academic Issues',
        'infrastructure': '🏗️ Infrastructure',
        'other': '📌 Other'
    };
    
    const truncateText = (text, maxLength) => {
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };
    
    return `
        <div class="complaint-card severity-${complaint.severity}">
            <div class="complaint-header">
                <h3 class="complaint-title">${escapeHtml(complaint.title)}</h3>
                <span class="badge badge-severity ${complaint.severity}">${complaint.severity}</span>
            </div>
            
            <div class="complaint-meta">
                <span>🏷️ ${categoryMap[complaint.category] || complaint.category}</span>
                <span>📅 ${complaint.timestamp}</span>
                ${complaint.location !== 'Not specified' ? `<span>📍 ${escapeHtml(complaint.location)}</span>` : ''}
            </div>
            
            <p class="complaint-description">${escapeHtml(complaint.description)}</p>
            
            <div class="complaint-footer">
                <span class="complaint-author ${complaint.isAnonymous ? 'anonymous' : ''}">
                    ${complaint.isAnonymous ? 'Posted Anonymously' : `By: ${escapeHtml(complaint.name)}`}
                </span>
                <button class="btn-view" onclick="viewComplaint(${complaint.id})">View Details</button>
            </div>
        </div>
    `;
}

// ==================== MODAL VIEW ====================
function viewComplaint(id) {
    const complaints = getComplaintsFromStorage();
    const complaint = complaints.find(c => c.id === id);
    
    if (!complaint) return;
    
    const categoryMap = {
        'bullying': '👥 Bullying & Harassment',
        'water': '💧 Water Issues',
        'hostel': '🏠 Hostel Facilities',
        'personal': '💭 Personal Related',
        'academic': '📚 Academic Issues',
        'infrastructure': '🏗️ Infrastructure',
        'other': '📌 Other'
    };
    
    const severityMap = {
        'low': '🟢 Low',
        'medium': '🟡 Medium',
        'high': '🔴 High',
        'critical': '⚫ Critical'
    };
    
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <h2 class="modal-title">${escapeHtml(complaint.title)}</h2>
        
        <div class="modal-detail">
            <div class="modal-detail-label">Category</div>
            <div class="modal-detail-content">${categoryMap[complaint.category] || complaint.category}</div>
        </div>
        
        <div class="modal-detail">
            <div class="modal-detail-label">Severity Level</div>
            <div class="modal-detail-content">${severityMap[complaint.severity] || complaint.severity}</div>
        </div>
        
        <div class="modal-detail">
            <div class="modal-detail-label">Location</div>
            <div class="modal-detail-content">${escapeHtml(complaint.location)}</div>
        </div>
        
        <div class="modal-detail">
            <div class="modal-detail-label">Description</div>
            <div class="modal-detail-content">${escapeHtml(complaint.description)}</div>
        </div>
        
        <div class="modal-detail">
            <div class="modal-detail-label">Submitted By</div>
            <div class="modal-detail-content">
                ${complaint.isAnonymous ? 'Anonymous' : `${escapeHtml(complaint.name)} (${escapeHtml(complaint.email)})`}
            </div>
        </div>
        
        <div class="modal-detail">
            <div class="modal-detail-label">Date & Time</div>
            <div class="modal-detail-content">${complaint.timestamp}</div>
        </div>
        
        <button class="btn-secondary" onclick="deleteComplaint(${complaint.id})" style="width: 100%; margin-top: 1.5rem; background-color: #fee2e2; color: #991b1b;">Delete Complaint</button>
    `;
    
    document.getElementById('complaintModal').style.display = 'block';
}

function closeModal() {
    document.getElementById('complaintModal').style.display = 'none';
}

function deleteComplaint(id) {
    if (confirm('Are you sure you want to delete this complaint? This action cannot be undone.')) {
        deleteComplaintFromStorage(id);
        closeModal();
    }
}

// ==================== FILTERING & SEARCHING ====================
function filterComplaints() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    const categoryFilter = document.getElementById('categoryFilter').value;
    const severityFilter = document.getElementById('severityFilter').value;
    
    let complaints = getComplaintsFromStorage();
    
    // Filter by search term
    if (searchTerm) {
        complaints = complaints.filter(complaint =>
            complaint.title.toLowerCase().includes(searchTerm) ||
            complaint.description.toLowerCase().includes(searchTerm) ||
            complaint.name.toLowerCase().includes(searchTerm) ||
            complaint.location.toLowerCase().includes(searchTerm)
        );
    }
    
    // Filter by category
    if (categoryFilter) {
        complaints = complaints.filter(complaint => complaint.category === categoryFilter);
    }
    
    // Filter by severity
    if (severityFilter) {
        complaints = complaints.filter(complaint => complaint.severity === severityFilter);
    }
    
    // Sort by date (newest first)
    complaints.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    // Display filtered complaints
    const complaintsList = document.getElementById('complaintsList');
    if (complaints.length === 0) {
        complaintsList.innerHTML = '<p class="empty-state">No complaints match your filters. Try adjusting your search criteria.</p>';
        return;
    }
    
    const complaintsHTML = complaints.map(complaint => createComplaintCard(complaint)).join('');
    complaintsList.innerHTML = complaintsHTML;
}

function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('categoryFilter').value = '';
    document.getElementById('severityFilter').value = '';
    displayComplaintsFromStorage();
}

// ==================== UTILITY FUNCTIONS ====================
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function scrollToForm() {
    document.getElementById('complaints').scrollIntoView({ behavior: 'smooth' });
}

// ==================== SAMPLE DATA FOR TESTING ====================
function loadSampleData() {
    const sampleComplaints = [
        {
            id: Date.now() - 1000000,
            name: 'Rahul Kumar',
            email: 'rahul@college.edu',
            category: 'water',
            severity: 'high',
            title: 'No water supply in Hostel H',
            description: 'Water supply has been cut off in Hostel H for the past 3 days. Students are facing severe issues with basic sanitation.',
            location: 'Hostel H, Block 2',
            isAnonymous: false,
            timestamp: new Date(Date.now() - 86400000).toLocaleString(),
            date: new Date(Date.now() - 86400000).toISOString()
        },
        {
            id: Date.now() - 2000000,
            name: 'Priya Singh',
            email: 'priya@college.edu',
            category: 'bullying',
            severity: 'critical',
            title: 'Repeated harassment from senior batch',
            description: 'A senior student continues to harass and bully junior students. Multiple complaints have been ignored by authorities.',
            location: 'Campus Canteen',
            isAnonymous: true,
            timestamp: new Date(Date.now() - 172800000).toLocaleString(),
            date: new Date(Date.now() - 172800000).toISOString()
        },
        {
            id: Date.now() - 3000000,
            name: 'Amit Patel',
            email: 'amit@college.edu',
            category: 'hostel',
            severity: 'medium',
            title: 'Broken furniture in hostel rooms',
            description: 'Many rooms have broken beds and tables that need immediate repair. Room maintenance request has not been addressed.',
            location: 'Hostel A',
            isAnonymous: false,
            timestamp: new Date(Date.now() - 259200000).toLocaleString(),
            date: new Date(Date.now() - 259200000).toISOString()
        }
    ];
    
    const existingComplaints = getComplaintsFromStorage();
    const allComplaints = [...sampleComplaints, ...existingComplaints];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allComplaints));
    displayComplaintsFromStorage();
}

// Uncomment the line below to load sample data on first visit (optional)
// if (getComplaintsFromStorage().length === 0) { loadSampleData(); }
