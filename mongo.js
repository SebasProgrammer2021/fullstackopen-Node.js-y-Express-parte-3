const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

const url = `mongodb+srv://sebastianl_db_user:${password}@cluster0.crexpey.mongodb.net/noteApp?appName=Cluster0`

mongoose.set('strictQuery',false)

mongoose.connect(url, { family: 4 }) // connection to the database, family: 4 forces the use of IPv4, which can help avoid certain network issues.

// Define a schema for the notes collection in MongoDB. A schema is a blueprint for the structure of the documents in a collection. It defines the fields and their types.
const noteSchema = new mongoose.Schema({
  content: String,
  important: Boolean,
})

// Create a model based on the schema. A model is a constructor function that allows us to create and manipulate documents in the collection. The first argument is the name of the collection (in singular form), and the second argument is the schema to use for that collection.
const Note = mongoose.model('Note', noteSchema)

const note = new Note({
  content: 'test note from mongoose',
  important: false,
})

// note.save().then(result => {
//   console.log('note saved!')
//   mongoose.connection.close()
// })

// buscar todas las notas en la colección de MongoDB y luego imprimir cada nota en la consola. Después de imprimir las notas, se cierra la conexión a la base de datos.
Note.find({}).then(result => {
  result.forEach(note => {
    console.log(note)
  })
  mongoose.connection.close()
})

// busca las notas en la colección de MongoDB que tienen el campo "important" establecido en true. Luego, imprime cada nota importante en la consola y cierra la conexión a la base de datos.
Note.find({important: true}).then(result => {
  result.forEach(note => {
    console.log(note)
  })
  mongoose.connection.close()
})