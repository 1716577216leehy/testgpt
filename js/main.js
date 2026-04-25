import { api, getR2Url, getDownloadUrl } from './api.js';

const user = sessionStorage.getItem("currentUser");
if (!user) window.location.href = "index.html";

const startDate = new Date(2026, 0, 9, 22, 51, 0); // 恋爱起始日
let globalStatus = {};

document.addEventListener('DOMContentLoaded', () => {
    initApp();
    setupButtons();
});

async function initApp() {
    const now = new Date(new Date().getTime() + 8 * 3600000);
    const year = now.getUTCFullYear();
    
    // 生日范围判断 (12.19 - 12.29)
    const start = new Date(Date.UTC(year, 11, 19));
    const end = new Date(Date.UTC(year, 11, 29, 23, 59, 59));
    const isSpecial = (now >= start && now <= end);
    globalStatus = { isSpecial, year, isBirthday: (now.getMonth() === 11 && now.getDate() === 24) };

    if (isSpecial) {
        document.body.classList.add('birthday-theme');
        startSnowEffect();
        if (user === '黄泽钰') {
            const state = await api('getBirthdayState');
            if (state.lastSeenYear !== year) return startBirthdayStory();
        }
    }
    enterMain();
}

function enterMain() {
    document.querySelectorAll('.card').forEach(c => c.classList.add('hidden'));
    document.getElementById('main-page').classList.remove('hidden');
    document.getElementById('welcome-msg').innerText = `你好呀, ${user}`;
    startLoveTimer();
}

function startLoveTimer() {
    const el = document.getElementById('love-timer');
    setInterval(() => {
        const diff = new Date() - startDate;
        const d = Math.floor(diff / 86400000);
        const h = Math.floor((diff % 86400000) / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        el.innerHTML = `${d}天 <span style='font-size:0.8em'>${h}时${m}分${s}秒</span>`;
    }, 1000);
}

// 相册渲染逻辑 (R2直连加速)
async function showAlbum(group = "默认分组") {
    const photos = await api('getPhotos');
    const container = document.getElementById('page-detail');
    container.innerHTML = `<h3>${group}</h3><div class="album-view" id="img-list"></div>`;
    const list = document.getElementById('img-list');
    photos.filter(p => p.group === group).forEach(p => {
        const imgUrl = getR2Url(p.id);
        const div = document.createElement('div');
        div.className = 'album-img-wrapper';
        div.innerHTML = `<img src="${imgUrl}" loading="lazy" onclick="openViewer('${p.id}')">`;
        list.appendChild(div);
    });
}

function openViewer(id) {
    document.getElementById('viewer-img').src = getR2Url(id);
    document.getElementById('viewer-overlay').style.display = 'flex';
    document.getElementById('download-btn').onclick = () => window.open(getDownloadUrl(id), '_blank');
}

window.closeViewer = () => document.getElementById('viewer-overlay').style.display = 'none';

function setupButtons() {
    document.getElementById('btn-album')?.addEventListener('click', () => {
        document.getElementById('main-page').classList.add('hidden');
        document.getElementById('content-page').classList.remove('hidden');
        showAlbum();
    });
    document.getElementById('btn-back')?.addEventListener('click', enterMain);
}

function startSnowEffect() {
    setInterval(() => {
        const d = document.createElement('div');
        d.className = 'decoration';
        d.innerText = ['❄️', '🍰', '🎁', '🎄'][Math.floor(Math.random()*4)];
        d.style.left = Math.random()*100 + 'vw';
        d.style.animationDuration = Math.random()*3+4+'s';
        document.body.appendChild(d);
        setTimeout(() => d.remove(), 7000);
    }, 500);
}