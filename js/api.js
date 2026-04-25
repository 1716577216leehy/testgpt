const API_BASE = "https://love-api.yourname.workers.dev";

// 上传文件
export async function uploadFile(file) {
  const key = `images/${Date.now()}-${file.name}`;

  const res = await fetch(`${API_BASE}?key=${key}`, {
    method: "PUT",
    body: file
  });

  if (!res.ok) {
    throw new Error("上传失败");
  }

  return key;
}

// 获取文件URL
export function getFileUrl(key) {
  return `${API_BASE}?key=${key}`;
}
