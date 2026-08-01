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
		var items = document.querySelector('.items');
		document.querySelector('#main').classList.add('project-page');
		var intro = items.querySelector('.intro');
		var projects = Array.prototype.slice.call(items.querySelectorAll('.item.thumb'));
		var leftColumn = document.createElement('div');
		var rightColumn = document.createElement('div');

		leftColumn.className = 'project-column project-column-left';
		rightColumn.className = 'project-column project-column-right';

		projects.forEach(function(project) {
			var side = (project.dataset.side || 'right').toLowerCase();
			(side === 'left' ? leftColumn : rightColumn).appendChild(project);
		});

		items.innerHTML = '';
		items.classList.add('project-layout');
		items.appendChild(intro);
		items.appendChild(leftColumn);
		items.appendChild(rightColumn);
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
		script.src = 'assets/js/main.js?v=20260801-layout-2';
		document.body.appendChild(script);
	});
})();
