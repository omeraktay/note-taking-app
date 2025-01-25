import express from "express";
import Note from '../models/Note.js'

const noteRouter = express.Router();

noteRouter.get('/', (req, res) => {
    res.render('users/welcome');
})

noteRouter.get('/login', (req, res) => {
    res.render('users/login');
});

// Create a new note
noteRouter.post('/newnote', async (req, res) => {
    try {
        const newNote = new Note(req.body);
        await newNote.save();
        res.status(201).send(newNote);
    } catch (err) {
        res.status(400).json({message: err.message});
    }
});

// Get all the notes
noteRouter.get('/mynotes', async (req, res) => {
    try {
        const notes = await Note.find();
        res.send(notes);
    } catch (err) {
        res.status(500).json({message: err.message});
    }
});

// Update a note by id
noteRouter.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { title, content } = req.body;
        const updateNote = await Note.findByIdAndUpdate(id, { title, content }, {new: true, runValidators: true});
        if(!updateNote){
            return res.status(404).json({message: 'Note was not found!'});
        }
        res.send(updateNote);
    } catch (err) {
        res.status(500).json({message: err.message});
    }
});

// Delete a note by id
noteRouter.delete('/:id', async (req, res) => {
    try {
        const deleteNote = await Note.findByIdAndDelete(req.params.id)
        if(!deleteNote){
            return res.status(404).json({message: 'We cannot find the note that you are lookig for!'})
        }
        res.send(`Note deleted succssfully`);
    } catch (err) {
        res.status(500).json({message: err.message});
    }
});


export default noteRouter;