'use strict'

const Context = require('./context')
const tableName = 'dbo.DailyHour'

class DailyHour extends Context{
    
    constructor(settings){
        super(settings)
        this.projects = []
    }
    saveDailyHour(projectHour, cb){
        
        this.ConnectSQL().then(pool => {
            return pool.request()
            .input('projectId',  projectHour.ProjectId)
            .input('startTime', projectHour.StartTime)
            .input('endTime', projectHour.EndTime)
            .input('userId', projectHour.UserId)
            .query(`insert into ${tableName} values (@projectId, @startTime, @endTime, @userId);`, (err, result)=>{
                if(err) return cb(null)
                cb(result)
            })
        })
    }

    updateDailyHour(projectHour, cb){
        this.ConnectSQL().then(pool => {
            return pool.request()
            .query(`update ${tableName} set EndTime = '${projectHour.EndTime}' where ProjectId=${projectHour.ProjectId};`, (err, result)=>{
                if(err) return cb(null)
                cb(result)
            })
        })
    }

    getDailyHours(condition, cb){
        var searchstr = ''
        var addOp = false
        Object.keys(condition).forEach(key => {
            if(addOp) searchstr += ` and `
            searchstr += `${key} = '${condition[key]}' `
            addOp = true
        });        
        this.ConnectSQL().then(pool => {
            const request = pool.request()
            return request.query(`select * from ${tableName} where ${searchstr}  order by Id desc;`).then(dt => {
                pool.close()
                if(dt != null){
                    cb(JSON.parse(JSON.stringify(dt.recordset)))
                }else{
                    cb(err)
                }                 
            })
        })
    }
}


module.exports = DailyHour