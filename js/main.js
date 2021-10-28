var __jproxyStatus = false;
var match = [];
var arrProxy = [];

function removeProxy(el) {
	chrome.storage.sync.get(null, items => {
		if ( items.jProxy != null ) {
			let notif = (items.jCountry == null)? items.jProxy : items.jCountry;
			chrome.storage.sync.set({jProxy: null, jCountry: null}, _ => {
				jcApp.alertDialog("Disconnected " + notif, true);
			})
		}
	});
};

function removeUserAgent(el) {
	chrome.storage.sync.get(null, items => {
		if ( items.jUserAgent != null ) {
			let ua = items.jUserAgent;
			chrome.storage.sync.set({jUserAgent: null}, _ => {
				jcApp.alertDialog("UserAgent " + ua + " Removed", true);	
			})
		}
	});
};

function saveProxy(inProxy, inCountry) {
	if ( inProxy.match('\n') != null || inProxy.match('\t') != null || inProxy.length <= 5 ) {
		jcApp.alertDialog("Not Valid IP:port Proxy!", false);
		return;
	}
	chrome.storage.sync.set({
		jProxy: inProxy,
		jCountry: inCountry
	}, _ => {
		let notif = (inCountry == null)? inProxy : inCountry;
		jcApp.alertDialog("Connected " + notif, true);	
	});
};


function saveUserAgent(ua) {
	if ( ua.match('\n') != null || ua.match('\t') != null || ua.length <= 5 ) {
		jcApp.alertDialog("Not Valid UserAgent!", false);
		return;
	}
	chrome.storage.sync.set({
		jUserAgent: ua
	}, _ => {
		jcApp.alertDialog("UserAgent " + ua + " Saved", true);	
	});
};

function trackProxy_old(el) {
	ajax.POST({url: "https://localhost/Umum/my_fun/web_traffic/proxy_list.php", send:false}, response => {
		if ( response ) {
			jcApp.jsonParse(response, res => {
				res.data.forEach( dt0 => {
					query('#proxy-list').innerHTML += `
						<div class="card card-light list" proxy="${dt0.proxy}" country="${dt0.country}" style="cursor: pointer; margin-bottom: 2px;">
							<span>${dt0.proxy}</span><span style="float:right">${dt0.country}</span>
						</div>
					`;
				});

				initRoll();
			});
		}
	});
};

function trackProxy(el) {
	if ( query('#proxy-list') == null ) {
		return;
	};

	query('#proxy-list').innerHTML = "";
	ajax.GET({url: "https://www.sslproxies.org", send:false}, response => {
		if ( response ) {
			match = response.match(/<td>\d{1,3}.\d{1,3}.\d{1,3}.\d{1,3}(.*?)<td class='hm'>(.*?)<\/td>/g);
			arrProxy = [];
			match.forEach( dt0 => {
				dt0 = dt0.replace(/<td>/g, ",")
					.replace(/<\/td>/g, ",")
					.replace(/<td class='hm'>/g, "")
					.replace(/,,/g, ",")
					.split(",");
				arrProxy.push({proxy: dt0[1]+":"+dt0[2], country: dt0[4]});
				query('#proxy-list').innerHTML += `
					<div class="card card-light list" proxy="${dt0[1]+":"+dt0[2]}" country="${dt0[4]}" style="cursor: pointer; margin-bottom: 2px;">
						<span>${dt0[1]+":"+dt0[2]}</span><span style="float:right">${dt0[4]}</span>
					</div>
				`;
			});

			initRoll();
		}
	});
};

function trackUserAgent(url) {
	if ( url.match("http") == null ) {
		jcApp.alertDialog("URL not valid!", false);
		return;
	}
	if ( query('#useragent-list') == null ) {
		return;
	};

	query('#useragent-list').innerHTML = "";
	ajax.GET({url: url, send: false}, response => {
		if ( response ) {
			match = response.match(/class="code">(.*?)<\/a>/g);
			if ( match == null ) {
				query('#useragent-list').innerHTML = `>>> No Data Match!`;
				return;
			}
			match.forEach( dt0 => {
				dt0 = dt0.replace(/class="code">/g, "#")
					.replace(/<\/a>/g, "#")
					.replace(/##/g, "#")
					.split("#");
				query('#useragent-list').innerHTML += `
					<div class="card card-light list" useragent="${dt0[1]}" style="cursor: pointer; margin-bottom: 2px;">
						<span>${dt0[1]}</span>
					</div>
				`;
			});

			initRoll();
		}
	});
};

function goSettingPage() {
	chrome.tabs.create({ url: "index.html" });
};

function isPerangkat(ua) {
	if ( ua == null || ua == undefined || ua == "" ) {
		return "Default";
	}
	else {
		return (ua.match(/\((.*)\)/gm).pop().split(')'))[0] + ")";
	}
};

function autoFillSetting() {
	chrome.storage.sync.get(null, items => {
		/* notif connect */
		if ( items.jProxy != null ) {
			__jproxyStatus = true;
			if ( query('#btn-toggle-proxy') != null ) {
				query('#btn-toggle-proxy').classList.remove("off");
				query('#btn-toggle-proxy').classList.add("on");
			}
		}
		else {
			__jproxyStatus = false;
			if ( query('#btn-toggle-proxy') != null ) {
				query('#btn-toggle-proxy').classList.remove("on");
				query('#btn-toggle-proxy').classList.add("off");
			}
		};

		/* index page */
		if ( query('.in-useragent') != null && query('.in-proxy') != null ) {
			query('.in-useragent').value = (items.jUserAgent != null)? items.jUserAgent: "";
			query('.in-proxy').value = (items.jProxy != null)? items.jProxy: "";
		};
		
		/* popup page*/
		if ( query('.nt-status') != null && query('.str-perangkat') != null ) {
			query('.str-perangkat').innerHTML = (items.jUserAgent != null)? isPerangkat(items.jUserAgent): "Default";
			query('.nt-status').innerHTML = (items.jCountry != null)? items.jCountry: "Not Connected";
		};
	});
};

function toggleProxy(el) {
	if ( __jproxyStatus ) {
		removeProxy();
	}
	else {
		goSettingPage();
	}
};

function initRoll() {
	if ( query('#proxy-list .list') != null ) {
		queryAll('#proxy-list .list').forEach( el => {
			el.addEventListener("click", _ => {
				saveProxy(el.getAttribute('proxy'), el.getAttribute('country'));
			});
		})
	}

	if ( query('#useragent-list .list') != null ) {
		queryAll('#useragent-list .list').forEach( el => {
			el.addEventListener("click", _ => {
				saveUserAgent(el.getAttribute('useragent'));
			});
		})
	}
};

function initJproxy() {
	/* autofill usage setting */
	chrome.storage.onChanged.addListener(function (changes, namespace) {
		autoFillSetting();
	});

	/* track proxy */
	if ( query('#btn-track-proxy') != null ) {
		query('#btn-track-proxy').addEventListener("click", e => {
			trackProxy(e.target);
		});
	};

	/* track proxy */
	if ( query('#btn-track-useragent') != null ) {
		query('#btn-track-useragent').addEventListener("click", e => {
			trackUserAgent(e.target.parentElement.querySelector('input').value);
		});
	};

	/* save manual proxy */
	if ( query('#save-proxy') != null ) {
		query('#save-proxy').addEventListener("click", e => {
			saveProxy(e.target.parentElement.querySelector('input').value, null);
		});
	};

	/* remove setting */
	if ( query('#remove-proxy') != null ) {
		query('#remove-proxy').addEventListener("click", e => {
			removeProxy(e.target);
		});
	};

	/* save manual useragent */
	if ( query('#save-useragent') != null ) {
		query('#save-useragent').addEventListener("click", e => {
			saveUserAgent(e.target.parentElement.querySelector('input').value);
		});
	};

	/* remove setting */
	if ( query('#remove-useragent') != null ) {
		query('#remove-useragent').addEventListener("click", e => {
			removeUserAgent(e.target);
		});
	};

	/* toggle proxy */
	if ( query('#btn-toggle-proxy') != null ) {
		query('#btn-toggle-proxy').addEventListener("click", e => {
			toggleProxy(e.target);
		});
	};

	/* toggle proxy */
	if ( query('#btn-gosetting') != null ) {
		query('#btn-gosetting').addEventListener("click", e => {
			goSettingPage();
		});
	}
};

document.addEventListener("readyApps", Res => {
	initJproxy(); initRoll(); autoFillSetting(); trackProxy(false);
	trackUserAgent("https://developers.whatismybrowser.com/useragents/explore/operating_system_name/windows/");
});