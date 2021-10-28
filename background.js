(function(chrome, console){
	'use strict';
	
	function Jproxy() {
		var objStorage = {};
		var userAgent = null;
		
		/* useragent config */
		var userAgentConfig = function(details) {
			if ( objStorage.jUserAgent != null && objStorage.jUserAgent.length > 5 ) {
				userAgent = objStorage.jUserAgent;
			}
			else {
				userAgent = localStorage.getItem("__ua");
			}
			for (var i = 0; i < details.requestHeaders.length; ++i) {
				if (details.requestHeaders[i].name === 'User-Agent') {
					details.requestHeaders[i].value = userAgent;
				break;
				}
			}
			return { requestHeaders: details.requestHeaders };
		};

		/* set user agent */
		var setUserAgent = function(ua) {
			chrome.webRequest.onBeforeSendHeaders.addListener(function (details) {
					return userAgentConfig(details);
				},
				{ urls: ['<all_urls>'] },
				['blocking', 'requestHeaders']
			);	
		}
		

		/* proxy config */
		var proxyConfig = function (proxyAddress) {
	        if (proxyAddress === null || proxyAddress === "") {
	            return {
	                mode: "direct"
	            };
	        }
	        return {
	            mode: "fixed_servers",
	            rules: {
	                proxyForHttp: {
	                    host: proxyAddress.split(":")[0],
	                    port: parseInt(proxyAddress.split(":")[1])
	                },
	                proxyForHttps: {
	                    host: proxyAddress.split(":")[0],
	                    port: parseInt(proxyAddress.split(":")[1])
	                },
	                bypassList: ["www.google.com"]
	            }
	        }
	    };

	    /* set proxy setting */
	    var setProxy = function(proxy) {
			chrome.proxy.settings.set( {value: proxyConfig(proxy), scope: 'regular'},function(e) {
				console.log(e);
				// something
				//if (proxyAddress !== "" && proxyUsername !== "") {
		            if (chrome.webRequest.onAuthRequired) {
						chrome.webRequest.onAuthRequired.addListener(function (details) {
							console.log(details)
						//return authCredentials(proxyUsername.trim(), proxyPassword.trim());
						}, {urls: ['<all_urls>']}, ['blocking']);
					} else {
						chrome.webRequest.onBeforeSendHeaders.addListener(function (details) {
							return userAgentConfig(details)
						//return credentialsToHeader(details, proxyUsername.trim(), proxyPassword.trim());
						}, {urls: ['<all_urls>']}, ['blocking', 'requestHeaders']);
					}
		        //}
			});	    	
	    }

	    /* init runnig */
	    this.init = function() {
	    	localStorage.setItem("__ua", navigator.userAgent)
	    	chrome.storage.sync.get( null , items => {
	    		objStorage = items;
	    		setUserAgent(items.jUserAgent);
				setProxy(items.jProxy);
	    	});
	    	chrome.storage.onChanged.addListener(function (changes, namespace) {
				chrome.storage.sync.get(null, items => {
					objStorage = items;
					setUserAgent(items.jUserAgent);
					setProxy(items.jProxy);
				});
			});
	    }
	}

	new Jproxy().init();
}(chrome, console));

