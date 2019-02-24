const databaseClient = process.env.DATABASE_TYPE || 'postgresql';
module.exports = {
    development: {
      client: databaseClient,
      connection: { user:'suri_user', password:'superpassword', database:'suricats_db', host:'localhost'},
      migrations: {
        directory: __dirname + '/db/migrations'
      },
      seeds: {
        directory: __dirname + '/db/seeds'
      }
    },
    test: {
      client: databaseClient,
      connection: 'postgres://localhost:5432/suricats_db_test',
      migrations: {
        directory: __dirname + '/db/migrations'
      },
      seeds: {
        directory: __dirname + '/db/seeds'
      }
    }
};