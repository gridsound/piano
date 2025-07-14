export default {
	title:         "Piano by GridSound",
	desc:          "A virtual piano",
	favicon:       "assets/favicon.png",
	url:           "https://piano.gridsound.com/",
	ogImage:       "https://piano.gridsound.com/cover.png",
	ogImageW:      1290,
	ogImageH:       624,
	serviceWorker: "serviceWorker.js",
	manifest:      "manifest.json",
	// .........................................................................
	cssSrcA: [
		"assets/fonts/fonts.css",
	],
	cssSrcB: [
		"style.css",
	],
	// jsSrcA: [
	// 	"checkBrowser.js",
	// ],
	jsSrcB: [
		"run.js",
	],
	// .........................................................................
	cssDep: [
		"gs-ui-components/gsui.css",
		"gs-ui-components/gsuiIcon/gsuiIcon.css",
		"gs-ui-components/gsuiAnalyserHist/gsuiAnalyserHist.css",
		"gs-ui-components/gsuiKeys/gsuiKeys.css",
	],
	// .........................................................................
	jsDep: [
		"gs-utils/gs-utils.js",
		"gs-utils/gs-utils-dom.js",
		"gs-utils/gs-utils-math.js",
		"gs-utils/gs-utils-func.js",
		"gs-utils/gs-utils-checkType.dev.js",
		"gs-utils/gs-utils-audio-nodes.dev.js",

		// .....................................................................
		"gs-ui-components/gsui0ne/gsui0ne.js",
		"gs-ui-components/gsuiAnalyserTd/gsuiAnalyserTd.js",
		"gs-ui-components/gsuiKeys/gsuiKeys.html.js",
		"gs-ui-components/gsuiKeys/gsuiKeys.js",

		// .....................................................................
		"gs-wa-components/gswaMIDIDevices/gswaMIDIDevices.js",
		"gs-wa-components/gswaMIDIDevices/gswaMIDIInput.js",
		"gs-wa-components/gswaMIDIDevices/gswaMIDIOutput.js",
	],
};
