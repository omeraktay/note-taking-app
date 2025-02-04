import express from "express";
import Note from "../models/Note.js";

const noteRouter = express.Router();

// RESTful API for notes

const identifyUser = (req, res, next) => {
    if (req.isAuthenticated()) {
        req.userId = req.user._id.toString();  
    } 
    else if (req.oidc?.isAuthenticated()) {
        req.userId = req.oidc.user.sub;
    } 
    else {
        req.flash("error", "Please login first!");
        return res.redirect("/users/login");
    }
    next();
};

// GET all notes for the logged-in user
noteRouter.get("/index", identifyUser, async (req, res) => {
    try {
        const notes = await Note.find({ userId: req.userId });
        res.render("index", { user: req.user || req.oidc.user, notes });
    } 
    catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving notes!!!");
    }
});

// POST a new note
noteRouter.post("/", identifyUser, async (req, res) => {
    const { title, content } = req.body;
    if (!title || !content) {
        return res.status(400).json({ message: "Title and content are required." });
    }
    try {
        console.log("User ID:", req.userId);
        const newNote = new Note({ title, content, userId: req.userId });
        await newNote.save();
        res.status(201).json(newNote);
    } 
    catch (error) {
        res.status(500).json({ message: "Error saving note." });
    }
});

// Update a note by ID 
noteRouter.put("/:id", identifyUser, async (req, res) => {
    try {
        const note = await Note.findOne({ _id: req.params.id, userId: req.userId });
        if (!note) {
            return res.status(404).json({ message: "Note not found." });
        }
        note.title = req.body.title || note.title;
        note.content = req.body.content || note.content;
        await note.save();
        res.json(note);
    } 
    catch (error) {
        res.status(500).json({ message: "Error updating note." });
    }
});

// DELETE a note by ID
noteRouter.delete("/:id", identifyUser, async (req, res) => {
    try {
        const note = await Note.findOneAndDelete({ _id: req.params.id, userId: req.userId });
        if (!note) {
            return res.status(404).json({ message: "Note not found." });
        }
        res.json({ message: "Note deleted successfully." });
    } 
    catch (error) {
        res.status(500).json({ message: "Error deleting note." });
    }
});

// Test error handling middleware
noteRouter.get("/test-error", (req, res, next) => {
    const error = new Error("This is a test error!");
    error.status = 500;
    next(error); // Pass the error to the middleware
});

export default noteRouter;
