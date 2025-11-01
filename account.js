// Account Manager
class AccountManager {
    constructor() {
        this.checkoutManager = new CheckoutManager();
        this.setupAccountListeners();
        this.loadAccountPage();
    }

    setupAccountListeners() {
        // Account tabs
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('account-tab')) {
                const tabName = e.target.getAttribute('data-tab');
                document.querySelectorAll('.account-tab').forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                document.querySelectorAll('.account-content').forEach(c => c.classList.remove('active'));
                document.getElementById(`${tabName}-accounts`).classList.add('active');
                this.loadAccountTab(tabName);
            }
        });

        // Report form
        const reportForm = document.getElementById('report-form');
        if (reportForm) {
            reportForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSubmitReport();
            });
        }
    }

    loadAccountPage() {
        if (!authManager.isLoggedIn()) {
            alert('Please login to view your accounts');
            window.location.href = '../index.html';
            return;
        }

        this.loadAccountTab('active');
    }

    loadAccountTab(tabName) {
        switch (tabName) {
            case 'active':
                this.loadActiveAccounts();
                break;
            case 'orders':
                this.loadOrderHistory();
                break;
            case 'reports':
                this.loadReports();
                break;
            case 'profile':
                this.loadProfile();
                break;
        }
    }

    loadActiveAccounts() {
        const container = document.getElementById('active-accounts');
        if (!container) return;

        const activeAccounts = this.checkoutManager.getUserOrders().filter(order => 
            order.status === 'delivered' && 
            order.expiresAt && 
            new Date(order.expiresAt) > new Date()
        );
        
        if (activeAccounts.length === 0) {
            container.innerHTML = '<div class="no-data">No active accounts found</div>';
            return;
        }
        
        container.innerHTML = activeAccounts.map(account => `
            <div class="account-card">
                <div class="account-header">
                    <h4>${account.productName}</h4>
                    <span class="account-status status-active">Active</span>
                </div>
                <div class="account-expiry">
                    Expires: ${new Date(account.expiresAt).toLocaleDateString()}
                </div>
                <div class="account-details">
                    <h4>Account Details:</h4>
                    <p><strong>Email:</strong> ${account.accountDetails.email}</p>
                    <p><strong>Password:</strong> ${account.accountDetails.password}</p>
                    ${account.accountDetails.profile ? `<p><strong>Profile:</strong> ${account.accountDetails.profile}</p>` : ''}
                    ${account.accountDetails.pin ? `<p><strong>PIN:</strong> ${account.accountDetails.pin}</p>` : ''}
                </div>
                <button class="btn btn-outline report-btn" data-order="${account.id}">
                    Report Issue
                </button>
            </div>
        `).join('');

        // Add event listeners to report buttons
        container.querySelectorAll('.report-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const orderId = parseInt(btn.getAttribute('data-order'));
                this.openReportModal(orderId);
            });
        });
    }

    loadOrderHistory() {
        const container = document.getElementById('order-history');
        if (!container) return;

        const orders = this.checkoutManager.getUserOrders();
        
        if (orders.length === 0) {
            container.innerHTML = '<div class="no-data">No order history found</div>';
            return;
        }
        
        container.innerHTML = orders.map(order => `
            <div class="order-card">
                <div class="order-header">
                    <div class="order-id">Order #${order.id}</div>
                    <span class="order-status status-${order.status}">${order.status}</span>
                </div>
                <p><strong>Product:</strong> ${order.productName}</p>
                <p><strong>Type:</strong> ${order.accountType} ${order.profileType}</p>
                <p><strong>Duration:</strong> ${order.duration}</p>
                <p><strong>Amount:</strong> ${CONFIG.CURRENCY}${order.amount}</p>
                <p><strong>Payment:</strong> ${order.paymentMethod}</p>
                <p><strong>Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
                ${order.deliveredAt ? `<p><strong>Delivered:</strong> ${new Date(order.deliveredAt).toLocaleDateString()}</p>` : ''}
            </div>
        `).join('');
    }

    loadReports() {
        const container = document.getElementById('reports');
        if (!container) return;

        // For now, show placeholder - you can implement reports functionality
        container.innerHTML = `
            <div class="no-data">
                <p>No reports submitted yet.</p>
                <p>Click "Report Issue" on any active account to submit a report.</p>
            </div>
        `;
    }

    loadProfile() {
        const container = document.getElementById('profile');
        if (!container) return;

        const user = authManager.getCurrentUser();
        const orders = this.checkoutManager.getUserOrders();
        const totalSpent = orders
            .filter(order => order.status === 'delivered')
            .reduce((sum, order) => sum + order.amount, 0);

        container.innerHTML = `
            <div class="account-card">
                <h3>Profile Information</h3>
                <div class="profile-info">
                    <p><strong>Name:</strong> ${user.name}</p>
                    <p><strong>Email:</strong> ${user.email}</p>
                    <p><strong>Member since:</strong> ${new Date(user.createdAt).toLocaleDateString()}</p>
                    <p><strong>Total Orders:</strong> ${orders.length}</p>
                    <p><strong>Total Spent:</strong> ${CONFIG.CURRENCY}${totalSpent}</p>
                </div>
            </div>
        `;
    }

    openReportModal(orderId) {
        const order = this.checkoutManager.getUserOrders().find(o => o.id === orderId);
        if (!order) return;

        // Populate account dropdown
        const accountSelect = document.getElementById('report-account');
        accountSelect.innerHTML = `<option value="${order.id}">${order.productName} (Order #${order.id})</option>`;

        // Show modal
        authManager.showModal('report');
    }

    handleSubmitReport() {
        const accountSelect = document.getElementById('report-account');
        const issueText = document.getElementById('report-issue');

        if (!accountSelect.value || !issueText.value) {
            alert('Please fill in all fields');
            return;
        }

        const orderId = parseInt(accountSelect.value);
        const issue = issueText.value;

        // Here you would typically save the report to your database
        console.log('Report submitted:', { orderId, issue });
        
        alert('Report submitted successfully! We will review your issue soon.');
        authManager.closeAllModals();
        
        // Clear form
        issueText.value = '';
    }
}

// Initialize account manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('accounts.html')) {
        window.accountManager = new AccountManager();
    }
});