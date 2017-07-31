var log = console.log.bind(console)

console.log('HEYHALL')
self.addEventListener('install', (event) => {
    log('[ServiceWorker] service worker installed!')
})

self.addEventListener('activate', (event) => {
    log(event)
})