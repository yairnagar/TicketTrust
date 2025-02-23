const { Notification, Admin } = require('../models');

const sendAdminNotification = async (title, message, userId) => {
  try {
    const admins = await Admin.findAll({ attributes: ['userId'] });

    if (!admins || admins.length === 0) {
      console.warn('⚠️ No admins found to notify.');
      return;
    }

    const notifications = admins.map(admin => ({
      userId: admin.userId,
      title,
      message,
      type: 'system',
      status: 'unread'
    }));

    await Notification.bulkCreate(notifications);
    console.log(`✅ Admins notified about: ${title}`);
  } catch (error) {
    console.error('❌ Error sending admin notification:', error);
    throw new Error('Failed to send notification.');
  }
};

module.exports = { sendAdminNotification };
