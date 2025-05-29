require('dotenv').config()
const Person = require('./models/phonebook')
const express = require('express')
const app = express()
app.use(express.json())
var morgan = require('morgan')
const cors = require('cors')
app.use(cors())
app.use(express.static('dist'))



morgan.token('postBody', (req) => {
  if (req.method === 'POST') {
    const { name, number } = req.body
    return JSON.stringify({ name, number })
  }
  return ''

})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :postBody'))

app.get('/', (request, response) => {
  response.send('<h1>Hello Backend</h1>')
})

app.get('/api/persons', (request, response) => {
  Person.find({}).then(persons => {
    response.json(persons)
  })

})

app.get('/info', (request, response) => {
  Person.find({}).then(person => {
    const date = new Date()
    response.send(`<p>Phonebook has info for ${person.length} people</p><p>${date}</p>`)
  })

})

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id).then(person => {
    if (person) {
      response.json(person)
    } else {
      response.status(404).end()
    }
  }).catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(() => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.put('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (!person) {
        return response.status(404).end()
      }
      person.number = request.body.number

      return person.save({ runValidators: true })
        .then(updatedPerson => {
          response.json(updatedPerson)
        })
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const newPerson = request.body
  if (!newPerson.name || newPerson.name.trim() === '') {
    return response.status(400).json({ error: 'name must be provided and it cannot be empty' })
  }

  if (!newPerson.number || newPerson.number.trim() === '') {
    return response.status(400).json({ error: 'number must be provided and it cannot be empty' })
  }

  Person.findOne({ name: newPerson.name })
    .then(existingPerson => {
      if (existingPerson) {
        return response.status(400).json({ error: 'name must be unique' })
      }

      const person = new Person({
        name: newPerson.name,
        number: newPerson.number
      })

      person.save()
        .then(savedPerson => {
          response.json(savedPerson)
        })
        .catch(error => next(error)) // Handle save errors
    })
    .catch(error => next(error))
})

const errorHandler = (error, request, response, next) => {
  console.log(error.message)
  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformed id' })
  }
  else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message })
  }
  next(error)
}

app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT)
console.log(`Server running on port ${PORT}`)