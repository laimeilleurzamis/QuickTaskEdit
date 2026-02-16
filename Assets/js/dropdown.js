if (!window.dropdownScriptLoaded) {
window.dropdownScriptLoaded = true;

(function() {
    'use strict';
    console.log('[QuickTaskEdit] Dropdown script loaded');

    function refreshBoard(data) {
        var boardContainer = document.getElementById('board-container');
        if (boardContainer && data) {
            // Replace content of the board with the new HTML from the server                
            boardContainer.outerHTML = data;
            
            // Refresh KB components if available
            if (window.KB) {
                window.KB.render();
            }
            console.log('[QuickTaskEdit] Board rafraîchi avec succès');
        } else {
            window.location.reload();
        }
    }
    
    function getColumnsFromBoard(dropdown) {
        var columnsData = dropdown.getAttribute('data-columns');
        var columnsParsed = columnsData ? JSON.parse(columnsData) : [];
        var columns = [];
        for (var c in columnsParsed) {
            if (columnsParsed.hasOwnProperty(c)) {
                columns.push({ id: c, title: columnsParsed[c] });
            }
        }
        if (!columns) {
            console.error('No columns data found on dropdown');
            return [];
        }
        try {
            return columns;
        }
        catch (e) {
            console.error('Failed to parse columns data:', e);
            return [];
        }
    }
    
    function populateDropdown(dropdown, currentColumnId) {
        var menu = dropdown.querySelector('.dropdown-menu');
        var columns = getColumnsFromBoard(dropdown);
        if (columns.length === 0) return;
        menu.innerHTML = '';
        columns.forEach(function(column) {
            var li = document.createElement('li');
            var link = document.createElement('a');
            link.href = '#';
            link.className = 'column-move-link';
            link.setAttribute('data-column-id', column.id);
            link.textContent = column.title;
            if (column.id == currentColumnId) {
                var icon = document.createElement('i');
                icon.className = 'fa fa-check';
                icon.style.marginLeft = '8px';
                link.appendChild(icon);
            }
            li.appendChild(link);
            menu.appendChild(li);
        });
    }
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.dropdown')) {
            document.querySelectorAll('.task-custom-footer-inline .dropdown.active').forEach(function(d) {
                d.classList.remove('active');
            });
        }
    });

    // Manage dropdown opening with dynamic positioning
    document.addEventListener('click', function(e) {
        var toggle = e.target.closest('.dropdown-toggle');
        if (toggle && toggle.closest('.task-custom-footer-inline')) {
            e.preventDefault(); e.stopPropagation();
            var dropdown = toggle.closest('.dropdown');
            var isActive = dropdown.classList.contains('active');
            
            // Close all dropdowns first
            document.querySelectorAll('.task-custom-footer-inline .dropdown.active').forEach(function(d) {
                d.classList.remove('active');
            });

        if (!isActive) {
                // Populate dropdown
                if (dropdown.classList.contains('column-dropdown')) {
                    populateDropdown(dropdown, toggle.getAttribute('data-column-id'));
                }
                
                var menu = dropdown.querySelector('.dropdown-menu');
                var rect = toggle.getBoundingClientRect();
                
                // Clean previous state
                menu.classList.remove('opens-up');
                menu.style.top = '';
                menu.style.left = '';

                // Mesure height
                menu.style.visibility = 'hidden';
                menu.style.display = 'block';
                var menuHeight = menu.offsetHeight;
                menu.style.display = '';
                menu.style.visibility = '';

                // Detect if there's enough space below, otherwise open upwards
                var spaceBelow = window.innerHeight - rect.bottom;

                if (spaceBelow < menuHeight) {
                    menu.classList.add('opens-up');
                }
                dropdown.classList.add('active');
            }
        }
    }, true);

    // Column move
    document.addEventListener('click', function(e) {
        var link = e.target.closest('.column-move-link');
        if (link) {
            e.preventDefault(); 
            e.stopPropagation();

        var dropdown = link.closest('.dropdown');
        var taskId = dropdown.getAttribute('data-task-id');
        var targetColumnId = link.getAttribute('data-column-id');
        var swimlaneId = dropdown.getAttribute('data-swimlane-id');
        var projectId = dropdown.getAttribute('data-project-id');
        var csrfToken = document.querySelector('input[name="csrf_token"]')?.value;

        dropdown.classList.remove('active');

            dropdown.classList.remove('active');
            if (!csrfToken) { alert("Erreur CSRF"); return; }

            var params = new URLSearchParams();
            params.append('task_id', taskId);
            params.append('column_id', targetColumnId);
            params.append('csrf_token', csrfToken);
            params.append('swimlane_id', swimlaneId);
            params.append('project_id', projectId);
            
        fetch('?controller=MoveTaskController&action=move&plugin=QuickTaskEdit&csrf_token=' + encodeURIComponent(csrfToken), {
            method: 'POST',
            headers: { 'X-Requested-With': 'XMLHttpRequest', 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params.toString()
        }).then(response => response.json()).then(data => {
            if (data.status === 'success') {
                if (window.KB && window.KB.board) {
                    window.KB.board.refresh(); 
                } else {
                    var currentUrl = window.location.origin + window.location.pathname;
                    var params = new URLSearchParams(window.location.search);

                    if (window.KB && window.KB.modal && window.KB.modal.isOpen()) {
                        params.set('open_task_id', taskId);
                    }
                    window.location.href = currentUrl + '?' + params.toString();
                }
            } else {
                alert("Erreur : " + data.message);
            }
        });
        }
    }, true);

    // Priority change
    document.addEventListener('click', function(e) {
        var link = e.target.closest('.priority-change-link');
        if (link) {
            e.preventDefault(); 
            e.stopPropagation();
            
            var dropdown = link.closest('.dropdown');
            var taskId = dropdown.getAttribute('data-task-id');
            var newPriority = link.getAttribute('data-priority');
            var csrfToken = document.querySelector('input[name="csrf_token"]')?.value;

            dropdown.classList.remove('active');
            if (!csrfToken) { alert("Erreur CSRF"); return; }

            var url = '?controller=MoveTaskController' +
                    '&action=updatePriority' +
                    '&plugin=QuickTaskEdit' +
                    '&task_id=' + taskId +
                    '&priority=' + newPriority +
                    '&csrf_token=' + encodeURIComponent(csrfToken);

            fetch(url, {
                method: 'POST',
                headers: { 'X-Requested-With': 'XMLHttpRequest' }
            })
            .then(response => {
                if (!response.ok) return response.json().then(data => { throw new Error(data.message || 'Erreur 400'); });
                return response.json();
            })
            .then(data => {
                if (data.status === 'success'){
                    var currentUrl = window.location.origin + window.location.pathname;
                    var params = new URLSearchParams(window.location.search);
                    if (window.KB && window.KB.modal && window.KB.modal.isOpen()) {
                        params.set('open_task_id', taskId);
                    }
                    window.location.href = currentUrl + '?' + params.toString();
                }
                else alert("Erreur : " + data.message);
            })
            .catch(error => {
                console.error('Update failed:', error);
                alert(error.message);
            });
        }
    }, true);

    // Assignee change
    document.addEventListener('click', function(e) {
        var link = e.target.closest('.assignee-change-link');
        if (link) {
            e.preventDefault(); e.stopPropagation();
            var dropdown = link.closest('.dropdown');
            var taskId = dropdown.getAttribute('data-task-id');
            var userId = link.getAttribute('data-user-id');
            var csrfToken = document.querySelector('input[name="csrf_token"]')?.value;

            dropdown.classList.remove('active');
            if (!csrfToken) { alert("Erreur CSRF"); return; }

            fetch('?controller=MoveTaskController&action=updateAssignee&plugin=QuickTaskEdit&task_id=' + taskId + '&user_id=' + userId + '&csrf_token=' + encodeURIComponent(csrfToken), {
                method: 'POST',
                headers: { 'X-Requested-With': 'XMLHttpRequest' }
            }).then(response => response.json()).then(data => {
                if (data.status === 'success') {
                    var currentUrl = window.location.origin + window.location.pathname;
                    var params = new URLSearchParams(window.location.search);
                    if (window.KB && window.KB.modal && window.KB.modal.isOpen()) {
                        params.set('open_task_id', taskId);
                    }
                    window.location.href = currentUrl + '?' + params.toString();
                }
                else alert("Erreur : " + data.message);
            });
        }
    }, true);
})();
}