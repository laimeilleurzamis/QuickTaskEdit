<?php

namespace Kanboard\Plugin\QuickTaskEdit;

use Kanboard\Core\Plugin\Base;

class Plugin extends Base
{
    public function initialize()
    {
        // Hook for footer
        $this->template->hook->attach('template:board:task:footer', 'QuickTaskEdit:board/task_footer');
        
        // CSS and JS
        $this->hook->on('template:layout:css', array('template' => 'plugins/QuickTaskEdit/Assets/css/skin.css'));
        $this->hook->on('template:layout:js', array('template' => 'plugins/QuickTaskEdit/Assets/js/dropdown.js'));
        
        // ROUTES - THESE ARE CRITICAL!
        $this->route->addRoute('/quicktaskedit/move', 'MoveTaskController', 'move', 'QuickTaskEdit');
        $this->route->addRoute('/quicktaskedit/update-priority', 'MoveTaskController', 'updatePriority', 'QuickTaskEdit');
        $this->route->addRoute('/quicktaskedit/update-assignee', 'MoveTaskController', 'updateAssignee', 'QuickTaskEdit');
    }    

    public function getPluginName()
    {
        return 'Quick Task Edit';
    }

    public function getPluginDescription()
    {
        return 'Quickly edit task properties directly from the board view.';
    }

    public function getPluginAuthor()
    {
        return 'laimeilleurzamis';
    }

    public function getPluginVersion()
    {
        return '1.1.0';
    }

    public function getPluginHomepage()
    {
        return '';
    }
}