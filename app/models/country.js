const Context = require('./context')

let fdt = {}
let err ={ errtype: 2, message: 'error'}
class Country extends Context{
    constructor(settings){
        super(settings)
    }   

    GetCountry(cb){
        console.log('calling no parameter');
        let myresult
        this.ConnectSQL().then(pool => {
            const request = pool.request()
            return request.query('select * from dbo.CODE_COUNTRY;').then(dt => {
                if(dt != null){
                    cb(JSON.parse(JSON.stringify(dt.recordset)))
                    //this.CloseConnection()
                }else{
                    cb(err)
                }
            })
        })
    }
    GetCountryById(conditions, cb){
        // console.log('calling parameter')
        console.log(conditions)
        this.ConnectSQL().then(pool => {
            const request = pool.request()
            return request.input('countrycode','BD', 'value').query('select * from dbo.CODE_COUNTRY where value=').then( dt =>{
                if(dt != null){
                    fdt = JSON.parse(JSON.stringify(dt.recordset))
                    this.CloseConnection()
                }else{
                    fdt = err
                } 
            })
        })
        if (cb && typeof(cb) === "function") {
            cb(fdt)
        }        
    }
}

module.exports = Country