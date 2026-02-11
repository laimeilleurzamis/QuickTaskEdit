<?php

namespace Kanboard\Plugin\QuickTaskEdit\Controller;

use Kanboard\Controller\BaseController;
use Exception;

class MoveTaskController extends BaseController
{
    public function move()
    {
        if (ob_get_length()) ob_clean();

        try {
            $this->checkCSRFParam();

            $values = $this->request->getValues();
            $taskId = $values['task_id'] ?? null;
            $columnId = $values['column_id'] ?? null;

            if (!$taskId || !$columnId) {
                throw new Exception('Données manquantes pour le déplacement.');
            }

            $task = $this->taskFinderModel->getById($taskId);
            if (empty($task)) {
                throw new Exception('Tâche #' . $taskId . ' introuvable.');
            }

            $result = $this->taskPositionModel->movePosition(
                $task['project_id'],
                $taskId,
                $columnId,
                1,
                $task['swimlane_id'],
                false
            );

            if ($result) {
                $this->response->json(['status' => 'success']);
            } else {
                throw new Exception('Le serveur a refusé le déplacement.');
            }

        } catch (Exception $e) {
            $this->response->status(400);
            $this->response->json([
                'status' => 'error',
                'message' => $e->getMessage()
            ]);
        }
    }
}