<div class="task-custom-footer-inline" onclick="event.stopPropagation();">
    <?php if (! empty($task['column_name'])): ?>
        <div class="dropdown column-dropdown" 
            data-project-id="<?= $task['project_id'] ?>"
            data-task-id="<?= $task['id'] ?>"
            data-swimlane-id="<?= $task['swimlane_id'] ?>">
            
            <div class="csrf-container" style="display:none;">
                <?= $this->form->csrf() ?>
            </div>

            <span class="badge-item status-column dropdown-toggle" 
                title="Cliquez pour changer de colonne" 
                style="cursor: pointer;" 
                data-column-id="<?= $task['column_id'] ?>"
                onclick="event.preventDefault(); event.stopPropagation();">
                <i class="fa fa-th-list"></i> <?= $this->text->e($task['column_name']) ?>
            </span>
            
            <ul class="dropdown-menu column-dropdown-menu"></ul>
        </div>
    <?php endif ?>

    <?php if ($task['priority'] >= 0): ?>
        <?php 
            // Mapping numeric priorities to custom labels
            $priority_labels = [0 => 'ok', 1 => 'info', 2 => 'warning', 3 => 'error']; 
        ?>
        <div class="dropdown priority-dropdown" 
            data-project-id="<?= $task['project_id'] ?>"
            data-task-id="<?= $task['id'] ?>">
            
            <span class="badge-item priority dropdown-toggle" 
                title="Cliquez pour changer la priorité" 
                style="cursor: pointer;" 
                data-current-priority="<?= $task['priority'] ?>"
                onclick="event.preventDefault(); event.stopPropagation();">
                <i class="fa fa-signal"></i> <?= $priority_labels[$task['priority']] ?? $task['priority'] ?>
            </span>
            
            <ul class="dropdown-menu priority-menu">
                <?php foreach ($priority_labels as $value => $label): ?>
                    <li>
                        <a href="#" class="priority-change-link" data-priority="<?= $value ?>">
                            <?= $label ?>
                            <?php if ($task['priority'] == $value): ?>
                                <i class="fa fa-check"></i>
                            <?php endif ?>
                        </a>
                    </li>
                <?php endforeach ?>
            </ul>
        </div>
    <?php endif ?>

    <?php 
        $available_users = $this->task->projectUserRoleModel->getAssignableUsersList($task['project_id']);
    ?>
    <div class="dropdown assignee-dropdown" 
        data-project-id="<?= $task['project_id'] ?>"
        data-task-id="<?= $task['id'] ?>">
        
        <span class="badge-item assignee dropdown-toggle" 
            title="Cliquez pour changer l'assigné" 
            style="cursor: pointer;" 
            data-current-assignee="<?= $task['owner_id'] ?>"
            onclick="event.preventDefault(); event.stopPropagation();">
            <i class="fa fa-user"></i> <?= $task['assignee_name'] ?: $task['assignee_username'] ?: 'Non assigné' ?>
        </span>

        <ul class="dropdown-menu assignee-menu">
            <li>
                <a href="#" class="assignee-change-link" data-user-id="0">
                </a>
            </li>
            <?php foreach ($available_users as $user_id => $user_name): ?>
                <li>
                    <a href="#" class="assignee-change-link" data-user-id="<?= $user_id ?>">
                        <?= $this->text->e($user_name) ?>
                        <?php if ($task['owner_id'] == $user_id): ?>
                            <i class="fa fa-check"></i>
                        <?php endif ?>
                    </a>
                </li>
            <?php endforeach ?>
        </ul>
    </div>
</div>