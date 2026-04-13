require('dotenv').config()
const express = require('express');
const cors = require('cors')
const app = express();
const Note = require('./models/note');
const { notes } = require('./burned-data');
app.use(express.json());
app.use(cors())


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

// Ten en cuenta que el middleware de manejo de errores debe ser el último middleware cargado, también todas las rutas deben registrarse antes que el error-handler!
const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  // si el error es un CastError, significa que el ID proporcionado no es válido, por ejemplo, si se intenta buscar una nota con un ID que no tiene el formato correcto de MongoDB (un ObjectId), se lanzará un CastError. En este caso, se responde con un código de estado 400 (Bad Request) y un mensaje de error indicando que el ID de la nota es inválido o mal formado.
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'ID de nota inválido, mal formado' })
  }

  // para otros tipos de errores, se responde con un código de estado 500 (Internal Server Error) y un mensaje de error genérico. Esto cubre cualquier otro error que pueda ocurrir en la aplicación, como errores de conexión a la base de datos, errores de validación, etc.
  next(error)
}

app.use(requestLogger)

// ruta raíz
app.get('/', (request, response) => {
  response.send('<h1>Hello World!</h1>')
})

// obtener todas las notas
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

// obtener una nota por id
app.get('/api/notes/:id', (request, response, next) => {
  // const id = Number(request.params.id) //el parametro siempre viene en string y debe convertirse a número.
  // console.log(id)
  // const note = notes.find(note => note.id === id)

  // FORMA 1 - usando el array de notas en memoria, datos quemados
  // const note = notes.find(note => {
  //   return note.id === id
  // })
  // if (note) {
  //   response.json(note)
  // } else {
  //   response.status(404).json({ message: "Nota no encontrada" }) //código 404 para not found
  // }

  // FORMA 2 - usando MongoDB
  Note.findById(request.params.id).
    then(note => {
      if (note) {
        response.json(note)
      } else {
        response.status(404).json({ message: "Nota no encontrada", status: 404 })
      }
    })
    // .catch(error => {
    // forma 1 sin middleware de manejo de errores
    // console.error('Error consultando la nota por ID:', error.message)
    // response.status(400).json({ error: 'ID de nota inválido, mal formado' })
    // })
    .catch(error => next(error)) // forma 2 con middleware de manejo de errores, se pasa el error al siguiente middleware que lo maneja, en este caso el middleware de manejo de errores definido al final del archivo.
})

// eliminar una nota por id
app.delete('/api/notes/:id', (request, response) => {
  // const id = Number(request.params.id)
  // notes = notes.filter(note => note.id !== id)

  // response.status(204).end()
  Note.deleteOne({ _id: request.params.id })
    .then(() => {
      response.status(204).end()
    })
    .catch(error => {
      console.error('Error deleting note:', error.message)
      response.status(500).json({ error: 'Error deleting note' })
    })
})

const generateId = () => {
  const maxId = notes.length > 0
    ? Math.max(...notes.map(n => n.id))
    : 0 // si no hay notas, el id máximo es 0,  de lo contrario, se calcula el id máximo a partir de las notas existentes. esto sirve para asignar un nuevo id a la nota que se va a crear, asegurando que sea único y secuencial.
  return maxId + 1
}

// crear una nueva nota
app.post('/api/notes', (request, response) => {
  const body = request.body

  //console.log(request.headers) imprime los headers de la petición, entre ellos el content-type

  if (!body || !body.content) {
    return response.status(400).json({ error: 'Content missing' })
  }

  // FORMA 1 - usando el array de notas en memoria, datos quemados
  // const note = {
  //   id: generateId(), // se genera un nuevo id para la nota utilizando la función generateId, que calcula el id máximo actual y le suma 1.
  //   content: body.content, // se asigna el contenido de la nota a partir del cuerpo de la solicitud, que se espera que tenga una propiedad content.
  //   important: Boolean(body.important) || false // se asigna la propiedad important a partir del cuerpo de la solicitud, convirtiendo su valor a booleano. Si no se proporciona un valor para important, se establece como false por defecto. esto permite que la nota tenga una propiedad important opcional, que puede ser true o false según lo que se envíe en la solicitud.
  // }

  // notes = notes.concat(note) // se agrega la nueva nota al array de notas existente utilizando el método concat, que devuelve un nuevo array con la nueva nota añadida al final. Esto es preferible a usar push, ya que concat no modifica el array original, lo que es una buena práctica en programación funcional.

  //  response.json(note)

  // FORMA 2 - usando MongoDB
  const note = new Note({
    content: body.content,
    important: Boolean(body.important) || false
  })

  console.log('note', note);

  note.save()
    .then(savedNote => {
      response.json(savedNote)
    })
    .catch(error => {
      response.status(500).json({ error: error.message })
    })

})

app.use(unknownEndpoint)

// este debe ser el último middleware cargado, ¡también todas las rutas deben ser registrada antes que esto!
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})