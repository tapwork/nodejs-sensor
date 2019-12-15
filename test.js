'use strict';

const sql = require('mssql');

let pool;

sql.on('error', err => {
  console.error(err);
});

const dbHost = process.env.MSSQL_HOST ? process.env.MSSQL_HOST : '127.0.0.1';
const dbPort = process.env.MSSQL_PORT ? parseInt(process.env.MSSQL_PORT, 10) : 1433;
const dbUrl = `${dbHost}:${dbPort}`;
const dbUser = process.env.MSSQL_USER ? process.env.MSSQL_USER : 'sa';
const dbPassword = process.env.MSSQL_PW ? process.env.MSSQL_PW : 'stanCanHazMsSQL1';
const initConnectString = `mssql://${dbUser}:${dbPassword}@${dbUrl}/tempdb`;
const dbName = 'nodejscollector';
let preparedStatementGlobal = new sql.PreparedStatement();

describe('Node.js', () => {
  it('should connect to MSSQL', () => {
    return sql
      .connect(initConnectString)
      .then(() =>
        new sql.Request().query(
          `IF EXISTS (SELECT * FROM sys.databases WHERE name = N'${dbName}') DROP DATABASE ${dbName}`
        )
      )
      .then(() => new sql.Request().query(`CREATE DATABASE ${dbName}`))
      .then(() => sql.close())
      .then(() =>
        sql.connect({
          user: dbUser,
          password: dbPassword,
          server: dbHost,
          port: dbPort,
          database: dbName
        })
      )
      .then(_pool => {
        pool = _pool;
        return new sql.Request().query(
          'CREATE TABLE UserTable (id INT IDENTITY(1,1), name VARCHAR(40) NOT NULL, email VARCHAR(40) NOT NULL)'
        );
      })
      .then(() =>
        new sql.Request().batch(
          'CREATE PROCEDURE testProcedure' +
            '    @username nvarchar(40)' +
            'AS' +
            '    SET NOCOUNT ON;' +
            '    SELECT name, email' +
            '    FROM UserTable' +
            '    WHERE name = @username;'
        )
      )
      .then(() => {
        preparedStatementGlobal = new sql.PreparedStatement();
        preparedStatementGlobal.input('username', sql.NVarChar(40));
        preparedStatementGlobal.input('email', sql.NVarChar(40));
        return preparedStatementGlobal.prepare('INSERT INTO UserTable (name, email) VALUES (@username, @email)');
      })
      .then(() => {
        console.log('Connected to MSSQL');
        sql.close();
        process.exit(0);
      })
      .catch(err => {
        console.error('Failed to create database or table or failed to connect.', err);
        throw err;
      });
  });
});
