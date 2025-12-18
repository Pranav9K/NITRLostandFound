require('dotenv').config()

console.log("File started")

const express = require('express')
const mongoose = require('mongoose')
const path = require('path')
const port = process.env.PORT || 3019
const app = express()

app.use(express.static(__dirname)) 
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.get('/home.html', (req, res) => {
  res.sendFile(path.join(__dirname, '/home.html'))
})

app.get('/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, '/index.html'))
})

app.get('/otpindex.html', (req, res) => {
  res.sendFile(path.join(__dirname, '/otpindex.html'))
})

app.get('/responses.html', (req, res) => {
  res.sendFile(path.join(__dirname, '/responses.html'))
})

app.get('/postitem.html', (req, res) => {
  res.sendFile(path.join(__dirname, '/postitem.html'))
})

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/lostandfounditems'

mongoose.connect(MONGODB_URI)
const db = mongoose.connection

app.get('/submit-item', (req, res) => {
  res.redirect('/postitem.html')
})

db.once('open', () => {
  console.log("Connected to MongoDB")
})

db.on('error', (err) => {
  console.error("MongoDB connection error:", err)
})

const itemSchema = new mongoose.Schema({
  itemType: {
    type: String,
    enum: ['lost', 'found'],
    required: true
  },

  itemName: {
    type: String,
    required: true
  },

  description: {
    type: String,
    required: true
  },

  dateLost: {
    type: Date,
    required: true
  },

  datePosted: {
    type: Date,
    default: Date.now
  },

  roomNo: {
    type: String,
    required: true
  },

  contact: {
    type: String,
    required: true
  },

  imageUrl: {
    type: String,
    required: false
  }

}, { timestamps: true })

const Items = mongoose.model('ItemData', itemSchema)


const multer = require('multer')
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Only image files are allowed!'), false)
    }
  }
})


const cloudinary = require('cloudinary').v2

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})


async function uploadToCloudinary(file) {
  try {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'lost-and-found', 
          resource_type: 'image'
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary upload error:', error)
            reject(error)
          } else {
            console.log('Cloudinary upload success:', result.secure_url)
            resolve(result.secure_url)
          }
        }
      )
      
      uploadStream.end(file.buffer)
    })
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error)
    throw error
  }
}

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'postitem.html'))
})


app.post('/submit-item', upload.single('image'), async (req, res) => {
  try {
    console.log('Received form data:', req.body)
    console.log('Received file:', req.file ? req.file.originalname : 'No file')

    let imageUrl = null

    if (req.file) {
      console.log('Uploading image to Cloudinary...')
      imageUrl = await uploadToCloudinary(req.file)
      console.log('Image uploaded successfully:', imageUrl)
    }

    const item = new Items({
      itemType: req.body.itemType,
      itemName: req.body.itemName,
      description: req.body.description,
      dateLost: req.body.dateLost,
      roomNo: req.body.roomNo,
      contact: req.body.contact,
      imageUrl: imageUrl
    })

    await item.save()
    console.log('Item saved to MongoDB successfully')
    
    res.redirect('/home.html?success=true')
  } catch (err) {
    console.error('Error in submit-item:', err)
    res.status(500).send(`Error saving item: ${err.message}`)
  }
})


app.get('/api/items', async (req, res) => {
  try {
    const items = await Items.find().sort({ datePosted: -1 })
    res.json(items)
  } catch (err) {
    console.error('Error fetching items:', err)
    res.status(500).json({ error: 'Error fetching items' })
  }
})


app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).send('File is too large. Maximum size is 10MB.')
    }
    return res.status(400).send(`Upload error: ${err.message}`)
  }
  
  if (err) {
    console.error('Unhandled error:', err)
    return res.status(500).send(`Server error: ${err.message}`)
  }
  
  next()
})

app.listen(port, () => {
  console.log(`Server started on port ${port}`)
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
})