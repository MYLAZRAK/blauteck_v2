// Language toggle functionality
let currentLanguage = localStorage.getItem('language') || 'en';

function toggleLanguage() {
    currentLanguage = currentLanguage === 'en' ? 'fr' : 'en';
    localStorage.setItem('language', currentLanguage);
    updateContent();
    updateButtonText();
}

function updateContent() {
    const elements = document.querySelectorAll('[data-' + currentLanguage + ']');
    elements.forEach(element => {
        const text = element.getAttribute('data-' + currentLanguage);
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
            element.placeholder = text;
        } else {
            element.innerText = text;
        }
    });
}

function updateButtonText() {
    const btn = document.querySelector('.lang-switch');
    if (btn) {
        btn.innerText = currentLanguage === 'en' ? 'FR' : 'EN';
    }
}

// Initialize language on page load
document.addEventListener('DOMContentLoaded', () => {
    updateContent();
    updateButtonText();
});