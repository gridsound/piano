"use strict";

document.body.append(
	GSUcreateElement( "div", { id: "title" },
		GSUcreateElement( "span", null, "Piano" ),
		GSUcreateElement( "span", null, "by GridSound" ),
	),
	GSUcreateElement( "div", { id: "myPiano" },
		GSUcreateElement( "div", { id: "velocityLabel" },
			GSUcreateElement( "i", { class: "gsuiIcon", "data-icon": "arrow-up" } ),
			GSUcreateElement( "span", null, "velocity" ),
			GSUcreateElement( "i", { class: "gsuiIcon", "data-icon": "arrow-down" } ),
		),
		GSUcreateElement( "div", { id: "niceBorder" },
			GSUcreateElement( "gsui-keys", { orient: "horizontal", rootoctave: 4, octaves: "1 4" } ),
			GSUcreateElement( "i", { class: "gsuiIcon loading", "data-spin": "on" } ),
		),
	),
	GSUcreateElement( "div", { id: "foot" },
		GSUcreateElement( "span", { id: "copyright" },
			"© 2024 ",
			GSUcreateElement( "a", { href: "https://gridsound.com" }, "gridsound.com" ),
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
