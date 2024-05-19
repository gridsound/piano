"use strict";

const pianoPath = "M4.57764e-05 112.676C3.86599e-05 90.6737 0 73 8.5 52.5C17 32 33.9306 20.4349 39 17.5C48.5 12 70 -3.05176e-05 110 -1.52587e-05C150 0 192 16 216.5 46.5C235 69.5 244.5 88 247 133.5C249.5 179 253.5 188.5 268.5 213C283.5 237.5 347.5 265 355.5 284.5C363.5 304 360 394 360 394H4.57764e-05C4.57764e-05 394 6.10352e-05 159.851 4.57764e-05 112.676Z";

document.body.append(
	GSUcreateDiv( { id: "title" },
		GSUcreateSpan( null, "Piano" ),
		GSUcreateSpan( null, "by GridSound" ),
	),
	GSUcreateDiv( { id: "myPiano" },
		GSUcreateDiv( { id: "pianoTop" },
			GSUcreateElementSVG( "svg", { id: "pianoSVGGradients" },
				GSUcreateElementSVG( "defs", null,
					GSUcreateElementSVG( "linearGradient", { id: "pianoGradient", x1: "0%", x2: "0%", y1: "0%", y2: "100%" },
						GSUcreateElementSVG( "stop", { offset:  "50%", "stop-color": "#00000040" } ),
						GSUcreateElementSVG( "stop", { offset: "100%", "stop-color": "#00000000" } ),
					),
					GSUcreateElementSVG( "linearGradient", { id: "pianoGradient2", x1: "0%", x2: "0%", y1: "0%", y2: "100%" },
						GSUcreateElementSVG( "stop", { offset:  "50%", "stop-color": "#00000040" } ),
						GSUcreateElementSVG( "stop", { offset: "100%", "stop-color": "#00000010" } ),
					),
				),
			),
			GSUcreateElementSVG( "svg", { viewBox: "0 0 361 394", preserveAspectRatio: "none" },
				GSUcreateElementSVG( "path", { d: pianoPath } ),
			),
			GSUcreateElementSVG( "svg", { viewBox: "0 0 361 394", preserveAspectRatio: "none" },
				GSUcreateElementSVG( "path", { d: pianoPath } ),
			),
		),
		GSUcreateDiv( { id: "velocityLabel" },
			GSUcreateI( { class: "gsuiIcon", "data-icon": "arrow-up" } ),
			GSUcreateSpan( null, "velocity" ),
			GSUcreateI( { class: "gsuiIcon", "data-icon": "arrow-down" } ),
		),
		GSUcreateDiv( { id: "niceBorder" },
			GSUcreateElement( "gsui-keys", { orient: "horizontal", rootoctave: 4, octaves: "1 4" } ),
			GSUcreateI( { class: "gsuiIcon loading", "data-spin": "on" } ),
		),
	),
	GSUcreateDiv( { id: "foot" },
		GSUcreateSpan( { id: "copyright" },
			"© 2024 ",
			GSUcreateA( { href: "https://gridsound.com" }, "gridsound.com" ),
			" all rights reserved",
		),
	),
);

const root = document.querySelector( "#myPiano" );
const uiKeys = document.querySelector( "gsui-keys" );
const szKey = GSUonMobile ? 24 : 16;
const absnMap = new Map();
let ctx;
let bufKeysAs = null;
let bufKeysADs = null;
let bufKeys88 = null;
let nbOct = 0;
const keysMap88 = {
	// assets/🎹/21-35
	21: [ 14, 14 *  0 ],
	22: [ 14, 14 *  1 ],
	23: [ 14, 14 *  2 ],
	24: [ 14, 14 *  3 ],
	25: [ 14, 14 *  4 ],
	26: [ 14, 14 *  5 ],
	27: [ 14, 14 *  6 ],
	28: [ 14, 14 *  7 ],
	29: [ 14, 14 *  8 ],
	30: [ 14, 14 *  9 ],
	31: [ 14, 14 * 10 ],
	32: [ 14, 14 * 11 ],
	33: [ 14, 14 * 12 ],
	34: [ 14, 14 * 13 ],
	35: [ 14, 14 * 14 ],

	// assets/🎹/36-47
	36: [ 12, 12 *  0 ],
	37: [ 12, 12 *  1 ],
	38: [ 12, 12 *  2 ],
	39: [ 12, 12 *  3 ],
	40: [ 12, 12 *  4 ],
	41: [ 12, 12 *  5 ],
	42: [ 12, 12 *  6 ],
	43: [ 12, 12 *  7 ],
	44: [ 12, 12 *  8 ],
	45: [ 12, 12 *  9 ],
	46: [ 12, 12 * 10 ],
	47: [ 12, 12 * 11 ],

	// assets/🎹/48-59
	48: [ 10, 10 *  0 ],
	49: [ 10, 10 *  1 ],
	50: [ 10, 10 *  2 ],
	51: [ 10, 10 *  3 ],
	52: [ 10, 10 *  4 ],
	53: [ 10, 10 *  5 ],
	54: [ 10, 10 *  6 ],
	55: [ 10, 10 *  7 ],
	56: [ 10, 10 *  8 ],
	57: [ 10, 10 *  9 ],
	58: [ 10, 10 * 10 ],
	59: [ 10, 10 * 11 ],

	// assets/🎹/60-71
	60: [ 8, 8 *  0 ],
	61: [ 8, 8 *  1 ],
	62: [ 8, 8 *  2 ],
	63: [ 8, 8 *  3 ],
	64: [ 8, 8 *  4 ],
	65: [ 8, 8 *  5 ],
	66: [ 8, 8 *  6 ],
	67: [ 8, 8 *  7 ],
	68: [ 8, 8 *  8 ],
	69: [ 8, 8 *  9 ],
	70: [ 8, 8 * 10 ],
	71: [ 8, 8 * 11 ],

	// assets/🎹/72-83
	72: [ 6, 6 * 0 ],
	73: [ 6, 6 * 1 ],
	74: [ 6, 6 * 2 ],
	75: [ 6, 6 * 3 ],
	76: [ 6, 6 * 4 ],
	77: [ 6, 6 * 5 ],
	78: [ 5, 6 * 6 + 5 * 0 ],
	79: [ 5, 6 * 6 + 5 * 1 ],
	80: [ 5, 6 * 6 + 5 * 2 ],
	81: [ 5, 6 * 6 + 5 * 3 ],
	82: [ 5, 6 * 6 + 5 * 4 ],
	83: [ 5, 6 * 6 + 5 * 5 ],

	// assets/🎹/84-95
	84: [ 4, 4 * 0 ],
	85: [ 4, 4 * 1 ],
	86: [ 4, 4 * 2 ],
	87: [ 4, 4 * 3 ],
	88: [ 4, 4 * 4 ],
	89: [ 4, 4 * 5 ],
	90: [ 3, 4 * 6 + 3 * 0 ],
	91: [ 3, 4 * 6 + 3 * 1 ],
	92: [ 3, 4 * 6 + 3 * 2 ],
	93: [ 3, 4 * 6 + 3 * 3 ],
	94: [ 3, 4 * 6 + 3 * 4 ],
	95: [ 3, 4 * 6 + 3 * 5 ],

	// assets/🎹/96-108
	 96: [ 2, 2 *  0 ],
	 97: [ 2, 2 *  1 ],
	 98: [ 2, 2 *  2 ],
	 99: [ 2, 2 *  3 ],
	100: [ 2, 2 *  4 ],
	101: [ 2, 2 *  5 ],
	102: [ 2, 2 *  6 ],
	103: [ 2, 2 *  7 ],
	104: [ 2, 2 *  8 ],
	105: [ 2, 2 *  9 ],
	106: [ 2, 2 * 10 ],
	107: [ 2, 2 * 11 ],
	108: [ 2, 2 * 12 ],
};

uiKeys.style.fontSize = `${ szKey }px`;
gsuiKeys.$keyNotation( "CDEFGAB" );

document.body.onresize = () => {
	const sz = document.body.clientWidth - 80;
	const nbOct2 = Math.max( 1, Math.min( Math.floor( sz / ( 12 * szKey ) ), 7 ) );

	if ( nbOct !== nbOct2 ) {
		nbOct = nbOct2;
		GSUsetAttribute( uiKeys, "octaves", `1 ${ nbOct }` );
	}
};

document.body.onresize();

root.onclick = bodyInitClick;

function createKeysMap( durs ) {
	const durs2 = { ...durs };

	for ( let k in durs2 ) {
		durs2[ k ] = [ 0, durs2[ k ], 0 ];
	}

	const keys = Object.keys( durs2 ).sort( ( a, b ) => a - b );

	keys.forEach( ( k, i ) => {
		const p = durs2[ keys[ i - 1 ] ];

		if ( p ) {
			durs2[ k ][ 0 ] = p[ 0 ] + p[ 1 ];
		}
	} );

	const durs3 = { ...durs2 };

	for ( let k = 21; k < 108; ++k ) {
		if ( !durs2[ k ] ) {
			const closestMidi = getClosestKey( durs2, k );
			const nkey = [ ...durs2[ closestMidi ] ];

			nkey[ 2 ] = k - closestMidi;
			durs3[ k ] = nkey;
		}
	}
	return durs3;
}

function getClosestKey( map, midi ) {
	for ( let i = 0; i < 88; ++i ) {
		if ( map[ midi + i ] ) {
			return midi + i;
		}
		if ( map[ midi - i ] ) {
			return midi - i;
		}
	}
}

function bodyInitClick() {
	root.onclick = null;
	GSUsetAttribute( root, "dl", true );
	ctx = new AudioContext();
	dlPianoAssets()
		.then( arr => {
			arr.forEach( ( [ buf, midiA, midiB ] ) => {
				for ( let i = midiA; i <= midiB; ++i ) {
					keysMap88[ i ].push( buf );
				}
			} );
			GSUsetAttribute( root, "ready", true );
		} )
		.catch( () => root.onclick = bodyInitClick )
		.finally( () => GSUsetAttribute( root, "dl", false ) );
};

function dlPianoAssets() {
	return Promise.allSettled( [
		"assets/🎹/21-35.96k.mp3",
		"assets/🎹/36-47.96k.mp3",
		"assets/🎹/48-59.96k.mp3",
		"assets/🎹/60-71.96k.mp3",
		"assets/🎹/72-83.96k.mp3",
		"assets/🎹/84-95.96k.mp3",
		"assets/🎹/96-108.96k.mp3",
	].map( url => {
		return fetch( url )
			.then( res => res.arrayBuffer() )
			.then( arr => ctx.decodeAudioData( arr ) )
			.then( buf => [ buf, ...GSUsplitNums( url.split( "/" )[ 2 ].split( "." )[ 0 ], "-" ) ] );
	} ) )
		.then( res => res
			.filter( r => r.status === "fulfilled" )
			.map( r => r.value )
		);
}

GSUlistenEvents( uiKeys, {
	gsuiKeys: {
		keyDown: d => {
			const [ key, vel ] = d.args;
			const key2 = key + 12;
			const [ bufDur, bufOff, buf ] = keysMap88[ key2 ];
			const vel2 = Math.max( .25, Math.min( vel / .85, 1 ) );
			const absn = ctx.createBufferSource();
			const gain = ctx.createGain();
			const lowp = ctx.createBiquadFilter();
			const freq = 440 * 2 ** ( ( ( key2 ) - 69 ) / 12 );
			const filt = ( freq + 5000 * GSUeaseInCirc( vel2 ) ) / ( 1 / vel2 );

			absn.buffer = buf;
			lowp.type = "lowpass";
			lowp.Q.setValueAtTime( 0, ctx.currentTime );
			lowp.frequency.setValueAtTime( filt, ctx.currentTime );
			gain.gain.setValueAtTime( vel2, ctx.currentTime );
			absn.connect( lowp );
			lowp.connect( gain );
			gain.connect( ctx.destination );
			absn.start( 0, bufOff, bufDur );
			absnMap.set( key2, [ absn, gain, lowp, vel2 ] );
		},
		keyUp: d => {
			const key = d.args[ 0 ];
			const key2 = key + 12;
			const [ absn, gain, lowp, vel ] = absnMap.get( key2 );

			lg(key2)
			gain.gain.setValueCurveAtTime( new Float32Array( [ vel, 0 ] ), ctx.currentTime, .5 );
			setTimeout(() => {
				lowp.disconnect();
				gain.disconnect();
				absn.stop();
			}, .6 * 1000 );
		},
	}
} );
