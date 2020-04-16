'use strict'

const electron = require('electron')
const {ipcRenderer} = electron
const machineResolution = electron.remote.screen
const $ = require('jquery')
const Project = require('./models/project')

let counter = 0;
let dragging = false;
let wX;
let wY;
const project = new Project();
// Display Size
var displayInfo = machineResolution.getPrimaryDisplay();
var elementInfo = {
    title: '',
    type: '',
    width: 0,
    height: 0,
    position: {
        top: 0,
        left: 0
    },
    imgPath: ''
};

$(document).ready(function(){
    
});
project.getProjects((projects)=>{
    if(projects.length > 0){
        projects.forEach(project => {
            const productlink = document.querySelector('#product-link');
            const li = document.createElement('li');
            const prodimg = document.createElement('img');
            prodimg.setAttribute('src', project.ProjectImagePath);
            prodimg.setAttribute('alt', project.ProjectName);
            const proda = document.createElement('a');
            proda.setAttribute('id', 'project_' + project.ProjectId);
            proda.setAttribute('href','#');
            proda.appendChild(prodimg);
            li.appendChild(proda);
            productlink.appendChild(li);
        });
        
    }
})
// open "add project window"
$('#openProjWin').on('click', () =>{
    var elmt=$('#openProjWin')
    elementInfo.title = 'openProjWin'
    elementInfo.type = elmt.type
    elementInfo.width = elmt.width()
    elementInfo.height = elmt.height()
    elementInfo.position = elmt.position()
    
    elmt.addClass('selected')
    
    ipcRenderer.send('openProjectWin', elementInfo)
});
// close "add project window" style event
ipcRenderer.on('pro-win-closed', function(e, elmt){
    if(elmt == ''){
        $('#openProjWin').removeClass('selected');
    }
    $('#'+ elmt).removeClass('selected');
});


$('#product-link').on('click', 'a', (e) => {
    const elmt = e.currentTarget;
    const elmtImage = e.currentTarget.querySelector('img');
    
    if(elmt.id != 'openProjWin'){
        var elmtid=$('#'+elmt.id)
    
        elementInfo.title = elmt.id
        elementInfo.type = elmtid.type
        elementInfo.width = elmtid.width()
        elementInfo.height = elmtid.height()
        elementInfo.position = elmtid.position()
        elementInfo.imgPath = elmtImage.src
        elementInfo.projectName = elmtImage.alt
        $('#'+e.currentTarget.id).addClass('selected');
        ipcRenderer.send('openProjectTimerwindow', elementInfo);
    }
});

ipcRenderer.on('addproject', function(e, prod){
    const productlink = document.querySelector('#product-link')
    const li = document.createElement('li')
    const prodimg = document.createElement('img')
    prodimg.setAttribute('src', prod.ProjectImagePath)
    prodimg.setAttribute('alt', prod.ProjectName)
    const proda = document.createElement('a')
    proda.setAttribute('id', prod.ProjectId)
    proda.setAttribute('href','#')
    proda.appendChild(prodimg)
    li.appendChild(proda)
    productlink.appendChild(li)
    $('#openProjWin').removeClass('selected')
});

$('#content').mousedown(function (e) {
    dragging = true;
    wX = e.pageX;
    wY = e.pageY;        
});
$('#content').mouseup(function () {
    dragging = false;
});
$(window).mousemove(function (e) {
    e.stopPropagation();
    e.preventDefault();
    if (dragging) {
        var xLoc = e.screenX - wX;
        var yLoc = e.screenY - wY;
        var windowPosition = [xLoc,yLoc];
        if(xLoc < 1 || xLoc > (displayInfo.workAreaSize.width-60) || yLoc < 1 || yLoc > (displayInfo.workAreaSize.height-600)){
            dragging = false;
        }else{
            try {
                //remote.BrowserWindow.getFocusedWindow().setPosition(xLoc, yLoc);
                ipcRenderer.send('window-dragging', windowPosition);
            } catch (err) {
                console.log(err);
            }
        }
        
    }
});

    
