// Full project detail page. Reads ?p=slug and renders from data/projects/<slug>.json

const root = document.getElementById('project-root');
const params = new URLSearchParams(location.search);
const slug = params.get('p');

const SAFE_SLUG = /^[a-z0-9-]+$/;   // guard against path tricks

window.onload = () => {
    if (!slug || !SAFE_SLUG.test(slug)) {
        return fail('Unknown project.');
    }
    fetch(`data/projects/${slug}.json`)
        .then((res) => {
            if (!res.ok) { throw new Error(`HTTP ${res.status}`); }
            return res.json();
        })
        .then(render)
        .catch((err) => {
            console.error('Unable to load project:', err);
            fail('This project could not be found.');
        });
};

function fail(msg) {
    root.innerHTML = `<div class="empty-state" style="padding:120px 24px;">${msg}
        <br><br><a class="btn btn-ghost" href="projects.html"><i class="fas fa-arrow-left"></i> All projects</a></div>`;
}

function esc(s) {
    return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

function render(p) {
    document.title = `${p.title} — Fabalu's World`;
    seo(p);

    const specs = (p.specs || []).map(
        ([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`
    ).join('');

    const tags = (p.tags || []).map((t) => `<span class="tag">${esc(t)}</span>`).join('');

    const links = (p.links || []).map(
        (l) => `<a class="btn btn-ghost" href="${esc(l.url)}" target="_blank" rel="noopener"><i class="fas fa-arrow-up-right-from-square"></i> ${esc(l.label)}</a>`
    ).join('');

    const gallery = (p.gallery || []).map((g, i) => `
        <figure data-i="${i}">
            <img src="${esc(g.src)}" alt="${esc(g.caption || '')}" loading="lazy">
            <figcaption>${esc(g.caption || '')}</figcaption>
        </figure>`).join('');

    // body is an array of raw HTML blocks authored in the JSON (trusted, first-party content)
    const body = (p.body || []).join('\n');

    root.innerHTML = `
        <header class="proj-hero" style="background-image:url('${esc(p.hero)}')">
            <div class="inner">
                <a class="back" href="projects.html"><i class="fas fa-arrow-left"></i> All projects</a>
                ${p.kicker ? `<div class="kicker">${esc(p.kicker)}</div>` : ''}
                <h1>${esc(p.title)}</h1>
                ${p.subtitle ? `<p class="subtitle">${esc(p.subtitle)}</p>` : ''}
                <div class="meta-row">
                    <span class="pill">${esc(p.role || 'Project')}</span>
                    <span><i class="fas fa-calendar"></i> ${esc(p.date || '')}</span>
                    ${p.team ? `<span><i class="fas fa-users"></i> ${esc(p.team)}</span>` : ''}
                </div>
            </div>
        </header>

        <article class="proj-body">
            ${tags ? `<div class="tags">${tags}</div>` : ''}
            ${specs ? `<div class="specs"><h3>At a glance</h3><dl>${specs}</dl></div>` : ''}
            <div class="prose">${body}</div>
            ${links ? `<div class="actions" style="margin-top:30px;display:flex;gap:12px;flex-wrap:wrap;">${links}</div>` : ''}
        </article>

        ${gallery ? `<section class="gallery"><h3>Gallery</h3><div class="grid">${gallery}</div></section>` : ''}
    `;

    wireLightbox(p.gallery || []);
}

function seo(p) {
    const url = `https://fabalu.xyz/project.html?p=${encodeURIComponent(p.slug)}`;
    const title = `${p.title} — Furkan Özkan (Fabalu)`;
    const desc = p.subtitle || p.blurb || `A project by Furkan Özkan (Fabalu).`;
    const image = p.hero ? `https://fabalu.xyz/${p.hero}` : 'https://fabalu.xyz/data/og-image.png';

    const set = (id, attr, val) => { const el = document.getElementById(id); if (el) { el.setAttribute(attr, val); } };
    set('canonical-link', 'href', url);
    set('og-url', 'content', url);
    set('og-title', 'content', title);
    set('og-description', 'content', desc);
    set('og-image', 'content', image);
    set('twitter-title', 'content', title);
    set('twitter-description', 'content', desc);
    set('twitter-image', 'content', image);
    set('meta-description', 'content', desc);

    const ld = document.createElement('script');
    ld.type = 'application/ld+json';
    ld.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'CreativeWork',
        'name': p.title,
        'description': desc,
        'url': url,
        'image': image,
        'datePublished': p.date || undefined,
        'author': { '@type': 'Person', 'name': 'Furkan Özkan', 'alternateName': 'Fabalu', 'url': 'https://fabalu.xyz/' },
        'creator': { '@type': 'Person', 'name': 'Furkan Özkan', 'alternateName': 'Fabalu', 'url': 'https://fabalu.xyz/' }
    });
    document.head.appendChild(ld);
}

function wireLightbox(items) {
    const box = document.getElementById('lightbox');
    const boxImg = box.querySelector('img');
    const boxCap = box.querySelector('.cap');

    document.querySelectorAll('.gallery figure').forEach((fig) => {
        fig.addEventListener('click', () => {
            const item = items[+fig.dataset.i];
            boxImg.src = item.src;
            boxImg.alt = item.caption || '';
            boxCap.textContent = item.caption || '';
            box.classList.add('active');
        });
    });

    const close = () => box.classList.remove('active');
    box.querySelector('.x').addEventListener('click', close);
    box.addEventListener('click', (e) => { if (e.target === box) close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
}
