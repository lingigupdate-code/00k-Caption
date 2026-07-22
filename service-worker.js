const CACHE_NAME = "00k-v2";
const ASSETS_TO_CACHE = [
  "./",
  "./index.html",
  "./manifest.json"
];

// 1. ติดตั้ง Service Worker และแคชไฟล์หลัก
self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// 2. ล้างแคชเก่าเมื่อมีการอัปเดตเวอร์ชัน
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. จัดการการดึงข้อมูล (ดักจับ Google Apps Script เพื่อให้โหลดไวทันทีบน iOS)
self.addEventListener("fetch", e => {
  const url = new URL(e.request.url);

  // ถ้าเป็นการดึงข้อมูลจาก Google Apps Script ให้ใช้เทคนิค Network First หรือ Cache First
  if (url.origin.includes("script.google.com")) {
    e.respondWith(
      caches.open(CACHE_NAME).then(cache => {
        return fetch(e.request)
          .then(response => {
            // ถ้าดึงข้อมูลใหม่สำเร็จ ให้บันทึกเก็บใส่แคชไว้ใช้รอบหน้าทันที
            cache.put(e.request, response.clone());
            return response;
          })
          .catch(() => {
            // ถ้าไม่มีเน็ตหรือออฟไลน์ ให้ดึงข้อมูลเก่าจากแคชมาแสดงแทนทันทีไม่ให้พัง
            return cache.match(e.request);
          });
      })
    );
    return;
  }

  // สำหรับไฟล์ทั่วไปในเว็บ ให้เปิดจาก Cache ก่อนเพื่อความเร็วสูงสุด
  e.respondWith(
    caches.match(e.request).then(res => {
      return res || fetch(e.request);
    })
  );
});
