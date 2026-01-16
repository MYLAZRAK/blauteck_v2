let currentJob = null;

document.addEventListener('DOMContentLoaded', async () => {
    currentLang = localStorage.getItem('language') || 'en';
    const jobIdParam = getUrlParameter('jobId');

    if (jobIdParam) {
        await loadJobDetails(jobIdParam);
    } else {
        document.getElementById('job-detail-title').innerText = "Job not found";
    }

    // Listen for language changes
    window.addEventListener('languageChanged', () => {
        currentLang = localStorage.getItem('language') || 'en';
        if(currentJob) renderJobDetails(currentJob);
    });

    // Character count listener for textarea
    const textArea = document.getElementById('applyCoverLetter');
    if(textArea) {
        textArea.addEventListener('input', function() {
            document.getElementById('charCount').innerText = `${this.value.length} characters`;
        });
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
            document.getElementById('job-detail-title').innerText = "Job Not Found";
        }
    } catch (error) {
        console.error("Error loading job:", error);
    }
}

function getLocalized(job, field) {
    currentLang = localStorage.getItem('language') || 'en';
    if (job[field] && typeof job[field] === 'object') {
        return job[field][currentLang] || job[field]['en'] || '';
    }
    return job[field] || '';
}

function renderJobDetails(job) {
    document.title = `${getLocalized(job, 'title')} - BLAUTECK`;
    document.getElementById('job-detail-breadcrumb').innerText = getLocalized(job, 'title');
    document.getElementById('job-detail-title').innerText = getLocalized(job, 'title');

    // Meta Row
    const metaContainer = document.getElementById('job-detail-meta');
    const compensation = job.salary || job.rate || "N/A";
    metaContainer.innerHTML = `
        <div class="row g-3">
            <div class="col-sm-6 col-md-3">
                <div class="p-2 bg-light rounded text-center">
                    <small class="text-muted d-block" data-en="Contract" data-fr="Contrat">Contract</small>
                    <strong>${getLocalized(job, 'type')}</strong>
                </div>
            </div>
            <div class="col-sm-6 col-md-3">
                <div class="p-2 bg-light rounded text-center">
                    <small class="text-muted d-block" data-en="Salary" data-fr="Salaire">Salary</small>
                    <strong>${compensation}</strong>
                </div>
            </div>
            <div class="col-sm-6 col-md-3">
                <div class="p-2 bg-light rounded text-center">
                    <small class="text-muted d-block" data-en="Location" data-fr="Lieu">Location</small>
                    <strong>${getLocalized(job, 'location')}</strong>
                </div>
            </div>
            <div class="col-sm-6 col-md-3">
                <div class="p-2 bg-light rounded text-center">
                    <small class="text-muted d-block" data-en="Start" data-fr="Début">Start</small>
                    <strong>${getLocalized(job, 'start')}</strong>
                </div>
            </div>
            <div class="col-sm-6 col-md-3">
                <div class="p-2 bg-light rounded text-center">
                    <small class="text-muted d-block" data-en="Mode" data-fr="Mode">Mode</small>
                    <strong>${getLocalized(job, 'mode')}</strong>
                </div>
            </div>
            <div class="col-sm-6 col-md-3">
                <div class="p-2 bg-light rounded text-center">
                    <small class="text-muted d-block" data-en="Posted" data-fr="Publié">Posted</small>
                    <strong>${getLocalized(job, 'posted')}</strong>
                </div>
            </div>
        </div>
    `;

    // Tags
    const tagsContainer = document.getElementById('job-detail-tags');
    tagsContainer.innerHTML = job.tags.map(tag => 
        `<span class="badge bg-primary bg-opacity-10 text-primary me-2 mb-2 p-2">${tag}</span>`
    ).join('');

    // Content
    document.getElementById('job-detail-description').innerHTML = getLocalized(job, 'description');
    document.getElementById('job-detail-requirements').innerHTML = getLocalized(job, 'requirements');
    document.getElementById('job-detail-benefits').innerHTML = getLocalized(job, 'benefits');

    // Handle Nationality Logic for Form
    const natGroup = document.getElementById('nationalityQuestionGroup');
    if (job.nationalityRequired === 'Yes') {
        natGroup.style.display = 'block';
    } else {
        natGroup.style.display = 'none';
    }
}

// Modal Handling
function openApplyModal() {
    // Transfer values from sidebar form to modal if present (simple UX)
    const quickName = document.querySelector('input[placeholder*="Full Name"]')?.value;
    if(quickName) {
        const names = quickName.split(' ');
        document.getElementById('applyFirstName').value = names[0] || '';
        document.getElementById('applyLastName').value = names.slice(1).join(' ') || '';
    }
    
    const modal = new bootstrap.Modal(document.getElementById('applyModal'));
    modal.show();
}

function openShareModal(platform) {
    if (platform === 'linkedin' && currentJob) {
        // Populate Modal Form for LinkedIn
        const tagsAsHashtags = currentJob.tags.map(t => `#${t.replace(/\s+/g, '')}`).join(' ');
        const compensation = currentJob.salary || currentJob.rate;
        
        const text = `Check out this opportunity: ${getLocalized(currentJob, 'title')}\n\n` +
                     `Type: ${getLocalized(currentJob, 'type')}\n` +
                     `Salary/Rate: ${compensation}\n` +
                     `Location: ${getLocalized(currentJob, 'location')}\n` +
                     `Start Date: ${getLocalized(currentJob, 'start')}\n` +
                     `Mode: ${getLocalized(currentJob, 'mode')}\n` +
                     `Posted: ${getLocalized(currentJob, 'posted')}\n` +
                     `Apply Here: ${window.location.href}\n\n` +
                     `${tagsAsHashtags}`;

        document.getElementById('shareContent').value = text;
        const modal = new bootstrap.Modal(document.getElementById('shareModal'));
        modal.show();
    } else {
        // Standard sharing for other platforms
        const url = encodeURIComponent(window.location.href);
        const text = encodeURIComponent(`Check out this job: ${getLocalized(currentJob, 'title')}`);
        
        let shareUrl = '';
        if (platform === 'twitter') shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
        if (platform === 'facebook') shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        if (platform === 'email') shareUrl = `mailto:?subject=Job Opportunity&body=${text} ${url}`;
        
        if (shareUrl) window.open(shareUrl, '_blank');
    }
}

function copyShareContent() {
    const copyText = document.getElementById("shareContent");
    copyText.select();
    document.execCommand("copy"); // Fallback
    // Modern API
    navigator.clipboard.writeText(copyText.value).then(() => {
        alert('Content copied to clipboard!');
    });
}

function submitApplication() {
    const form = document.getElementById('modalApplyForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    // Specific Nationality Validation
    if (currentJob.nationalityRequired === 'Yes') {
        const hasNationality = document.getElementById('applyNationality').value;
        if (hasNationality === 'No') {
            alert('This position requires specific nationality. Unfortunately, we cannot proceed with the application.');
            return;
        }
    }

    // Email Validation
    const email = document.getElementById('applyEmail').value;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        alert('Please enter a valid email address.');
        return;
    }

    // Cover Letter Length Validation (HTML5 handles min, but double check)
    const cover = document.getElementById('applyCoverLetter').value;
    if (cover.length < 50) {
        alert('Please provide at least 50 characters explaining why you are the best fit.');
        return;
    }

    // Success
    alert('Application submitted successfully!');
    const modalEl = document.getElementById('applyModal');
    const modal = bootstrap.Modal.getInstance(modalEl);
    modal.hide();
    form.reset();
}
