(function() {
    'use strict';
    console.log('[QuickTaskEdit] Script chargé v10');
    
    function getColumnsFromBoard() {
        var columns = [];
        var boardColumns = document.querySelectorAll('.board-column-header');
        boardColumns.forEach(function(header) {
            var columnId = header.getAttribute('data-column-id');
            var titleElement = header.querySelector('.board-column-title') || header.querySelector('span[title]') || header.querySelector('a');
            if (columnId && titleElement) {
                var title = titleElement.getAttribute('title') || titleElement.textContent.trim();
                title = title.split('Cacher')[0].split('Créer')[0].trim();
                columns.push({ id: columnId, title: title });
            }
        });
        return columns;
    }
    
    function populateDropdown(dropdown, currentColumnId) {
        var menu = dropdown.querySelector('.dropdown-menu');
        var columns = getColumnsFromBoard();
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
    
    // Fermer les menus au clic extérieur
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.dropdown')) {
            document.querySelectorAll('.task-custom-footer-inline .dropdown.active').forEach(function(d) {
                d.classList.remove('active');
            });
        }
    });

    // Gestion de l'ouverture des menus
    document.addEventListener('click', function(e) {
        var toggle = e.target.closest('.dropdown-toggle');
        if (toggle && toggle.closest('.task-custom-footer-inline')) {
            e.preventDefault(); e.stopPropagation();
            var dropdown = toggle.closest('.dropdown');
            var isActive = dropdown.classList.contains('active');
            
            // On ferme tous les autres menus ouverts
            document.querySelectorAll('.task-custom-footer-inline .dropdown.active').forEach(function(d) {
                d.classList.remove('active');
            });

            if (!isActive) {
                // MODIFICATION : On ne peuple dynamiquement que si c'est le menu des COLONNES
                if (dropdown.classList.contains('column-dropdown')) {
                    populateDropdown(dropdown, toggle.getAttribute('data-column-id'));
                }
                
                var menu = dropdown.querySelector('.dropdown-menu');
                var rect = toggle.getBoundingClientRect();
                menu.style.top = (rect.bottom + window.scrollY + 5) + 'px';
                menu.style.left = rect.left + 'px';
                dropdown.classList.add('active');
            }
        }
    }, true);

    // Action : Changement de Colonne
    document.addEventListener('click', function(e) {
        var link = e.target.closest('.column-move-link');
        if (link) {
            e.preventDefault(); 
            e.stopPropagation();

            var dropdown = link.closest('.dropdown');
            var taskId = dropdown.getAttribute('data-task-id');
            var targetColumnId = link.getAttribute('data-column-id');
            var csrfToken = document.querySelector('input[name="csrf_token"]')?.value;

            dropdown.classList.remove('active');
            if (!csrfToken) { alert("Erreur CSRF"); return; }

            var params = new URLSearchParams();
            params.append('task_id', taskId);
            params.append('column_id', targetColumnId);
            params.append('csrf_token', csrfToken);

            fetch('?controller=MoveTaskController&action=move&plugin=QuickTaskEdit&csrf_token=' + encodeURIComponent(csrfToken), {
                method: 'POST',
                headers: { 'X-Requested-With': 'XMLHttpRequest', 'Content-Type': 'application/x-www-form-urlencoded' },
                body: params.toString()
            }).then(response => response.json()).then(data => {
                if (data.status === 'success') window.location.reload();
                else alert("Erreur : " + data.message);
            });
        }
    }, true);

    // Action : Changement de Priorité
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
                if (data.status === 'success') window.location.reload();
                else alert("Erreur : " + data.message);
            })
            .catch(error => {
                console.error('Update failed:', error);
                alert(error.message);
            });
        }
    }, true);

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
                if (data.status === 'success') window.location.reload();
                else alert("Erreur : " + data.message);
            });
        }
    }, true);
})();