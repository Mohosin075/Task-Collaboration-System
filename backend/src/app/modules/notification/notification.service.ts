import { INotification } from './notification.interface.js';
import { Notification } from './notification.model.js';
import { socketHelper } from '../../helpers/socketHelper.js';

const createNotification = async (payload: Partial<INotification>) => {
  const result = await Notification.create(payload);
  
  // Also emit real-time event to the specific recipient via Socket.IO
  socketHelper.emitToAll(`notification-${payload.recipient?.toString()}`, result);
  
  return result;
};

const getNotifications = async (recipientId: string) => {
  const result = await Notification.find({ recipient: recipientId })
    .sort({ createdAt: -1 })
    .limit(50);
  return result;
};

const markAsRead = async (id: string, recipientId: string) => {
  const result = await Notification.findOneAndUpdate(
    { _id: id, recipient: recipientId },
    { isRead: true },
    { new: true }
  );
  return result;
};

const markAllAsRead = async (recipientId: string) => {
  const result = await Notification.updateMany(
    { recipient: recipientId, isRead: false },
    { isRead: true }
  );
  return result;
};

const deleteNotification = async (id: string, recipientId: string) => {
  const result = await Notification.findOneAndDelete({ _id: id, recipient: recipientId });
  return result;
};

export const NotificationServices = {
  createNotification,
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
};
