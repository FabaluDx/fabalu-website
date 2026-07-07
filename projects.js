// Projects grid — blog-style cards that link out to full project pages.

const grid = document.querySelector('.post-grid');
const template = document.getElementById('project-card');
const emptyState = document.querySelector('.empty-state');

window.onload = () => {
    fetch('data/projects.json')
        .then((res) => {
            if (!res.ok) { throw new Error(`HTTP ${res.status}`); }
            return res.json();
        })
        .then(render)
        .catch((err) => {
            console.error('Unable to load projects:', err);
            emptyState.textContent = 'Could not load projects.';
            emptyState.hidden = false;
        });
};

function render(projects) {
    if (!projects || !projects.length) { emptyState.hidden = false; return; }
    projects.forEach(makeCard);
    revealOnScroll();
}

function makeCard(p) {
    const node = template.content.cloneNode(true);
    const link = node.querySelector('.project-link');
    const card = node.querySelector('.card');

    // Where does the card go? Own page if it has one, else external link, else nowhere.
    if (p.hasPage) {
        link.href = `project.html?p=${encodeURIComponent(p.slug)}`;
    } else if (p.link) {
        link.href = p.link;
        link.target = '_blank';
        link.rel = 'noopener';
    } else {
        link.removeAttribute('href');
        link.style.cursor = 'default';
    }

    if (p.featured) { card.classList.add('featured'); }

    // anything without its own story page yet gets a "soon" marker
    const soon = !p.hasPage;
    if (soon) { card.classList.add('is-soon'); }

    // thumb: real image or emoji gradient cover
    const thumb = node.querySelector('.thumb');
    const img = node.querySelector('img');
    if (p.thumb) {
        img.src = p.thumb;
        img.alt = p.title;
    } else {
        img.remove();
        thumb.classList.add('no-image');
        thumb.insertAdjacentText('afterbegin', p.emoji ?? '📦');
    }
    if (soon) {
        const badge = document.createElement('span');
        badge.className = 'soon-badge';
        badge.textContent = 'story soon';
        thumb.appendChild(badge);
    }

    // tags
    const tags = node.querySelector('.tags');
    (p.tags || []).slice(0, 3).forEach((t) => {
        const span = document.createElement('span');
        span.className = 'tag';
        span.textContent = t;
        tags.appendChild(span);
    });

    node.querySelector('.card-role').textContent = p.role || '';
    node.querySelector('.header').textContent = p.title;
    node.querySelector('.excerpt').textContent = p.blurb;
    node.querySelector('.date').textContent = ' ' + p.date;

    const read = node.querySelector('.read');
    if (p.hasPage) {
        read.innerHTML = 'read the story <i class="fas fa-arrow-right"></i>';
    } else if (p.link) {
        read.innerHTML = 'visit <i class="fas fa-arrow-up-right-from-square"></i>';
    } else {
        read.innerHTML = '<span class="muted-read">story soon</span>';
    }

    grid.appendChild(node);
}

function revealOnScroll() {
    const cards = document.querySelectorAll('.card');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    cards.forEach((card, i) => {
        card.style.transitionDelay = `${Math.min(i * 60, 360)}ms`;
        observer.observe(card);
    });
    setTimeout(() => cards.forEach((c) => c.classList.add('visible')), 1500);
}
