console.log("File started")

const express = require('express')
const mongoose = require('mongoose')
const path = require('path')
const port = 3019

const app = express()
app.use(express.static(__dirname)) 
app.use(express.urlencoded({ extended: true }))

mongoose.connect('mongodb://127.0.0.1:27017/lostandfounditems')
const db = mongoose.connection
db.once('open', () => {
  console.log("Connected to MongoDB")
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

  imagePath: {
    type: String,
    required: false
  }

}, { timestamps: true })

const Items = mongoose.model('ItemData', itemSchema)

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'postitem.html'));
});

app.post('/submit-item', async (req, res) => {
  console.log(req.body)

  const item = new Items({
    itemType: req.body.itemType,
    itemName: req.body.itemName,
    description: req.body.description,
    dateLost: req.body.dateLost,
    datePosted: new Date(),
    roomNo: req.body.roomNo,
    contact: req.body.contact
  })

  await item.save()
  res.send("Item submitted successfully!")
})

app.listen(port, () => {
  console.log("Server started on port", port)
})
