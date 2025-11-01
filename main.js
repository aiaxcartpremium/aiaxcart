// Product Manager
class ProductManager {
    constructor() {
        this.products = DB.getAll(DB_KEYS.PRODUCTS);
        this.accounts = DB.getAll(DB_KEYS.ACCOUNTS);
        this.setupProductListeners();
    }
    
    setupProductListeners() {
        // Category filters
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('category-btn')) {
                const category = e.target.getAttribute('data-category');
                this.filterProducts(category);
            }
        });

        // Checkout buttons (will be added after rendering products)
    }
    
    getAllProducts() {
        return this.products.map(product => {
            const stock = this.accounts.filter(acc => 
                acc.productId === product.id && acc.status === 'available'
            ).length;
            return { ...product, stock };
        });
    }
    
    getProductsByCategory(category) {
        const products = this.getAllProducts();
        if (category === 'all') return products;
        return products.filter(product => product.category === category);
    }
    
    getProductById(id) {
        const product = this.products.find(p => p.id === id);
        if (product) {
            const stock = this.accounts.filter(acc => 
                acc.productId === id && acc.status === 'available'
            ).length;
            return { ...product, stock };
        }
        return null;
    }
    
    addProduct(productData) {
        const newProduct = {
            ...productData,
            status: 'active',
            createdAt: new Date().toISOString()
        };
        
        const product = DB.add(DB_KEYS.PRODUCTS, newProduct);
        this.products.push(product);
        return product;
    }
    
    addAccountStock(accountData) {
        const newAccount = {
            ...accountData,
            status: 'available',
            createdAt: new Date().toISOString()
        };
        
        const account = DB.add(DB_KEYS.ACCOUNTS, newAccount);
        this.accounts.push(account);
        return account;
    }
    
    getAvailableAccounts(productId, type = null) {
        return this.accounts.filter(acc => 
            acc.productId === productId && 
            acc.status === 'available' &&
            (!type || acc.type === type)
        );
    }
    
    updateAccountStatus(id, status) {
        return DB.update(DB_KEYS.ACCOUNTS, id, { status });
    }
    
    getAllAccountStock() {
        return this.accounts.map(account => {
            const product = this.products.find(p => p.id === account.productId);
            return { ...account, productName: product ? product.name : 'Unknown' };
        });
    }

    renderProducts(category = 'all') {
        const container = document.getElementById('products-container');
        if (!container) return;

        const products = this.getProductsByCategory(category);
        
        if (products.length === 0) {
            container.innerHTML = '<p class="no-data">No products found in this category.</p>';
            return;
        }

        container.innerHTML = products.map(product => `
            <div class="product-card">
                <div class="product-image">
                    ${this.getProductIcon(product.category)}
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
            educational: '📚',
            editing: '💻'
        };
        return icons[category] || '📦';
    }

    filterProducts(category) {
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');
        this.renderProducts(category);
    }

    openCheckout(productId) {
        if (!authManager.isLoggedIn()) {
            authManager.showModal('login');
            return;
        }

        // Redirect to checkout page with product ID
        window.location.href = `pages/checkout.html?product=${productId}`;
    }
}

// Initialize product manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.productManager = new ProductManager();
    if (document.getElementById('products-container')) {
        productManager.renderProducts();
    }
});