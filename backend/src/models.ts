import mongoose, { Schema } from 'mongoose';

// User Schema
const UserSchema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String },
  role: { type: String, enum: ['admin', 'developer', 'devops', 'guest'], required: true },
  isBlocked: { type: Boolean, default: false }
});

// Project Schema
const ProjectSchema = new Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  description: { type: String, required: true }
});

// Story Schema
const StorySchema = new Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  priority: { type: String, enum: ['low', 'medium', 'high'], required: true },
  projectId: { type: String, required: true },
  creationDate: { type: Date, required: true },
  status: { type: String, enum: ['To Do', 'In Progress', 'Done'], required: true },
  ownerId: { type: String, required: true }
});

// Task Schema
const TaskSchema = new Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  priority: { type: String, enum: ['low', 'medium', 'high'], required: true },
  storyId: { type: String, required: true },
  estimatedTime: { type: Number, required: true },
  workedHours: { type: Number, required: true },
  createdAt: { type: Date, required: true },
  status: { type: String, enum: ['todo', 'doing', 'done'], required: true },
  assignee: { type: Object }, // Store nested user object if assigned
  startedAt: { type: Date },
  finishedAt: { type: Date }
});

// Notification Schema
const NotificationSchema = new Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  date: { type: String, required: true },
  priority: { type: String, enum: ['low', 'medium', 'high'], required: true },
  isRead: { type: Boolean, required: true },
  recipientId: { type: String, required: true }
});

// Mongoose Models
export const User = mongoose.model('User', UserSchema);
export const Project = mongoose.model('Project', ProjectSchema);
export const Story = mongoose.model('Story', StorySchema);
export const Task = mongoose.model('Task', TaskSchema);
export const Notification = mongoose.model('Notification', NotificationSchema);
