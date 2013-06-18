trycatch(function() {
  return lab.HUE(1 / 0);
}, function() {
  return console.log(arguments);
});
