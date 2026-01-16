// State management
let allJobs = [];

document.addEventListener('DOMContentLoaded', async () => {
    // Sync language with storage
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
        container.innerHTML = `<div class="col-12 text-center text-danger">Unable to load job postings at this time.</div>`;
    }
}

// Calculate status based on logic: 
// If status field is populated, use it. 
// Else, "Open" if today < lastDateToApply, else "Closed".
function calculateJobStatus(job) {
    if (job.status && job.status.trim() !== "") {
        return job.status;
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normalize time to compare dates only
    
    const deadline = new Date(job.lastDateToApply);
    
    return today < deadline ? "Open" : "Closed";
}

// Helper to format date (YYYY-MM-DD -> DD/MM/YYYY or MMM DD, YYYY)
function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    
    // Basic formatting based on language preference
    if (currentLanguage === 'fr') {
        return date.toLocaleDateString('fr-FR');
    } else {
        return date.toLocaleDateString('en-US');
    }
}

// Helper to get localized text for a job field
function getLocalizedField(job, fieldBase) {
    return job[`${fieldBase}${currentLanguage === 'en' ? 'En' : 'Fr'}`] || job[`${fieldBase}En`];
}

function populateFilters() {
    const extractUnique = (key) => {
        // Use En keys as value identifiers, but we might want to display localized options
        // For simplicity in this implementation, we use the En keys as values and labels
        return [...new Set(allJobs.map(job => job[key]))].filter(Boolean);
    };

    const populateSelect = (elementId, options) => {
        const select = document.getElementById(elementId);
        // Keep the first "All" option
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

    // Populate using English keys as canonical values
    populateSelect('filterContractType', extractUnique('contractTypeEn'));
    populateSelect('filterLocation', extractUnique('locationEn'));
    populateSelect('filterWorkMode', extractUnique('workModeEn'));
}

function setupEventListeners() {
    const filters = ['filterContractType', 'filterLocation', 'filterWorkMode', 'filterStatus'];
    filters.forEach(id => {
        document.getElementById(id).addEventListener('change', filterJobs);
    });
    
    // Re-render on language change to update text and date formats
    window.addEventListener('languageChanged', () => {
        currentLanguage = localStorage.getItem('language') || 'en';
        populateFilters(); // Re-populate in case we want localized filter labels later
        filterJobs();
    });
}

function filterJobs() {
    const contractFilter = document.getElementById('filterContractType').value;
    const locationFilter = document.getElementById('filterLocation').value;
    const workModeFilter = document.getElementById('filterWorkMode').value;
    const statusFilter = document.getElementById('filterStatus').value;

    const filtered = allJobs.filter(job => {
        const jobStatus = calculateJobStatus(job);
        
        // Match logic (using English keys as values for comparison)
        const matchContract = contractFilter === 'all' || job.contractTypeEn === contractFilter;
        const matchLocation = locationFilter === 'all' || job.locationEn === locationFilter;
        const matchWorkMode = workModeFilter === 'all' || job.workModeEn === workModeFilter;
        const matchStatus = statusFilter === 'all' || jobStatus === statusFilter;

        return matchContract && matchLocation && matchWorkMode && matchStatus;
    });

    renderJobs(filtered);
}

function renderJobs(jobs) {
    const container = document.getElementById('job-listings');
    const noResults = document.getElementById('no-results');

    if (jobs.length === 0) {
        container.innerHTML = '';
        noResults.classList.remove('d-none');
        return;
    }

    noResults.classList.add('d-none');

    container.innerHTML = jobs.map(job => {
        const status = calculateJobStatus(job);
        const statusClass = status === 'Open' ? 'text-success' : 'text-danger';
        const statusBadge = status === 'Open' 
            ? `<span class="badge bg-success rounded-pill">${status}</span>` 
            : `<span class="badge bg-secondary rounded-pill">${status}</span>`;

        return `
            <div class="col-12">
                <div class="job-card" onclick="window.location.href='job-detail.html?id=${job.id}'">
                    <div class="row align-items-center">
                        <div class="col-md-8 mb-3 mb-md-0">
                            <div class="d-flex align-items-center gap-2 mb-2">
                                <h3 class="job-title mb-0">${getLocalizedField(job, 'title')}</h3>
                                <small class="text-muted">(${job.id})</small>
                                ${statusBadge}
                            </div>
                            
                            <div class="job-meta">
                                <span class="job-meta-item"><i class="bi bi-briefcase"></i> ${getLocalizedField(job, 'contractType')}</span>
                                <span class="job-meta-item"><i class="bi bi-geo-alt"></i> ${getLocalizedField(job, 'location')}</span>
                                <span class="job-meta-item"><i class="bi bi-laptop"></i> ${getLocalizedField(job, 'workMode')}</span>
                                <span class="job-meta-item"><i class="bi bi-cash"></i> <strong>${job.salary}</strong></span>
                            </div>
                            
                            <div class="job-meta mt-2">
                                <span class="job-meta-item text-muted small">
                                    <i class="bi bi-calendar-event"></i> ${currentLanguage === 'en' ? 'Start:' : 'Début:'} ${formatDate(job.startDate)}
                                </span>
                                <span class="job-meta-item text-muted small">
                                    <i class="bi bi-calendar-check"></i> ${currentLanguage === 'en' ? 'Deadline:' : 'Date limite:'} ${formatDate(job.lastDateToApply)}
                                </span>
                            </div>
                        </div>
                        <div class="col-md-4 text-md-end">
                            <button class="btn btn-outline-custom w-100">${currentLanguage === 'en' ? 'View Details' : 'Voir Détails'}</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

