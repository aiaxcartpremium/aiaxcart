// Authentication Management
class AuthManager {
    constructor() {
        this.currentUser = null;
        this.loadCurrentUser();
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
    
    login(email, password, role = 'user') {
        const users = DB.getAll(DB_KEYS.USERS);
        
        // Check for admin login
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
        
        // Check for regular user
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
        
        // Check if user already exists
        if (users.find(u => u.email === email)) {
            return { success: false, message: 'User with this email already exists' };
        }
        
        // Create new user
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
    
    logout() {
        this.currentUser = null;
        this.saveCurrentUser();
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
}

// Create global auth instance
const authManager = new AuthManager();
