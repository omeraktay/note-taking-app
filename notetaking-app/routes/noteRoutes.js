import express from "express";
import Note from "../models/Note.js";
import pkg from 'express-openid-connect';
const { requiresAuth } = pkg;

const noteRouter = express.Router();

noteRouter.get("/index", requiresAuth(), async (req, res) => {
    try {
        const notes = await Note.find({ user: req.oidc.user.sub });
        res.render("index", { user: req.oidc.user, notes });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving notes!!!");
    }
  });

// // GET all notes for logged-in user
// noteRouter.get("/", requiresAuth(), async (req, res) => {
//     try {
//         const notes = await Note.find({ user: req.oidc.user.sub });
//         res.json(notes);
//     } catch (error) {
//         res.status(500).json({ message: "Error retrieving notes." });
//     }
// });

// POST a new note
noteRouter.post("/", requiresAuth(), async (req, res) => {
    const { title, content } = req.body;
    if (!title || !content) {
        return res.status(400).json({ message: "Title and content are required." });
    }

    try {
        const newNote = new Note({ title, content, user: req.oidc.user.sub });
        await newNote.save();
        res.status(201).json(newNote);
    } catch (error) {
        res.status(500).json({ message: "Error saving note." });
    }
});

// PUT (update) a note by ID
noteRouter.put("/:id", requiresAuth(), async (req, res) => {
    try {
        const note = await Note.findOne({ _id: req.params.id, user: req.oidc.user.sub });
        if (!note) {
            return res.status(404).json({ message: "Note not found." });
        }

        note.title = req.body.title || note.title;
        note.content = req.body.content || note.content;
        await note.save();

        res.json(note);
    } catch (error) {
        res.status(500).json({ message: "Error updating note." });
    }
});

// DELETE a note by ID
noteRouter.delete("/:id", requiresAuth(), async (req, res) => {
    try {
        const note = await Note.findOneAndDelete({ _id: req.params.id, user: req.oidc.user.sub });
        if (!note) {
            return res.status(404).json({ message: "Note not found." });
        }

        res.json({ message: "Note deleted successfully." });
    } catch (error) {
        res.status(500).json({ message: "Error deleting note." });
    }
});

// RESTful API for notes
// const notes = [];
// noteRouter.get("/api/notes", requiresAuth(), (req, res) => {
//   res.json(notes.filter(note => note.user === req.oidc.user.sub));
// });

// noteRouter.post("/api/notes", requiresAuth(), (req, res) => {
//   const { title, content } = req.body;
//   if (!title || !content) {
//     return res.status(400).json({ message: "Title and content are required." });
//   }
//   const newNote = { id: Date.now(), title, content, user: req.oidc.user.sub };
//   notes.push(newNote);
//   res.status(201).json(newNote);
// });

// noteRouter.put("/api/notes/:id", requiresAuth(), (req, res) => {
//   const note = notes.find(n => n.id == req.params.id && n.user === req.oidc.user.sub);
//   if (!note) {
//     return res.status(404).json({ message: "Note not found." });
//   }
//   note.title = req.body.title || note.title;
//   note.content = req.body.content || note.content;
//   res.json(note);
// });

// noteRouter.delete("/api/notes/:id", requiresAuth(), (req, res) => {
//   const index = notes.findIndex(n => n.id == req.params.id && n.user === req.oidc.user.sub);
//   if (index === -1) {
//     return res.status(404).json({ message: "Note not found." });
//   }
//   notes.splice(index, 1);
//   res.json({ message: "Note deleted." });
// });

export default noteRouter;
