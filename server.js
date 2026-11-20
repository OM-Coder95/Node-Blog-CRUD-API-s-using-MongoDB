
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
require('dotenv').config()

const app = express()

app.use(cors())
app.use(express.json())

// 1. Create Blog Schema
const blogSchema = new mongoose.Schema({

    title: {
        type: String,
        required: [true, 'Title is a required field.!!'],
        trim: true,
        minlength: [5, 'Title must have at least 5 characters.!!']
    },

    content: {
        type: String,
        required: [true, 'Content is a required field.!!'],
        trim: true
    },

    author: {
        type: String,
        required: [true, 'Author is a required field.!!'],
        trim: true
    },

    category: {
        type: String,
        required: [true, 'Category is a required field.!!']
    }

}, {
    timestamps: true
})

// 2. Create Blog Model
const Blog = mongoose.model('blogs', blogSchema)

app.post('/api/blog', async (req, res) => {
    try {
        let createBody = req.body;
        let blog = await Blog.create(createBody);

        res.status(201).json({
            message: 'New Blog is created successfully!!!',
            data: blog
        })
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({
                message: 'Validation Error',
                error: Object.values(err.errors).map(e => e.message)
            })
        }

        res.status(500).json({
            message: 'Network Error',
            error: err.message
        })
    }
})

app.get('/api/blog', async (req, res) => {
    try {
        let blogs = await Blog.find();

        res.status(200).json({
            message: 'Successfully fetched',
            body: blogs
        })

    } catch (err) {
        if (err.name === 'ValidationError') {
            res.status(400).json({
                message: 'Validation Errors',
                error: Object.values(err.errors).map(e => e.message)
            })
        }

        res.status(500).json({
            message: 'Network Error',
            error: err.message
        })
    }
})

app.get('/api/blog/:id', async (req, res) => {
    try {
        let id = req.params.id;
        let blog = await Blog.findById(id);

        if (!blog) {
            return res.status(400).json({
                message: `Post with ${id} Not Found`,
            })
        }

        res.status(200).json({
            message: `Blog fetched successfully with Id ${id}`,
            body: blog
        })

    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({
                message: 'Validation Error',
                error: Object.values(err.errors).map(e => e.message)
            })
        }

        if (err.name === "CastError") {
            return res.status(400).json({
                message: "Invalid MongoDB Id"
            })
        }

        res.status(500).json({
            message: 'Network Error',
            error: err.message
        })
    }
})

app.patch("/api/blog/:id", async (req, res) => {
    try {
        let id = req.params.id;
        let updateBody = req.body;

        let updatedBlog = await Blog.findByIdAndUpdate(id, updateBody, {
            new: true,
            runValidators: true
        });

        if (!updatedBlog) {
            return res.status(404).json({
                message: `Blog with id ${id} not found!!!`,
            })
        }

        res.status(200).json({
            message: `Blog with id ${id} updated successfully!!!`,
            body: updatedBlog
        })


    } catch (err) {
        if (err.name === "ValidationError") {
            return res.status(400).json({
                message: "Validation Error",
                errors: Object.values(err.errors).map(error => error.message)
            })
        }

        if (err.name === "CastError") {
            return res.status(400).json({
                message: "Invalid MongoDB Id"
            })
        }

        res.status(500).json({
            message: 'Network Error',
            error: err.message
        })
    }
})

app.delete("/api/blog/:id", async (req, res) => {
    try {
        let deleteId = req.params.id;

        let blog = await Blog.findByIdAndDelete(deleteId);

        if (!blog) {
            return res.status(404).json({
                message: `Blog with id ${deleteId} not found!!!`
            })
        }

        res.status(200).json({
            message: `Blog with id ${deleteId} deleted successfully!!!`,
            body: blog
        })

    } catch (err) {
        if (err.name === "ValidationError") {
            return res.status(400).json({
                message: 'Validation Error',
                error: Object.values(err.errors).map(e => e.message)
            })
        }

        if (err.name === "CastError") {
            return res.status(400).json({
                message: "Invalid MongoDB Id"
            })
        }

        res.status(500).json({
            message: "Network Error",
            error: err.message
        })
    }
})

// 3. Set Port
const port = process.env.PORT || 3000

// 4. Start Server and Connect MongoDB
async function startServer() {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is missing')
        }
        await mongoose.connect(process.env.MONGODB_URI)

        app.listen(port, () => {
            console.log(`Application is running on port ${port}`)
        })

    } catch (error) {
        console.log('Server Error:', error)
    }
}

startServer()