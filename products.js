// Product Management
class ProductManager {
    constructor() {
        this.products = DB.getAll(DB_KEYS.PRODUCTS);
        this.accounts = DB.getAll(DB_KEYS.ACCOUNTS);
    }
    
    // Get all products with stock count
    getAllProducts() {
        return this.products.map(product => {
            const stock = this.accounts.filter(acc => 
                acc.productId === product.id && acc.status === 'available'
            ).length;
            return { ...product, stock };
        });
    }
    
    // Get products by category
    getProductsByCategory(category) {
        const products = this.getAllProducts();
        if (category === 'all') return products;
        return products.filter(product => product.category === category);
    }
    
    // Get product by ID
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
    
    // Add new product
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
    
    // Update product
    updateProduct(id, updates) {
        const product = DB.update(DB_KEYS.PRODUCTS, id, updates);
        if (product) {
            const index = this.products.findIndex(p => p.id === id);
            if (index !== -1) {
                this.products[index] = product;
            }
        }
        return product;
    }
    
    // Add account stock
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
    
    // Get available accounts for product
    getAvailableAccounts(productId, type = null) {
        let query = { productId, status: 'available' };
        if (type) query.type = type;
        
        return this.accounts.filter(acc => 
            acc.productId === productId && 
            acc.status === 'available' &&
            (!type || acc.type === type)
        );
    }
    
    // Get account by ID
    getAccountById(id) {
        return this.accounts.find(acc => acc.id === id);
    }
    
    // Update account status
    updateAccountStatus(id, status) {
        const account = DB.update(DB_KEYS.ACCOUNTS, id, { status });
        if (account) {
            const index = this.accounts.findIndex(acc => acc.id === id);
            if (index !== -1) {
                this.accounts[index] = account;
            }
        }
        return account;
    }
    
    // Get all account stock with product info
    getAllAccountStock() {
        return this.accounts.map(account => {
            const product = this.products.find(p => p.id === account.productId);
            return { ...account, productName: product ? product.name : 'Unknown' };
        });
    }
}

// Create global product manager instance
const productManager = new ProductManager();
