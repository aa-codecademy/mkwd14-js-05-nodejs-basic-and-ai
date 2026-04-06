# Class 09: Mongoose Basics

This project demonstrates a simple CRUD API using:

- `Express` for HTTP routes
- `Mongoose` as an ODM (Object Data Modeling) layer
- `Zod` for request validation
- `MongoDB Atlas` as the database

## What is Mongoose?

Mongoose is a library on top of the MongoDB Node driver that gives you:

- **Schemas** to define document structure
- **Models** with convenient query methods (`find`, `findById`, `save`, etc.)
- **Validation** at the model level
- **Middleware/hooks** and other features for larger apps

In short: Mongoose helps structure MongoDB access and keeps data logic consistent.

## Why use Mongoose in class 09?

In class 08, we used the raw MongoDB driver to see database commands directly.
In class 09, we use Mongoose to learn how an ODM improves developer experience.

This helps students compare:

- Raw driver style (`collection().findOne()`, `insertOne()`, ...)
- ODM style (`Reminder.findById()`, `new Reminder().save()`, ...)

## Important note about architecture

To keep this lesson easy to follow, this project does **not** use full MVC folders.
All logic is in a small number of files.

Inside `index.js`, each endpoint includes comments like:

- router responsibility
- controller responsibility
- service responsibility
- model responsibility

These comments show how the same code would be separated in a real MVC application.

## Files overview

- `index.js` - Express app, endpoints, and MongoDB connection with Mongoose
- `repair.model.js` - Mongoose schema + model (`Reminder`)
- `schemas/reminder.schema.js` - Zod request schemas
- `validate-request.js` - reusable request validation middleware

## Run locally

From the `class_09_mongoose` folder:

```bash
npm install
npm run dev
```

Server runs on:

- `http://localhost:3000`

## API endpoints

- `GET /api/reminders`
- `GET /api/reminders/:id`
- `POST /api/reminders`
- `PUT /api/reminders/:id`
- `DELETE /api/reminders/:id`

## CRUD methods and alternatives in Mongoose

### Create

- `new Reminder(data)` + `save()` (used in this class): good when you want a document instance before saving (can modify fields, run instance methods, inspect state).
- `Reminder.create(data)`: shorter one-step create, good for straightforward inserts.
- `Reminder.insertMany([...])`: best for bulk insert operations.

### Read (Find)

- `Reminder.find()` (used): returns many documents (array).
- `Reminder.findById(id)` (used): shorthand for `_id` lookup.
- `Reminder.findOne(filter)`: returns first matching document.
- `Reminder.findById(id).select('name').lean()`: common optimization pattern; `select` limits fields, `lean` returns plain JS objects (faster, no Mongoose document methods).

### Update

- `Reminder.findByIdAndUpdate(id, update, { new: true })` (used): concise update by ID and return updated doc.
- `Reminder.findOneAndUpdate(filter, update, options)`: same idea but with custom filters.
- `Reminder.updateOne(filter, update)`: returns write result metadata, not the updated document.
- `doc.set(update); await doc.save()`: two-step pattern when you need document middleware/logic and clearer control over changed fields.

### Delete

- `Reminder.findByIdAndDelete(id)` (used): concise delete by ID and returns deleted doc.
- `Reminder.findOneAndDelete(filter)`: delete first matching document by any filter.
- `Reminder.deleteOne(filter)`: returns delete metadata, not the deleted document.
- `Reminder.deleteMany(filter)`: bulk delete for cleanup/admin operations.

### Quick differences summary

- `find...AndUpdate/Delete` methods are concise and practical for CRUD APIs.
- `updateOne/deleteOne` focus on operation result (`matchedCount`, `modifiedCount`, `deletedCount`) instead of returning documents.
- `save()` is useful when you need document-level logic; direct update methods are usually shorter for simple endpoints.

## Useful docs

- [Mongoose docs](https://mongoosejs.com/docs/)
- [Mongoose guide: Schemas](https://mongoosejs.com/docs/guide.html)
- [Mongoose models](https://mongoosejs.com/docs/models.html)
- [Mongoose queries](https://mongoosejs.com/docs/queries.html)
- [MongoDB Node.js driver docs](https://www.mongodb.com/docs/drivers/node/current/)
- [MongoDB CRUD docs](https://www.mongodb.com/docs/manual/crud/)
- [Zod docs](https://zod.dev/)
- [Express docs](https://expressjs.com/)
