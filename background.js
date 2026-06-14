"use strict";

const PageRuler = {
	init: function(type, previousVersion) {
		const manifest = chrome.runtime.getManifest();
		const version = manifest.version;
		switch (type) {
			case "install":
				chrome.storage.sync.set({
					statistics: true,
					hide_update_tab: false
				});
				break;
		}
	},
	image: function(file) {
		return {
			"19": "images/19/" + file,
			"38": "images/38/" + file
		};
	},
	load: async function(tabId) {
		try {
			await chrome.scripting.executeScript({
				target: { tabId: tabId },
				files: ["content.js"]
			});
			PageRuler.enable(tabId);
		} catch (e) {
			console.error("Failed to load content script:", e);
		}
	},
	enable: function(tabId) {
		chrome.tabs.sendMessage(tabId, { type: "enable" }, function() {
			chrome.action.setIcon({
				path: PageRuler.image("browser_action_on.png"),
				tabId: tabId
			});
		});
	},
	disable: function(tabId) {
		chrome.tabs.sendMessage(tabId, { type: "disable" }, function() {
			chrome.action.setIcon({
				path: PageRuler.image("browser_action.png"),
				tabId: tabId
			});
		});
	},
	browserAction: function(tab) {
		const tabId = tab.id;
		chrome.scripting.executeScript({
			target: { tabId: tabId },
			func: () => {
				chrome.runtime.sendMessage({
					action: 'loadtest',
					loaded: window.hasOwnProperty('__PageRuler'),
					active: window.hasOwnProperty('__PageRuler') && window.__PageRuler.active
				});
			}
		});
	},
	openUpdateTab: function(type) {
		chrome.storage.sync.get("hide_update_tab", function(items) {
			if (!items.hide_update_tab) {
				chrome.tabs.create({
					url: "update.html#" + type
				});
			}
		});
	},
	setPopup: function(tabId, changeInfo, tab) {
		const url = changeInfo.url || tab.url || false;
		if (!!url) {
			if (/^chrome\-extension:\/\//.test(url) || /^chrome:\/\//.test(url)) {
				chrome.action.setPopup({
					tabId: tabId,
					popup: "popup.html#local"
				});
			}
			if (/^https:\/\/chrome\.google\.com\/webstore\//.test(url)) {
				chrome.action.setPopup({
					tabId: tabId,
					popup: "popup.html#webstore"
				});
			}
		}
	},
	greyscaleConvert: function(imgData) {
		const grey = new Int16Array(imgData.length / 4);
		for (let i = 0, n = 0; i < imgData.length; i += 4, n++) {
			const r = imgData[i], g = imgData[i + 1], b = imgData[i + 2];
			grey[n] = Math.round(r * .2126 + g * .7152 + b * .0722);
		}
		return grey;
	}
};

chrome.action.onClicked.addListener(PageRuler.browserAction);

chrome.tabs.onUpdated.addListener(PageRuler.setPopup);

chrome.runtime.onStartup.addListener(function() {
	PageRuler.init();
});

chrome.runtime.onInstalled.addListener(function(details) {
	PageRuler.init(details.reason, details.previousVersion);
	switch (details.reason) {
		case "install":
			PageRuler.openUpdateTab("install");
			break;
		case "update":
			PageRuler.openUpdateTab("update");
			break;
	}
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
	const tabId = sender.tab && sender.tab.id;
	switch (message.action) {
		case "borderSearch":
			chrome.tabs.captureVisibleTab({ format: "png" }, async function(dataUrl) {
				try {
				const fetchResp = await fetch(dataUrl);
				const blob = await fetchResp.blob();
					const bitmap = await createImageBitmap(blob);
					const canvas = new OffscreenCanvas(sender.tab.width, sender.tab.height);
					const ctx = canvas.getContext("2d");
					ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

					const startX = Math.floor(message.x * message.devicePixelRatio);
					const startY = Math.floor(message.y * message.devicePixelRatio + message.yOffset * message.devicePixelRatio);
					let imageLine;
					if (message.xDir > 0) {
						imageLine = ctx.getImageData(startX, startY, canvas.width - startX, 1).data;
					} else if (message.xDir < 0) {
						imageLine = ctx.getImageData(0, startY, startX + 1, 1).data;
					} else if (message.yDir > 0) {
						imageLine = ctx.getImageData(startX, startY, 1, canvas.height - startY).data;
					} else {
						imageLine = ctx.getImageData(startX, 0, 1, startY + 1).data;
					}

					const gsData = PageRuler.greyscaleConvert(imageLine);
					let index = 0;
					let direction = 1;
					let checks = 0;
					const threshHold = 10;

					if (message.xDir < 0 || message.yDir < 0) {
						index = gsData.length - 1;
						direction = -1;
					}

					const startPixel = gsData[index];
					index += direction;

					while (index >= 0 && index < gsData.length) {
						const nextPixel = gsData[index];
						checks++;
						if (Math.abs(startPixel - nextPixel) > threshHold) {
							break;
						}
						index += direction;
					}

					const spotsToMove = checks <= 1 ? checks : checks - 1;
					const response = {
						x: Math.floor((startX + spotsToMove * message.xDir) / message.devicePixelRatio),
						y: Math.floor((startY + spotsToMove * message.yDir - message.yOffset * message.devicePixelRatio) / message.devicePixelRatio)
					};
					sendResponse(response);
				} catch (e) {
					console.error("borderSearch error:", e);
					sendResponse({ x: message.x, y: message.y });
				}
			});
			break;

		case "loadtest":
			if (!message.loaded) {
				PageRuler.load(tabId);
			} else {
				if (message.active) {
					PageRuler.disable(tabId);
				} else {
					PageRuler.enable(tabId);
				}
			}
			break;

		case "disable":
			if (!!tabId) {
				PageRuler.disable(tabId);
			}
			break;

		case "setColor":
			chrome.storage.sync.set({ color: message.color });
			break;

		case "getColor":
			chrome.storage.sync.get("color", function(items) {
				sendResponse(items.color || "#5b5bdc");
			});
			break;

		case "setDockPosition":
			chrome.storage.sync.set({ dock: message.position });
			break;

		case "getDockPosition":
			chrome.storage.sync.get("dock", function(items) {
				sendResponse(items.dock || "top");
			});
			break;

		case "setGuides":
			chrome.storage.sync.set({ guides: message.visible });
			break;

		case "getGuides":
			chrome.storage.sync.get("guides", function(items) {
				sendResponse(items.hasOwnProperty("guides") ? items.guides : true);
			});
			break;

		case "setBorderSearch":
			chrome.storage.sync.set({ borderSearch: message.visible });
			break;

		case "getBorderSearch":
			chrome.storage.sync.get("borderSearch", function(items) {
				sendResponse(items.hasOwnProperty("borderSearch") ? items.borderSearch : false);
			});
			break;

		case "trackEvent":
		case "trackPageview":
			sendResponse();
			break;

		case "openHelp":
			chrome.tabs.create({
				url: chrome.runtime.getURL("update.html") + "#help"
			});
			break;
	}
	return true;
});

chrome.commands.onCommand.addListener(function(command) {});
