import express from 'express';
import { User, Project, Story, Task, Notification } from './models';

export const router = express.Router();

// Helper to create CRUD routes
const createCrudRoutes = (modelName: string, Model: any) => {
  let path = `/${modelName.toLowerCase()}s`;
  if (modelName === 'Story') {
    path = '/stories';
  }

  // GET all
  router.get(path, async (req, res) => {
    try {
      const items = await Model.find({}, { _id: 0, __v: 0 }); // Exclude mongo-specific fields
      res.json(items);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // GET by id
  router.get(`${path}/:id`, async (req, res) => {
    try {
      const item = await Model.findOne({ id: req.params.id }, { _id: 0, __v: 0 });
      if (!item) return res.status(404).json({ error: 'Not found' });
      res.json(item);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // POST create
  router.post(path, async (req, res) => {
    try {
      const item = new Model(req.body);
      await item.save();
      const result = item.toObject();
      delete result._id;
      delete result.__v;
      res.status(201).json(result);
    } catch (err: any) {
      console.error(`POST ${path} error:`, err);
      res.status(400).json({ error: err.message });
    }
  });

  // PUT update by id
  router.put(`${path}/:id`, async (req, res) => {
    try {
      const item = await Model.findOneAndUpdate({ id: req.params.id }, req.body, { new: true, overwrite: true });
      if (!item) return res.status(404).json({ error: 'Not found' });
      const result = item.toObject();
      delete result._id;
      delete result.__v;
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // PATCH update by id
  router.patch(`${path}/:id`, async (req, res) => {
    try {
      const item = await Model.findOneAndUpdate({ id: req.params.id }, { $set: req.body }, { new: true });
      if (!item) return res.status(404).json({ error: 'Not found' });
      const result = item.toObject();
      delete result._id;
      delete result.__v;
      res.json(result);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  // DELETE by id
  router.delete(`${path}/:id`, async (req, res) => {
    try {
      const item = await Model.findOneAndDelete({ id: req.params.id });
      if (!item) return res.status(404).json({ error: 'Not found' });
      res.status(204).send();
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });
};

createCrudRoutes('User', User);
createCrudRoutes('Project', Project);
createCrudRoutes('Story', Story);
createCrudRoutes('Task', Task);
createCrudRoutes('Notification', Notification);

