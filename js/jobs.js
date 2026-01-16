// State management
let allJobs = [];

document.addEventListener('DOMContentLoaded', async () => {
    currentLanguage = localStorage.getItem('language') || 'en';
    
    await loadJobs();
    setupEventListeners();
});

async function loadJobs() {
    try {
        const response = await fetch('data/jobs.json');
        allJobs = await response.json();
        
        populateFilters();
        filterJobs();
    } catch (error) {
        console.error('Error loading jobs:', error);
        const container = document.getElementById('job-listings');
        container.innerHTML = `<div class="col-12 text-center text-danger">Unable to load job postings.</div>`;
    }
}

// Calculate status based on logic
function calculateJobStatus(job) {
    if (job.status && job.status.trim() !== "") {
        return job.status;
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    
    const deadline = new Date(job.lastDateToApply);
    
    // Check if date is invalid
    if (isNaN(deadline.getTime())) return "Unknown";

    return today < deadline ? "Open" : "Closed";
}

// Helper to get compensation (salary or rate)
function getCompensation(job) {
    return job.salary || job.rate || "N/A";
}

// Helper to format date
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    currentLanguage = localStorage.getItem('language') || 'en';
    
    if (isNaN(date.getTime())) return dateString; // Return raw string if invalid

    if (currentLanguage === 'fr') {
        return date.toLocaleDateString('fr-FR');
    } else {
        return date.toLocaleDateString('en-US');
    }
}

// Helper to get localized text
function getLocalizedField(job, fieldBase) {
    currentLanguage = localStorage.getItem('language') || 'en';
    return job[`${fieldBase}${currentLanguage === 'en' ? 'En' : 'Fr'}`] || job[`${fieldBase}En`];
}

function populateFilters() {
    const extractUnique = (key) => {
        return [...new Set(allJobs.map(job => job[key]))].filter(Boolean);
    };

    const populateSelect = (elementId, options) => {
        const select = document.getElementById(elementId);
        const firstOption = select.firstElementChild;
        select.innerHTML = '';
        select.appendChild(firstOption);
        
        options.forEach(opt => {
            const option = document.createElement('option');
            option.value = opt;
            option.textContent = opt;
            select.appendChild(option);
        });
    };

    // Populate using English keys as canonical values for filtering logic
    populateSelect('filterContractType', extractUnique('contractTypeEn'));
    populateSelect('filterLocation', extractUnique('locationEn'));
    populateSelect('filterWorkMode', extractUnique('workModeEn'));
    
    // Nationality filter is static options (Yes/No) in HTML, but we can verify values exist
}

function setupEventListeners() {
    const filters = ['filterContractType', 'filterLocation', 'filterWorkMode', 'filterNationality', 'filterStatus'];
    currentLanguage = localStorage.getItem('language') || 'en';
    filters.forEach(id => {
        document.getElementById(id).addEventListener('change', filterJobs);
    });
    
    // Re-render on language change
    window.addEventListener('languageChanged', () => {
        currentLanguage = localStorage.getItem('language') || 'en';
        populateFilters();
        filterJobs();
    });
}

function filterJobs() {
    const contractFilter = document.getElementById('filterContractType').value;
    const locationFilter = document.getElementById('filterLocation').value;
    const workModeFilter = document.getElementById('filterWorkMode').value;
    const nationalityFilter = document.getElementById('filterNationality').value;
    const statusFilter = document.getElementById('filterStatus').value;

    const filtered = allJobs.filter(job => {
        const jobStatus = calculateJobStatus(job);
        
        const matchContract = contractFilter === 'all' || job.contractTypeEn === contractFilter;
        const matchLocation = locationFilter === 'all' || job.locationEn === locationFilter;
        const matchWorkMode = workModeFilter === 'all' || job.workModeEn === workModeFilter;
        const matchStatus = statusFilter === 'all' || jobStatus === statusFilter;
        const matchNationality = nationalityFilter === 'all' || job.nationalityRequired === nationalityFilter;

        return matchContract && matchLocation && matchWorkMode && matchStatus && matchNationality;
    });

    renderJobs(filtered);
}

function renderJobs(jobs) {
    const container = document.getElementById('job-listings');
    const noResults = document.getElementById('no-results');
    currentLanguage = localStorage.getItem('language') || 'en';

    if (jobs.length === 0) {
        container.innerHTML = '';
        noResults.classList.remove('d-none');
        return;
    }

    noResults.classList.add('d-none');

    container.innerHTML = jobs.map(job => {
        const status = calculateJobStatus(job);
        const statusBadge = status === 'Open' 
            ? `<span class="badge bg-success rounded-pill">${status}</span>` 
            : `<span class="badge bg-secondary rounded-pill">${status}</span>`;

        const natIcon = job.nationalityRequired === 'Yes' ? '<i class="bi bi-pass text-danger" title="Nationality Required"></i>' : '<i class="bi bi-globe text-success" title="Open to all nationalities"></i>';

        return `
            <div class="col-12 mb-3">
                <div class="job-card" onclick="window.location.href='job-detail.html?id=${job.id}'">
                    <div class="row align-items-center">
                        <!-- Left Column: Main Info -->
                        <div class="col-lg-8 mb-3 mb-lg-0">
                            <div class="d-flex align-items-center gap-2 mb-2 flex-wrap">
                                <h4 class="job-title mb-0 fw-bold">${getLocalizedField(job, 'title')}</h4>
                                <small class="text-muted">(${job.id})</small>
                                ${statusBadge}
                            </div>
                            
                            <!-- Key Details Row -->
                            <div class="job-meta">
                                <span class="job-meta-item"><i class="bi bi-briefcase"></i> ${getLocalizedField(job, 'contractType')}</span>
                                <span class="job-meta-item"><i class="bi bi-geo-alt"></i> ${getLocalizedField(job, 'location')}</span>
                                <span class="job-meta-item"><i class="bi bi-cash"></i> <strong>${getCompensation(job)}</strong></span>
                                <span class="job-meta-item">${natIcon} ${job.nationalityRequired}</span>
                            </div>
                            
                            <!-- Secondary Details Row -->
                            <div class="job-meta mt-2 small">
                                <span class="job-meta-item text-muted"><i class="bi bi-laptop"></i> ${getLocalizedField(job, 'workMode')}</span>
                                <span class="job-meta-item text-muted"><i class="bi bi-calendar-check"></i> ${currentLanguage === 'en' ? 'Start:' : 'Début:'} ${formatDate(job.startDate)}</span>
                                <span class="job-meta-item text-muted"><i class="bi bi-hourglass-split"></i> ${currentLanguage === 'en' ? 'Deadline:' : 'Fin:'} ${formatDate(job.lastDateToApply)}</span>
                                <span class="job-meta-item text-muted"><i class="bi bi-calendar-event"></i> ${currentLanguage === 'en' ? 'Pub:' : 'Pub:'} ${formatDate(job.publishedDate)}</span>
                            </div>
                        </div>
                        
                        <!-- Right Column: Action -->
                        <div class="col-lg-4 text-lg-end">
                            <button class="btn btn-outline-custom w-100">${currentLanguage === 'en' ? 'View Details' : 'Voir Détails'}</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}
