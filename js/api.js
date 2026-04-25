const WORKER_BASE = "https://love-back.1716577216leehy.workers.dev"; 
const R2_PUBLIC_BASE = "https://pub-0dfa381f30774594b756c154da0a2033.r2.dev";

export async function apiRequest(action, data = {}) {
    const user = sessionStorage.getItem("currentUser");
    const res = await fetch(`${WORKER_BASE}/api/data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, user, ...data })
    });
    return res.json();
}

export function getImageUrl(id) { return `${R2_PUBLIC_BASE}/photo_${id}`; }
export function getDownloadUrl(id) { return `${WORKER_BASE}/?file=photo_${id}&download=1`; }

export function login(user) {
    const pwd = prompt(`请输入密码 (${user}):`);
    const correct = (user === '黄泽钰') ? 'ilovelhy' : 'ilovehzy';
    if (pwd === correct) {
        sessionStorage.setItem("currentUser", user);
        window.location.href = "main.html";
    } else { alert("密码错误哦~"); }
}
