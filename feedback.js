// Feedback Manager
class FeedbackManager {
    constructor() {
        this.setupFeedbackListeners();
        this.loadFeedbackPage();
    }

    setupFeedbackListeners() {
        // Submit feedback button
        const submitFeedback = document.getElementById('submit-feedback');
        if (submitFeedback) {
            submitFeedback.addEventListener('click', () => {
                this.handleSubmitFeedback();
            });
        }

        // Feedback image preview
        const feedbackImage = document.getElementById('feedback-image');
        if (feedbackImage) {
            feedbackImage.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        document.getElementById('feedback-image-preview').src = e.target.result;
                        document.getElementById('feedback-image-preview').style.display = 'block';
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
    }

    loadFeedbackPage() {
        this.renderFeedback();
    }

    handleSubmitFeedback() {
        if (!authManager.isLoggedIn()) {
            alert('Please login to submit feedback.');
            return;
        }
        
        const message = document.getElementById('feedback-message').value;
        const imageFile = document.getElementById('feedback-image').files[0];
        
        if (!message) {
            alert('Please enter your feedback message.');
            return;
        }
        
        if (!imageFile) {
            alert('Please upload an image with your feedback.');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const feedback = {
                userId: authManager.getCurrentUser().id,
                userName: authManager.getCurrentUser().name,
                message,
                image: e.target.result,
                createdAt: new Date().toISOString()
            };
            
            DB.add(DB_KEYS.FEEDBACK, feedback);
            this.renderFeedback();
            
            // Clear form
            document.getElementById('feedback-message').value = '';
            document.getElementById('feedback-image').value = '';
            document.getElementById('feedback-image-preview').style.display = 'none';
            
            alert('Feedback submitted successfully!');
        };
        reader.readAsDataURL(imageFile);
    }

    renderFeedback() {
        const container = document.getElementById('feedback-list');
        if (!container) return;

        const feedback = DB.getAll(DB_KEYS.FEEDBACK);
        
        if (feedback.length === 0) {
            container.innerHTML = '<p class="no-data">No feedback yet. Be the first to share your experience!</p>';
            return;
        }
        
        container.innerHTML = feedback.map(item => `
            <div class="feedback-item">
                <div class="feedback-header">
                    <div class="feedback-author">${item.userName}</div>
                    <div class="feedback-date">${new Date(item.createdAt).toLocaleDateString()}</div>
                </div>
                <div class="feedback-message">${item.message}</div>
                <img src="${item.image}" class="feedback-image" alt="Feedback image">
            </div>
        `).join('');
    }
}

// Initialize feedback manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('feedback.html')) {
        window.feedbackManager = new FeedbackManager();
    }
});