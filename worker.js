export default {
  async fetch(request, env) {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*", // 建议上线后改为你的 Pages 域名
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

    const url = new URL(request.url);
    const R2 = env.LOVE_BUCKET;

    // 1. 处理图片下载请求 (GET)
    const fileKey = url.searchParams.get("file");
    const isDownload = url.searchParams.has("download");
    if (request.method === "GET" && fileKey) {
      const imageObj = await R2.get(fileKey);
      if (!imageObj) return new Response("Not Found", { status: 404 });
      const headers = new Headers(corsHeaders);
      headers.set("Content-Type", "image/png");
      if (isDownload) {
        headers.set("Content-Disposition", `attachment; filename="memory_${fileKey}.png"`);
      }
      return new Response(imageObj.body, { headers });
    }

    // 2. 业务 API (POST)
    if (request.method === "POST" && url.pathname === "/api/data") {
      try {
        const body = await request.json();
        const { action, user, content, image, id, groupName } = body;
        const getR2 = async (k, d = "[]") => { const o = await R2.get(k); return o ? JSON.parse(await o.text()) : JSON.parse(d); };
        const setR2 = async (k, d) => await R2.put(k, JSON.stringify(d));
        const bj = () => {
          const d = new Date(new Date().getTime() + (8 * 3600000));
          return { full: `${d.getUTCFullYear()}/${d.getUTCMonth()+1}/${d.getUTCDate()} ${d.getUTCHours()}:${d.getUTCMinutes()}`, day: `${d.getUTCFullYear()}-${d.getUTCMonth()+1}-${d.getUTCDate()}`, year: d.getUTCFullYear() };
        };

        if (action === 'getBirthdayState') return new Response(JSON.stringify({ lastSeenYear: (await getR2("user_config.json", "{}")).lastBirthdayStoryYear || 0 }), { headers: corsHeaders });
        if (action === 'markBirthdayStoryDone') {
          const conf = await getR2("user_config.json", "{}"); conf.lastBirthdayStoryYear = bj().year;
          await setR2("user_config.json", conf);
          return new Response(JSON.stringify({ status: "ok" }), { headers: corsHeaders });
        }
        if (action === 'getMemos') return new Response(JSON.stringify(await getR2("memos")), { headers: corsHeaders });
        if (action === 'addMemo') {
          const m = await getR2("memos"); const t = bj();
          m.push({ memoId: "m"+Date.now(), user, content, time: t.full, rawDate: t.day });
          await setR2("memos", m);
          return new Response(JSON.stringify({ status: "ok" }), { headers: corsHeaders });
        }
        if (action === 'missYou') {
          const l = await getR2("miss_logs"); l.push({ from: user, time: Date.now() });
          await setR2("miss_logs", l);
          return new Response(JSON.stringify({ status: "ok" }), { headers: corsHeaders });
        }
        if (action === 'getMissStats') {
          const l = await getR2("miss_logs"); const target = user === "黄泽钰" ? "李鸿运" : "黄泽钰";
          const start = new Date(bj().day).getTime() - (8 * 3600000);
          return new Response(JSON.stringify({ today: l.filter(i => i.from === target && i.time >= start).length }), { headers: corsHeaders });
        }
        if (action === 'addPhoto') {
          const ps = await getR2("photos.json"); const pId = Date.now();
          const bytes = new Uint8Array(atob(image.split(',')[1]).split("").map(c => c.charCodeAt(0)));
          await R2.put(`photo_${pId}`, bytes);
          ps.push({ id: pId, group: groupName || "默认分组" });
          await setR2("photos.json", ps);
          return new Response(JSON.stringify({ status: "ok" }), { headers: corsHeaders });
        }
        if (action === 'getPhotos') return new Response(JSON.stringify(await getR2("photos.json")), { headers: corsHeaders });
        if (action === 'delPhoto') {
          let ps = await getR2("photos.json"); await R2.delete(`photo_${id}`);
          await setR2("photos.json", ps.filter(p => p.id !== id));
          return new Response(JSON.stringify({ status: "ok" }), { headers: corsHeaders });
        }
        if (action === 'getGroups') return new Response(JSON.stringify(await getR2("album_groups", '["默认分组"]')), { headers: corsHeaders });
        if (action === 'addGroup') {
          let ags = await getR2("album_groups", '["默认分组"]');
          if(!ags.includes(groupName)) ags.push(groupName);
          await setR2("album_groups", ags);
          return new Response(JSON.stringify({ status: "ok" }), { headers: corsHeaders });
        }
      } catch (e) { return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: corsHeaders }); }
    }
    return new Response("Not Found", { status: 404, headers: corsHeaders });
  }
};