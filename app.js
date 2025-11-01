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
                            <button class="option-btn" data-option="3m" data-price="250">3 Months (+₱250)</button>
                            <button class="option-btn" data-option="6m" data-price="450">6 Months (+₱450)</button>
                            <button class="option-btn" data-option="12m" data-price="800">12 Months (+₱800)</button>
                        </div>
                    </div>
                    
                    <div class="total-amount" id="checkout-total">
                        Total: ₱0
                    </div>
                    
                    <div class="payment-method">
                        <div class="option-title">Payment Method</div>
                        <select id="payment-method" class="form-control">
                            <option value="gcash">GCash</option>
                            <option value="paypal">PayPal</option>
                            <option value="bank">Bank Transfer</option>
                        </select>
                        
                        <div class="payment-option active" id="gcash-details">
                            <p>Send payment to: <strong>${CONFIG.PAYMENT_METHODS.GCASH.number}</strong></p>
                            <p>Account Name: <strong>${CONFIG.PAYMENT_METHODS.GCASH.account}</strong></p>
                            <div class="form-group">
                                <label for="gcash-reference">Reference Number</label>
                                <input type="text" id="gcash-reference" class="form-control" placeholder="Enter reference number">
                            </div>
                            <div class="form-group">
                                <label for="gcash-receipt">Upload Receipt (Optional)</label>
                                <input type="file" id="gcash-receipt" class="form-control" accept="image/*">
                            </div>
                        </div>
                        
                        <div class="payment-option" id="paypal-details">
                            <p>Send payment to: <strong>${CONFIG.PAYMENT_METHODS.PAYPAL.email}</strong></p>
                            <div class="form-group">
                                <label for="paypal-reference">Transaction ID</label>
                                <input type="text" id="paypal-reference" class="form-control" placeholder="Enter transaction ID">
                            </div>
                            <div class="form-group">
                                <label for="paypal-receipt">Upload Receipt (Optional)</label>
                                <input type="file" id="paypal-receipt" class="form-control" accept="image/*">
                            </div>
                        </div>
                        
                        <div class="payment-option" id="bank-details">
                            <p>Bank: <strong>${CONFIG.PAYMENT_METHODS.BANK.bank}</strong></p>
                            <p>Account Number: <strong>${CONFIG.PAYMENT_METHODS.BANK.account}</strong></p>
                            <p>Account Name: <strong>${CONFIG.PAYMENT_METHODS.BANK.accountName}</strong></p>
                            <div class="form-group">
                                <label for="bank-reference">Reference Number</label>
                                <input type="text" id="bank-reference" class="form-control" placeholder="Enter reference number">
                            </div>
                            <div class="form-group">
                                <label for="bank-receipt">Upload Receipt (Optional)</label>
                                <input type="file" id="bank-receipt" class="form-control" accept="image/*">
                            </div>
                        </div>
                    </div>
                    
                    <button class="btn btn-primary" style="width: 100%;" id="confirm-checkout">Confirm Checkout</button>
                </div>
            </div>

            <!-- Add Product Modal -->
            <div class="modal" id="add-product-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Add New Product</h2>
                        <button class="close-modal">&times;</button>
                    </div>
                    <form id="add-product-form">
                        <div class="form-group">
                            <label for="product-name">Product Name</label>
                            <input type="text" id="product-name" class="form-control" placeholder="Enter product name" required>
                        </div>
                        <div class="form-group">
                            <label for="product-category">Category</label>
                            <select id="product-category" class="form-control" required>
                                <option value="streaming">Streaming</option>
                                <option value="gaming">Gaming</option>
                                <option value="software">Software</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="product-price">Base Price (₱)</label>
                            <input type="number" id="product-price" class="form-control" placeholder="Enter base price" required>
                        </div>
                        <div class="form-group">
                            <label for="product-description">Description</label>
                            <textarea id="product-description" class="form-control" rows="3" placeholder="Enter product description"></textarea>
                        </div>
                        <button type="submit" class="btn btn-primary" style="width: 100%;">Add Product</button>
                    </form>
                </div>
            </div>

            <!-- Add Accounts Modal -->
            <div class="modal" id="add-accounts-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Add Account Stock</h2>
                        <button class="close-modal">&times;</button>
                    </div>
                    <form id="add-accounts-form">
                        <div class="form-group">
                            <label for="account-product">Product</label>
                            <select id="account-product" class="form-control" required>
                                <!-- Products will be dynamically populated -->
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="account-type">Account Type</label>
                            <select id="account-type" class="form-control" required>
                                <option value="shared">Shared</option>
                                <option value="solo">Solo</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="account-email">Email/Username</label>
                            <input type="text" id="account-email" class="form-control" placeholder="Enter email or username" required>
                        </div>
                        <div class="form-group">
                            <label for="account-password">Password</label>
                            <input type="text" id="account-password" class="form-control" placeholder="Enter password" required>
                        </div>
                        <div class="form-group">
                            <label for="account-profile">Profile (Optional)</label>
                            <input type="text" id="account-profile" class="form-control" placeholder="Enter profile name">
                        </div>
                        <div class="form-group">
                            <label for="account-pin">PIN (Optional)</label>
                            <input type="text" id="account-pin" class="form-control" placeholder="Enter PIN">
                        </div>
                        <button type="submit" class="btn btn-primary" style="width: 100%;">Add Account</button>
                    </form>
                </div>
            </div>

            <!-- Report Modal -->
            <div class="modal" id="report-modal">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>Report Issue</h2>
                        <button class="close-modal">&times;</button>
                    </div>
                    <form id="report-form">
                        <div class="form-group">
                            <label for="report-account">Select Account</label>
                            <select id="report-account" class="form-control" required>
                                <!-- Active accounts will be dynamically populated -->
                            </select>
                        </div>
                        <div class="form-group">
                            <label for="report-issue">Issue Description</label>
                            <textarea id="report-issue" class="form-control" rows="4" placeholder="Describe the issue you're experiencing" required></textarea>
                        </div>
                        <button type="submit" class="btn btn-primary" style="width: 100%;">Submit Report</button>
                    </form>
                </div>
            </div>
        `;

        this.setupModalListeners();
    }

    setupModalListeners() {
        // Login form
        document.getElementById('login-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Register form
        document.getElementById('register-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister();
        });

        // Show register link
        document.getElementById('show-register').addEventListener('click', (e) => {
            e.preventDefault();
            this.closeAllModals();
            this.showModal('register');
        });

        // Show login link
        document.getElementById('show-login').addEventListener('click', (e) => {
            e.preventDefault();
            this.closeAllModals();
            this.showModal('login');
        });

        // Checkout options
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('option-btn')) {
                const group = e.target.parentElement;
                group.querySelectorAll('.option-btn').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                this.updateCheckoutTotal();
            }
        });

        // Payment method change
        document.getElementById('payment-method').addEventListener('change', (e) => {
            const method = e.target.value;
            document.querySelectorAll('.payment-option').forEach(option => {
                option.classList.remove('active');
            });
            document.getElementById(`${method}-details`).classList.add('active');
        });

        // Confirm checkout
        document.getElementById('confirm-checkout').addEventListener('click', () => {
            this.handleCheckout();
        });

        // Add product form
        document.getElementById('add-product-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAddProduct();
        });

        // Add accounts form
        document.getElementById('add-accounts-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleAddAccounts();
        });
    }

    openCheckout(productId) {
        if (!authManager.isLoggedIn()) {
            this.showModal('login');
            return;
        }

        const product = productManager.getProductById(productId);
        if (!product) return;

        this.currentProduct = product;

        // Update checkout modal with product info
        document.getElementById('checkout-product-info').innerHTML = `
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <div class="product-price">Base Price: ${CONFIG.CURRENCY}${product.basePrice}</div>
        `;

        // Reset options
        document.querySelectorAll('.option-btn').forEach(btn => {
            if (btn.parentElement.querySelector('.option-btn.active') === null) {
                btn.classList.add('active');
            }
        });

        this.updateCheckoutTotal();
        this.showModal('checkout');
    }

    updateCheckoutTotal() {
        if (!this.currentProduct) return;

        let total = this.currentProduct.basePrice;

        // Add option prices
        document.querySelectorAll('.option-buttons').forEach(group => {
            const activeBtn = group.querySelector('.option-btn.active');
            if (activeBtn) {
                const price = parseInt(activeBtn.getAttribute('data-price')) || 0;
                total += price;
            }
        });

        document.getElementById('checkout-total').textContent = `Total: ${CONFIG.CURRENCY}${total}`;
    }

    handleCheckout() {
        if (!authManager.isLoggedIn() || !this.currentProduct) return;

        // Get selected options
        const accountType = document.querySelector('[data-option="shared"], [data-option="solo"].active').getAttribute('data-option');
        const profileType = document.querySelector('[data-option="account"], [data-option="profile"].active').getAttribute('data-option');
        const duration = document.querySelector('.option-group:last-child .option-btn.active').getAttribute('data-option');

        // Get payment details
        const paymentMethod = document.getElementById('payment-method').value;
        let referenceField;
        if (paymentMethod === 'gcash') referenceField = document.getElementById('gcash-reference');
        else if (paymentMethod === 'paypal') referenceField = document.getElementById('paypal-reference');
        else referenceField = document.getElementById('bank-reference');

        if (!referenceField.value) {
            alert('Please enter the reference number for your payment.');
            return;
        }

        const options = {
            accountType,
            profileType,
            duration
        };

        const result = checkoutManager.createOrder(
            this.currentProduct.id,
            options,
            paymentMethod,
            referenceField.value
        );

        if (result.success) {
            this.closeAllModals();
            alert(result.message);
            
            // Refresh products to update stock
            this.renderProducts();
        } else {
            alert(result.message);
        }
    }

    handleLogin() {
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const role = document.getElementById('login-role').value;

        const result = authManager.login(email, password, role);
        
        if (result.success) {
            this.closeAllModals();
            this.updateAuthUI();
            alert('Login successful!');
            
            // Redirect based on role
            if (authManager.isAdmin()) {
                this.navigateTo('admin');
            }
        } else {
            alert(result.message);
        }
    }

    handleRegister() {
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;

        const result = authManager.register(name, email, password);
        
        if (result.success) {
            this.closeAllModals();
            this.updateAuthUI();
            alert('Registration successful! You are now logged in.');
        } else {
            alert(result.message);
        }
    }

    handleAddProduct() {
        const name = document.getElementById('product-name').value;
        const category = document.getElementById('product-category').value;
        const price = parseInt(document.getElementById('product-price').value);
        const description = document.getElementById('product-description').value;

        const product = productManager.addProduct({
            name,
            category,
            basePrice: price,
            description
        });

        this.closeAllModals();
        alert('Product added successfully!');
        
        // Refresh admin products table if on admin page
        if (this.currentPage === 'admin') {
            this.loadAdminProducts();
        }
    }

    handleAddAccounts() {
        const productId = parseInt(document.getElementById('account-product').value);
        const type = document.getElementById('account-type').value;
        const email = document.getElementById('account-email').value;
        const password = document.getElementById('account-password').value;
        const profile = document.getElementById('account-profile').value;
        const pin = document.getElementById('account-pin').value;

        const account = productManager.addAccountStock({
            productId,
            type,
            email,
            password,
            profile,
            pin
        });

        this.closeAllModals();
        alert('Account added successfully!');
        
        // Refresh admin accounts table if on admin page
        if (this.currentPage === 'admin') {
            this.loadAdminAccounts();
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.aiaxcartApp = new AiaxcartApp();
});
