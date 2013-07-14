describe 'sx', ->

  it 'should be in the global variable', ->
    expect(sx).to.be.ok

  it 'should have the system paths defined and valid', ->
    expect(sx.paths).to.not.be.empty
    expect(sx.paths.system).to.be.ok
    expect(fs.existsSync(sx.paths.system)).to.be.ok

  it 'should load all app configs before anything', ->

  it 'should load all modules specified in config', ->

  return
