// Configuration
const CONFIG = {
    ADMIN_EMAIL: 'shanaiamau99@gmail.com',
    CURRENCY: '₱'
};

// Database simulation using localStorage
const DB_KEYS = {
    USERS: 'aiaxcart_users',
    PRODUCTS: 'aiaxcart_products',
    ACCOUNTS: 'aiaxcart_accounts',
    ORDERS: 'aiaxcart_orders',
    FEEDBACK: 'aiaxcart_feedback'
};

// Initialize database
function initializeDatabase() {
    if (!localStorage.getItem(DB_KEYS.USERS)) {
        const adminUser = {
            id: 1,
            name: 'Admin',
            email: 'shanaiamau99@gmail.com',
            password: 'Smfmariano',
            role: 'admin',
            createdAt: new Date().toISOString()
        };
        localStorage.setItem(DB_KEYS.USERS, JSON.stringify([adminUser]));
    }
    
    if (!localStorage.getItem(DB_KEYS.PRODUCTS)) {
        const defaultProducts = [
            {
                id: 1,
                name: 'Netflix Premium',
                category: 'streaming',
                basePrice: 160,
                description: 'Full access to Netflix Premium with 4K streaming',
                status: 'active',
                createdAt: new Date().toISOString()
            },
            {
                id: 2,
                name: 'Spotify Premium',
                category: 'streaming',
                basePrice: 60,
                description: 'Ad-free music streaming with offline downloads',
                status: 'active',
                createdAt: new Date().toISOString()
            },
            {
                id: 3,
                name: 'YouTube Premium',
                category: 'streaming',
                basePrice: 50,
                description: 'Ad-free YouTube and YouTube Music',
                status: 'active',
                createdAt: new Date().toISOString()
            }
        ];
        localStorage.setItem(DB_KEYS.PRODUCTS, JSON.stringify(defaultProducts));
    }
    
    if (!localStorage.getItem(DB_KEYS.ACCOUNTS)) {
        localStorage.setItem(DB_KEYS.ACCOUNTS, JSON.stringify([]));
    }
    if (!localStorage.getItem(DB_KEYS.ORDERS)) {
        localStorage.setItem(DB_KEYS.ORDERS, JSON.stringify([]));
    }
    if (!localStorage.getItem(DB_KEYS.FEEDBACK)) {
        localStorage.setItem(DB_KEYS.FEEDBACK, JSON.stringify([]));
    }
}

// Database helper
const DB = {
    getAll: (collection) => {
        const data = localStorage.getItem(collection);
        return data ? JSON.parse(data) : [];
    },
    
    saveAll: (collection, items) => {
        localStorage.setItem(collection, JSON.stringify(items));
    },
    
    add: (collection, item) => {
        const items = DB.getAll(collection);
        item.id = items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;
        items.push(item);
        DB.saveAll(collection, items);
        return item;
    },
    
    update: (collection, id, updates) => {
        const items = DB.getAll(collection);
        const index = items.findIndex(item => item.id === id);
        if (index !== -1) {
            items[index] = { ...items[index], ...updates };
            DB.saveAll(collection, items);
            return items[index];
        }
        return null;
    },
    
    findOne: (collection, criteria) => {
        const items = DB.getAll(collection);
        return items.find(item => {
            return Object.keys(criteria).every(key => item[key] === criteria[key]);
        });
    }
};

// Auth Manager
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.loadCurrentUser();
        this.setupAuthListeners();
    }
    
    loadCurrentUser() {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
        }
    }
    
    saveCurrentUser() {
        if (this.currentUser) {
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        } else {
            localStorage.removeItem('currentUser');
        }
    }
    
    setupAuthListeners() {
        // Login form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        // Register form
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRegister();
            });
        }

        // Login button
        const loginBtn = document.getElementById('login-btn');
        if (loginBtn) {
            loginBtn.addEventListener('click', () => {
                if (this.isLoggedIn()) {
                    this.handleLogout();
                } else {
                    this.showModal('login');
                }
            });
        }

        // My Account button
        const myAccountBtn = document.getElementById('my-account-btn');
        if (myAccountBtn) {
            myAccountBtn.addEventListener('click', () => {
                this.handleMyAccountClick();
            });
        }

        // Modal links
        const showRegister = document.getElementById('show-register');
        if (showRegister) {
            showRegister.addEventListener('click', (e) => {
                e.preventDefault();
                this.closeAllModals();
                this.showModal('register');
            });
        }

        const showLogin = document.getElementById('show-login');
        if (showLogin) {
            showLogin.addEventListener('click', (e) => {
                e.preventDefault();
                this.closeAllModals();
                this.showModal('login');
            });
        }

        // Close modals
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('close-modal') || 
                e.target.classList.contains('modal')) {
                this.closeAllModals();
            }
        });

        // Escape key to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    }
    
    handleLogin() {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const role = document.getElementById('login-role').value;

        const result = this.login(email, password, role);
        
        if (result.success) {
            this.closeAllModals();
            this.updateAuthUI();
            alert('Login successful!');
            
            // Redirect based on role
            if (this.isAdmin()) {
                window.location.href = 'pages/admin.html';
            } else {
                window.location.href = 'pages/accounts.html';
            }
        } else {
            alert(result.message);
        }
    }
    
    handleRegister() {
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;

        const result = this.register(name, email, password);
        
        if (result.success) {
            this.closeAllModals();
            this.updateAuthUI();
            alert('Registration successful! You are now logged in.');
            window.location.href = 'pages/accounts.html';
        } else {
            alert(result.message);
        }
    }
    
    login(email, password, role = 'user') {
        const users = DB.getAll(DB_KEYS.USERS);
        
        if (role === 'admin' && email === CONFIG.ADMIN_EMAIL && password === 'admin123') {
            this.currentUser = {
                id: 0,
                name: 'Admin',
                email: CONFIG.ADMIN_EMAIL,
                role: 'admin'
            };
            this.saveCurrentUser();
            return { success: true, user: this.currentUser };
        }
        
        const user = users.find(u => u.email === email && u.password === password);
        if (user) {
            this.currentUser = user;
            this.saveCurrentUser();
            return { success: true, user };
        }
        
        return { success: false, message: 'Invalid email or password' };
    }
    
    register(name, email, password) {
        const users = DB.getAll(DB_KEYS.USERS);
        
        if (users.find(u => u.email === email)) {
            return { success: false, message: 'User with this email already exists' };
        }
        
        const newUser = {
            name,
            email,
            password,
            role: 'user',
            createdAt: new Date().toISOString()
        };
        
        const user = DB.add(DB_KEYS.USERS, newUser);
        this.currentUser = user;
        this.saveCurrentUser();
        
        return { success: true, user };
    }
    
    handleLogout() {
        if (confirm('Are you sure you want to logout?')) {
            this.logout();
            this.updateAuthUI();
            alert('You have been logged out successfully.');
            window.location.href = 'index.html';
        }
    }
    
    logout() {
        this.currentUser = null;
        this.saveCurrentUser();
    }
    
    handleMyAccountClick() {
        if (this.isLoggedIn()) {
            if (this.isAdmin()) {
                window.location.href = 'pages/admin.html';
            } else {
                window.location.href = 'pages/accounts.html';
            }
        } else {
            this.showModal('login');
        }
    }
    
    isLoggedIn() {
        return this.currentUser !== null;
    }
    
    isAdmin() {
        return this.currentUser && this.currentUser.role === 'admin';
    }
    
    getCurrentUser() {
        return this.currentUser;
    }
    
    updateAuthUI() {
        const loginBtn = document.getElementById('login-btn');
        const myAccountBtn = document.getElementById('my-account-btn');

        if (loginBtn && myAccountBtn) {
            if (this.isLoggedIn()) {
                loginBtn.textContent = 'Logout';
                myAccountBtn.textContent = this.isAdmin() ? 'Admin Panel' : 'My Account';
            } else {
                loginBtn.textContent = 'Login';
                myAccountBtn.textContent = 'My Account';
            }
        }
    }
    
    showModal(modalType) {
        this.closeAllModals();
        const modal = document.getElementById(`${modalType}-modal`);
        if (modal) {
            modal.style.display = 'flex';
        }
    }
    
    closeAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    }
}

// Initialize the auth manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeDatabase();
    window.authManager = new AuthManager();
});