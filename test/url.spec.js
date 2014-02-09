var url;

url = factory('url', require('../lib/system/classes/url.js'));

module.exports = {
  'url': {
    'defined and available': function() {
      return expect(url).to.be.ok();
    },
    'title': function() {
      return {
        'convert the text to a slug': function() {
          return expect(url.title('THIS TITLE')).to.equal('this-title');
        }
      };
    }
  }
};
