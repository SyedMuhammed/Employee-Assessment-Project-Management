const express = require('express');
const router = express.Router();

// Get notifications for a user
router.get('/', async (req, res) => {
  try {
    // In a real app, you'd store notifications in a database
    // For now, we'll return a mock response
    const notifications = [
      {
        id: 1,
        type: 'project_assignment',
        title: 'New Project Assignment',
        message: 'You have been assigned to Project Alpha',
        timestamp: new Date(),
        read: false
      },
      {
        id: 2,
        type: 'employee_update',
        title: 'Employee Profile Updated',
        message: 'John Doe\'s skills have been updated',
        timestamp: new Date(Date.now() - 3600000),
        read: true
      }
    ];
    
    res.json({
      success: true,
      data: notifications
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Mark notification as read
router.patch('/:id/read', async (req, res) => {
  try {
    // In a real app, you'd update the notification in the database
    res.json({
      success: true,
      message: 'Notification marked as read'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Mark all notifications as read
router.patch('/read-all', async (req, res) => {
  try {
    // In a real app, you'd update all notifications in the database
    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router; 