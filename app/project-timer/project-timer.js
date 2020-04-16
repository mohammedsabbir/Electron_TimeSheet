const electron = require('electron');
const {ipcRenderer} = electron;
const $= require('jquery');
const Project = require('./../models/project')
const DailyHour = require('./../models/dailyhour')
const Helper = require('./../helper/helper')
const project = new Project()
const dailyhour = new DailyHour()
const helper = new Helper()
let selectedProject = {}
let projectHour ={
    'Id': 0,
    'ProjectId': 0,
    'StartTime': null,
    'EndTime': null,
    'UserId': 1
}

var h3 = document.getElementsByTagName('h3')[0]
var seconds = 0
var minutes = 0
var hours = 0
var t

ipcRenderer.on('init-data', function(e, data){
    hours = 0
    minutes = 0
    seconds = 0
    clearTimeout(t)
    
    LoadProjects(data.title.split('_')[1], false)
});

function LoadProjects(projectId, isStart){
    h3.textContent = "00:00:00"
    $('table tbody').empty()
    var condition = { 'ProjectId' : projectId}
    project.getProject(condition, (proj) => {
        if(proj == null) {
            console.log('project not found.');            
        }
        selectedProject = JSON.parse(JSON.stringify(proj[0]))
        $('#project-name').text(proj[0].ProjectName)
        projectHour.ProjectId = selectedProject.ProjectId
        var index = 1
        dailyhour.getDailyHours(condition, (dhlist) => {
            dhlist.forEach(dh => {
                if(index < 4){
                    var markup = `<tr><td>${formatDate(dh.StartTime)}</td><td>${formatDate(dh.EndTime)}</td><td>${calculatediff(dh.StartTime,dh.EndTime)}</td></tr>`
                    $('table tbody').append(markup)
                    index++
                }
            });
            var runningProject = dhlist.filter(function(dh){
                return dh.EndTime == null
            })
            if(runningProject.length == 0){
                $("#btn-start").attr("disabled", false)
                $("#btn-stop").attr("disabled", true)
            }else{
                projectHour = runningProject[0]
                $("#btn-start").attr("disabled", true)
                $("#btn-stop").attr("disabled", false)
                calculateHours(projectHour.StartTime)
                timer()
            }
        })
    })
}

function formatDate(dt){
    if(dt == null) return ''
    
    var todt = new Date(dt)
    console.log(todt);
    var d = todt.getUTCDate()
    var mo = todt.getUTCMonth() + 1
    var y = todt.getFullYear()
    var h =todt.getUTCHours()
    var m = todt.getUTCMinutes()
    var s = todt.getUTCSeconds()
    return (d > 9 ? d : "0" + d) + '-' + (mo > 9 ? mo : "0" + mo) + '-' + (y) + ' ' + (h > 9 ? h : "0" + h) + ':' +  (m > 9 ? m : "0" + m) + ':' + (s > 9 ? s : "0" + s);
}

function calculatediff(startTime, endTime){
    if(endTime == null) return ''
    let timediff = new Date(new Date(endTime) - new Date(startTime))
    var h =timediff.getUTCHours()
    var m = timediff.getMinutes()
    // var s = timediff.getSeconds()
    // return (h > 9 ? h : "0" + h) + ':' +  (m > 9 ? m : "0" + m) + ':' + (s > 9 ? s : "0" + s);
    return (h > 9 ? h : "0" + h) + ':' +  (m > 9 ? m : "0" + m);
}

function calculateHours(startTime){    
    let timediff =new Date(new Date() - new Date(startTime))
    hours = timediff.getHours();
    minutes = timediff.getMinutes();
    seconds = timediff.getSeconds(); 
}


function add() {
    seconds++;
    if (seconds >= 60) {
        seconds = 0;
        minutes++;
        if (minutes >= 60) {
            minutes = 0;
            hours++;
        }
    }
    
    h3.textContent = (hours ? (hours > 9 ? hours : "0" + hours) : "00") + ":" + (minutes ? (minutes > 9 ? minutes : "0" + minutes) : "00") + ":" + (seconds > 9 ? seconds : "0" + seconds);
    timer()
}
function timer() {
    t = setTimeout(add, 1000);
}
$('#btn-start').on("click", ()=>{
    projectHour.StartTime = helper.GetCurrentDateTime()
    projectHour.EndTime = null
    dailyhour.saveDailyHour(projectHour, (result)=>{
        if(result != null){
            LoadProjects(projectHour.ProjectId, true)
            console.log(result);
        }else{
            console.log(result);
        }
    })
    $("#btn-start").attr("disabled", true)
    $("#btn-stop").attr("disabled", false)
})


$('#btn-stop').on("click", ()=>{
    clearTimeout(t)
    projectHour.EndTime = helper.GetCurrentDateTime()
    dailyhour.updateDailyHour(projectHour, (result)=>{
        if(result.rowsAffected[0] >= 1){
            LoadProjects(projectHour.ProjectId, false)
            console.log(result);
        }else{
            console.log(result);
        }
    })
    $("#btn-stop").attr("disabled", true)
    $("#btn-start").attr("disabled", false)
})