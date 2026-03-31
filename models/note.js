const mongoose = require('mongoose')
mongoose.set('strictQuery', false)

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  console.warn('MongoDB URI missing. Set MONGODB_URI in your environment or .env file.')
} else {
  mongoose
    .connect(MONGODB_URI, { family: 4 }) // family: 4 forces the use of IPv4, which can help avoid certain connection issues.
    .then(() => {
      console.log('Connected to MongoDB')
    })
    .catch(error => {
      console.error('MongoDB connection error:', error.message)
    })
}


const noteSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  important: {
    type: Boolean,
    default: false,
  },
})

// La función transform en toJSON se utiliza para modificar la representación JSON de los documentos de Mongoose antes de que se envíen como respuesta a las solicitudes. En este caso, se está transformando el documento para que el campo _id se convierta en id y se eliminen los campos _id y __v. Esto hace que la respuesta JSON sea más limpia y fácil de usar para los clientes que consumen la API.
noteSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Note', noteSchema)