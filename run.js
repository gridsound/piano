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

const ctx = new AudioContext();
const uiKeys = document.querySelector( "gsui-keys" );
const prKeys = [];
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

GSUI.$listenEvents( uiKeys, {
	gsuiKeys: {
		keyDown: d => {
			const [ key, vel ] = d.args;
			const absn = ctx.createBufferSource();
			const gain = ctx.createGain();
			const lowp = ctx.createBiquadFilter();
			const freq = 440 * 2 ** ( ( key - 57 ) / 12 );
			const filt = ( freq + 5000 * GSUI.$easeInCirc( vel ) ) / ( 1 / vel );
			const vel2 = vel;

			lg(freq, filt)
			lowp.type = "lowpass";
			lowp.Q.value = 0;
			lowp.frequency.value = filt;
			absn.buffer = bufKeys.get( key );
			gain.gain.value = vel2;
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

for ( let i = 21; i <= 108; ++i ) {
	prKeys.push( fetch( `/🎹/ff/${ i }.mp3` )
		.then( res => res.arrayBuffer() )
		.then( arr => ctx.decodeAudioData( arr ) )
		.then( buf => bufKeys.set( i, buf ) )
	);
}

Promise.all( prKeys )
	.then( arr => {
		lg( bufKeys );
	} );
