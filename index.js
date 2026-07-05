const blogPath = "data/blogs/";

let upload = document.getElementById('upload');
let preview = document.getElementById('preview');

const postContainer = document.querySelector('.blog-scroll');
const postElement = document.getElementById('blog-card');

const blogCards = document.querySelectorAll('.card');
const closePopupButton = document.querySelectorAll('[data-close-button]');
const popUp = document.querySelector('.blog-popup');
const overlay = document.getElementById('overlay');

window.onload = (event) => {

    fetch("./data/blogs/blogDatas.json")
    .then((res) => {
        if (!res.ok) {throw new Error(`HTTP error! Status: ${res.status}`);}
        return res.json();})
    .then((data) => FillCards(data))
    .catch((error) => console.error("Unable to fetch data:", error));
};


function FillCards(cardDatas){
    cardDatas.forEach(CreateCard);
}

function CreateCard(cardData){
    const newPostElement = postElement.content.cloneNode(true);
    
    newPostElement.querySelector(".image-url").src = cardData.imageUrl;
    newPostElement.querySelector(".header").textContent = cardData.header;
    newPostElement.querySelector(".index").textContent = cardData.id + ".";
    newPostElement.querySelector(".short-content").textContent = cardData.shortContent;
    newPostElement.querySelector(".date").textContent = cardData.date;

    newPostElement.querySelector(".card").addEventListener('click', () => {
        ToggleBlogPopup(true, cardData.header, cardData.actualContent);
    })
    //newPostElement.querySelector(".actual-content").textContent = cardData.actualContent;

    postContainer.appendChild(newPostElement);
}

function OnClosePopup(){
    ToggleBlogPopup(false);
}

function ToggleBlogPopup(isOn, title, content){
    if(isOn){
        popUp.querySelector(".title").innerHTML = title;
        popUp.querySelector(".content").innerHTML = content;

        popUp.classList.add('active');
        overlay.classList.add('active');
    }else{
        popUp.classList.remove('active');
        overlay.classList.remove('active');
    }
}