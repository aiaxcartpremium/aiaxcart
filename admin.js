// Admin Panel Management
class AdminManager {
    constructor() {
        this.stats = this.calculateStats();
    }

    // Calculate dashboard statistics
    calculateStats() {
        const orders = DB.getAll(DB_KEYS.ORDERS);
        const products = DB.getAll(DB_KEYS.PRODUCTS);
        const accounts = DB.getAll(DB_KEYS.ACCOUNTS);
        const users = DB.getAll(DB_KEYS.USERS).filter(u => u.role === 'user');

        const today = new Date().toDateString();
        const todayOrders = orders.filter(order => 
            new Date(order.createdAt).toDateString() === today
        );

        const totalSales = orders
            .filter(order => order.status === 'delivered')
            .reduce((sum, order) => sum + order.amount, 0);

        return {
            totalProducts: products.length,
            totalUsers: users.length,
            totalOrders: orders.length,
            todayOrders: todayOrders.length,
            availableAccounts: accounts.filter(acc => acc.status === 'available').length,
            soldAccounts: accounts.filter(acc => acc.status === 'sold').length,
            totalSales: totalSales,
            pendingOrders: orders.filter(order => order.status === 'pending').length
        };
    }

    // Get sales history
    getSalesHistory(days = 30) {
        const orders = DB.getAll(DB_KEYS.ORDERS);
        const history = [];
        
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateString = date.toDateString();
            
            const dayOrders = orders.filter(order => 
                new Date(order.createdAt).toDateString() === dateString &&
                order.status === 'delivered'
            );
            
            const sales = dayOrders.reduce((sum, order) => sum + order.amount, 0);
            
            history.push({
                date: dateString,
                orders: dayOrders.length,
                sales: sales
            });
        }
        
        return history;
    }

    // Get popular products
    getPopularProducts() {
        const orders = DB.getAll(DB_KEYS.ORDERS);
        const productStats = {};
        
        orders.forEach(order => {
            if (!productStats[order.productId]) {
                productStats[order.productId] = {
                    productName: order.productName,
                    orders: 0,
                    sales: 0
                };
            }
            productStats[order.productId].orders++;
            productStats[order.productId].sales += order.amount;
        });
        
        return Object.values(productStats)
            .sort((a, b) => b.orders - a.orders)
            .slice(0, 5);
    }

    // Add bulk accounts
    addBulkAccounts(productId, accountType, accountsData) {
        const results = {
            success: 0,
            failed: 0,
            errors: []
        };

        accountsData.forEach(accountData => {
            try {
                const account = {
                    productId: parseInt(productId),
                    type: accountType,
                    email: accountData.email,
                    password: accountData.password,
                    profile: accountData.profile || '',
                    pin: accountData.pin || ''
                };

                productManager.addAccountStock(account);
                results.success++;
            } catch (error) {
                results.failed++;
                results.errors.push(`Failed to add account: ${accountData.email}`);
            }
        });

        return results;
    }

    // Update product
    updateProduct(productId, updates) {
        return productManager.updateProduct(productId, updates);
    }

    // Delete product
    deleteProduct(productId) {
        // Check if product has accounts
        const productAccounts = productManager.accounts.filter(
            acc => acc.productId === productId
        );

        if (productAccounts.length > 0) {
            return { 
                success: false, 
                message: 'Cannot delete product with existing accounts. Delete accounts first.' 
            };
        }

        const success = DB.remove(DB_KEYS.PRODUCTS, productId);
        if (success) {
            productManager.products = productManager.products.filter(
                p => p.id !== productId
            );
            return { success: true, message: 'Product deleted successfully' };
        }

        return { success: false, message: 'Failed to delete product' };
    }

    // Get low stock products
    getLowStockProducts(threshold = 5) {
        const products = productManager.getAllProducts();
        return products.filter(product => product.stock < threshold);
    }

    // Export data (for backup)
    exportData() {
        const data = {
            products: DB.getAll(DB_KEYS.PRODUCTS),
            accounts: DB.getAll(DB_KEYS.ACCOUNTS),
            orders: DB.getAll(DB_KEYS.ORDERS),
            users: DB.getAll(DB_KEYS.USERS),
            feedback: DB.getAll(DB_KEYS.FEEDBACK),
            exportDate: new Date().toISOString()
        };

        return JSON.stringify(data, null, 2);
    }

    // Import data (for restore)
    importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            
            if (data.products) DB.saveAll(DB_KEYS.PRODUCTS, data.products);
            if (data.accounts) DB.saveAll(DB_KEYS.ACCOUNTS, data.accounts);
            if (data.orders) DB.saveAll(DB_KEYS.ORDERS, data.orders);
            if (data.users) DB.saveAll(DB_KEYS.USERS, data.users);
            if (data.feedback) DB.saveAll(DB_KEYS.FEEDBACK, data.feedback);
            
            // Reload managers
            productManager.products = DB.getAll(DB_KEYS.PRODUCTS);
            productManager.accounts = DB.getAll(DB_KEYS.ACCOUNTS);
            checkoutManager.orders = DB.getAll(DB_KEYS.ORDERS);
            
            return { success: true, message: 'Data imported successfully' };
        } catch (error) {
            return { success: false, message: 'Failed to import data: ' + error.message };
        }
    }
}

// Create global admin manager instance
const adminManager = new AdminManager();
