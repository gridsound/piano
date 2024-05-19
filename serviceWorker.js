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
			"/assets/🎹/21-35.96k.mp3",
			"/assets/🎹/36-47.96k.mp3",
			"/assets/🎹/48-59.96k.mp3",
			"/assets/🎹/60-71.96k.mp3",
			"/assets/🎹/72-83.96k.mp3",
			"/assets/🎹/84-95.96k.mp3",
			"/assets/🎹/96-108.96k.mp3",
		] )
	) ) );
} );

self.addEventListener( "fetch", e => {
	e.respondWith(
		fetch( e.request ).catch( () => caches.match( e.request ) )
	);
} );
