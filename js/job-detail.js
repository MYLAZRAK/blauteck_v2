let currentJob = null;
let currentLang = 'en';

document.addEventListener('DOMContentLoaded', async () => {
    currentLang = localStorage.getItem('language') || 'en';
    const jobIdParam = getUrlParameter('jobId');

    // Listen for language changes
    window.addEventListener('languageChanged', () => {
        currentLang = localStorage.getItem('language') || 'en';
        if(currentJob) renderJobDetails(currentJob);
    });

    // Character count listener
    const textArea = document.getElementById('applyCoverLetter');
    if(textArea) {
        textArea.addEventListener('input', function() {
            document.getElementById('charCount').innerText = `${this.value.length} characters`;
        });
    }

    if (jobIdParam) {
        await loadJobDetails(jobIdParam);
    } else {
        document.getElementById('job-detail-title').innerText = "Job not found";
    }
});

async function loadJobDetails(id) {
    try {
        const response = await fetch('data/jobs.json');
        const jobs = await response.json();
        const job = jobs.find(j => j.jobId === id);
        if (job) {
            currentJob = job;
            renderJobDetails(job);
        } else {
            document.getElementById('job-detail-title').innerText = "Job not found";
        }
    } catch (error) {
        console.error("Error loading job:", error);
    }
}

function getLocalized(job, field) {
    if (job[field] && typeof job[field] === 'object') {
        return job[field][currentLang] || job[field]['en'] || '';
    }
    return job[field] || '';
}

function renderJobDetails(job) {
    document.title = `${getLocalized(job, 'title')} - BLAUTECK`;
    document.getElementById('job-detail-breadcrumb').innerText = getLocalized(job, 'title');
    document.getElementById('job-detail-title').innerText = getLocalized(job, 'title');

    // Meta Row (Contract, Salary, Location, Start, Mode, Posted)
    const metaContainer = document.getElementById('job-detail-meta');
    const compensation = job.salary || job.rate || "N/A";
    metaContainer.innerHTML = `
        <div class="row g-3">
            <div class="col-sm-6 col-md-4">
                <div class="p-3 bg-light rounded text-center h-100 d-flex flex-column justify-content-center">
                    <small class="text-muted d-block" data-en="Contract" data-fr="Contrat">Contract</small>
                    <strong>${getLocalized(job, 'type')}</strong>
                </div>
            </div>
            <div class="col-sm-6 col-md-4">
                <div class="p-3 bg-light rounded text-center h-100 d-flex flex-column justify-content-center">
                    <small class="text-muted d-block" data-en="Salary" data-fr="Salaire">Salary</small>
                    <strong>${compensation}</strong>
                </div>
            </div>
            <div class="col-sm-6 col-md-4">
                <div class="p-3 bg-light rounded text-center h-100 d-flex flex-column justify-content-center">
                    <small class="text-muted d-block" data-en="Location" data-fr="Lieu">Location</small>
                    <strong>${getLocalized(job, 'location')}</strong>
                </div>
            </div>
            <div class="col-sm-6 col-md-4">
                <div class="p-3 bg-light rounded text-center h-100 d-flex flex-column justify-content-center">
                    <small class="text-muted d-block" data-en="Start" data-fr="Début">Start</small>
                    <strong>${getLocalized(job, 'start')}</strong>
                </div>
            </div>
            <div class="col-sm-6 col-md-4">
                <div class="p-3 bg-light rounded text-center h-100 d-flex flex-column justify-content-center">
                    <small class="text-muted d-block" data-en="Mode" data-fr="Mode">Mode</small>
                    <strong>${getLocalized(job, 'mode')}</strong>
                </div>
            </div>
            <div class="col-sm-6 col-md-4">
                <div class="p-3 bg-light rounded text-center h-100 d-flex flex-column justify-content-center">
                    <small class="text-muted d-block" data-en="Posted" data-fr="Publié">Posted</small>
                    <strong>${getLocalized(job, 'posted')}</strong>
                </div>
            </div>
        </div>
    `;

    // Tags
    const tagsContainer = document.getElementById('job-detail-tags');
    tagsContainer.innerHTML = job.tags && job.tags.length 
        ? job.tags.map(tag => `<span class="badge bg-primary bg-opacity-10 text-primary me-2 mb-2 p-2 border border-primary">${tag}</span>`).join('') 
        : '<span class="text-muted">No tags</span>';

    // Content HTML
    document.getElementById('job-detail-description').innerHTML = getLocalized(job, 'description');
    document.getElementById('job-detail-requirements').innerHTML = getLocalized(job, 'requirements');
    document.getElementById('job-detail-benefits').innerHTML = getLocalized(job, 'benefits');

    // Handle Nationality Logic (2.2)
    const natGroup = document.getElementById('nationalityQuestionGroup');
    if (job.nationalityRequired === 'Yes') {
        natGroup.classList.remove('d-none');
        natGroup.classList.add('d-block');
    } else {
        natGroup.classList.add('d-none');
    }
}

// Application Modal Logic
function openApplyModal() {
    const modal = new bootstrap.Modal(document.getElementById('applyModal'));
    modal.show();
}

function submitApplication() {
    const form = document.getElementById('modalApplyForm');
    
    // Basic HTML5 Validation
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    // Email Validation
    const email = document.getElementById('applyEmail').value;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address.');
        return;
    }

    // Cover Letter Validation (50 chars min)
    const cover = document.getElementById('applyCoverLetter').value;
    if (cover.length < 50) {
        alert('Please provide at least 50 characters explaining why you are the best fit.');
        return;
    }

    // Nationality Validation (if visible)
    const natGroup = document.getElementById('nationalityQuestionGroup');
    if (!natGroup.classList.contains('d-none')) {
        const hasNationality = document.getElementById('applyNationality').value;
        if (hasNationality !== 'Yes') {
            alert('This position requires specific nationality. Unfortunately, we cannot proceed with your application.');
            return;
        }
    }

    // Success
    alert('Application submitted successfully!');
    const modalEl = document.getElementById('applyModal');
    const modal = bootstrap.Modal.getInstance(modalEl);
    modal.hide();
    form.reset();
}

// Share Logic (2.3)
function openShareModal(platform) {
    if (!currentJob) return;

    const url = window.location.href;
    const title = getLocalized(currentJob, 'title');
    const compensation = currentJob.salary || currentJob.rate;

    // Share Content Generator
    const generateContent = () => {
        const tagsAsHashtags = currentJob.tags.map(t => `#${t.replace(/\s+/g, '')}`).join(' ');
        
        return `${title}\n\n` +
               `Type: ${getLocalized(currentJob, 'type')}\n` +
               `Salary/Rate: ${compensation}\n` +
               `Location: ${getLocalized(currentJob, 'location')}\n` +
               `Start Date: ${getLocalized(currentJob, 'start')}\n` +
               `Mode: ${getLocalized(currentJob, 'mode')}\n` +
               `Posted: ${getLocalized(currentJob, 'posted')}\n\n` +
               `Apply Here: ${url}\n\n` +
               `${tagsAsHashtags}`;
    };

    if (platform === 'linkedin') {
        // Prefill Modal for LinkedIn
        document.getElementById('shareContent').value = generateContent();
        const modal = new bootstrap.Modal(document.getElementById('shareModal'));
        modal.show();
    } else {
        // Direct Share for others
        let shareUrl = '';
        const text = encodeURIComponent(`Check out this job: ${title}`);
        const encodedUrl = encodeURIComponent(url);

        if (platform === 'twitter') shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${encodedUrl}`;
        if (platform === 'facebook') shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        if (platform === 'email') shareUrl = `mailto:?subject=Job Opportunity&body=${text} ${encodedUrl}`;
        
        if (shareUrl) window.open(shareUrl, '_blank');
    }
}

function copyShareContent() {
    const copyText = document.getElementById("shareContent");
    
    // Modern API
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(copyText.value).then(() => {
            alert('Content copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy: ', err);
            fallbackCopy(copyText);
        });
    } else {
        fallbackCopy(copyText);
    }
}

function fallbackCopy(element) {
    element.select();
    document.execCommand("copy");
    alert('Content copied to clipboard!');
}
