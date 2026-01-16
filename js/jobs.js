// State management
let allJobs = [];
let currentLang = 'en'; // Default

document.addEventListener('DOMContentLoaded', async () => {
    currentLang = localStorage.getItem('language') || 'en';
    
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

// Helper to get localized field from nested object { en: ..., fr: ... }
function getLocalized(job, field) {
    if (job[field] && typeof job[field] === 'object') {
        return job[field][currentLang] || job[field]['en'] || '';
    }
    return job[field] || '';
}

// Calculate status based on logic
function calculateJobStatus(job) {
    if (job.status && job.status.trim() !== "") {
        return job.status;
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    
    // Note: In the JSON provided, I added 'lastDateToApply'. 
    // Assuming format "YYYY-MM-DD"
    const deadline = new Date(job.lastDateToApply);
    
    if (isNaN(deadline.getTime())) return "Unknown";

    return today < deadline ? "Open" : "Closed";
}

// Helper to get compensation (salary or rate)
function getCompensation(job) {
    return job.salary || job.rate || "N/A";
}

function populateFilters() {
    const extractUnique = (key) => {
        // Extract unique values based on current language
        const values = allJobs.map(job => getLocalized(job, key)).filter(Boolean);
        return [...new Set(values)];
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

    // Populate filters dynamically
    populateSelect('filterType', extractUnique('type'));
    populateSelect('filterLocation', extractUnique('location'));
    populateSelect('filterMode', extractUnique('mode'));
    
    // Nationality filter is static options in HTML
}

function setupEventListeners() {
    const filters = ['filterType', 'filterLocation', 'filterMode', 'filterNationality', 'filterStatus'];
    filters.forEach(id => {
        document.getElementById(id).addEventListener('change', filterJobs);
    });
    
    // Re-render on language change
    window.addEventListener('languageChanged', () => {
        currentLang = localStorage.getItem('language') || 'en';
        populateFilters(); // Update filter options to new language
        filterJobs();      // Update displayed cards to new language
    });
}

function filterJobs() {
    const typeFilter = document.getElementById('filterType').value;
    const locationFilter = document.getElementById('filterLocation').value;
    const modeFilter = document.getElementById('filterMode').value;
    const nationalityFilter = document.getElementById('filterNationality').value;
    const statusFilter = document.getElementById('filterStatus').value;

    const filtered = allJobs.filter(job => {
        const jobStatus = calculateJobStatus(job);
        
        // Match logic
        const matchType = typeFilter === 'all' || getLocalized(job, 'type') === typeFilter;
        const matchLocation = locationFilter === 'all' || getLocalized(job, 'location') === locationFilter;
        const matchMode = modeFilter === 'all' || getLocalized(job, 'mode') === modeFilter;
        const matchStatus = statusFilter === 'all' || jobStatus === statusFilter;
        const matchNationality = nationalityFilter === 'all' || job.nationalityRequired === nationalityFilter;

        return matchType && matchLocation && matchMode && matchStatus && matchNationality;
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
        const statusBadge = status === 'Open' 
            ? `<span class="badge bg-success rounded-pill">${status}</span>` 
            : `<span class="badge bg-secondary rounded-pill">${status}</span>`;

        const natIcon = job.nationalityRequired === 'Yes' 
            ? '<i class="bi bi-pass text-danger" title="Nationality Required"></i>' 
            : '<i class="bi bi-globe text-success" title="Open to all"></i>';

        // Format Date from nested object or raw string if simple
        const deadline = job.lastDateToApply || "N/A";
        
        // Tags rendering
        const tagsHtml = job.tags ? job.tags.map(tag => 
            `<span class="badge bg-light text-secondary border me-1 mb-1">${tag}</span>`
        ).join('') : '';

        return `
            <div class="col-12 mb-3">
                <div class="job-card" onclick="window.location.href='job-detail.html?jobId=${job.jobId}'">
                    <div class="row align-items-center">
                        <!-- Left Column -->
                        <div class="col-lg-8 mb-3 mb-lg-0">
                            <div class="d-flex align-items-center gap-2 mb-2 flex-wrap">
                                <h4 class="job-title mb-0 fw-bold text-primary">${getLocalized(job, 'title')}</h4>
                                <small class="text-muted">(${job.jobId})</small>
                                ${statusBadge}
                            </div>
                            
                            <!-- Key Details Row -->
                            <div class="job-meta">
                                <span class="job-meta-item"><i class="bi bi-briefcase"></i> ${getLocalized(job, 'type')}</span>
                                <span class="job-meta-item"><i class="bi bi-geo-alt"></i> ${getLocalized(job, 'location')}</span>
                                <span class="job-meta-item"><i class="bi bi-cash"></i> <strong>${getCompensation(job)}</strong></span>
                                <span class="job-meta-item">${natIcon} ${job.nationalityRequired}</span>
                            </div>
                            
                            <!-- Secondary Details Row -->
                            <div class="job-meta mt-2 small">
                                <span class="job-meta-item text-muted"><i class="bi bi-laptop"></i> ${getLocalized(job, 'mode')}</span>
                                <span class="job-meta-item text-muted"><i class="bi bi-calendar-check"></i> ${getLocalized(job, 'start')}</span>
                                <span class="job-meta-item text-muted"><i class="bi bi-hourglass-split"></i> ${currentLang === 'en' ? 'Deadline:' : 'Fin:'} ${deadline}</span>
                                <span class="job-meta-item text-muted"><i class="bi bi-calendar-event"></i> ${getLocalized(job, 'posted')}</span>
                            </div>

                            <!-- Tags Row -->
                            <div class="mt-2">
                                ${tagsHtml}
                            </div>
                        </div>
                        
                        <!-- Right Column -->
                        <div class="col-lg-4 text-lg-end">
                            <button class="btn btn-outline-custom w-100">${currentLang === 'en' ? 'View Details' : 'Voir Détails'}</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}
