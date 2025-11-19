'use strict';

const express = require('express');

function createServer() {
  const app = express();

  app.use(express.json());

  // Armazenamento em memória
  const users = [];
  let nextUserId = 1;

  const expenses = [];
  let nextExpenseId = 1;

  // Users

  // POST /users - cria usuário
  app.post('/users', (req, res) => {
    const { name } = req.body || {};

    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    const user = { id: nextUserId++, name };

    users.push(user);

    return res.status(201).json(user);
  });

  // GET /users - lista todos usuários
  app.get('/users', (_req, res) => {
    return res.status(200).json(users);
  });

  // GET /users/:id - obtém usuário por id
  app.get('/users/:id', (req, res) => {
    const id = Number(req.params.id);
    const user = users.find((u) => u.id === id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json(user);
  });

  // PATCH /users/:id - atualiza usuário
  app.patch('/users/:id', (req, res) => {
    const id = Number(req.params.id);
    const user = users.find((u) => u.id === id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { name } = req.body || {};

    if (typeof name !== 'undefined') {
      user.name = name;
    }

    return res.status(200).json(user);
  });

  // DELETE /users/:id - remove usuário
  app.delete('/users/:id', (req, res) => {
    const id = Number(req.params.id);
    const index = users.findIndex((u) => u.id === id);

    if (index === -1) {
      return res.status(404).json({ message: 'User not found' });
    }

    users.splice(index, 1);

    return res.status(204).end();
  });

  // Expenses

  // POST /expenses - cria despesa
  app.post('/expenses', (req, res) => {
    const { userId, spentAt, title, amount, category, note } = req.body || {};

    const missing =
      typeof userId === 'undefined' ||
      !spentAt ||
      !title ||
      typeof amount === 'undefined' ||
      !category ||
      !note;

    if (missing) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const user = users.find((u) => u.id === Number(userId));

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    const expense = {
      id: nextExpenseId++,
      userId: Number(userId),
      spentAt,
      title,
      amount,
      category,
      note,
    };

    expenses.push(expense);

    return res.status(201).json(expense);
  });

  // GET /expenses - lista despesas com filtros
  app.get('/expenses', (req, res) => {
    const { userId, categories, from, to } = req.query;
    let result = expenses.slice();

    if (userId) {
      const idNum = Number(userId);

      result = result.filter((e) => e.userId === idNum);
    }

    if (categories) {
      const list = String(categories).split(',');

      result = result.filter((e) => list.includes(e.category));
    }

    if (from || to) {
      const fromTs = from ? new Date(from).getTime() : -Infinity;
      const toTs = to ? new Date(to).getTime() : Infinity;

      result = result.filter((e) => {
        const ts = new Date(e.spentAt).getTime();

        return ts >= fromTs && ts <= toTs;
      });
    }

    return res.status(200).json(result);
  });

  // GET /expenses/:id - obtém despesa por id
  app.get('/expenses/:id', (req, res) => {
    const id = Number(req.params.id);
    const exp = expenses.find((e) => e.id === id);

    if (!exp) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    return res.status(200).json(exp);
  });

  // PATCH /expenses/:id - atualiza despesa
  app.patch('/expenses/:id', (req, res) => {
    const id = Number(req.params.id);
    const exp = expenses.find((e) => e.id === id);

    if (!exp) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    const updates = req.body || {};

    if (typeof updates.userId !== 'undefined') {
      const userFound = users.find(
        (user) => user.id === Number(updates.userId),
      );

      if (!userFound) {
        return res.status(400).json({ message: 'User not found' });
      }

      exp.userId = Number(updates.userId);
    }

    if (typeof updates.spentAt !== 'undefined') {
      exp.spentAt = updates.spentAt;
    }

    if (typeof updates.title !== 'undefined') {
      exp.title = updates.title;
    }

    if (typeof updates.amount !== 'undefined') {
      exp.amount = updates.amount;
    }

    if (typeof updates.category !== 'undefined') {
      exp.category = updates.category;
    }

    if (typeof updates.note !== 'undefined') {
      exp.note = updates.note;
    }

    return res.status(200).json(exp);
  });

  // DELETE /expenses/:id - remove despesa
  app.delete('/expenses/:id', (req, res) => {
    const id = Number(req.params.id);
    const index = expenses.findIndex((e) => e.id === id);

    if (index === -1) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    expenses.splice(index, 1);

    return res.status(204).end();
  });

  return app;
}

module.exports = {
  createServer,
};
