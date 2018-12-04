const expect = require('chai').expect;
const request = require('supertest');

const { app } = require('../../server');

describe('This is a test suite', () => {

  it('Should run when npm test command is set', (done) => {
    request(app)
      .get('/')
      .expect(200)
      .expect((response) => {
        expect(response.headers['x-powered-by']).to.equal('Express');
      }).end(done);
  })

});