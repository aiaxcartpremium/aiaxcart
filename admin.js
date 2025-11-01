// Admin Manager
class AdminManager {
    constructor() {
        this.checkoutManager = new CheckoutManager();
        this.setupAdminListeners();
        this.loadAdminPage();
    }

    setupAdminListeners() {
        // Admin tabs
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('admin-tab')) {
                const tabName = e.target.getAttribute('data-tab');
                document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
                document.querySelectorAll('.admin-content').forEach(c => c.classList.remove('active'));
                document.getElementById(`admin-${tabName}`).classList.add('active');
                this.loadAdminTab(tabName);
            }
        });

        // Add product button
        const addProductBtn = document.getElementById('add-product-btn');
        if (addProductBtn) {
            addProductBtn.addEventListener('click', () => {
                authManager.showModal('add-product');
            });
        }

        // Add product form
        const addProductForm = document.getElementById('add-product-form');
        if (addProductForm) {
            addProductForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleAddProduct();
            });
        }

        // Add accounts button
        const addAccountBtn = document.getElementById('add-account-btn');
        if (addAccountBtn) {
            addAccountBtn.addEventListener('click', () => {
                this.populateProductDropdown();
                authManager.showModal('add-accounts');
            });
        }

        // Add accounts form
        const addAccountsForm = document.getElementById('add-accounts-form');
        if (addAccountsForm) {
            addAccountsForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleAddAccounts();
            });
        }
    }

    loadAdminPage() {
        if (!authManager.isLoggedIn() || !authManager.isAdmin()) {
            alert('Access denied. Admin only.');
            window.location.href = '../index.html';
            return;
        }

        this.loadAdminTab('dashboard');
    }

    loadAdminTab(tabName) {
        switch (tabName) {
            case 'dashboard':
                this.loadAdminDashboard();
                break;
            case 'products':
                this.loadAdminProducts();
                break;
            case 'accounts':
                this.loadAdminAccounts();
                break;
            case 'orders':
                this.loadAdminOrders();
                break;
            case 'sales':
                this.loadAdminSales();
                break;
        }
    }

    loadAdminDashboard() {
        const container = document.getElementById('admin-stats');
        if (!container) return;

        const orders = this.checkoutManager.orders;
        const products = productManager.products;
        const accounts = productManager.accounts;
        const users = DB.getAll(DB_KEYS.USERS).filter(u => u.role === 'user');

        const today = new Date().toDateString();
        const todayOrders = orders.filter(order => 
            new Date(order.createdAt).toDateString() === today
        );

        const totalSales = orders
            .filter(order => order.status === 'delivered')
            .reduce((sum, order) => sum + order.amount, 0);

        const stats = [
            { number: products.length, label: 'Total Products' },
            { number: users.length, label: 'Total Users' },
            { number: orders.length, label: 'Total Orders' },
            { number: todayOrders.length, label: "Today's Orders" },
            { number: accounts.filter(acc => acc.status === 'available').length, label: 'Available Accounts' },
            { number: accounts.filter(acc => acc.status === 'sold').length, label: 'Sold Accounts' },
            { number: totalSales, label: 'Total Sales', isCurrency: true },
            { number: orders.filter(order => order.status === 'pending').length, label: 'Pending Orders' }
        ];

        container.innerHTML = stats.map(stat => `
            <div class="stat-card">
                <div class="stat-number">
                    ${stat.isCurrency ? CONFIG.CURRENCY : ''}${stat.number}
                </div>
                <div class="stat-label">${stat.label}</div>
            </div>
        `).join('');
    }

    loadAdminProducts() {
        const container = document.getElementById('products-table');
        if (!container) return;

        const products = productManager.getAllProducts();
        
        container.innerHTML = products.map(product => `
            <tr>
                <td>${product.id}</td>
                <td>${product.name}</td>
                <td>${product.category}</td>
                <td>${CONFIG.CURRENCY}${product.basePrice}</td>
                <td>${product.stock}</td>
                <td>
                    <button class="action-btn btn-deliver">Edit</button>
                    <button class="action-btn btn-reject">Delete</button>
                </td>
            </tr>
        `).join('');
    }

    loadAdminAccounts() {
        const container = document.getElementById('accounts-table');
        if (!container) return;

        const accounts = productManager.getAllAccountStock();
        
        container.innerHTML = accounts.map(account => `
            <tr>
                <td>${account.productName}</td>
                <td>${account.type}</td>
                <td>${account.email}</td>
                <td>
                    <span class="account-status status-${account.status}">
                        ${account.status}
                    </span>
                </td>
                <td>
                    <button class="action-btn btn-deliver">Edit</button>
                </td>
            </tr>
        `).join('');
    }

    loadAdminOrders() {
        const container = document.getElementById('orders-table');
        if (!container) return;

        const orders = this.checkoutManager.getAllOrders();
        
        container.innerHTML = orders.map(order => `
            <tr>
                <td>#${order.id}</td>
                <td>${order.productName}</td>
                <td>${order.userName} (${order.userEmail})</td>
                <td>${CONFIG.CURRENCY}${order.amount}</td>
                <td>
                    <span class="order-status status-${order.status}">
                        ${order.status}
                    </span>
                </td>
                <td>
                    ${order.status === 'pending' ? `
                        <button class="action-btn btn-approve deliver-btn" data-order="${order.id}">
                            Deliver
                        </button>
                    ` : ''}
                    <button class="action-btn btn-deliver">View</button>
                </td>
            </tr>
        `).join('');

        // Add event listeners to deliver buttons
        container.querySelectorAll('.deliver-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const orderId = parseInt(btn.getAttribute('data-order'));
                this.deliverOrder(orderId);
            });
        });
    }

    loadAdminSales() {
        const container = document.getElementById('sales-table');
        if (!container) return;

        const orders = this.checkoutManager.getAllOrders().filter(order => 
            order.status === 'delivered' || order.status === 'expired'
        );
        
        container.innerHTML = orders.map(order => `
            <tr>
                <td>${new Date(order.createdAt).toLocaleDateString()}</td>
                <td>#${order.id}</td>
                <td>${order.productName}</td>
                <td>${CONFIG.CURRENCY}${order.amount}</td>
                <td>
                    <span class="order-status status-${order.status}">
                        ${order.status}
                    </span>
                </td>
            </tr>
        `).join('');
    }

    populateProductDropdown() {
        const select = document.getElementById('account-product');
        if (!select) return;

        select.innerHTML = '';
        productManager.products.forEach(product => {
            const option = document.createElement('option');
            option.value = product.id;
            option.textContent = product.name;
            select.appendChild(option);
        });
    }

    handleAddProduct() {
        const name = document.getElementById('product-name').value;
        const category = document.getElementById('product-category').value;
        const price = parseInt(document.getElementById('product-price').value);
        const description = document.getElementById('product-description').value;

        productManager.addProduct({
            name,
            category,
            basePrice: price,
            description
        });

        authManager.closeAllModals();
        alert('Product added successfully!');
        this.loadAdminTab('products');
        
        // Clear form
        document.getElementById('add-product-form').reset();
    }

    handleAddAccounts() {
        const productId = parseInt(document.getElementById('account-product').value);
        const type = document.getElementById('account-type').value;
        const email = document.getElementById('account-email').value;
        const password = document.getElementById('account-password').value;
        const profile = document.getElementById('account-profile').value;
        const pin = document.getElementById('account-pin').value;

        productManager.addAccountStock({
            productId,
            type,
            email,
            password,
            profile,
            pin
        });

        authManager.closeAllModals();
        alert('Account added successfully!');
        this.loadAdminTab('accounts');
        
        // Clear form
        document.getElementById('add-accounts-form').reset();
    }

    deliverOrder(orderId) {
        const result = this.checkoutManager.deliverOrder(orderId);
        if (result.success) {
            alert(result.message);
            this.loadAdminTab('orders');
            this.loadAdminTab('dashboard');
        } else {
            alert(result.message);
        }
    }
}

// Initialize admin manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('admin.html')) {
        window.adminManager = new AdminManager();
    }
});