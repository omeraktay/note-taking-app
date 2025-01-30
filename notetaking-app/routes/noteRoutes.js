import express from "express";
import Note from "../models/Note.js";
import pkg from 'express-openid-connect';
const { requiresAuth } = pkg;

const noteRouter = express.Router();

// RESTful API for notes

// noteRouter.get("/profile", requiresAuth(), async (req, res) => {
//     try {
//         const notes = await Note.find({ user: req.oidc.user.sub });
//         res.render("profile", { user: req.oidc.user, notes });
//     } catch (error) {
//         console.error(error);
//         res.status(500).send("Error retrieving notes!!!");
//     }
//   });

  noteRouter.get("/profile", requiresAuth(), (req, res) => {
  res.render("profile", { user: req.oidc.user });
});

  noteRouter.get("/index", requiresAuth(), async (req, res) => {
    try {
        const notes = await Note.find({ user: req.oidc.user.sub });
        res.render("index", { user: req.oidc.user, notes });
    } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving notes!!!");
    }
  });

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

export default noteRouter;
