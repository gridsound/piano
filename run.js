"use strict";

const pianoPath = "M4.57764e-05 112.676C3.86599e-05 90.6737 0 73 8.5 52.5C17 32 33.9306 20.4349 39 17.5C48.5 12 70 -3.05176e-05 110 -1.52587e-05C150 0 192 16 216.5 46.5C235 69.5 244.5 88 247 133.5C249.5 179 253.5 188.5 268.5 213C283.5 237.5 347.5 265 355.5 284.5C363.5 304 360 394 360 394H4.57764e-05C4.57764e-05 394 6.10352e-05 159.851 4.57764e-05 112.676Z";

document.body.append(
	GSUcreateDiv( { id: "head" },
		GSUcreateElement( "gsui-analysertime", { color: "#ddd", pinch: 1, amp: 10 } ),
		GSUcreateDiv( { id: "title" },
			GSUcreateSpan( null, "Piano" ),
			GSUcreateSpan( null, "by GridSound" ),
		),
	),
	GSUcreateDiv( { id: "myPiano" },
		GSUcreateDiv( { id: "pianoTop" },
			GSUcreateElementSVG( "svg", { id: "pianoSVGGradients" },
				GSUcreateElementSVG( "defs", null,
					GSUcreateElementSVG( "linearGradient", { id: "pianoGradient", x1: "0%", x2: "0%", y1: "0%", y2: "100%" },
						GSUcreateElementSVG( "stop", { offset:  "50%", "stop-color": "#00000040" } ),
						GSUcreateElementSVG( "stop", { offset: "100%", "stop-color": "#00000000" } ),
					),
					GSUcreateElementSVG( "linearGradient", { id: "pianoGradient2", x1: "100%", x2: "0%", y1: "0%", y2: "0%" },
						GSUcreateElementSVG( "stop", { offset:  "50%", "stop-color": "#00000030" } ),
						GSUcreateElementSVG( "stop", { offset: "100%", "stop-color": "#00000000" } ),
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
			GSUcreateElement( "gsui-keys", { orient: "horizontal", rootoctave: 2, octaves: "1 4" } ),
			GSUcreateDiv( { id: "octaves-loaders" },
				GSUcreateDiv( { class: "octave-loader", style: { animationDelay: ".0s" } } ),
				GSUcreateDiv( { class: "octave-loader", style: { animationDelay: ".05s" } } ),
				GSUcreateDiv( { class: "octave-loader", style: { animationDelay: ".10s" } } ),
				GSUcreateDiv( { class: "octave-loader", style: { animationDelay: ".15s" } } ),
				GSUcreateDiv( { class: "octave-loader", style: { animationDelay: ".20s" } } ),
				GSUcreateDiv( { class: "octave-loader", style: { animationDelay: ".25s" } } ),
				GSUcreateDiv( { class: "octave-loader", style: { animationDelay: ".30s" } } ),
			),
		),
	),
	GSUcreateDiv( { id: "analyserBottom" } ),
	GSUcreateDiv( { id: "foot" },
		GSUcreateDiv( { id: "readme" },
			GSUcreateSpan( null, "The raw audio samples come from a Piano " ),
			GSUcreateI( null, "Steinway & Sons model B" ),
			GSUcreateSpan( null, " recorded at " ),
			GSUcreateAExt( { href: "https://theremin.music.uiowa.edu/MISpiano.html" }, "the university of Iowa" ),
			GSUcreateSpan( null, " — " ),
			GSUcreateAExt( { href: "https://github.com/gridsound/piano" }, "source code" ),
		),
		GSUcreateSpan( { id: "copyright" },
			"© 2024 ",
			GSUcreateA( { href: "https://gridsound.com" }, "gridsound.com" ),
			" all rights reserved",
		),
	),
);

const root = document.querySelector( "#myPiano" );
const head = document.querySelector( "#head" );
const uiKeys = document.querySelector( "gsui-keys" );
const uiAnTime = document.querySelector( "gsui-analysertime" );
const anBottom = document.querySelector( "#analyserBottom" );
const octavesLoadersWrap = document.querySelector( "#octaves-loaders" );
const octavesLoaders = octavesLoadersWrap.getElementsByClassName( "octave-loader" );
const szKey = GSUonMobile ? 24 : 16;
const octaveBuffers = {};
const keyboardDown = {};
const octaveURLs = {
	1: "assets/🎹/21-35.96k.mp3",
	2: "assets/🎹/36-47.96k.mp3",
	3: "assets/🎹/48-59.96k.mp3",
	4: "assets/🎹/60-71.96k.mp3",
	5: "assets/🎹/72-83.96k.mp3",
	6: "assets/🎹/84-95.96k.mp3",
	7: "assets/🎹/96-108.96k.mp3",
};
const absnMap = new Map();
const ctx = new AudioContext();
const analyserNode = ctx.createAnalyser();
const analyserFFTSize = 512;
const analyserData = new Uint8Array( analyserFFTSize / 2 );
let nbOct = 0;
const keysMap88 = {
	// assets/🎹/21-35
	21: [ 1, 14, 14 *  0 ],
	22: [ 1, 14, 14 *  1 ],
	23: [ 1, 14, 14 *  2 ],
	24: [ 1, 14, 14 *  3 ],
	25: [ 1, 14, 14 *  4 ],
	26: [ 1, 14, 14 *  5 ],
	27: [ 1, 14, 14 *  6 ],
	28: [ 1, 14, 14 *  7 ],
	29: [ 1, 14, 14 *  8 ],
	30: [ 1, 14, 14 *  9 ],
	31: [ 1, 14, 14 * 10 ],
	32: [ 1, 14, 14 * 11 ],
	33: [ 1, 14, 14 * 12 ],
	34: [ 1, 14, 14 * 13 ],
	35: [ 1, 14, 14 * 14 ],

	// assets/🎹/36-47
	36: [ 2, 12, 12 *  0 ],
	37: [ 2, 12, 12 *  1 ],
	38: [ 2, 12, 12 *  2 ],
	39: [ 2, 12, 12 *  3 ],
	40: [ 2, 12, 12 *  4 ],
	41: [ 2, 12, 12 *  5 ],
	42: [ 2, 12, 12 *  6 ],
	43: [ 2, 12, 12 *  7 ],
	44: [ 2, 12, 12 *  8 ],
	45: [ 2, 12, 12 *  9 ],
	46: [ 2, 12, 12 * 10 ],
	47: [ 2, 12, 12 * 11 ],

	// assets/🎹/48-59
	48: [ 3, 10, 10 *  0 ],
	49: [ 3, 10, 10 *  1 ],
	50: [ 3, 10, 10 *  2 ],
	51: [ 3, 10, 10 *  3 ],
	52: [ 3, 10, 10 *  4 ],
	53: [ 3, 10, 10 *  5 ],
	54: [ 3, 10, 10 *  6 ],
	55: [ 3, 10, 10 *  7 ],
	56: [ 3, 10, 10 *  8 ],
	57: [ 3, 10, 10 *  9 ],
	58: [ 3, 10, 10 * 10 ],
	59: [ 3, 10, 10 * 11 ],

	// assets/🎹/60-71
	60: [ 4, 8, 8 *  0 ],
	61: [ 4, 8, 8 *  1 ],
	62: [ 4, 8, 8 *  2 ],
	63: [ 4, 8, 8 *  3 ],
	64: [ 4, 8, 8 *  4 ],
	65: [ 4, 8, 8 *  5 ],
	66: [ 4, 8, 8 *  6 ],
	67: [ 4, 8, 8 *  7 ],
	68: [ 4, 8, 8 *  8 ],
	69: [ 4, 8, 8 *  9 ],
	70: [ 4, 8, 8 * 10 ],
	71: [ 4, 8, 8 * 11 ],

	// assets/🎹/72-83
	72: [ 5, 6, 6 * 0 ],
	73: [ 5, 6, 6 * 1 ],
	74: [ 5, 6, 6 * 2 ],
	75: [ 5, 6, 6 * 3 ],
	76: [ 5, 6, 6 * 4 ],
	77: [ 5, 6, 6 * 5 ],
	78: [ 5, 5, 6 * 6 + 5 * 0 ],
	79: [ 5, 5, 6 * 6 + 5 * 1 ],
	80: [ 5, 5, 6 * 6 + 5 * 2 ],
	81: [ 5, 5, 6 * 6 + 5 * 3 ],
	82: [ 5, 5, 6 * 6 + 5 * 4 ],
	83: [ 5, 5, 6 * 6 + 5 * 5 ],

	// assets/🎹/84-95
	84: [ 6, 4, 4 * 0 ],
	85: [ 6, 4, 4 * 1 ],
	86: [ 6, 4, 4 * 2 ],
	87: [ 6, 4, 4 * 3 ],
	88: [ 6, 4, 4 * 4 ],
	89: [ 6, 4, 4 * 5 ],
	90: [ 6, 3, 4 * 6 + 3 * 0 ],
	91: [ 6, 3, 4 * 6 + 3 * 1 ],
	92: [ 6, 3, 4 * 6 + 3 * 2 ],
	93: [ 6, 3, 4 * 6 + 3 * 3 ],
	94: [ 6, 3, 4 * 6 + 3 * 4 ],
	95: [ 6, 3, 4 * 6 + 3 * 5 ],

	// assets/🎹/96-108
	 96: [ 7, 2, 2 *  0 ],
	 97: [ 7, 2, 2 *  1 ],
	 98: [ 7, 2, 2 *  2 ],
	 99: [ 7, 2, 2 *  3 ],
	100: [ 7, 2, 2 *  4 ],
	101: [ 7, 2, 2 *  5 ],
	102: [ 7, 2, 2 *  6 ],
	103: [ 7, 2, 2 *  7 ],
	104: [ 7, 2, 2 *  8 ],
	105: [ 7, 2, 2 *  9 ],
	106: [ 7, 2, 2 * 10 ],
	107: [ 7, 2, 2 * 11 ],
	108: [ 7, 2, 2 * 12 ],
};

analyserNode.fftSize = analyserFFTSize;
analyserNode.smoothingTimeConstant = 0;

function frame() {
	analyserNode.getByteTimeDomainData( analyserData );
	uiAnTime.$draw( analyserData );
	requestAnimationFrame( frame );
}

frame();

uiKeys.style.fontSize = `${ szKey }px`;
gsuiKeys.$keyNotation( "CDEFGAB" );

document.body.onresize = onresize;
document.body.onclick = () => {
	if ( ctx.state !== "running" ) {
		ctx.resume();
	}
};
document.body.onkeydown = e => {
	const key = uiKeys.$getMidiKeyFromKeyboard( e );

	if ( key !== false && !( key in keyboardDown ) ) {
		keyboardDown[ key ] = true;
		uiKeys.$midiKeyDown( key );
	}
};
document.body.onkeyup = e => {
	const key = uiKeys.$getMidiKeyFromKeyboard( e );

	if ( key !== false ) {
		delete keyboardDown[ key ];
		uiKeys.$midiKeyUp( key );
	}
};

GSUlistenEvents( uiKeys, {
	gsuiKeys: {
		keyDown: d => startKey( ...d.args ),
		keyUp: d => stopKey( ...d.args ),
	}
} );

onresize();

function onresize() {
	const sz = document.body.clientWidth - 80;
	const nbOct2 = Math.max( 1, Math.min( Math.floor( sz / ( 12 * szKey ) ), 7 ) );

	if ( nbOct !== nbOct2 ) {
		if ( ( nbOct === 1 ) !== ( nbOct2 === 1 ) ) {
			( nbOct2 === 1 ? anBottom : head ).prepend( uiAnTime );
		}
		nbOct = nbOct2;
		GSUsetAttribute( uiKeys, "octaves", `1 ${ nbOct }` );
		for ( let i = 0; i < octavesLoaders.length; ++i ) {
			const needed = i < nbOct;

			octavesLoaders[ i ].classList.toggle( "octave-needed", needed );
			if ( needed && !octaveBuffers[ i + 1 ] ) {
				dlOctave( i + 1 );
			}
		}
		head.style.width =
		anBottom.style.width = `${ uiKeys.parentNode.clientWidth }px`;
	}
}

function dlOctave( oct ) {
	const url = octaveURLs[ oct ];
	const loadCl = octavesLoaders[ oct - 1 ].classList;

	loadCl.add( "octave-loading" );
	return fetch( url )
		.then( res => res.arrayBuffer() )
		.then( arr => ctx.decodeAudioData( arr ) )
		.then( buf => {
			octaveBuffers[ oct ] = buf;
			loadCl.remove( "octave-loading" );
			return [ buf, ...GSUsplitNums( url.split( "/" )[ 2 ].split( "." )[ 0 ], "-" ) ];
		} );
}

function startKey( key, vel ) {
	const key2 = key + 12;
	const [ octave, bufDur, bufOff ] = keysMap88[ key2 ];
	const buf = octaveBuffers[ octave ];
	const vel2 = Math.max( .001, GSUeaseOutCirc( ( .2 + vel ) * ( 1 / 1.2 ) ) );
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
	gain.connect( analyserNode );
	absn
		.connect( lowp )
		.connect( gain )
		.connect( ctx.destination );
	absn.start( 0, bufOff, bufDur );
	absnMap.set( key2, [ absn, gain, lowp, vel2 ] );
}

function stopKey( key ) {
	const key2 = key + 12;
	const absnData = absnMap.get( key2 );

	if ( absnData ) {
		const [ absn, gain, lowp, vel ] = absnData;

		gain.gain.setValueCurveAtTime( new Float32Array( [ vel, 0 ] ), ctx.currentTime, .35 );
		setTimeout(() => {
			lowp.disconnect();
			gain.disconnect();
			absn.stop();
		}, .6 * 1000 );
	}
}
