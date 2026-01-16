// ==========================================
// JOB DETAIL PAGE - JavaScript
// ==========================================

// Global Variables
let currentJob = null;
let allJobs = [];

// ==========================================
// INITIALIZATION
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    initializePage();
});

async function initializePage() {
    // Load jobs data
    await loadJobsData();
    
    // Get job ID from URL
    const jobId = getJobIdFromURL();
    
    if (jobId) {
        loadJobDetails(jobId);
    } else {
        showJobNotFound();
    }
    
    // Initialize language
    updateLanguage();
    updateLangButton();
    
    // Initialize event listeners
    initializeEventListeners();
    
    // Initialize scroll effects
    initializeScrollEffects();
    
    // Initialize character counter
    initializeCharCounter();
}

// ==========================================
// DATA LOADING
// ==========================================

async function loadJobsData() {
    try {
        const response = await fetch('data/jobs.json');
        if (!response.ok) {
            throw new Error('Failed to load jobs data');
        }
        allJobs = await response.json();
    } catch (error) {
        console.error('Error loading jobs:', error);
        showError('Failed to load job data. Please try again later.');
    }
}

function getJobIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('jobId');
}

function loadJobDetails(jobId) {
    currentJob = allJobs.find(job => job.jobId === jobId);
    
    if (currentJob) {
        populateJobDetails();
        checkDeadline();
    } else {
        showJobNotFound();
    }
}

// ==========================================
// POPULATE JOB DETAILS
// ==========================================

function populateJobDetails() {
    const lang = localStorage.getItem('language') || 'en';
    
    // Update page title
    document.title = `${currentJob.title[lang]} - TechRecruit`;
    
    // Breadcrumb and Title
    document.getElementById('job-detail-breadcrumb').textContent = currentJob.title[lang];
    document.getElementById('job-detail-title').textContent = currentJob.title[lang];
    
    // Subtitle with job type
    const subtitle = document.getElementById('job-detail-subtitle');
    subtitle.textContent = `${currentJob.type[lang]} • ${currentJob.location[lang]}`;
    
    // Meta Information
    populateJobMeta();
    
    // Tags
    populateTags();
    
    // Description, Requirements, Benefits
    document.getElementById('job-detail-description').innerHTML = currentJob.description[lang];
    document.getElementById('job-detail-requirements').innerHTML = currentJob.requirements[lang];
    document.getElementById('job-detail-benefits').innerHTML = currentJob.benefits[lang];
    
    // Sidebar Info
    populateSidebarInfo();
    
    // Apply Modal Title
    document.getElementById('apply-modal-job-title').textContent = currentJob.title[lang];
    
    // Nationality Question
    handleNationalityQuestion();
    
    // Share content
    updateShareContent();
}

function populateJobMeta() {
    const lang = localStorage.getItem('language') || 'en';
    const metaContainer = document.getElementById('job-detail-meta');
    
    const salaryOrRate = currentJob.salary || currentJob.rate;
    const salaryLabel = currentJob.salary ? 
        (lang === 'en' ? 'Salary' : 'Salaire') : 
        (lang === 'en' ? 'Rate' : 'Taux');
    
    metaContainer.innerHTML = `
        <div class="job-meta-item">
            <i class="bi bi-file-earmark-text"></i>
            <span>${currentJob.type[lang]}</span>
        </div>
        <div class="job-meta-item">
            <i class="bi bi-currency-euro"></i>
            <span>${salaryOrRate}</span>
        </div>
        <div class="job-meta-item">
            <i class="bi bi-geo-alt"></i>
            <span>${currentJob.location[lang]}</span>
        </div>
        <div class="job-meta-item">
            <i class="bi bi-calendar"></i>
            <span>${lang === 'en' ? 'Start:' : 'Début:'} ${currentJob.start[lang]}</span>
        </div>
        <div class="job-meta-item">
            <i class="bi bi-house"></i>
            <span>${currentJob.mode[lang]}</span>
        </div>
        <div class="job-meta-item">
            <i class="bi bi-clock"></i>
            <span>${lang === 'en' ? 'Posted:' : 'Publié:'} ${currentJob.posted[lang]}</span>
        </div>
    `;
}

function populateTags() {
    const tagsContainer = document.getElementById('job-detail-tags');
    tagsContainer.innerHTML = currentJob.tags.map(tag => 
        `<span class="job-tag">${tag}</span>`
    ).join('');
}

function populateSidebarInfo() {
    const lang = localStorage.getItem('language') || 'en';
    const infoContainer = document.getElementById('job-info-list');
    
    const salaryOrRate = currentJob.salary || currentJob.rate;
    const salaryLabel = currentJob.salary ? 
        (lang === 'en' ? 'Salary' : 'Salaire') : 
        (lang === 'en' ? 'Daily Rate' : 'Taux Journalier');
    
    const deadlineDate = new Date(currentJob.lastDateToApply);
    const formattedDeadline = deadlineDate.toLocaleDateString(lang === 'en' ? 'en-US' : 'fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    infoContainer.innerHTML = `
        <div class="job-info-item">
            <i class="bi bi-briefcase"></i>
            <div>
                <div class="label" data-en="Job Type" data-fr="Type de Contrat">${lang === 'en' ? 'Job Type' : 'Type de Contrat'}</div>
                <div class="value">${currentJob.type[lang]}</div>
            </div>
        </div>
        <div class="job-info-item">
            <i class="bi bi-currency-euro"></i>
            <div>
                <div class="label">${salaryLabel}</div>
                <div class="value">${salaryOrRate}</div>
            </div>
        </div>
        <div class="job-info-item">
            <i class="bi bi-geo-alt"></i>
            <div>
                <div class="label" data-en="Location" data-fr="Localisation">${lang === 'en' ? 'Location' : 'Localisation'}</div>
                <div class="value">${currentJob.location[lang]}</div>
            </div>
        </div>
        <div class="job-info-item">
            <i class="bi bi-calendar-check"></i>
            <div>
                <div class="label" data-en="Start Date" data-fr="Date de Début">${lang === 'en' ? 'Start Date' : 'Date de Début'}</div>
                <div class="value">${currentJob.start[lang]}</div>
            </div>
        </div>
        <div class="job-info-item">
            <i class="bi bi-house-door"></i>
            <div>
                <div class="label" data-en="Work Mode" data-fr="Mode de Travail">${lang === 'en' ? 'Work Mode' : 'Mode de Travail'}</div>
                <div class="value">${currentJob.mode[lang]}</div>
            </div>
        </div>
        <div class="job-info-item">
            <i class="bi bi-clock-history"></i>
            <div>
                <div class="label" data-en="Posted On" data-fr="Publié le">${lang === 'en' ? 'Posted On' : 'Publié le'}</div>
                <div class="value">${currentJob.posted[lang]}</div>
            </div>
        </div>
        <div class="job-info-item">
            <i class="bi bi-calendar-x"></i>
            <div>
                <div class="label" data-en="Apply Before" data-fr="Postuler Avant">${lang === 'en' ? 'Apply Before' : 'Postuler Avant'}</div>
                <div class="value">${formattedDeadline}</div>
            </div>
        </div>
        <div class="job-info-item">
            <i class="bi bi-hash"></i>
            <div>
                <div class="label" data-en="Job Reference" data-fr="Référence">${lang === 'en' ? 'Job Reference' : 'Référence'}</div>
                <div class="value">${currentJob.jobId}</div>
            </div>
        </div>
    `;
}

function checkDeadline() {
    const deadlineDate = new Date(currentJob.lastDateToApply);
    const today = new Date();
    const daysRemaining = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
    const lang = localStorage.getItem('language') || 'en';
    
    const warningContainer = document.getElementById('deadline-warning-container');
    const applyBtn = document.getElementById('applyBtn');
    
    if (daysRemaining < 0) {
        // Application closed
        warningContainer.innerHTML = `
            <div class="deadline-warning" style="background: linear-gradient(135deg, #6c757d 0%, #495057 100%);">
                <i class="bi bi-x-circle"></i>
                <span data-en="Applications Closed" data-fr="Candidatures Fermées">${lang === 'en' ? 'Applications Closed' : 'Candidatures Fermées'}</span>
            </div>
        `;
        applyBtn.disabled = true;
        applyBtn.innerHTML = `<i class="bi bi-x-circle me-2"></i><span>${lang === 'en' ? 'Applications Closed' : 'Candidatures Fermées'}</span>`;
        applyBtn.style.opacity = '0.6';
    } else if (daysRemaining <= 7) {
        // Less than a week remaining
        warningContainer.innerHTML = `
            <div class="deadline-warning">
                <i class="bi bi-exclamation-triangle"></i>
                <span>${lang === 'en' ? `Only ${daysRemaining} days left to apply!` : `Plus que ${daysRemaining} jours pour postuler !`}</span>
            </div>
        `;
    } else {
        warningContainer.innerHTML = '';
    }
}

function handleNationalityQuestion() {
    const nationalityQuestion = document.getElementById('nationalityQuestion');
    
    if (currentJob.nationalityRequired && currentJob.nationalityRequired.toLowerCase() === 'yes') {
        nationalityQuestion.classList.add('show');
    } else {
        nationalityQuestion.classList.remove('show');
    }
}

// ==========================================
// APPLICATION MODAL
// ==========================================

function openApplyModal() {
    // Check if applications are closed
    const deadlineDate = new Date(currentJob.lastDateToApply);
    const today = new Date();
    const lang = localStorage.getItem('language') || 'en';
    
    if (deadlineDate < today) {
        alert(lang === 'en' ? 
            'Sorry, applications for this position are now closed.' : 
            'Désolé, les candidatures pour ce poste sont maintenant fermées.');
        return;
    }
    
    // Reset form
    document.getElementById('applicationForm').reset();
    document.getElementById('applicationForm').classList.remove('was-validated');
    resetCharCounter();
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('applyModal'));
    modal.show();
}

function submitApplication() {
    const form = document.getElementById('applicationForm');
    const lang = localStorage.getItem('language') || 'en';
    
    // Custom validation
    let isValid = true;
    
    // Check motivation length
    const motivation = document.getElementById('motivation');
    if (motivation.value.length < 50) {
        motivation.classList.add('is-invalid');
        isValid = false;
    } else {
        motivation.classList.remove('is-invalid');
    }
    
    // Check nationality if required
    if (currentJob.nationalityRequired && currentJob.nationalityRequired.toLowerCase() === 'yes') {
        const nationalityYes = document.getElementById('nationalityYes');
        const nationalityNo = document.getElementById('nationalityNo');
        const nationalityError = document.getElementById('nationalityError');
        
        if (!nationalityYes.checked && !nationalityNo.checked) {
            nationalityError.style.display = 'block';
            isValid = false;
        } else {
            nationalityError.style.display = 'none';
        }
    }
    
    // Check email format
    const email = document.getElementById('email');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.value)) {
        email.classList.add('is-invalid');
        isValid = false;
    }
    
    // Validate form
    form.classList.add('was-validated');
    
    if (form.checkValidity() && isValid) {
        // Collect form data
        const formData = {
            jobId: currentJob.jobId,
            jobTitle: currentJob.title[lang],
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            linkedin: document.getElementById('linkedin').value,
            motivation: document.getElementById('motivation').value,
            nationality: document.querySelector('input[name="nationality"]:checked')?.value || 'N/A',
            submittedAt: new Date().toISOString()
        };
        
        console.log('Application submitted:', formData);
        
        // Close apply modal
        const applyModal = bootstrap.Modal.getInstance(document.getElementById('applyModal'));
        applyModal.hide();
        
        // Show success modal
        setTimeout(() => {
            const successModal = new bootstrap.Modal(document.getElementById('successModal'));
            successModal.show();
        }, 300);
    }
}

// ==========================================
// CHARACTER COUNTER
// ==========================================

function initializeCharCounter() {
    const motivation = document.getElementById('motivation');
    const charCount = document.getElementById('charCount');
    const charCounter = document.getElementById('charCounter');
    
    motivation.addEventListener('input', function() {
        const length = this.value.length;
        charCount.textContent = length;
        
        if (length < 50) {
            charCounter.classList.remove('valid');
            charCounter.classList.add('error');
        } else {
            charCounter.classList.remove('error');
            charCounter.classList.add('valid');
        }
    });
}

function resetCharCounter() {
    const charCount = document.getElementById('charCount');
    const charCounter = document.getElementById('charCounter');
    charCount.textContent = '0';
    charCounter.classList.remove('valid', 'error');
}

// ==========================================
// SHARE FUNCTIONALITY
// ==========================================

function openShareModal() {
    updateShareContent();
    const modal = new bootstrap.Modal(document.getElementById('shareModal'));
    modal.show();
}

function updateShareContent() {
    const lang = localStorage.getItem('language') || 'en';
    const salaryOrRate = currentJob.salary || currentJob.rate;
    const jobUrl = window.location.href;
    
    // Update preview content
    const previewContent = document.getElementById('share-preview-content');
    previewContent.innerHTML = `
        <p><strong>${currentJob.title[lang]}</strong></p>
        <p>📋 ${currentJob.type[lang]}</p>
        <p>💰 ${salaryOrRate}</p>
        <p>📍 ${currentJob.location[lang]}</p>
        <p>📅 ${lang === 'en' ? 'Start:' : 'Début:'} ${currentJob.start[lang]}</p>
        <p>🏠 ${currentJob.mode[lang]}</p>
        <p>🔗 ${jobUrl}</p>
    `;
    
    // Update hashtags
    const hashtagsContainer = document.getElementById('share-hashtags');
    const hashtags = currentJob.tags.map(tag => `#${tag.replace(/[^a-zA-Z0-9]/g, '')}`).join(' ');
    hashtagsContainer.textContent = hashtags + ' #Hiring #JobOpportunity';
    
    // Update share text
    const shareText = document.getElementById('shareText');
    shareText.value = generateShareText();
    
    // Update job link
    document.getElementById('jobLink').value = jobUrl;
}

function generateShareText() {
    const lang = localStorage.getItem('language') || 'en';
    const salaryOrRate = currentJob.salary || currentJob.rate;
    const hashtags = currentJob.tags.map(tag => `#${tag.replace(/[^a-zA-Z0-9]/g, '')}`).join(' ');
    
    if (lang === 'en') {
        return `🚀 New Job Opportunity!\n\n` +
            `📌 ${currentJob.title.en}\n` +
            `📋 ${currentJob.type.en}\n` +
            `💰 ${salaryOrRate}\n` +
            `📍 ${currentJob.location.en}\n` +
            `📅 Start: ${currentJob.start.en}\n` +
            `🏠 ${currentJob.mode.en}\n\n` +
            `Apply now: ${window.location.href}\n\n` +
            `${hashtags} #Hiring #JobOpportunity`;
    } else {
        return `🚀 Nouvelle Opportunité d'Emploi !\n\n` +
            `📌 ${currentJob.title.fr}\n` +
            `📋 ${currentJob.type.fr}\n` +
            `💰 ${salaryOrRate}\n` +
            `📍 ${currentJob.location.fr}\n` +
            `📅 Début: ${currentJob.start.fr}\n` +
            `🏠 ${currentJob.mode.fr}\n\n` +
            `Postulez maintenant: ${window.location.href}\n\n` +
            `${hashtags} #Recrutement #Emploi`;
    }
}

function shareOnLinkedIn() {
    const lang = localStorage.getItem('language') || 'en';
    const shareText = document.getElementById('shareText')?.value || generateShareText();
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(currentJob.title[lang]);
    const summary = encodeURIComponent(shareText);
    
    // LinkedIn sharing URL
    //const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
    const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?title=${title}&summary=${summary}&url=${url}`;
    
    window.open(linkedInUrl, '_blank', 'width=600,height=600');
}

function shareOnTwitter() {
    const shareText = document.getElementById('shareText')?.value || generateShareText();
    const text = encodeURIComponent(shareText.substring(0, 280)); // Twitter character limit
    
    const twitterUrl = `https://twitter.com/intent/tweet?text=${text}`;
    
    window.open(twitterUrl, '_blank', 'width=600,height=400');
}

function shareOnFacebook() {
    const url = encodeURIComponent(window.location.href);
    
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
    
    window.open(facebookUrl, '_blank', 'width=600,height=400');
}

function shareOnWhatsApp() {
    const shareText = document.getElementById('shareText')?.value || generateShareText();
    const text = encodeURIComponent(shareText);
    
    const whatsappUrl = `https://wa.me/?text=${text}`;
    
    window.open(whatsappUrl, '_blank');
}

function shareViaEmail() {
    const lang = localStorage.getItem('language') || 'en';
    const shareText = document.getElementById('shareText')?.value || generateShareText();
    
    const subject = encodeURIComponent(
        lang === 'en' ? 
        `Job Opportunity: ${currentJob.title.en}` : 
        `Opportunité d'emploi: ${currentJob.title.fr}`
    );
    const body = encodeURIComponent(shareText);
    
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
}

function copyJobLink() {
    const jobLink = window.location.href;
    
    navigator.clipboard.writeText(jobLink).then(() => {
        // Show toast notification
        const toast = new bootstrap.Toast(document.getElementById('copyToast'));
        toast.show();
    }).catch(err => {
        console.error('Failed to copy:', err);
        // Fallback for older browsers
        const input = document.getElementById('jobLink');
        input.select();
        document.execCommand('copy');
    });
}

// ==========================================
// LANGUAGE SWITCHING
// ==========================================

function toggleLanguage() {
    const lang = localStorage.getItem('language') || 'en';
    localStorage.setItem('language', lang);
    updateLanguage();
    updateLangButton();
    
    // Re-populate job details with new language
    if (currentJob) {
        populateJobDetails();
        checkDeadline();
    }
}

function updateLanguage() {
    const lang = localStorage.getItem('language') || 'en';
    const elements = document.querySelectorAll('[data-en][data-fr]');
    elements.forEach(el => {
        const text = el.getAttribute(`data-${lang}`);
        if (text) {
            el.textContent = text;
        }
    });
    
    // Update placeholders
    const placeholderElements = document.querySelectorAll('[data-en-placeholder][data-fr-placeholder]');
    placeholderElements.forEach(el => {
        const placeholder = el.getAttribute(`data-${lang}-placeholder`);
        if (placeholder) {
            el.placeholder = placeholder;
        }
    });
    
    // Update HTML lang attribute
    document.documentElement.lang = lang;
}

function updateLangButton() {
    const langBtn = document.querySelector('.lang-switch');
    const lang = localStorage.getItem('language') || 'en';
    if (langBtn) {
        langBtn.textContent = lang === 'en' ? 'FR' : 'EN';
    }
}

// ==========================================
// ERROR HANDLING
// ==========================================

function showJobNotFound() {
    const lang = localStorage.getItem('language') || 'en';
    const container = document.querySelector('.container[style*="margin-top: -50px"]');
    container.innerHTML = `
        <div class="job-detail-content text-center" style="padding: 80px 40px;">
            <i class="bi bi-exclamation-circle" style="font-size: 4rem; color: var(--secondary-color);"></i>
            <h2 class="mt-4" data-en="Job Not Found" data-fr="Offre Non Trouvée">${lang === 'en' ? 'Job Not Found' : 'Offre Non Trouvée'}</h2>
            <p class="text-muted mt-3" data-en="The job you're looking for doesn't exist or has been removed." data-fr="L'offre que vous recherchez n'existe pas ou a été supprimée.">
                ${lang === 'en' ? "The job you're looking for doesn't exist or has been removed." : "L'offre que vous recherchez n'existe pas ou a été supprimée."}
            </p>
            <a href="jobs.html" class="btn btn-primary-custom mt-4">
                <i class="bi bi-arrow-left me-2"></i>
                <span data-en="Back to Jobs" data-fr="Retour aux Offres">${lang === 'en' ? 'Back to Jobs' : 'Retour aux Offres'}</span>
            </a>
        </div>
    `;
    
    // Update header
    document.getElementById('job-detail-title').textContent = lang === 'en' ? 'Job Not Found' : 'Offre Non Trouvée';
    document.getElementById('job-detail-breadcrumb').textContent = lang === 'en' ? 'Not Found' : 'Non Trouvée';
}

function showError(message) {
    console.error(message);
    // Could implement a toast or alert here
}

// ==========================================
// SCROLL EFFECTS
// ==========================================

function initializeScrollEffects() {
    // Navbar scroll effect
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        const backToTop = document.getElementById('backToTop');
        
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        if (window.scrollY > 300) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    });
}

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// ==========================================
// EVENT LISTENERS
// ==========================================

function initializeEventListeners() {
    // Form input validation on blur
    const formInputs = document.querySelectorAll('#applicationForm input[required], #applicationForm textarea[required]');
    formInputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (this.value.trim() === '') {
                this.classList.add('is-invalid');
            } else {
                this.classList.remove('is-invalid');
            }
        });
        
        input.addEventListener('input', function() {
            if (this.value.trim() !== '') {
                this.classList.remove('is-invalid');
            }
        });
    });
    
    // Email validation
    const emailInput = document.getElementById('email');
    emailInput.addEventListener('blur', function() {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (this.value && !emailRegex.test(this.value)) {
            this.classList.add('is-invalid');
        }
    });
    
    // Nationality radio buttons
    const nationalityRadios = document.querySelectorAll('input[name="nationality"]');
    nationalityRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            document.getElementById('nationalityError').style.display = 'none';
        });
    });
    
    // Close modals with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const modals = document.querySelectorAll('.modal.show');
            modals.forEach(modal => {
                const bsModal = bootstrap.Modal.getInstance(modal);
                if (bsModal) {
                    bsModal.hide();
                }
            });
        }
    });
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

function formatDate(dateString, lang) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString(lang === 'en' ? 'en-US' : 'fr-FR', options);
}

function sanitizeHTML(str) {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}

// ==========================================
// EXPORT FOR TESTING (if needed)
// ==========================================

if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        loadJobDetails,
        toggleLanguage,
        submitApplication,
        shareOnLinkedIn,
        shareOnTwitter,
        shareOnFacebook,
        shareOnWhatsApp,
        copyJobLink
    };
}
