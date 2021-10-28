import JcApp from './src/jcbooster.min.js';
import BoosterFunction from './src/jcbooster.function.min.js';
import BoosterProto from './src/jcbooster.proto.min.js';


window.addEventListener('load', e => {
	BoosterFunction();
	window.jcApp = new JcApp(); BoosterProto(); jcApp.init(e.srcElement); 
	// let apps 	= document.createEvent("Event");
	// 	apps.jcApp 	= jcApp;
	// 	apps.initEvent("readyApps", true, true);

	let apps = new CustomEvent('readyApps', {
		detail: {
			hazcheeseburger: true
		},
		bubbles: true,
		cancelable: true,
		composed: true,
		cancelBubble: false
	});
	
	apps.jcApp = jcApp;
	document.dispatchEvent(apps);
});