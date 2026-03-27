const express = require('express');
const cors = require('cors')
const app = express();
app.use(express.json());
app.use(cors())
const mongoose = require('mongoose')

const password = process.argv[2]
const mongoUriFromArg = password
  ? `mongodb+srv://sebastianl_db_user:${password}@cluster0.crexpey.mongodb.net/noteApp?appName=Cluster0`
  : null
const MONGODB_URI = process.env.MONGODB_URI || mongoUriFromArg

mongoose.set('strictQuery', false)

if (!MONGODB_URI) {
  console.warn('MongoDB URI missing. Set MONGODB_URI or pass the password as a CLI arg.')
} else {
  mongoose
    .connect(MONGODB_URI, { family: 4 })
    .then(() => {
      console.log('Connected to MongoDB')
    })
    .catch(error => {
      console.error('MongoDB connection error:', error.message)
    })
}

let notes = [
  {
    id: 1,
    content: "HTML is easy",
    important: true
  },
  {
    id: 2,
    content: "Browser can execute only JavaScript",
    important: false
  },
  {
    id: 3,
    content: "GET and POST are the most important methods of HTTP protocol",
    important: true
  }
]

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(requestLogger)


app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

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

const Note = mongoose.model('Note', noteSchema)

app.get('/api/notes', (request, response) => {
  // Primera ruta usando MongoDB
  Note.find({})
    .then(notes => {
      response.json(notes)
    })
    .catch(error => {
      response.status(500).json({ error: error.message })
    })

})

app.get('/api/notes/:id', (request, response) => {
  const id = Number(request.params.id) //el parametro siempre viene en string y debe convertirse a número.
  console.log(id)
  // const note = notes.find(note => note.id === id)
  const note = notes.find(note => {
    return note.id === id
  })
  if (note) {
    response.json(note)
  } else {
    response.status(404).json({ message: "Nota no encontrada" }) //código 404 para not found
  }
})

app.delete('/api/notes/:id', (request, response) => {
  const id = Number(request.params.id)
  notes = notes.filter(note => note.id !== id)

  response.status(204).end()
})

const generateId = () => {
  const maxId = notes.length > 0
    ? Math.max(...notes.map(n => n.id))
    : 0 // si no hay notas, el id máximo es 0,  de lo contrario, se calcula el id máximo a partir de las notas existentes. esto sirve para asignar un nuevo id a la nota que se va a crear, asegurando que sea único y secuencial.
  return maxId + 1
}

app.post('/api/notes', (request, response) => {
  const body = request.body

  //console.log(request.headers) imprime los headers de la petición, entre ellos el content-type

  if (!body || !body.content) {
    return response.status(400).json({ error: 'Content missing' })
  }

  const note = {
    id: generateId(), // se genera un nuevo id para la nota utilizando la función generateId, que calcula el id máximo actual y le suma 1.
    content: body.content, // se asigna el contenido de la nota a partir del cuerpo de la solicitud, que se espera que tenga una propiedad content.
    important: Boolean(body.important) || false // se asigna la propiedad important a partir del cuerpo de la solicitud, convirtiendo su valor a booleano. Si no se proporciona un valor para important, se establece como false por defecto. esto permite que la nota tenga una propiedad important opcional, que puede ser true o false según lo que se envíe en la solicitud.
  }

  notes = notes.concat(note) // se agrega la nueva nota al array de notas existente utilizando el método concat, que devuelve un nuevo array con la nueva nota añadida al final. Esto es preferible a usar push, ya que concat no modifica el array original, lo que es una buena práctica en programación funcional.

  console.log('note', note);

  response.json(note)
})


app.use(unknownEndpoint)
const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})