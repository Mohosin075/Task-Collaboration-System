import { IActivity } from './activity.interface.js';
import { Activity } from './activity.model.js';
import { socketHelper } from '../../helpers/socketHelper.js';

const logActivity = async (payload: IActivity) => {
  const result = await Activity.create(payload);
  
  // Real-time broadcast activity log to all clients
  socketHelper.emitToAll('new-activity', result);

  return result;
};

const getRecentActivities = async () => {
  // Fetch latest 10 activities and sort descending
  return await Activity.find()
    .sort({ createdAt: -1 })
    .limit(10);
};

export const ActivityServices = {
  logActivity,
  getRecentActivities,
};
