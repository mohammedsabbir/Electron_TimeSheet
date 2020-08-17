const electron = require('electron');
const remote = electron.remote;
const url = require('url');
const path = require('path');
const {ipcRenderer} = electron;
let $ = require('jquery');
let helper = require('./helper/helper.js');

let counter = 0;
let dragging = false;
let wX;
let wY;
var screenElectron = electron.screen;
// Display Size
var displayInfo = screenElectron.getPrimaryDisplay();
var elmtPosition = {
    additem: { left: 0, top: 0},
    rendereritem: { left: 0, top: 0}
};
$('#additem').on('click', () =>{
    // console.log('application name: ' + helper.getApplicationName());
    
    elmtPosition.additem =$('#additem').position(); 
    var objectInfo = {
        position: $('#additem').position(),
        linkId: 'additem'
    };
    $('#additem').addClass('selected');
    ipcRenderer.send('open-add-item', objectInfo);
});
$('#product-link').on('click', 'a', (e) => {
    const elmt = e.currentTarget;
    const elmtImage = e.currentTarget.querySelector('img');
    
    if(elmt.id != 'additem'){
        elmtPosition.rendereritem = $('#'+elmt.id).position();
        var objectInfo = {
            position: $('#'+elmt.id).position(),
            linkId: elmt.id,
            IconPath: elmtImage.src
        };
        $('#'+e.currentTarget.id).addClass('selected');
        ipcRenderer.send('open-window', objectInfo);
    }
});


ipcRenderer.on('product:add', function(e, prod){
    const productlink = document.querySelector('#product-link');
    const li = document.createElement('li');
    const prodimg = document.createElement('img');
    prodimg.setAttribute('src', prod.IconPath);
    const proda = document.createElement('a');
    proda.setAttribute('id', prod.ProductName );
    proda.setAttribute('href','#');
    proda.appendChild(prodimg);
    li.appendChild(proda);
    productlink.appendChild(li);
});

ipcRenderer.on('pro-win-closed', function(e, elmt){
    $('#'+elmt).removeClass('selected');
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
        var objectPosition = [xLoc,yLoc];
        if(xLoc < 1 || xLoc > (displayInfo.workAreaSize.width-60) || yLoc < 1 || yLoc > (displayInfo.workAreaSize.height-600)){
            dragging = false;
        }else{
            try {
                //remote.BrowserWindow.getFocusedWindow().setPosition(xLoc, yLoc);
                ipcRenderer.send('window-dragging', objectPosition, elmtPosition);
            } catch (err) {
                console.log(err);
            }
        }
        
    }
});

    
