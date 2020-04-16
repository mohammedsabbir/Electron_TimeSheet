'use strict'

const Context = require('./context')
const tableName = 'dbo.project'

class Project extends Context{
    
    constructor(settings){
        super(settings)
        this.projects = []
    }

    saveProject(project, cb){
        this.ConnectSQL().then(pool => {
            return pool.request()
            .input('projectName',  project.ProjectName)
            .input('projectImagePath', project.ProjectImagePath)
            .input('imageName', project.ImageName)
            .query(`insert into ${tableName} values (@projectName, @projectImagePath, @imageName);`, (err, result)=>{
                if(err) return cb(null)
                cb(result)
            })
        })
    }

    getProjects(cb){
        this.ConnectSQL().then(pool => {
            const request = pool.request()
            return request.query(`select * from ${tableName};`).then(dt => {
                pool.close()
                if(dt != null){
                    cb(JSON.parse(JSON.stringify(dt.recordset)))
                }else{
                    cb(err)
                }                 
            })
        })
    }

    getProject(condition, cb){
        var searchstr = ''
        var addOp = false
        Object.keys(condition).forEach(key => {
            if(addOp) searchstr += ` and `
            searchstr += `${key} = '${condition[key]}' `
            addOp = true
        });        
        this.ConnectSQL().then(pool => {
            const request = pool.request()
            return request.query(`select * from ${tableName} where ${searchstr};`).then(dt => {
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

module.exports = Project