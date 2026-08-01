/* Load each portfolio project from its own HTML fragment before main.js initializes. */
(function() {
	var slots = Array.prototype.slice.call(document.querySelectorAll('[data-project]'));
	var projectFiles = slots.map(function(slot) { return slot.dataset.project; });
	var projectRequests = {};

	Promise.all(projectFiles.map(function(file) {
		if (!projectRequests[file]) {
			projectRequests[file] = fetch('projects/' + file)
			.then(function(response) {
				if (!response.ok) throw new Error('Could not load ' + file);
				return response.text();
			});
		}
		return projectRequests[file];
	})).then(function(fragments) {
		slots.forEach(function(slot, index) {
			slot.outerHTML = fragments[index];
		});
	}).catch(function(error) {
		console.error('Portfolio projects failed to load:', error);
		slots.forEach(function(slot) {
			slot.textContent = 'Projects could not be loaded.';
		});
	}).then(function() {
		return Promise.all(Array.prototype.slice.call(document.querySelectorAll('[data-read-more]')).map(function(project) {
			var path = project.dataset.readMore;
			return fetch(path, { method: 'HEAD' }).then(function(response) {
				if (!response.ok) return;
				var link = document.createElement('a');
				link.className = 'read-more';
				link.href = path;
				link.target = '_blank';
				link.rel = 'noopener';
				link.textContent = 'Read More';
				project.appendChild(link);
			});
		}));
	}).then(function() {
		var script = document.createElement('script');
		script.src = 'assets/js/main.js';
		document.body.appendChild(script);
	});
})();
