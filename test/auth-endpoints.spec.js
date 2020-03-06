const knex = require('knex');
const jwt = require('jsonwebtoken');
const app = require('../src/app');
const helpers = require('./test-helpers');

describe.only('Auth Endpoints', function() {
  let db;

  const { testUsers } = helpers.makeThingsFixtures();
  const testUser = testUsers[0];

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    });
    
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy());

  before('cleanup', () => helpers.cleanTables(db));

  afterEach('cleanup', () => helpers.cleanTables(db));

  describe.only(`POST /api/auth/login`, () => { // technically "login" is a verb which isnt very RESTful, but I was told that authentication endpoints sometimes do this
    beforeEach(`insert users`, () => {
      return helpers.seedUsers(
        db,
        testUsers
      );
    });

    const requiredFields = ['user_name', 'password'];
    requiredFields.forEach(field => {
      const loginAttemptBody = {
        user_name: testUser.user_name,
        password: testUser.password,
      };

      it(`responds with 400 required error when '${field}' is missing`, () => {
        delete loginAttemptBody[field];

        return supertest(app)
          .post('/api/auth/login')
          .send(loginAttemptBody)
          .expect(400, {
            error: `Missing '${field}' in request body`,
          });
      });
    });

    it(`responds 401 'invalid user_name or password' when bad user_name`, () => {
      const loginBody = { user_name: 'user-not', password: 'existy' };
      return supertest(app)
        .post('/api/auth/login')
        .send(loginBody)
        .expect(401, { error: 'Invalid credentials' });
    });

    it(`responds 401 'invalid user_name or password' when bad password`, () => {
      const loginBody = { user_name: testUser.user_name, password: 'incorrect'};
      console.log(loginBody);
      return supertest(app)
        .post('/api/auth/login')
        .send(loginBody)
        .expect(401, { error: 'Incorrect user_name or password'});
    });

    it('responds 200 and JWT auth token using secret when valid credentials', () => {
      const loginBody = { user_name: testUser.user_name, password: testUser.password };
      const expectedToken = jwt.sign(
        { user_id: testUser.id }, // payload
        process.env.JWT_SECRET,   // secret
        {
          subject: testUser.user_name,
          algorithm: 'HS256',
        }
      );

      return supertest(app)
        .post('/api/auth/login')
        .send(loginBody)
        .expect(200, {
          authToken: expectedToken,
        });
    });

  });
});