<div class="task-custom-footer-inline" onclick="event.stopPropagation();">
    <?php if (! empty($task['column_name'])): ?>
        <div class="dropdown" 
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
        <span class="badge-item priority" title="Priorité">
            <i class="fa fa-signal"></i> <?= $task['priority'] ?>
        </span>
    <?php endif ?>

    <?php if (! empty($task['date_creation'])): ?>
        <span class="badge-item date-creation" title="Date de création">
            <i class="fa fa-calendar-plus-o"></i> <?= $this->dt->date($task['date_creation']) ?>
        </span>
    <?php endif ?>
</div>