'use strict'

const Store = require('electron-store');
const sql = require('mssql');
const config = {
    user: 'sa',
    password: '@sa',
    server: '192.168.0.214', // You can use 'localhost\\instance' to connect to named instance
    //server:'192.168.10.13',
    database: 'TimeSheet',
    connectionTimeout: 20000,
    options: {
        encrypt: false // Use this if you're on Windows Azure
    }
}
class Context extends Store{
    constructor(settings){
        super(settings); // setting
    }

    ConnectSQL(){
        return sql.connect(config)
    }

    CloseConnection(){
        sql.close()
    }
    
}
sql.close()
module.exports = Context
