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
const keysMapAs = createKeysMap( {
	21: 14,
	33: 14,
	45: 12,
	57: 10,
	69: 8,
	81: 5,
	93: 3,
	105: 2,
} );
const keysMapADs = createKeysMap( {
	21: 14,
	26: 14,
	33: 14,
	38: 12,
	45: 12,
	50: 10,
	57: 10,
	62: 8,
	69: 8,
	74: 6,
	81: 5,
	86: 4,
	93: 3,
	98: 2,
	105: 2,
} );
const keysMap88 = createKeysMap( {
	21: 14,
	22: 14,
	23: 14,
	24: 14,
	25: 14,
	26: 14,
	27: 14,
	28: 14,
	29: 14,
	30: 14,
	31: 14,
	32: 14,
	33: 14,
	34: 14,
	35: 14,
	36: 12,
	37: 12,
	38: 12,
	39: 12,
	40: 12,
	41: 12,
	42: 12,
	43: 12,
	44: 12,
	45: 12,
	46: 12,
	47: 12,
	48: 10,
	49: 10,
	50: 10,
	51: 10,
	52: 10,
	53: 10,
	54: 10,
	55: 10,
	56: 10,
	57: 10,
	58: 10,
	59: 10,
	60: 8,
	61: 8,
	62: 8,
	63: 8,
	64: 8,
	65: 8,
	66: 8,
	67: 8,
	68: 8,
	69: 8,
	70: 8,
	71: 8,
	72: 6,
	73: 6,
	74: 6,
	75: 6,
	76: 6,
	77: 6,
	78: 5,
	79: 5,
	80: 5,
	81: 5,
	82: 5,
	83: 5,
	84: 4,
	85: 4,
	86: 4,
	87: 4,
	88: 4,
	89: 4,
	90: 3,
	91: 3,
	92: 3,
	93: 3,
	94: 3,
	95: 3,
	96: 2,
	97: 2,
	98: 2,
	99: 2,
	100: 2,
	101: 2,
	102: 2,
	103: 2,
	104: 2,
	105: 2,
	106: 2,
	107: 2,
	108: 2,
} );

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
		.then( arr => GSUsetAttribute( root, "ready", true ) )
		.catch( () => root.onclick = bodyInitClick )
		.finally( () => GSUsetAttribute( root, "dl", false ) );
};

function dlPianoAssets() {
	/** /
	return fetch( "assets/🎹/allA-ff.128k.mp3" )
		.then( res => res.arrayBuffer() )
		.then( arr => ctx.decodeAudioData( arr ) )
		.then( all => bufKeysAs = all );
	/** /
	return fetch( "assets/🎹/allAD-ff.128k.mp3" )
		.then( res => res.arrayBuffer() )
		.then( arr => ctx.decodeAudioData( arr ) )
		.then( all => bufKeysADs = all );
	/**/
	return fetch( "assets/🎹/all88-ff.128k.mp3" )
		.then( res => res.arrayBuffer() )
		.then( arr => ctx.decodeAudioData( arr ) )
		.then( all => bufKeys88 = all );
	/**/
}

GSUlistenEvents( uiKeys, {
	gsuiKeys: {
		keyDown: d => {
			const [ key, vel ] = d.args;
			const key2 = key + 12;
			// const [ bufOff, bufDur, change ] = keysMapAs[ key2 ];
			// const [ bufOff, bufDur, change ] = keysMapADs[ key2 ];
			const [ bufOff, bufDur, change ] = keysMap88[ key2 ];
			const vel2 = Math.max( .25, Math.min( vel / .85, 1 ) );
			const absn = ctx.createBufferSource();
			const gain = ctx.createGain();
			const lowp = ctx.createBiquadFilter();
			const freq = 440 * 2 ** ( ( ( key2 + change ) - 69 ) / 12 );
			const filt = ( freq + 5000 * GSUeaseInCirc( vel2 ) ) / ( 1 / vel2 );

			// absn.buffer = bufKeysAs;
			// absn.buffer = bufKeysADs;
			absn.buffer = bufKeys88;
			lowp.type = "lowpass";
			lowp.Q.setValueAtTime( 0, ctx.currentTime );
			lowp.frequency.setValueAtTime( filt, ctx.currentTime );
			gain.gain.setValueAtTime( vel2, ctx.currentTime );
			if ( change ) {
				absn.playbackRate.value = 1 * ( 2 ** ( change / 12 ) );
			}
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
