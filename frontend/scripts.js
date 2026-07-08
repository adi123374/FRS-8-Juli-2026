// Global state
let currentUser = null;
let currentPage = 'dashboard';

// Initialize app
window.addEventListener('load', () => {
    checkSession();
    updateTime();
    setInterval(updateTime, 1000);
});

// Check if user is logged in
function checkSession() {
    const userSession = localStorage.getItem('userSession');
    
    if (!userSession) {
        window.location.href = 'login.html';
        return;
    }

    try {
        currentUser = JSON.parse(userSession);
        initializeApp();
    } catch (error) {
        localStorage.removeItem('userSession');
        window.location.href = 'login.html';
    }
}

// Initialize app UI
function initializeApp() {
    // Set user info in sidebar
    document.getElementById('userName').textContent = currentUser.name;
    document.getElementById('userRole').textContent = `(${currentUser.role})`;

    // Build navigation menu based on role
    buildNavMenu();

    // Load dashboard by default
    loadDashboard();
}

// Build navigation menu based on user role
function buildNavMenu() {
    const navMenu = document.getElementById('navMenu');
    navMenu.innerHTML = '';

    const menuItems = {
        'Maker': [
            { label: 'Dashboard', id: 'dashboard', icon: '📊' },
            { label: 'Payment Order', id: 'paymentOrder', icon: '📋' },
            { label: 'Payment Request', id: 'paymentRequest', icon: '💰' },
            { label: 'My Requests', id: 'myRequests', icon: '📑' },
            { label: 'Profile', id: 'profile', icon: '👤' }
        ],
        'Manager': [
            { label: 'Dashboard', id: 'dashboard', icon: '📊' },
            { label: 'Approvals', id: 'approvals', icon: '✅' },
            { label: 'Payment Order', id: 'paymentOrder', icon: '📋' },
            { label: 'Payment Request', id: 'paymentRequest', icon: '💰' },
            { label: 'Reports', id: 'reports', icon: '📈' },
            { label: 'Profile', id: 'profile', icon: '👤' }
        ],
        'Director': [
            { label: 'Dashboard', id: 'dashboard', icon: '📊' },
            { label: 'Approvals', id: 'approvals', icon: '✅' },
            { label: 'Reports', id: 'reports', icon: '📈' },
            { label: 'Finance Overview', id: 'financeOverview', icon: '💼' },
            { label: 'Settings', id: 'settings', icon: '⚙️' },
            { label: 'Profile', id: 'profile', icon: '👤' }
        ],
        'Finance': [
            { label: 'Dashboard', id: 'dashboard', icon: '📊' },
            { label: 'Payments', id: 'payments', icon: '💵' },
            { label: 'Reports', id: 'reports', icon: '📈' },
            { label: 'Bank Accounts', id: 'bankAccounts', icon: '🏦' },
            { label: 'Settings', id: 'settings', icon: '⚙️' },
            { label: 'Profile', id: 'profile', icon: '👤' }
        ],
        'Admin': [
            { label: 'Dashboard', id: 'dashboard', icon: '📊' },
            { label: 'Users', id: 'users', icon: '👥' },
            { label: 'Categories', id: 'categories', icon: '📁' },
            { label: 'Bank Accounts', id: 'bankAccounts', icon: '🏦' },
            { label: 'Settings', id: 'settings', icon: '⚙️' },
            { label: 'Logs', id: 'logs', icon: '📋' },
            { label: 'Profile', id: 'profile', icon: '👤' }
        ]
    };

    const items = menuItems[currentUser.role] || menuItems['Maker'];

    items.forEach(item => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = '#';
        a.textContent = `${item.icon} ${item.label}`;
        a.onclick = (e) => {
            e.preventDefault();
            loadPage(item.id);
        };
        li.appendChild(a);
        navMenu.appendChild(li);
    });
}

// Load page content
function loadPage(pageId) {
    currentPage = pageId;
    const contentArea = document.getElementById('contentArea');
    const pageTitle = document.getElementById('pageTitle');

    // Update active menu
    document.querySelectorAll('.sidebar-nav a').forEach(a => {
        a.classList.remove('active');
    });
    event.target.closest('a').classList.add('active');

    // Update page title
    const menuText = event.target.closest('a').textContent.trim();
    pageTitle.textContent = menuText;

    // Load content based on page
    switch (pageId) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'paymentOrder':
            loadPaymentOrder();
            break;
        case 'paymentRequest':
            loadPaymentRequest();
            break;
        case 'approvals':
            loadApprovals();
            break;
        case 'payments':
            loadPayments();
            break;
        case 'settings':
            loadSettings();
            break;
        case 'users':
            loadUsers();
            break;
        case 'profile':
            loadProfile();
            break;
        default:
            contentArea.innerHTML = '<p>Halaman tidak ditemukan</p>';
    }
}

// Load Dashboard
function loadDashboard() {
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = `
        <div class="grid">
            <div class="stat-card">
                <div class="stat-number" id="totalRequests">0</div>
                <div class="stat-label">Total Requests</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="pendingApproval">0</div>
                <div class="stat-label">Pending Approval</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="approvedRequests">0</div>
                <div class="stat-label">Approved</div>
            </div>
            <div class="stat-card">
                <div class="stat-number" id="paidRequests">0</div>
                <div class="stat-label">Paid</div>
            </div>
        </div>

        <div class="card">
            <div class="card-header">
                <h3 class="card-title">Recent Requests</h3>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Request No</th>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody id="recentRequestsTable">
                    <tr><td colspan="6" style="text-align: center;">Loading...</td></tr>
                </tbody>
            </table>
        </div>
    `;

    // Fetch dashboard data
    google.script.run.withSuccessHandler(onDashboardLoaded).getDashboardSummary(currentUser.email);
}

function onDashboardLoaded(response) {
    if (response.success) {
        const data = response.data;
        document.getElementById('totalRequests').textContent = data.totalRequests;
        document.getElementById('pendingApproval').textContent = data.pendingApproval;
        document.getElementById('approvedRequests').textContent = data.approvedRequests;
        document.getElementById('paidRequests').textContent = data.paidRequests;
    }
}

// Load Payment Order
function loadPaymentOrder() {
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">Create Payment Order</h3>
            </div>
            <form id="poForm">
                <div class="form-group">
                    <label>Request Number</label>
                    <input type="text" name="requestNo" required>
                </div>
                <div class="form-group">
                    <label>Request Date</label>
                    <input type="date" name="requestDate" required>
                </div>
                <div class="form-group">
                    <label>Department</label>
                    <input type="text" name="department" required>
                </div>
                <div class="form-group">
                    <label>Currency</label>
                    <select name="currency" required>
                        <option value="">Select Currency</option>
                        <option value="IDR">IDR</option>
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Total Amount</label>
                    <input type="number" name="totalAmount" required>
                </div>
                <button type="submit" class="btn btn-primary">Create Order</button>
            </form>
        </div>
    `;

    document.getElementById('poForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = {
            requestNo: formData.get('requestNo'),
            requestDate: formData.get('requestDate'),
            requestEmail: currentUser.email,
            requestName: currentUser.name,
            department: formData.get('department'),
            currency: formData.get('currency'),
            totalAmount: parseFloat(formData.get('totalAmount'))
        };
        google.script.run.withSuccessHandler((response) => {
            if (response.success) {
                showToast('PO created successfully', 'success');
                e.target.reset();
            } else {
                showToast(response.message, 'error');
            }
        }).createPaymentOrder(data);
    });
}

// Load Payment Request
function loadPaymentRequest() {
    loadPaymentOrder(); // Same form as PO for now
}

// Load Approvals
function loadApprovals() {
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">Pending Approvals</h3>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Request No</th>
                        <th>Department</th>
                        <th>Amount</th>
                        <th>Submitted</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody id="approvalsTable">
                    <tr><td colspan="5" style="text-align: center;">Loading...</td></tr>
                </tbody>
            </table>
        </div>
    `;

    google.script.run.withSuccessHandler((response) => {
        if (response.success) {
            const tbody = document.getElementById('approvalsTable');
            if (response.data.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">No pending approvals</td></tr>';
            } else {
                tbody.innerHTML = response.data.map(req => `
                    <tr>
                        <td>${req.requestNo}</td>
                        <td>${req.department}</td>
                        <td>${req.totalAmount}</td>
                        <td>${req.createdAt}</td>
                        <td>
                            <button class="btn btn-primary" onclick="viewRequest('${req.requestId}')">View</button>
                        </td>
                    </tr>
                `).join('');
            }
        }
    }).getPendingApprovals(currentUser.email);
}

// Load Payments
function loadPayments() {
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = `
        <div class="card">
            <table>
                <thead>
                    <tr>
                        <th>Payment No</th>
                        <th>Amount</th>
                        <th>Bank</th>
                        <th>Status</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    <tr><td colspan="5" style="text-align: center;">No payments yet</td></tr>
                </tbody>
            </table>
        </div>
    `;
}

// Load Settings
function loadSettings() {
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">System Settings</h3>
            </div>
            <p>Settings panel - Configure system parameters</p>
        </div>
    `;
}

// Load Users
function loadUsers() {
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">User Management</h3>
                <button class="btn btn-primary" style="float: right;">Add User</button>
            </div>
            <table id="usersTable">
                <thead>
                    <tr>
                        <th>Email</th>
                        <th>Name</th>
                        <th>Role</th>
                        <th>Department</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    <tr><td colspan="6" style="text-align: center;">Loading...</td></tr>
                </tbody>
            </table>
        </div>
    `;

    google.script.run.withSuccessHandler((response) => {
        if (response.success) {
            const tbody = document.getElementById('usersTable').getElementsByTagName('tbody')[0];
            tbody.innerHTML = response.data.map(user => `
                <tr>
                    <td>${user.email}</td>
                    <td>${user.name}</td>
                    <td><span class="badge badge-primary">${user.role}</span></td>
                    <td>${user.department}</td>
                    <td><span class="badge ${user.status === 'Active' ? 'badge-success' : 'badge-danger'}">${user.status}</span></td>
                    <td>
                        <button class="btn btn-secondary" style="padding: 5px 10px; font-size: 12px;">Edit</button>
                    </td>
                </tr>
            `).join('');
        }
    }).listAllUsers(currentUser.email);
}

// Load Profile
function loadProfile() {
    const contentArea = document.getElementById('contentArea');
    contentArea.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h3 class="card-title">My Profile</h3>
            </div>
            <div style="padding: 20px;">
                <p><strong>Email:</strong> ${currentUser.email}</p>
                <p><strong>Name:</strong> ${currentUser.name}</p>
                <p><strong>Role:</strong> ${currentUser.role}</p>
                <button class="btn btn-primary" onclick="showChangePasswordForm()">Change Password</button>
            </div>
        </div>
    `;
}

// View Request Details
function viewRequest(requestId) {
    google.script.run.withSuccessHandler((response) => {
        if (response.success) {
            showModal(`
                <h2>${response.header.requestNo}</h2>
                <p><strong>Department:</strong> ${response.header.department}</p>
                <p><strong>Amount:</strong> ${response.header.totalAmount}</p>
                <p><strong>Status:</strong> ${response.header.status}</p>
                <h3>Items</h3>
                <table style="font-size: 12px;">
                    <thead>
                        <tr>
                            <th>Description</th>
                            <th>Qty</th>
                            <th>Unit Price</th>
                            <th>Amount</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${response.details.map(d => `
                            <tr>
                                <td>${d.description}</td>
                                <td>${d.qty}</td>
                                <td>${d.unitPrice}</td>
                                <td>${d.amount}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            `);
        }
    }).getRequestDetails(requestId);
}

// Show Password Change Form
function showChangePasswordForm() {
    showModal(`
        <h2>Change Password</h2>
        <form id="changePasswordForm">
            <div class="form-group">
                <label>Old Password</label>
                <input type="password" name="oldPassword" required>
            </div>
            <div class="form-group">
                <label>New Password</label>
                <input type="password" name="newPassword" required>
            </div>
            <div class="form-group">
                <label>Confirm Password</label>
                <input type="password" name="confirmPassword" required>
            </div>
            <button type="submit" class="btn btn-primary">Change Password</button>
        </form>
    `);

    document.getElementById('changePasswordForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const newPassword = document.querySelector('input[name="newPassword"]').value;
        const confirmPassword = document.querySelector('input[name="confirmPassword"]').value;
        
        if (newPassword !== confirmPassword) {
            showToast('Passwords do not match', 'error');
            return;
        }

        const oldPassword = document.querySelector('input[name="oldPassword"]').value;
        google.script.run.withSuccessHandler((response) => {
            if (response.success) {
                showToast('Password changed successfully', 'success');
                closeModal();
            } else {
                showToast(response.message, 'error');
            }
        }).changePassword(currentUser.email, oldPassword, newPassword);
    });
}

// Logout
function logoutUser() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('userSession');
        window.location.href = 'login.html';
    }
}

// Toggle Sidebar (Mobile)
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('show');
}

// Show Modal
function showModal(content) {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = content;
    modal.classList.remove('hidden');
    modal.classList.add('show');
}

// Close Modal
function closeModal() {
    const modal = document.getElementById('modal');
    modal.classList.add('hidden');
    modal.classList.remove('show');
}

// Show Toast
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.remove('hidden');
    
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

// Update time display
function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('id-ID');
    const dateString = now.toLocaleDateString('id-ID');
    document.getElementById('currentTime').textContent = `${dateString} ${timeString}`;
}