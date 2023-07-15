"use strict";

document.body.append(
	GSUI.$createElement( "div", { id: "title" },
		GSUI.$createElement( "span", null, "Piano" ),
		GSUI.$createElement( "span", null, "by GridSound" ),
	),
	GSUI.$createElement( "div", { id: "myPiano" },
		GSUI.$createElement( "div", { id: "velocityLabel" },
			GSUI.$createElement( "i", { class: "gsuiIcon", "data-icon": "arrow-up" } ),
			GSUI.$createElement( "span", null, "velocity" ),
			GSUI.$createElement( "i", { class: "gsuiIcon", "data-icon": "arrow-down" } ),
		),
		GSUI.$createElement( "div", { id: "niceBorder" },
			GSUI.$createElement( "gsui-keys", { orient: "horizontal", rootoctave: 4, octaves: "2 4" } ),
			GSUI.$createElement( "i", { class: "gsuiIcon loading", "data-spin": "on" } ),
		),
	),
	GSUI.$createElement( "div", { id: "foot" },
		GSUI.$createElement( "span", { id: "copyright" },
			"© 2023 ",
			GSUI.$createElement( "a", { href: "https://gridsound.com" }, "gridsound.com" ),
			" all rights reserved",
		),
	),
);

let ctx;
const root = document.querySelector( "#myPiano" );
const uiKeys = document.querySelector( "gsui-keys" );
const bufKeys = new Map();
const absnMap = new Map();
const szKey = GSUI.$mobile ? 24 : 16;
let nbOct = 0;

uiKeys.style.fontSize = `${ szKey }px`;

document.body.onresize = () => {
	const sz = document.body.clientWidth - 80;
	const nbOct2 = Math.max( 1, Math.min( Math.floor( sz / ( 12 * szKey ) ), 6 ) );

	if ( nbOct !== nbOct2 ) {
		nbOct = nbOct2;
		GSUI.$setAttribute( uiKeys, "octaves", `2 ${ nbOct }` );
	}
};

document.body.onresize();

root.onclick = bodyInitClick;

function bodyInitClick() {
	root.onclick = null;
	GSUI.$setAttribute( root, "dl", true );
	ctx = new AudioContext();
	Promise.all( dlPianoAssets() )
		.then( arr => GSUI.$setAttribute( root, "ready", true ) )
		.catch( () => root.onclick = bodyInitClick )
		.finally( () => GSUI.$setAttribute( root, "dl", false ) );
};

function dlPianoAssets() {
	const pr = [];

	for ( let i = 21; i <= 108; ++i ) {
		pr.push( fetch( `/assets/🎹/ff/${ i }.mp3` )
			.then( res => res.arrayBuffer() )
			.then( arr => ctx.decodeAudioData( arr ) )
			.then( buf => bufKeys.set( i, buf ) )
		);
	}
	return pr;
}

GSUI.$listenEvents( uiKeys, {
	gsuiKeys: {
		keyDown: d => {
			const [ key, vel ] = d.args;
			const vel2 = Math.max( .3, Math.min( vel / .85, 1 ) );
			const absn = ctx.createBufferSource();
			const gain = ctx.createGain();
			const lowp = ctx.createBiquadFilter();
			const freq = 440 * 2 ** ( ( key - 57 ) / 12 );
			const filt = ( freq + 5000 * GSUI.$easeInCirc( vel2 ) ) / ( 1 / vel2 );

			absn.buffer = bufKeys.get( key );
			lowp.type = "lowpass";
			lowp.Q.setValueAtTime( 0, ctx.currentTime );
			lowp.frequency.setValueAtTime( filt, ctx.currentTime );
			gain.gain.setValueAtTime( vel2, ctx.currentTime );
			absn.connect( lowp );
			lowp.connect( gain );
			gain.connect( ctx.destination );
			absn.start();
			absnMap.set( key, [ absn, gain, lowp, vel2 ] );
		},
		keyUp: d => {
			const key = d.args[ 0 ];
			const [ absn, gain, lowp, vel ] = absnMap.get( key );

			gain.gain.setValueCurveAtTime( new Float32Array( [ vel, 0 ] ), ctx.currentTime, .5 );
			setTimeout(() => {
				lowp.disconnect();
				gain.disconnect();
				absn.stop();
			}, .6 * 1000 );
		},
	}
} );
