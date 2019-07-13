const mongoose = require('mongoose');
const db = 'mongodb+srv://Daniel:daniel1997@cluster0-vfwmk.mongodb.net/movie?retryWrites=true&w=majority';



mongoose
  .connect(
    db,
    { useNewUrlParser: true }
  )
  .then(() => {
    console.log('Connected to database');
  })
  .catch(error => {
    console.log('Mongoose connetion error: ', error);
  });

const schema = mongoose.Schema({
  title: { type: String },
  name: {
    name: { type: String },
    lowerName: {type: String}
  },
  preview: { type: String },
  lyrics: { type: String },
  picture_big: { type: String },
  cover_big: {type: String}
  
});

const Songs = mongoose.model('Songs', schema, 'songCollection');

module.exports = Songs;
