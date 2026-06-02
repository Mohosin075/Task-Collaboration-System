import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { UserRoutes } from '../modules/user/user.routes.js';
import { ProjectRoutes } from '../modules/project/project.routes.js';
import { TaskRoutes } from '../modules/task/task.routes.js';
import { CommentRoutes } from '../modules/comment/comment.routes.js';
import { ActivityRoutes } from '../modules/activity/activity.routes.js';
import { NotificationRoutes } from '../modules/notification/notification.routes.js';

const router = Router();

// Set up multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './uploads');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// File Upload Route
router.post('/upload', upload.single('file'), (req: any, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
  res.status(200).json({
    success: true,
    message: 'File uploaded successfully',
    url: fileUrl,
    filename: req.file.originalname,
  });
});

const moduleRoutes = [
  { path: '/users', route: UserRoutes },
  { path: '/projects', route: ProjectRoutes },
  { path: '/tasks', route: TaskRoutes },
  { path: '/comments', route: CommentRoutes },
  { path: '/activities', route: ActivityRoutes },
  { path: '/notifications', route: NotificationRoutes },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
