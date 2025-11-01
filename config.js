// Configuration and Constants
const CONFIG = {
    APP_NAME: 'Aiaxcart Premium Shop',
    ADMIN_EMAIL: 'shanaiamau99@gmail.com',
    SUPPORT_EMAIL: 'support@aiaxcart.shop',
    SUPPORT_PHONE: '+63 965 554 4105',
    CURRENCY: '₱',
    
    
    },
    
    // Payment methods
    PAYMENT_METHODS: {
        GCASH: {
            name: 'GCash',
            number: '0962 5544 105 ',
            account: 'Shanaia Maureen Mariano'
        },
        MAYA: {
            name: 'Maya',
            number: '0929 894 3629',
            account: 'Shanaia Maureen Mariano'
        },
        BANK: {
            name: 'Bank Transfer',
            bank: 'MariBank/SeaBank',
            account: '10592147810',
            accountName: 'Shanaia Maureen Mariano'
        }
    },
    
    // Duration options with multipliers
    DURATIONS: {
        '7d': { label: '7 Days', multiplier: 1 },
        '14d': { label: '14 Days', multiplier: 1.2 },
        '1m': { label: '1 Month', multiplier: 1.5 },
        '3m': { label: '3 Months', multiplier: 2 },
        '6m': { label: '6 Months', multiplier: 3 },
        '12m': { label: '12 Months', multiplier: 5 }
    },
    
    // Account types with price adjustments
    ACCOUNT_TYPES: {
        'shared': { label: 'Shared', price: 0 },
        'solo': { label: 'Solo', price: 100 }
    },
    
    // Profile types with price adjustments
    PROFILE_TYPES: {
        'account': { label: 'Account', price: 0 },
        'profile': { label: 'Profile', price: 50 }
    }
};

// Database schema (using localStorage as example)
const DB_KEYS = {
    USERS: 'aiaxcart_users',
    PRODUCTS: 'aiaxcart_products',
    ACCOUNTS: 'aiaxcart_accounts',
    ORDERS: 'aiaxcart_orders',
    FEEDBACK: 'aiaxcart_feedback',
    SETTINGS: 'aiaxcart_settings'
};

// Initialize database
function initializeDatabase() {
    // Initialize users with admin account
    if (!localStorage.getItem(DB_KEYS.USERS)) {
        const adminUser = {
            id: 1,
            name: 'Admin',
            email: 'admin@aiaxcart.com',
            password: 'admin123',
            role: 'admin',
            createdAt: new Date().toISOString()
        };
        localStorage.setItem(DB_KEYS.USERS, JSON.stringify([adminUser]));
    }
    
    // Initialize products if empty
    if (!localStorage.getItem(DB_KEYS.PRODUCTS)) {
        const defaultProducts = [
            {
                id: 1,
                name: 'Netflix Premium',
                category: 'streaming',
                basePrice: 299,
                description: 'Full access to Netflix Premium with 4K streaming',
                image: '📺',
                status: 'active',
                createdAt: new Date().toISOString()
            },
            {
                id: 2,
                name: 'Spotify Premium',
                category: 'streaming',
                basePrice: 199,
                description: 'Ad-free music streaming with offline downloads',
                image: '🎵',
                status: 'active',
                createdAt: new Date().toISOString()
            },
            {
                id: 3,
                name: 'YouTube Premium',
                category: 'streaming',
                basePrice: 249,
                description: 'Ad-free YouTube and YouTube Music',
                image: '📹',
                status: 'active',
                createdAt: new Date().toISOString()
            }
        ];
        localStorage.setItem(DB_KEYS.PRODUCTS, JSON.stringify(defaultProducts));
    }
    
    // Initialize other collections if empty
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

// Database helper functions
const DB = {
    // Get all items from a collection
    getAll: (collection) => {
        const data = localStorage.getItem(collection);
        return data ? JSON.parse(data) : [];
    },
    
    // Save all items to a collection
    saveAll: (collection, items) => {
        localStorage.setItem(collection, JSON.stringify(items));
    },
    
    // Add an item to a collection
    add: (collection, item) => {
        const items = DB.getAll(collection);
        item.id = items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;
        items.push(item);
        DB.saveAll(collection, items);
        return item;
    },
    
    // Update an item in a collection
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
    
    // Remove an item from a collection
    remove: (collection, id) => {
        const items = DB.getAll(collection);
        const filtered = items.filter(item => item.id !== id);
        DB.saveAll(collection, filtered);
        return filtered.length !== items.length;
    },
    
    // Find items by criteria
    find: (collection, criteria) => {
        const items = DB.getAll(collection);
        return items.filter(item => {
            return Object.keys(criteria).every(key => item[key] === criteria[key]);
        });
    },
    
    // Find one item by criteria
    findOne: (collection, criteria) => {
        const items = DB.getAll(collection);
        return items.find(item => {
            return Object.keys(criteria).every(key => item[key] === criteria[key]);
        });
    }
};

// Initialize the database when the config is loaded
initializeDatabase();
