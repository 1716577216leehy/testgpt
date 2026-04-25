import { uploadFile, getFileUrl } from "./api.js";

const uploadInput = document.getElementById("upload");
const gallery = document.getElementById("gallery");

uploadInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  try {
    const key = await uploadFile(file);

    const img = document.createElement("img");
    img.src = getFileUrl(key);

    gallery.appendChild(img);
  } catch (err) {
    alert("上传失败");
  }
});
