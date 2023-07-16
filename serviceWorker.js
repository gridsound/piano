"use strict";

self.addEventListener( "install", e => {
	e.waitUntil( caches.open( "piano" ).then( cache => (
		cache.addAll( [
			"/",
			"/index.html",
			"/manifest.json",
			"/assets/favicon.png",
			"/assets/fonts/fa-duotone-900.woff2",
			"/assets/fonts/montserrat-500-latin.woff2",
			"/assets/fonts/montserrat-700-latin.woff2",
			"/assets/🎹/all88-ff.128k.mp3",
		] )
	) ) );
} );

self.addEventListener( "fetch", e => {
	e.respondWith(
		fetch( e.request ).catch( () => caches.match( e.request ) )
	);
} );
