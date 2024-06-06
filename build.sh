#!/bin/bash

writeHeader() {
	echo '<!DOCTYPE html>'
	echo '<html lang="en">'
	echo '<head>'
	echo '<title>Piano by GridSound</title>'
	echo '<meta charset="utf-8"/>'
	echo '<meta name="viewport" content="width=device-width"/>'
	echo '<meta name="description" content="A virtual piano"/>'
	echo '<meta name="google" content="notranslate"/>'
	echo '<meta property="og:type" content="website"/>'
	echo '<meta property="og:title" content="Piano by GridSound"/>'
	echo '<meta property="og:url" content="https://piano.gridsound.com"/>'
	echo '<meta property="og:image" content="https://piano.gridsound.com/cover.png"/>'
	echo '<meta property="og:image:width" content="1290"/>'
	echo '<meta property="og:image:height" content="624"/>'
	echo '<meta property="og:description" content="A virtual piano"/>'
	echo '<link rel="manifest" href="manifest.json"/>'
	echo '<link rel="shortcut icon" href="assets/favicon.png"/>'
}
writeBody() {
	echo '</head>'
	echo '<body>'
	echo '<noscript>need JavaScript</noscript>'
}
writeEnd() {
	echo '</body>'
	echo '</html>'
}
writeCSS() {
	printf '<link rel="stylesheet" href="%s"/>\n' "${CSSfiles[@]}"
}
writeJS() {
	printf '<script src="%s"></script>\n' "${JSfiles[@]}"
}
writeCSScompress() {
	echo -n '' > allCSS.css
	cat "${CSSfiles[@]}" >> allCSS.css
	echo '<style>'
	csso allCSS.css
	echo '</style>'
	rm allCSS.css
}
writeJScompress() {
	echo '"use strict";' > allJS.js
	cat "${JSfilesProd[@]}" >> allJS.js
	cat "${JSfiles[@]}" >> allJS.js
	echo '<script>'
	terser allJS.js --compress --mangle --toplevel --mangle-props "regex='^[$]'"
	echo '</script>'
	rm allJS.js
}

declare -a CSSfiles=(
	"assets/fonts/fonts.css"
	"gs-ui-components/gsui.css"
	"gs-ui-components/gsuiIcon/gsuiIcon.css"
	"gs-ui-components/gsuiKeys/gsuiKeys.colors.default.css"
	"gs-ui-components/gsuiKeys/gsuiKeys.css"
	"gs-ui-components/gsuiAnalyserTime/gsuiAnalyserTime.css"
	"style.css"
)

declare -a JSfilesProd=(
	"initServiceWorker.js"
)

declare -a JSfiles=(
	# "checkBrowser.js"
	"gs-utils/gs-utils.js"
	"gs-utils/gs-utils-dom.js"
	"gs-ui-components/gsui0ne/gsui0ne.js"
	"gs-ui-components/gsuiKeys/gsuiKeys.html.js"
	"gs-ui-components/gsuiKeys/gsuiKeys.js"
	"gs-ui-components/gsuiAnalyserTime/gsuiAnalyserTime.js"
	"gs-wa-components/gswaMIDIControllersManager/gswaMIDIControllersManager.js"
	"gs-wa-components/gswaMIDIControllersManager/gswaMIDIControllerInput.js"
	"gs-wa-components/gswaMIDIControllersManager/gswaMIDIControllerOutput.js"
	"run.js"
)

buildDev() {
	filename='index.html'
	echo "Build $filename"
	writeHeader > $filename
	writeCSS >> $filename
	writeBody >> $filename
	echo '<script>function lg( a ) { return console.log.apply( console, arguments ), a; }</script>' >> $filename
	writeJS >> $filename
	writeEnd >> $filename
}

buildProd() {
	filename='index-prod.html'
	echo "Build $filename"
	writeHeader > $filename
	writeCSScompress >> $filename
	writeBody >> $filename
	echo '<script>function lg(a){return a}</script>' >> $filename
	writeJScompress >> $filename
	writeEnd >> $filename
}

lint() {
	stylelint "${CSSfiles[@]}"
	echo '"use strict";' > __lintMain.js
	cat "${JSfilesProd[@]}" | grep -v '"use strict";' >> __lintMain.js
	cat "${JSfiles[@]}" | grep -v '"use strict";' >> __lintMain.js
	eslint __lintMain.js && rm __lintMain.js
}

updateDep() {
	git submodule init
	git submodule update --remote
}

if [ $# = 0 ]; then
	echo '          --------------------------------'
	echo '        .:: GridSound build shell-script ::.'
	echo '        ------------------------------------'
	echo ''
	echo './build.sh dev ---> create "index.html" for development'
	echo './build.sh prod --> create "index-prod.html" for production'
	echo './build.sh lint --> launch the JS/CSS linters (ESLint and Stylelint)'
	echo './build.sh dep ---> update all the submodules'
elif [ $1 = "dep" ]; then
	updateDep
elif [ $1 = "dev" ]; then
	buildDev
elif [ $1 = "prod" ]; then
	buildProd
elif [ $1 = "lint" ]; then
	lint
fi
