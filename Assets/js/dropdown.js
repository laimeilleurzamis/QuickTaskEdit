if (!window.dropdownScriptLoaded) {
window.dropdownScriptLoaded = true;

(function() {
    'use strict';
    console.log('[QuickTaskEdit] Dropdown script loaded');

    function refreshBoard(data) {
        var boardContainer = document.getElementById('board-container');
        if (boardContainer && data) {
            // On remplace le contenu par le nouveau HTML reçu
            boardContainer.outerHTML = data;
            
            // On réinitialise les composants Kanboard (Drag & Drop, etc.)
            if (window.KB) {
                window.KB.render();
            }
            
            // Optionnel : Afficher un message de succès silencieux ou masquer un loader
            console.log('[QuickTaskEdit] Board rafraîchi avec succès');
        } else {
            // Si on ne trouve pas le conteneur, on reload par sécurité
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
                // Peupler le menu colonnes si nécessaire
                if (dropdown.classList.contains('column-dropdown')) {
                    populateDropdown(dropdown, toggle.getAttribute('data-column-id'));
                }
                
                var menu = dropdown.querySelector('.dropdown-menu');
                var rect = toggle.getBoundingClientRect();
                
                // 1. Nettoyage : on enlève la classe "haut" par défaut et les styles manuels
                menu.classList.remove('opens-up');
                menu.style.top = '';  // On laisse le CSS gérer
                menu.style.left = ''; // On laisse le CSS gérer

                // 2. Mesure de la hauteur du menu
                menu.style.visibility = 'hidden';
                menu.style.display = 'block';
                var menuHeight = menu.offsetHeight;
                menu.style.display = '';
                menu.style.visibility = '';

                // 3. Détection : Est-ce qu'on dépasse en bas de l'écran ?
                // window.innerHeight = hauteur de la fenêtre visible
                // rect.bottom = position du bas du bouton
                var spaceBelow = window.innerHeight - rect.bottom;

                if (spaceBelow < menuHeight) {
                    // Pas assez de place en bas -> On ajoute la classe pour ouvrir en haut
                    menu.classList.add('opens-up');
                }

                // 4. On active (le CSS absolute fera le reste)
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
                // Utilisation de la fonction interne de Kanboard pour rafraîchir le tableau
                if (window.KB && window.KB.board) {
                    // Cette fonction force Kanboard à recalculer et réafficher les colonnes
                    window.KB.board.refresh(); 
                } else {
                    // Fallback si KB n'est pas dispo
                    window.location.reload();
                }
            } else {
                alert("Erreur : " + data.message);
            }
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
}