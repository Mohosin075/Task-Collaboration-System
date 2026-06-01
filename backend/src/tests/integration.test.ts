import request from 'supertest';
import mongoose from 'mongoose';
import app from '../app.js';
import config from '../app/config/index.js';
import { User } from '../app/modules/user/user.model.js';
import { Project } from '../app/modules/project/project.model.js';
import { Task } from '../app/modules/task/task.model.js';
import { Activity } from '../app/modules/activity/activity.model.js';

describe('🚀 SMART PROJECT & TASK COLLABORATION SYSTEM INTEGRATION TESTS', () => {
  let adminToken: string;
  let memberToken: string;
  let adminUser: any;
  let memberUser: any;
  let testProject: any;

  // 1. Establish database connection before running tests
  beforeAll(async () => {
    const localMongoUri = 'mongodb://127.0.0.1:27017/test-smart-collaboration';
    try {
      await mongoose.connect(localMongoUri);
      console.log('🔌 Connected to local MongoDB for integration tests!');
    } catch (err) {
      console.log('⚠️ Local MongoDB failed, connecting to Atlas config...');
      const testMongoUri = config.mongo_uri.replace('smart-collaboration', 'test-smart-collaboration');
      await mongoose.connect(testMongoUri);
    }
    
    // Clear existing data
    await User.deleteMany({});
    await Project.deleteMany({});
    await Task.deleteMany({});
    await Activity.deleteMany({});
  });

  // 2. Tear down database connection after tests
  afterAll(async () => {
    await mongoose.connection.db?.dropDatabase();
    await mongoose.disconnect();
  });

  describe('🔐 AUTHENTICATION TESTS', () => {
    it('should successfully sign up a new Admin user', async () => {
      const response = await request(app)
        .post('/api/v1/users/signup')
        .send({
          name: 'Test Admin',
          email: 'admin_test@demo.com',
          password: 'password123',
          role: 'Admin',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Test Admin');
      expect(response.body.data.role).toBe('Admin');
      adminUser = response.body.data;
    });

    it('should successfully sign up a Team Member user', async () => {
      const response = await request(app)
        .post('/api/v1/users/signup')
        .send({
          name: 'Test Member',
          email: 'member_test@demo.com',
          password: 'password123',
          role: 'Team Member',
        });

      expect(response.status).toBe(201);
      memberUser = response.body.data;
    });

    it('should successfully log in and return a JWT token', async () => {
      const loginRes = await request(app)
        .post('/api/v1/users/login')
        .send({
          email: 'admin_test@demo.com',
          password: 'password123',
        });

      expect(loginRes.status).toBe(200);
      expect(loginRes.body.success).toBe(true);
      expect(loginRes.body.data.accessToken).toBeDefined();
      adminToken = `Bearer ${loginRes.body.data.accessToken}`;

      const memberLoginRes = await request(app)
        .post('/api/v1/users/login')
        .send({
          email: 'member_test@demo.com',
          password: 'password123',
        });
      memberToken = `Bearer ${memberLoginRes.body.data.accessToken}`;
    });

    it('should fail to login with an incorrect password', async () => {
      const response = await request(app)
        .post('/api/v1/users/login')
        .send({
          email: 'admin_test@demo.com',
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe('🚧 RBAC (ROLE-BASED ACCESS CONTROL) TESTS', () => {
    it('should allow Admin to create a project', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const response = await request(app)
        .post('/api/v1/projects')
        .set('Authorization', adminToken)
        .send({
          name: 'E-Commerce App Redesign',
          description: 'Rebuilding the frontend with Next.js',
          deadline: tomorrow.toISOString(),
          userName: 'Test Admin',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      testProject = response.body.data;
    });

    it('should prevent a Team Member from creating a project', async () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const response = await request(app)
        .post('/api/v1/projects')
        .set('Authorization', memberToken)
        .send({
          name: 'Hack Project',
          description: 'Hacking project',
          deadline: tomorrow.toISOString(),
          userName: 'Test Member',
        });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('should prevent a Team Member from deleting a project', async () => {
      const response = await request(app)
        .delete(`/api/v1/projects/${testProject._id}`)
        .set('Authorization', memberToken);

      expect(response.status).toBe(403);
    });
  });

  describe('📅 TASK BUSINESS RULES & CONFLICT VALIDATION TESTS', () => {
    it('should prevent creating a task with a deadline in the past', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const response = await request(app)
        .post('/api/v1/tasks')
        .set('Authorization', adminToken)
        .send({
          project: testProject._id,
          title: 'Setup Database Schema',
          description: 'Configure MongoDB connections',
          assignedTo: memberUser._id,
          dueDate: yesterday.toISOString(),
          userName: 'Test Admin',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('Please select a valid deadline');
    });

    it('should successfully create a task with a valid upcoming due date', async () => {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 5);

      const response = await request(app)
        .post('/api/v1/tasks')
        .set('Authorization', adminToken)
        .send({
          project: testProject._id,
          title: 'Setup Database Schema',
          description: 'Configure MongoDB connections',
          assignedTo: memberUser._id,
          dueDate: nextWeek.toISOString(),
          userName: 'Test Admin',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });

    it('should prevent creating a duplicate task title in the same project', async () => {
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 5);

      const response = await request(app)
        .post('/api/v1/tasks')
        .set('Authorization', adminToken)
        .send({
          project: testProject._id,
          title: 'Setup Database Schema',
          description: 'Configure MongoDB connections again',
          assignedTo: memberUser._id,
          dueDate: nextWeek.toISOString(),
          userName: 'Test Admin',
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain('This task already exists in the project');
    });
  });
});
