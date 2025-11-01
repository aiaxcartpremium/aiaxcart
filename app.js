// Main Application Controller
class AiaxcartApp {
    constructor() {
        this.currentPage = 'home';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadCurrentPage();
        this.updateAuthUI();
        
        // Load modals
        this.loadModals();
    }

    setupEventListeners() {
        // Navigation
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('nav-link')) {
                e.preventDefault();
                const page = e.target.getAttribute('data-page');
                this.navigateTo(page);
            }
        });

        // Category filters
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('category-btn')) {
                const category = e.target.getAttribute('data-category');
                this.filterProducts(category);
            }
        });

        // Modal handling
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('close-modal') || 
                e.target.classList.contains('modal')) {
                this.closeAllModals();
            }
        });

        // Auth buttons
        document.getElementById('login-btn').addEventListener('click', () => {
            if (authManager.isLoggedIn()) {
                this.handleLogout();
            } else {
                this.showModal('login');
            }
        });

        document.getElementById('my-account-btn').addEventListener('click', () => {
            this.handleMyAccountClick();
        });

        // Close modals with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    }

    navigateTo(page) {
        this.currentPage = page;
        this.loadCurrentPage();
        
        // Update active nav link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-page="${page}"]`).classList.add('active');
    }

    loadCurrentPage() {
        const main = document.querySelector('main');
        
        switch (this.currentPage) {
            case 'home':
                this.loadHomePage();
                break;
            case 'accounts':
                this.loadAccountsPage();
                break;
            case 'feedback':
                this.loadFeedbackPage();
                break;
            case 'admin':
                this.loadAdminPage();
                break;
            default:
                this.loadHomePage();
        }
    }

    loadHomePage() {
        const main = document.querySelector('main');
        main.innerHTML = `
            <div id="home-page" class="page active">
                <section class="hero">
                    <h1>Premium Accounts at Affordable Prices</h1>
                    <p>Get access to premium streaming, gaming, and software accounts with our reliable service. Instant delivery after payment!</p>
                </section>

                <section>
                    <div class="categories">
                        <button class="category-btn active" data-category="all">All</button>
                        <button class="category-btn" data-category="streaming">Streaming</button>
                        <button class="category-btn" data-category="gaming">Gaming</button>
                        <button class="category-btn" data-category="software">Software</button>
                    </div>

                    <div class="products-grid" id="products-container">
                        <!-- Products will be loaded by JavaScript -->
                    </div>
                </section>
            </div>
        `;

        this.renderProducts();
        this.setupCategoryListeners();
    }

    loadAccountsPage() {
        if (!authManager.isLoggedIn()) {
            this.showModal('login');
            this.navigateTo('home');
            return;
        }

        const main = document.querySelector('main');
        main.innerHTML = `
            <div id="accounts-page" class="page active">
                <h1>My Accounts</h1>
                <div class="account-tabs">
                    <div class="account-tab active" data-tab="active">Active Accounts</div>
                    <div class="account-tab" data-tab="orders">Order History</div>
                    <div class="account-tab" data-tab="reports">Reports</div>
                    <div class="account-tab" data-tab="profile">Profile</div>
                </div>

                <div class="account-content active" id="active-accounts">
                    <!-- Active accounts will be loaded here -->
                </div>

                <div class="account-content" id="order-history">
                    <!-- Order history will be loaded here -->
                </div>

                <div class="account-content" id="reports">
                    <!-- Reports will be loaded here -->
                </div>

                <div class="account-content" id="profile">
                    <!-- Profile will be loaded here -->
                </div>
            </div>
        `;

        this.loadAccountTabs();
        this.setupAccountTabListeners();
    }

    loadFeedbackPage() {
        const main = document.querySelector('main');
        main.innerHTML = `
            <div id="feedback-page" class="page active">
                <h1>Customer Feedback</h1>
                <div class="feedback-section">
                    <div class="feedback-form">
                        <h3>Leave Your Feedback</h3>
                        <div class="form-group">
                            <label for="feedback-message">Your Message</label>
                            <textarea id="feedback-message" class="form-control" rows="4" placeholder="Share your experience with us"></textarea>
                        </div>
                        <div class="form-group">
                            <label for="feedback-image">Upload Image (Required)</label>
                            <input type="file" id="feedback-image" class="form-control" accept="image/*">
                            <img id="feedback-image-preview" class="feedback-image-preview" src="" alt="Preview">
                        </div>
                        <button class="btn btn-primary" id="submit-feedback">Submit Feedback</button>
                    </div>

                    <div class="feedback-list" id="feedback-list">
                        <!-- Feedback items will be loaded here -->
                    </div>
                </div>
            </div>
        `;

        this.setupFeedbackListeners();
        this.renderFeedback();
    }

    loadAdminPage() {
        if (!authManager.isAdmin()) {
            alert('Access denied. Admin only.');
            this.navigateTo('home');
            return;
        }

        const main = document.querySelector('main');
        main.innerHTML = `
            <div id="admin-page" class="page active">
                <h1>Admin Panel</h1>
                <div class="admin-panel">
                    <div class="admin-tabs">
                        <div class="admin-tab active" data-tab="dashboard">Dashboard</div>
                        <div class="admin-tab" data-tab="products">Products</div>
                        <div class="admin-tab" data-tab="accounts">Account Stock</div>
                        <div class="admin-tab" data-tab="orders">Orders</div>
                        <div class="admin-tab" data-tab="sales">Sales History</div>
                    </div>

                    <div class="admin-content active" id="admin-dashboard">
                        <!-- Dashboard content will be loaded here -->
                    </div>

                    <div class="admin-content" id="admin-products">
                        <!-- Products management will be loaded here -->
                    </div>

                    <div class="admin-content" id="admin-accounts">
                        <!-- Account stock will be loaded here -->
                    </div>

                    <div class="admin-content" id="admin-orders">
                        <!-- Orders management will be loaded here -->
                    </div>

                    <div class="admin-content" id="admin-sales">
                        <!-- Sales history will be loaded here -->
                    </div>
                </div>
            </div>
        `;

        this.loadAdminDashboard();
        this.setupAdminTabListeners();
    }

    // ... (other methods for rendering products, handling modals, etc.)

    renderProducts(category = 'all') {
        const container = document.getElementById('products-container');
        if (!container) return;

        const products = productManager.getProductsByCategory(category);
        
        if (products.length === 0) {
            container.innerHTML = '<p class="no-products">No products found in this category.</p>';
            return;
        }

        container.innerHTML = products.map(product => `
            <div class="product-card">
                <div class="product-image">
                    ${product.image || this.getProductIcon(product.category)}
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p>${product.description}</p>
                    <div class="product-price">${CONFIG.CURRENCY}${product.basePrice}</div>
                    <div class="product-stock">Stock: ${product.stock}</div>
                    <button class="btn btn-primary checkout-btn" data-id="${product.id}">
                        Checkout
                    </button>
                </div>
            </div>
        `).join('');

        // Add event listeners to checkout buttons
        container.querySelectorAll('.checkout-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const productId = parseInt(btn.getAttribute('data-id'));
                this.openCheckout(productId);
            });
        });
    }

    getProductIcon(category) {
        const icons = {
            streaming: '📺',
            gaming: '🎮',
            software: '💻'
        };
        return icons[category] || '📦';
    }

    filterProducts(category) {
        // Update active category button
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');

        this.renderProducts(category);
    }

    setupCategoryListeners() {
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const category = e.target.getAttribute('data-category');
                this.filterProducts(category);
            });
        });
    }

    updateAuthUI() {
        const loginBtn = document.getElementById('login-btn');
        const myAccountBtn = document.getElementById('my-account-btn');

        if (authManager.isLoggedIn()) {
            loginBtn.textContent = 'Logout';
            myAccountBtn.textContent = authManager.isAdmin() ? 'Admin Panel' : 'My Account';
        } else {
            loginBtn.textContent = 'Login';
            myAccountBtn.textContent = 'My Account';
        }
    }

    handleMyAccountClick() {
        if (authManager.isLoggedIn()) {
            if (authManager.isAdmin()) {
                this.navigateTo('admin');
            } else {
                this.navigateTo('accounts');
            }
        } else {
            this.showModal('login');
        }
    }

    handleLogout() {
        if (confirm('Are you sure you want to logout?')) {
            authManager.logout();
            this.updateAuthUI();
            this.navigateTo('home');
            alert('You have been logged out successfully.');
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

    loadModals() {
        const modalsContainer = document.getElementById('modals-container');
        modalsContainer.innerHTML = `
            <!-- Login Modal -->
            <div class="modal" id="login-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Login</h2>
                        <button class="close-modal">&times;</button>
                    </div>
                    <form id="login-form">
                        <div class="form-group">
                            <label for="login-email">Email</label>
                            <input type="email" id="login-email" class="form-control" placeholder="Enter your email" required>
                        </div>
                        <div class="form-group">
                            <label for="login-password">Password</label>
                            <input type="password" id="login-password" class="form-control" placeholder="Enter your password" required>
                        </div>
                        <div class="form-group">
                            <label for="login-role">Login as:</label>
                            <select id="login-role" class="form-control">
                                <option value="user">User</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <button type="submit" class="btn btn-primary" style="width: 100%;">Login</button>
                    </form>
                    <p style="text-align: center; margin-top: 1rem;">Don't have an account? <a href="#" id="show-register">Register here</a></p>
                </div>
            </div>

            <!-- Register Modal -->
            <div class="modal" id="register-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Register</h2>
                        <button class="close-modal">&times;</button>
                    </div>
                    <form id="register-form">
                        <div class="form-group">
                            <label for="register-name">Full Name</label>
                            <input type="text" id="register-name" class="form-control" placeholder="Enter your full name" required>
                        </div>
                        <div class="form-group">
                            <label for="register-email">Email</label>
                            <input type="email" id="register-email" class="form-control" placeholder="Enter your email" required>
                        </div>
                        <div class="form-group">
                            <label for="register-password">Password</label>
                            <input type="password" id="register-password" class="form-control" placeholder="Create a password" required>
                        </div>
                        <button type="submit" class="btn btn-primary" style="width: 100%;">Register</button>
                    </form>
                    <p style="text-align: center; margin-top: 1rem;">Already have an account? <a href="#" id="show-login">Login here</a></p>
                </div>
            </div>

            <!-- Checkout Modal -->
            <div class="modal" id="checkout-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Checkout</h2>
                        <button class="close-modal">&times;</button>
                    </div>
                    <div id="checkout-product-info">
                        <!-- Product info will be dynamically generated -->
                    </div>
                    
                    <div class="checkout-options">
                        <div class="option-group">
                            <div class="option-title">Account Type</div>
                            <div class="option-buttons">
                                <button class="option-btn active" data-option="shared" data-price="0">Shared</button>
                                <button class="option-btn" data-option="solo" data-price="100">Solo (+₱100)</button>
                            </div>
                        </div>
                        
                        <div class="option-group">
                            <div class="option-title">Account/Profile</div>
                            <div class="option-buttons">
                                <button class="option-btn active" data-option="account" data-price="0">Account</button>
                                <button class="option-btn" data-option="profile" data-price="50">Profile (+₱50)</button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="option-group">
                        <div class="option-title">Duration</div>
                        <div class="option-buttons">
                            <button class="option-btn" data-option="7d" data-price="0">7 Days</button>
                            <button class="option-btn" data-option="14d" data-price="50">14 Days (+₱50)</button>
                            <button class="option-btn active" data-option="1m" data-price="100">1 Month (+₱100)</button>
                            <button class="option-btn"
