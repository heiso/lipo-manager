function expressErrorHandler (err, req, res, next) {
  console.error(err)
  res.status(500).send({error: 'Interval Server Error'})
  return err
}

function graphqlErrorHandler (err) {
  if (err.originalError instanceof CustomError) {
    if (!err.originalError.path) err.originalError.path = err.path
    console.error(err.originalError)
    return err.originalError
  } else {
    console.error(err.originalError)
    return err
  }
}

class CustomError extends Error {
  constructor (id, message) {
    super()
    this.id = id.toString()
    this.message = message
    this.path = null
  }
}

class CustomErrorSet extends Error {
  constructor () {
    super()
    this._errors = []
  }

  set path (path) {
    this._errors.forEach((error) => { error.path = path })
  }

  // HACK: appolo-server will check if throwed error has an errors property and will iterate over it.
  // Here we provide this errors property with mocked Errors and the originalError populated.
  // By doing this we can pass in the errorFormatter for each errors in our CustomErrorSet and get a flattened errors object in response.
  get errors () {
    return this._errors.map((error) => {
      const err = new Error()
      err.originalError = error
      return err
    })
  }

  add (idOrError, message) {
    if (idOrError instanceof CustomError) this._errors.push(idOrError)
    else if (idOrError instanceof CustomErrorSet) idOrError._errors.forEach((error) => this.add(error))
    else this._errors.push(new CustomError(idOrError, message))
  }

  isEmpty () {
    return this._errors.length === 0
  }
}

module.exports = {
  expressErrorHandler,
  graphqlErrorHandler,
  CustomError,
  CustomErrorSet
}
