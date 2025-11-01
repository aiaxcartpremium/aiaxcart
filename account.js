// User Account Management
class AccountManager {
    constructor() {
        this.reports = [];
    }

    // Get user account summary
    getUserSummary() {
        if (!authManager.isLoggedIn()) return null;

        const userOrders = checkoutManager.getUserOrders();
        const activeAccounts = checkoutManager.getUserActiveAccounts();
        const expiredAccounts = checkoutManager.getUserExpiredAccounts();
        const totalSpent = userOrders
            .filter(order => order.status === 'delivered')
            .reduce((sum, order) => sum + order.amount, 0);

        return {
            totalOrders: userOrders.length,
            activeAccounts: activeAccounts.length,
            expiredAccounts: expiredAccounts.length,
            totalSpent: totalSpent,
            memberSince: authManager.getCurrentUser().createdAt
        };
    }

    // Get user orders with pagination
    getUserOrdersPaginated(page = 1, limit = 10) {
        const userOrders = checkoutManager.getUserOrders();
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;

        return {
            orders: userOrders.slice(startIndex, endIndex),
            total: userOrders.length,
            page: page,
            totalPages: Math.ceil(userOrders.length / limit)
        };
    }

    // Submit a report for an account
    submitReport(orderId, issue) {
        if (!authManager.isLoggedIn()) {
            return { success: false, message: 'Please login to submit a report' };
        }

        const order = checkoutManager.getOrderById(orderId);
        if (!order || order.userId !== authManager.getCurrentUser().id) {
            return { success: false, message: 'Order not found' };
        }

        if (order.status !== 'delivered') {
            return { success: false, message: 'Can only report issues for delivered accounts' };
        }

        const report = {
            id: this.reports.length + 1,
            orderId: orderId,
            userId: authManager.getCurrentUser().id,
            userName: authManager.getCurrentUser().name,
            productName: order.productName,
            issue: issue,
            status: 'open',
            createdAt: new Date().toISOString()
        };

        this.reports.push(report);
        // In a real app, save to database
        // DB.add('reports', report);

        // Notify admin about the report
        this.notifyAdminAboutReport(report);

        return { success: true, message: 'Report submitted successfully' };
    }

    // Get user reports
    getUserReports() {
        if (!authManager.isLoggedIn()) return [];
        return this.reports.filter(report => report.userId === authManager.getCurrentUser().id);
    }

    // Change user password
    changePassword(currentPassword, newPassword) {
        if (!authManager.isLoggedIn()) {
            return { success: false, message: 'Not logged in' };
        }

        const user = authManager.getCurrentUser();
        const users = DB.getAll(DB_KEYS.USERS);

        // Find user in database
        const userIndex = users.findIndex(u => u.id === user.id);
        if (userIndex === -1) {
            return { success: false, message: 'User not found' };
        }

        // Verify current password
        if (users[userIndex].password !== currentPassword) {
            return { success: false, message: 'Current password is incorrect' };
        }

        // Update password
        users[userIndex].password = newPassword;
        DB.saveAll(DB_KEYS.USERS, users);

        // Update current user in auth manager
        authManager.currentUser.password = newPassword;
        authManager.saveCurrentUser();

        return { success: true, message: 'Password changed successfully' };
    }

    // Update user profile
    updateProfile(updates) {
        if (!authManager.isLoggedIn()) {
            return { success: false, message: 'Not logged in' };
        }

        const user = authManager.getCurrentUser();
        const users = DB.getAll(DB_KEYS.USERS);

        const userIndex = users.findIndex(u => u.id === user.id);
        if (userIndex === -1) {
            return { success: false, message: 'User not found' };
        }

        // Update user data
        users[userIndex] = { ...users[userIndex], ...updates };
        DB.saveAll(DB_KEYS.USERS, users);

        // Update current user in auth manager
        authManager.currentUser = { ...authManager.currentUser, ...updates };
        authManager.saveCurrentUser();

        return { success: true, message: 'Profile updated successfully' };
    }

    // Get account usage statistics
    getAccountUsage() {
        const activeAccounts = checkoutManager.getUserActiveAccounts();
        const usageStats = {};

        activeAccounts.forEach(account => {
            const productName = account.productName;
            if (!usageStats[productName]) {
                usageStats[productName] = {
                    productName: productName,
                    count: 0,
                    totalValue: 0,
                    expiresSoon: 0
                };
            }

            usageStats[productName].count++;
            usageStats[productName].totalValue += account.amount;

            // Check if expires in less than 7 days
            const daysUntilExpiry = Math.ceil(
                (new Date(account.expiresAt) - new Date()) / (1000 * 60 * 60 * 24)
            );
            if (daysUntilExpiry <= 7) {
                usageStats[productName].expiresSoon++;
            }
        });

        return Object.values(usageStats);
    }

    // Notify admin about report (simulated)
    notifyAdminAboutReport(report) {
        const message = `New account issue reported!\n\nReport #${report.id}\nProduct: ${report.productName}\nUser: ${report.userName}\nIssue: ${report.issue}`;
        
        console.log('ADMIN REPORT NOTIFICATION:', message);
        // In a real app, send notification to admin
    }

    // Check for expiring accounts
    getExpiringAccounts(daysThreshold = 7) {
        const activeAccounts = checkoutManager.getUserActiveAccounts();
        const now = new Date();
        const thresholdDate = new Date(now.setDate(now.getDate() + daysThreshold));

        return activeAccounts.filter(account => 
            new Date(account.expiresAt) <= thresholdDate
        );
    }
}

// Create global account manager instance
const accountManager = new AccountManager();
