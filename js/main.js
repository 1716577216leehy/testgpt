import { apiRequest, getImageUrl, getDownloadUrl } from './api.js';

const user = sessionStorage.getItem("currentUser");
if (!user) window.location.href = "index.html";

const startDate = new Date(2026, 0, 9, 22, 51, 0);

document.addEventListener('DOMContentLoaded', async () => {
    initApp();
    setupEventListeners();
});

async function initApp() {
    const now = new Date(new Date().getTime() + 8 * 3600000);
    const year = now.getUTCFullYear();
    const start = new Date(Date.UTC(year, 11, 19));
    const end = new Date(Date.UTC(year, 11, 29, 23, 59, 59));
    const isSpecial = (now >= start && now <= end);

    if (isSpecial) {
        document.body.classList.add('birthday-theme');
        startSnowEffect();
        if (user === '黄泽钰') {
            const state = await apiRequest('getBirthdayState');
            if (state.lastSeenYear !== year) return showBirthdayStory();
        }
    }
    showMain();
}

function showMain() {
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

// 相册功能
async function openAlbum() {
    showSection('相册');
    const groups = await apiRequest('getGroups');
    const photos = await apiRequest('getPhotos');
    const detail = document.getElementById('page-detail');
    detail.innerHTML = `<div class="menu-grid" id="group-list"></div>`;
    groups.forEach(g => {
        const div = document.createElement('div'); div.className = 'menu-item';
        const count = photos ? photos.filter(p => p.group === g).length : 0;
        div.innerHTML = `📂 ${g}<br><small>${count} 张</small>`;
        div.onclick = () => showPhotoList(g, photos);
        detail.querySelector('#group-list').appendChild(div);
    });
}

function showPhotoList(group, allPhotos) {
    const detail = document.getElementById('page-detail');
    detail.innerHTML = `<h3>${group}</h3><div class="album-view" id="img-list"></div>`;
    allPhotos.filter(p => p.group === group).forEach(p => {
        const img = document.createElement('img');
        img.src = getImageUrl(p.id);
        img.loading = "lazy";
        img.onclick = () => {
            document.getElementById('viewer-img').src = getImageUrl(p.id);
            document.getElementById('viewer-overlay').style.display = 'flex';
            document.getElementById('download-btn').onclick = () => window.open(getDownloadUrl(p.id), '_blank');
        };
        detail.querySelector('#img-list').appendChild(img);
    });
}

// 回忆录功能
async function openMemo() {
    showSection('回忆录');
    const data = await apiRequest('getMemos');
    const detail = document.getElementById('page-detail');
    detail.innerHTML = `<div id="memo-list"></div>`;
    data.forEach(m => {
        const div = document.createElement('div');
        div.className = `memo-item ${m.user === '黄泽钰' ? 'memo-left' : 'memo-right'}`;
        div.innerHTML = `<span style="font-size:10px;opacity:0.6">${m.time}</span><br>${m.content}`;
        detail.querySelector('#memo-list').appendChild(div);
    });
}

function showSection(title) {
    document.getElementById('main-page').classList.add('hidden');
    document.getElementById('content-page').classList.remove('hidden');
    document.getElementById('page-detail').innerHTML = `<h3>${title}</h3>`;
}

function setupEventListeners() {
    document.getElementById('btn-album').onclick = openAlbum;
    document.getElementById('btn-memo').onclick = openMemo;
    document.getElementById('btn-back').onclick = showMain;
    document.getElementById('btn-miss').onclick = async () => { alert("我也想你啦！❤️"); await apiRequest('missYou'); };
    document.getElementById('btn-mood').onclick = () => {
        showSection('记心情');
        document.getElementById('page-detail').innerHTML += `<textarea id="mood-text" rows="5"></textarea><button class="btn" id="save-mood">保存</button>`;
        document.getElementById('save-mood').onclick = async () => {
            const val = document.getElementById('mood-text').value;
            if(val) { await apiRequest('addMemo', { content: val }); showMain(); }
        };
    };
}

window.closeViewer = () => document.getElementById('viewer-overlay').style.display = 'none';

function startSnowEffect() {
    setInterval(() => {
        const d = document.createElement('div'); d.className = 'decoration';
        d.innerText = ['❄️', '🍰', '🎁', '🎄'][Math.floor(Math.random()*4)];
        d.style.left = Math.random()*100 + 'vw';
        d.style.animationDuration = Math.random()*3+4+'s';
        document.body.appendChild(d);
        setTimeout(() => d.remove(), 7000);
    }, 500);
}