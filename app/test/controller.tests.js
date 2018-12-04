const expect = require('chai').expect;
const request = require('request');

describe('This is a test suite', () => {

  it('Should run when npm test command is set', () => {
    request.get('/', function(error, response, body){
      console.log(response);
      console.log(body);
    });
  })

});