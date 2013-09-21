module.exports =
  'sx':
    'should be in the global variable': ->
      expect(sx).to.be.ok

    'should have the system paths defined and valid': ->
      expect(sx.paths).to.not.be.empty
      expect(sx.paths.system).to.be.ok
      expect(fs.existsSync(sx.paths.system)).to.be.ok

    'should load all app configs before anything': ->

    'should load all modules specified in config': ->