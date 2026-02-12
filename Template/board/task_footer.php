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
            
            <ul class="dropdown-menu column-dropdown-menu">
                </ul>
        </div>
    <?php endif ?>

    <?php if ($task['priority'] >= 0): ?>
        <div class="dropdown priority-dropdown" 
            data-project-id="<?= $task['project_id'] ?>"
            data-task-id="<?= $task['id'] ?>">
            
            <span class="badge-item priority dropdown-toggle" 
                title="Cliquez pour changer la priorité" 
                style="cursor: pointer;" 
                data-current-priority="<?= $task['priority'] ?>"
                onclick="event.preventDefault(); event.stopPropagation();">
                <i class="fa fa-signal"></i> <?= $task['priority'] ?>
            </span>
            
            <ul class="dropdown-menu priority-menu">
                <?php for ($i = 0; $i <= 3; $i++): ?>
                    <li>
                        <a href="#" class="priority-change-link" data-priority="<?= $i ?>">
                            Priorité <?= $i ?>
                            <?php if ($task['priority'] == $i): ?>
                                <i class="fa fa-check"></i>
                            <?php endif ?>
                        </a>
                    </li>
                <?php endfor ?>
            </ul>
        </div>
    <?php endif ?>

    <?php if (! empty($task['owner_id'])): ?>
        <div class="dropdown assignee-dropdown" 
            data-project-id="<?= $task['project_id'] ?>"
            data-task-id="<?= $task['id'] ?>">
            
            <span class="badge-item assignee dropdown-toggle" 
                title="Cliquez pour changer l'assigné" 
                style="cursor: pointer;" 
                data-current-assignee="<?= $task['owner_id'] ?>"
                onclick="event.preventDefault(); event.stopPropagation();">
                <i class="fa fa-user"></i> <?= $this->text->e($task['owner_id']) ?>
            </span>

            <ul class="dropdown-menu assignee-menu">
                <?php foreach ($users_list as $user): ?>
                    <li>
                        <a href="#" class="assignee-change-link" data-user-id="<?= $user['id'] ?>">
                            <?= $this->text->e($user['name']) ?>
                            <?php if ($task['owner_id'] == $user['id']): ?>
                                <i class="fa fa-check"></i>
                            <?php endif ?>
                        </a>
                    </li>
                <?php endforeach ?>
            </ul>
        </div>
    <?php endif ?>

    <?php if (! empty($task['date_creation'])): ?>
        <span class="badge-item date-creation" title="Date de création">
            <i class="fa fa-calendar-plus-o"></i> <?= $this->dt->date($task['date_creation']) ?>
        </span>
    <?php endif ?>
</div>