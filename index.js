// Shared card renderer + reader modal.
// The page decides which feed it shows via <body data-feed="...">.

const feedUrl = document.body.dataset.feed;

const postContainer = document.querySelector('.post-grid');
const postTemplate = document.getElementById('post-card');
const emptyState = document.querySelector('.empty-state');

const reader = document.getElementById('reader');
const overlay = document.getElementById('overlay');

window.onload = () => {
    fetch(feedUrl)
        .then((res) => {
            if (!res.ok) { throw new Error(`HTTP error! Status: ${res.status}`); }
            return res.json();
        })
        .then((data) => FillCards(data))
        .catch((error) => {
            console.error("Unable to fetch data:", error);
            emptyState.hidden = false;
        });
};

function FillCards(cardDatas) {
    if (!cardDatas || cardDatas.length === 0) {
        emptyState.hidden = false;
        return;
    }
    cardDatas.forEach(CreateCard);
    RevealOnScroll();
}

function CreateCard(cardData) {
    const newPostElement = postTemplate.content.cloneNode(true);

    const thumb = newPostElement.querySelector(".thumb");
    const img = newPostElement.querySelector("img");
    if (cardData.imageUrl) {
        img.src = cardData.imageUrl;
        img.alt = cardData.header;
    } else {
        img.remove();
        thumb.classList.add("no-image");
        thumb.insertAdjacentText("afterbegin", cardData.emoji ?? "✍️");
    }

    newPostElement.querySelector(".index").textContent = "#" + cardData.id;
    newPostElement.querySelector(".header").textContent = cardData.header;
    newPostElement.querySelector(".excerpt").textContent = cardData.shortContent;
    newPostElement.querySelector(".date").textContent = " " + cardData.date;

    newPostElement.querySelector(".card").addEventListener('click', () => {
        OpenReader(cardData);
    });

    postContainer.appendChild(newPostElement);
}

function OpenReader(cardData) {
    reader.querySelector(".title").textContent = cardData.header;
    reader.querySelector(".date span").textContent = " " + cardData.date;
    reader.querySelector(".body").innerHTML = cardData.actualContent;
    reader.querySelector(".body").scrollTop = 0;

    reader.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function CloseReader() {
    reader.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
}

reader.querySelector(".close").addEventListener('click', CloseReader);
overlay.addEventListener('click', CloseReader);
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') { CloseReader(); }
});

// fade cards in as they enter the viewport
function RevealOnScroll() {
    const cards = document.querySelectorAll('.card');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, ) => {
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

    // safety net: never leave cards invisible if the observer doesn't fire
    setTimeout(() => {
        cards.forEach((card) => card.classList.add('visible'));
    }, 1500);
}
