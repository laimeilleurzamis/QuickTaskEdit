(function() {
    'use strict';
    console.log('[QuickTaskEdit] Script chargé v9');
    
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
    
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.dropdown')) {
            document.querySelectorAll('.task-custom-footer-inline .dropdown.active').forEach(function(d) {
                d.classList.remove('active');
            });
        }
    });

    document.addEventListener('click', function(e) {
        var toggle = e.target.closest('.dropdown-toggle');
        if (toggle && toggle.closest('.task-custom-footer-inline')) {
            e.preventDefault(); e.stopPropagation();
            var dropdown = toggle.closest('.dropdown');
            var isActive = dropdown.classList.contains('active');
            document.querySelectorAll('.task-custom-footer-inline .dropdown.active').forEach(function(d) {
                d.classList.remove('active');
            });
            if (!isActive) {
                populateDropdown(dropdown, toggle.getAttribute('data-column-id'));
                var menu = dropdown.querySelector('.dropdown-menu');
                var rect = toggle.getBoundingClientRect();
                menu.style.top = (rect.bottom + window.scrollY + 5) + 'px';
                menu.style.left = rect.left + 'px';
                dropdown.classList.add('active');
            }
        }
    }, true);

    document.addEventListener('click', function(e) {
        var link = e.target.closest('.column-move-link');
        if (link) {
            e.preventDefault(); e.stopPropagation();
            var dropdown = link.closest('.dropdown');
            var taskId = dropdown.getAttribute('data-task-id');
            var targetColumnId = link.getAttribute('data-column-id');
            
            var csrfInput = dropdown.querySelector('input[name="csrf_token"]');
            var csrfToken = csrfInput ? csrfInput.value : "";
            
            if (!csrfToken) {
                var globalToken = document.querySelector('input[name="csrf_token"]');
                csrfToken = globalToken ? globalToken.value : "";
            }

            console.log('[QuickTaskEdit] Task:', taskId, 'TargetCol:', targetColumnId, 'Token:', csrfToken ? 'Trouvé' : 'MANQUANT');
            dropdown.classList.remove('active');

            if (!csrfToken) {
                alert("Erreur : Impossible de trouver le jeton de sécurité (CSRF).");
                return;
            }
            console.log('[QuickTaskEdit] Envoi Task:', taskId, 'vers Col:', targetColumnId);

            var params = new URLSearchParams();
            params.append('task_id', taskId);
            params.append('column_id', targetColumnId);
            params.append('csrf_token', csrfToken); // On le laisse dans le corps

            var url = '?controller=MoveTaskController&action=move&plugin=QuickTaskEdit&csrf_token=' + encodeURIComponent(csrfToken);

            fetch(url, {
                method: 'POST',
                headers: {
                    'X-Requested-With': 'XMLHttpRequest',
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: params.toString()
            })
            .then(function(response) {
                return response.json().then(function(data) {
                    if (response.ok && data.status === 'success') {
                        window.location.reload();
                    } else {
                        console.error('[QuickTaskEdit] Erreur:', data);
                        alert("Erreur : " + (data.message || "Token invalide (essayez de rafraîchir la page)"));
                    }
                });
            });
        }
    }, true);
})();