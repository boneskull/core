module.exports = {
  $singleton: true
  $deps: [
    {'parse':['url','parse']}
    {'querystring':'querystring'}
    {'im': ['http','IncomingMessage']}
    {'Q':'q'}
    {'forms': 'forms'}
    {'formidable': ['formidable','IncomingForm']}
  ]
  parse: (request = null) ->
    form = new @$.formidable()

    d = @$.Q.defer()

    if request?
      form.parse(request, (err, fields, files) ->
        if (err)
          d.reject(err, form)
        else
          d.resolve(fields, files, form)
      )
    else
      d.reject('You must pass a request to the parse method', form)

    d.promise

  get: ->
    @$.forms

  _handle: (form, obj, callbacks) ->
    if typeof obj is "undefined" or obj is null or (typeof obj is "object" and Object.keys(obj).length is 0)
      (callbacks.empty or callbacks.other)(form)
    else if (typeof obj.body isnt "undefined" or typeof obj.url isnt "undefined") and typeof obj.method isnt "undefined"

      if obj.method is "GET"
        qs = @$.parse(obj.url).query
        @_handle(form, @$.querystring.parse(qs), callbacks)

      else if obj.method is "POST" or obj.method is "PUT"

        if obj.body
          @_handle(form, obj.body, callbacks)
        else
          buffer = ""
          obj.addListener "data", (chunk) ->
            buffer += chunk

          obj.addListener "end", =>
            @_handle(form, @$.querystring.parse(buffer), callbacks)

      else
        throw new Error("Cannot handle request method: " + obj.method)

    else if typeof obj is "object"

      form.bind(obj).validate (err, f) ->
        if f.isValid()
          (callbacks.success or callbacks.other) f
        else
          (callbacks.error or callbacks.other) f

    else
      throw new Error("Cannot handle type: " + typeof obj)

  validate: (request, form) ->
    d = @$.Q.defer()

    try
      @_handle(form, request, {
        success: (f) ->
          f.validate((err) ->
            if err
              d.reject(err, f)
            else
              d.resolve(f)
          )
        error: d.reject
      })
    catch e
      d.reject(e.toString(), form)

    d.promise
}