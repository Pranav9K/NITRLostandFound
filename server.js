console.log("File started")

const express = require('express')
const mongoose = require('mongoose')
const path = require('path')
const fs = require('fs')
const port = 3019
const app = express()

app.use(express.static(__dirname)) 
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

const uploadsDir = path.join(__dirname, 'uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
  console.log('Created uploads directory')
}

app.use('/uploads', express.static(uploadsDir))

mongoose.connect('mongodb://127.0.0.1:27017/lostandfounditems')
const db = mongoose.connection

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


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir)
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    const ext = path.extname(file.originalname)
    cb(null, uniqueSuffix + ext)
  }
})

const upload = multer({
  storage: storage,
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

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'postitem.html'))
})

app.post('/submit-item', upload.single('image'), async (req, res) => {
  try {
    console.log('Received form data:', req.body)
    console.log('Received file:', req.file ? req.file.filename : 'No file')

    let imageUrl = null

    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`
      console.log('Image saved locally:', imageUrl)
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
    
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path)
      console.log('Cleaned up uploaded file due to error')
    }
    
    res.status(500).send(`Error saving item: ${err.message}`)
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
  console.log("Server started on port", port)
  console.log(`Uploads will be saved to: ${uploadsDir}`)
})