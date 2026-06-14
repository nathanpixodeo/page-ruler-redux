(function() {

	/*
	 * Locale
	 */
	var elements = document.getElementsByTagName('*');
	for (var i= 0, ilen=elements.length; i<ilen; i++) {
		var element = elements[i];
		if (element.dataset && element.dataset.message) {
			element.innerText = chrome.i18n.getMessage(element.dataset.message);
		}
	}

	/*
	 * Fields
	 */

	/*
	 * Statistics
	 */
	var statisticsField = document.getElementById('statistics');

	// populate
	chrome.storage.sync.get('statistics', function(items) {
		statisticsField.checked = !!items.statistics;
	});

	// change
	statisticsField.addEventListener('change', function(e) {
		chrome.storage.sync.set({
			'statistics': this.checked
		});
	}, this);

	/*
	 * Update tab
	 */
	var updateTabField = document.getElementById('hide_update_tab');

	// populate
	chrome.storage.sync.get('hide_update_tab', function(items) {
		updateTabField.checked = !!items.hide_update_tab;
	});

	// change
	updateTabField.addEventListener('change', function(e) {
		chrome.storage.sync.set({
			'hide_update_tab': this.checked
		});
	});

})();