document.addEventListener('DOMContentLoaded', () => {
    loadJobs();
});

async function loadJobs() {
    try {
        const response = await fetch('data/jobs.json');
        const jobs = await response.json();
        renderJobs(jobs);
    } catch (error) {
        console.error('Error loading jobs:', error);
        const container = document.getElementById('job-listings');
        if (container) {
            container.innerHTML = '<div class="col-12 text-center">Unable to load job postings at this time.</div>';
        }
    }
}

function renderJobs(jobs) {
    const container = document.getElementById('job-listings');
    if (!container) return;

    container.innerHTML = jobs.map(job => `
        <div class="col-12">
            <div class="job-card" onclick="window.location.href='job-detail.html?id=${job.id}'">
                <div class="d-flex justify-content-between align-items-start flex-wrap">
                    <div>
                        <h3 class="job-title">${job.title}</h3>
                        <div class="job-meta">
                            <span class="job-meta-item"><i class="bi bi-geo-alt"></i> ${job.location}</span>
                            <span class="job-meta-item"><i class="bi bi-briefcase"></i> ${job.type}</span>
                            <span class="job-meta-item"><i class="bi bi-clock"></i> ${job.posted}</span>
                        </div>
                    </div>
                    <button class="job-apply-btn">Apply Now</button>
                </div>
                <div>
                    ${job.tags.map(tag => `<span class="job-tag">${tag}</span>`).join('')}
                </div>
                <p class="job-description">${job.description}</p>
            </div>
        </div>
    `).join('');
}