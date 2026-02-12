<?php

namespace Kanboard\Plugin\QuickTaskEdit\Controller;

use Kanboard\Controller\BaseController;
use Exception;

class MoveTaskController extends BaseController
{
    public function move()
    {
        ob_start();
        try {
            $this->checkCSRFParam();
            $values = $this->request->getValues();
            $taskId = $values['task_id'] ?? null;
            $columnId = $values['column_id'] ?? null;

            if (!$taskId || !$columnId) { throw new Exception('Données manquantes.'); }

            $task = $this->taskFinderModel->getById($taskId);
            $result = $this->taskPositionModel->movePosition(
                $task['project_id'], $taskId, $columnId, 1, $task['swimlane_id'], false
            );

            if (ob_get_length()) ob_end_clean();
            $this->response->json(['status' => $result ? 'success' : 'error']);
        } catch (Exception $e) {
            if (ob_get_length()) ob_end_clean();
            $this->response->status(400);
            $this->response->json(['status' => 'error', 'message' => $e->getMessage()]);
        }
    }

    public function updatePriority()
    {
        ob_start();
        try {
            $this->checkCSRFParam();
            
            // Use getStringParam/getIntegerParam to be safe across different server configs
            $taskId = $this->request->getIntegerParam('task_id') ?: $this->request->getValues()['task_id'] ?? null;
            $priority = $this->request->getStringParam('priority') !== "" ? $this->request->getIntegerParam('priority') : null;

            if (!$taskId || $priority === null) { 
                throw new Exception('Données manquantes : ID=' . $taskId . ' Prio=' . $priority); 
            }

            // Verify task exists
            $task = $this->taskFinderModel->getById($taskId);
            if (empty($task)) {
                throw new Exception('Task not found (ID: ' . $taskId . ')');
            }

            // Use TaskModificationModel for consistency with Kanboard's internal logic
            $result = $this->taskModificationModel->update([
                'id' => $taskId,
                'priority' => $priority
            ]);

            if (ob_get_length()) ob_end_clean();
            $this->response->json(['status' => $result ? 'success' : 'error']);
        } catch (Exception $e) {
            if (ob_get_length()) ob_end_clean();
            $this->response->status(400);
            $this->response->json(['status' => 'error', 'message' => $e->getMessage()]);
        }
    }
}