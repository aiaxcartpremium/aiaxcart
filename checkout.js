// Checkout and Order Management
class CheckoutManager {
    constructor() {
        this.orders = DB.getAll(DB_KEYS.ORDERS);
        this.currentOrder = null;
    }

    // Calculate total price based on options
    calculateTotal(basePrice, options) {
        let total = basePrice;
        
        // Add account type price
        if (options.accountType && CONFIG.ACCOUNT_TYPES[options.accountType]) {
            total += CONFIG.ACCOUNT_TYPES[options.accountType].price;
        }
        
        // Add profile type price
        if (options.profileType && CONFIG.PROFILE_TYPES[options.profileType]) {
            total += CONFIG.PROFILE_TYPES[options.profileType].price;
        }
        
        // Apply duration multiplier
        if (options.duration && CONFIG.DURATIONS[options.duration]) {
            total *= CONFIG.DURATIONS[options.duration].multiplier;
        }
        
        return Math.round(total);
    }

    // Create new order
    createOrder(productId, options, paymentMethod, reference) {
        const product = productManager.getProductById(productId);
        if (!product) {
            return { success: false, message: 'Product not found' };
        }

        // Check stock availability
        const availableAccounts = productManager.getAvailableAccounts(
            productId, 
            options.accountType
        );

        if (availableAccounts.length === 0) {
            return { success: false, message: 'No accounts available for this product/type' };
        }

        // Calculate total amount
        const amount = this.calculateTotal(product.basePrice, options);

        // Create order
        const order = {
            userId: authManager.getCurrentUser().id,
            productId: product.id,
            productName: product.name,
            accountType: options.accountType,
            profileType: options.profileType,
            duration: options.duration,
            amount: amount,
            paymentMethod: paymentMethod,
            reference: reference,
            status: 'pending',
            accountId: null, // Will be assigned when delivered
            accountDetails: null, // Will be filled when delivered
            expiresAt: null, // Will be calculated when delivered
            createdAt: new Date().toISOString()
        };

        const newOrder = DB.add(DB_KEYS.ORDERS, order);
        this.orders.push(newOrder);

        // Send notification to admin
        this.sendAdminNotification(newOrder);

        return { 
            success: true, 
            order: newOrder,
            message: 'Order placed successfully! Your account will be delivered after payment confirmation.'
        };
    }

    // Deliver account to user
    deliverOrder(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (!order) {
            return { success: false, message: 'Order not found' };
        }

        if (order.status !== 'pending') {
            return { success: false, message: 'Order already processed' };
        }

        // Find available account
        const availableAccount = productManager.getAvailableAccounts(
            order.productId,
            order.accountType
        )[0];

        if (!availableAccount) {
            return { success: false, message: 'No accounts available for delivery' };
        }

        // Calculate expiration date
        const expiresAt = this.calculateExpirationDate(order.duration);

        // Update account status
        productManager.updateAccountStatus(availableAccount.id, 'sold');

        // Update order with account details
        const updates = {
            status: 'delivered',
            accountId: availableAccount.id,
            accountDetails: {
                email: availableAccount.email,
                password: availableAccount.password,
                profile: availableAccount.profile,
                pin: availableAccount.pin
            },
            expiresAt: expiresAt,
            deliveredAt: new Date().toISOString()
        };

        const updatedOrder = DB.update(DB_KEYS.ORDERS, orderId, updates);
        
        // Update local orders array
        const orderIndex = this.orders.findIndex(o => o.id === orderId);
        if (orderIndex !== -1) {
            this.orders[orderIndex] = updatedOrder;
        }

        // Send notification to user
        this.sendUserNotification(updatedOrder);

        return { 
            success: true, 
            order: updatedOrder,
            message: 'Account delivered successfully!'
        };
    }

    // Calculate expiration date based on duration
    calculateExpirationDate(duration) {
        const now = new Date();
        switch (duration) {
            case '7d':
                return new Date(now.setDate(now.getDate() + 7)).toISOString();
            case '14d':
                return new Date(now.setDate(now.getDate() + 14)).toISOString();
            case '1m':
                return new Date(now.setMonth(now.getMonth() + 1)).toISOString();
            case '3m':
                return new Date(now.setMonth(now.getMonth() + 3)).toISOString();
            case '6m':
                return new Date(now.setMonth(now.getMonth() + 6)).toISOString();
            case '12m':
                return new Date(now.setMonth(now.getMonth() + 12)).toISOString();
            default:
                return new Date(now.setDate(now.getDate() + 30)).toISOString();
        }
    }

    // Get orders for current user
    getUserOrders() {
        if (!authManager.isLoggedIn()) return [];
        
        const userOrders = this.orders.filter(order => 
            order.userId === authManager.getCurrentUser().id
        );

        return userOrders.map(order => {
            const isExpired = order.expiresAt && new Date(order.expiresAt) < new Date();
            const status = isExpired ? 'expired' : order.status;
            return { ...order, status };
        });
    }

    // Get all orders (for admin)
    getAllOrders() {
        return this.orders.map(order => {
            const user = DB.findOne(DB_KEYS.USERS, { id: order.userId });
            const isExpired = order.expiresAt && new Date(order.expiresAt) < new Date();
            const status = isExpired ? 'expired' : order.status;
            
            return {
                ...order,
                userName: user ? user.name : 'Unknown User',
                userEmail: user ? user.email : 'Unknown Email',
                status
            };
        });
    }

    // Get order by ID
    getOrderById(id) {
        return this.orders.find(order => order.id === id);
    }

    // Send notification to admin (simulated)
    sendAdminNotification(order) {
        const message = `New order received!\n\nOrder #${order.id}\nProduct: ${order.productName}\nAmount: ${CONFIG.CURRENCY}${order.amount}\nPayment: ${order.paymentMethod}\nReference: ${order.reference}`;
        
        console.log('ADMIN NOTIFICATION:', message);
        // In a real app, you would integrate with EmailJS, Twilio, etc.
        // this.sendEmail(CONFIG.ADMIN_EMAIL, 'New Order Received', message);
        // this.sendSMS(CONFIG.SUPPORT_PHONE, message);
    }

    // Send notification to user (simulated)
    sendUserNotification(order) {
        if (order.status === 'delivered') {
            const message = `Your account is ready!\n\nOrder #${order.id}\nProduct: ${order.productName}\nAccount details have been delivered to your account page.`;
            
            console.log('USER NOTIFICATION:', message);
            // In a real app, send email/SMS to user
            // const user = DB.findOne(DB_KEYS.USERS, { id: order.userId });
            // if (user) {
            //     this.sendEmail(user.email, 'Your Account is Ready!', message);
            // }
        }
    }

    // Get active accounts for current user
    getUserActiveAccounts() {
        const userOrders = this.getUserOrders();
        return userOrders.filter(order => 
            order.status === 'delivered' && 
            order.expiresAt && 
            new Date(order.expiresAt) > new Date()
        );
    }

    // Get expired accounts for current user
    getUserExpiredAccounts() {
        const userOrders = this.getUserOrders();
        return userOrders.filter(order => 
            order.status === 'expired' || 
            (order.expiresAt && new Date(order.expiresAt) <= new Date())
        );
    }
}

// Create global checkout manager instance
const checkoutManager = new CheckoutManager();
