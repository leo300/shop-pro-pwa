self.addEventListener("install", e=>{
  e.waitUntil(caches.open("shoppro").then(c=>c.addAll(["./"])));
});
