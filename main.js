const electron = require('electron')
const {app, BrowserWindow, Menu, ipcMain} = electron;
const url = require('url');
const path = require('path');

let machineScreen;

let mainWindow;
let mainWindowPosition = { xaxis: 0, yaxis: 0};
let mainWindowScreen;

let productWindow;
let productWindowScreen;
let productWindowPosition = { xaxis: 0, yaxis: 0};

let prodMgtWin;
let prodMgtWinScreen;
let prodMgtWinPosition = { xaxis: 0, yaxis: 0};

let openedWindowLinkId;
function createWindow() {
   
   mainWindow = new BrowserWindow({
      width: 52, 
      height: 600,
      fullscreenable: false,
      resizable: false,
      frame: false
   });
   mainWindowPosition.xaxis = 2;
   mainWindowPosition.yaxis = 100;
   mainWindow.setPosition(mainWindowPosition.xaxis, mainWindowPosition.yaxis);
   mainWindow.loadURL(url.format ({ 
      pathname: path.join(__dirname, 'index.html'), 
      protocol: 'file:', 
      slashes: true 
   }));
}

function createProductWindow(){
   productWindow = new BrowserWindow({
      width: 400,
      height:500,
      x: mainWindowPosition[0],
      y: mainWindowPosition[1],
      icon: path.join(__dirname,'/assets/png/create.png'),
      title: 'Add Product',
      resizable: false,
      show: false,
      autoHideMenuBar: true,
      parent: mainWindow
   });
   productWindow.loadURL(url.format({
      pathname: path.join(__dirname, '/app/product/product.html'),
      protocol: 'file:',
      slashes: true
   }));
}

function CreateProdMgtWin(){
   prodMgtWin = new BrowserWindow({
      width: 640,
      height: 480,
      title: 'prod-mgt',
      resizable: false,
      icon: path.join(__dirname,'/assets/png/terminal.png'),
      show: false,
      autoHideMenuBar: true,
      parent: mainWindow
   });
   prodMgtWin.loadURL(url.format({
      pathname: path.join(__dirname, '/app/prod-mgt/prod-mgt.html'),
      protocol: 'file:',
      slashes: true
   }));
}

app.on('ready', function(){
   createWindow();
   createProductWindow();
   CreateProdMgtWin();
   // Display screen module
   var screenElectron = electron.screen;
   // Display Size
   var displayInfo = screenElectron.getPrimaryDisplay();
   if(displayInfo != null){
      machineScreen = {width: displayInfo.workAreaSize.width,height:displayInfo.workAreaSize.height};
   }
   // Main window display size
   var mainWindowDisplayInfo = mainWindow.getContentBounds();
   mainWindowScreen = {width: mainWindowDisplayInfo.width - 10, height: mainWindowDisplayInfo.height};
   // Product window display size
   var productWindowDisplayInfo = productWindow.getContentBounds();
   productWindowScreen = {width: productWindowDisplayInfo.width, height: productWindowDisplayInfo.height};
   // Product management window display size
   var prodMgtWinDisplayInfo = prodMgtWin.getContentBounds();
   prodMgtWinScreen = {width: prodMgtWinDisplayInfo.width, height: prodMgtWinDisplayInfo.height};

   mainWindow.on('closed', function(){
      app.quit();
   });
   // handle garbage collection
   mainWindow.on('close',function(){
      mainWindow = null;
   });
   
   productWindow.on('close', function(e){
      e.preventDefault();
      productWindow.hide();
      mainWindow.webContents.send('pro-win-closed','additem');
   });
   prodMgtWin.on('close', function(e){
      e.preventDefault();
      prodMgtWin.hide();
      mainWindow.webContents.send('pro-win-closed',openedWindowLinkId);
   });
   const menu = Menu.buildFromTemplate(template);
   Menu.setApplicationMenu(menu);
});

app.on('window-all-closed', () => {
   if(process.platform !== 'darwin'){
      app.quit();
   }
});

app.on('activate', () => {
   if(mainWindow === null){
      createWindow();
   }
});

function CloseWindow(targetWindow, elmt){
   targetWindow.hide();
   targetWindow = null;
   mainWindow.webContents.send('pro-win-closed',elmt);
}
// send product:add
ipcMain.on('product:add', function(e, prod){
   mainWindow.webContents.send('product:add', prod);
   CloseWindow(productWindow, openedWindowLinkId);
});

ipcMain.on('open-add-item', function(e, objectInfo){
   openedWindowLinkId = objectInfo.linkId;
   setProductPosition(mainWindowPosition.xaxis,objectInfo.position.top, 0);
   if(productWindow == null){
      CreateProductWindow();
   }
   productWindow.setPosition(productWindowPosition.xaxis,productWindowPosition.yaxis);
   productWindow.show();
   
});

ipcMain.on('open-window', function(e, objectInfo){
   openedWindowLinkId = objectInfo.linkId;
   console.log(objectInfo);
   setRenderedWindowPosition(mainWindowPosition.xaxis,objectInfo.position.top, 0);
   if(prodMgtWin == null){
      CreateProdMgtWin();
   }
   prodMgtWin.setPosition(prodMgtWinPosition.xaxis,prodMgtWinPosition.yaxis);
   prodMgtWin.setIcon(objectInfo.IconPath.split('///')[1]);
   prodMgtWin.setTitle(objectInfo.linkId);
   prodMgtWin.show();
   prodMgtWin.webContents.send('init-data',objectInfo);
});

function setRenderedWindowPosition( xloc, yloc, elmtPosition){
   prodMgtWinPosition.xaxis = ((prodMgtWinScreen.width + mainWindowScreen.width + xloc ) >  machineScreen.width) ? (xloc - prodMgtWinScreen.width - 10) : xloc + mainWindowScreen.width + 3;
   if(yloc > 0){
      prodMgtWinPosition.yaxis = mainWindowPosition.yaxis + yloc;
   }else{
      prodMgtWinPosition.yaxis = mainWindowPosition.yaxis + elmtPosition.top;
   }
   prodMgtWin.setPosition(prodMgtWinPosition.xaxis,prodMgtWinPosition.yaxis );
}

function setProductPosition(xloc,yloc, elmtPosition){
   productWindowPosition.xaxis = ((productWindowScreen.width + mainWindowScreen.width + xloc ) >  machineScreen.width) ? (xloc - productWindowScreen.width - 10) : xloc + mainWindowScreen.width + 3;
   if(yloc > 0){
      productWindowPosition.yaxis = mainWindowPosition.yaxis + yloc;
   }else{
      productWindowPosition.yaxis = mainWindowPosition.yaxis + elmtPosition.top;
   }
   productWindow.setPosition(productWindowPosition.xaxis,productWindowPosition.yaxis);
}

function setWindowPosition(xloc,yloc){
   if(xloc<1){
      mainWindowPosition.xaxis = 1;
   }else if((xloc + mainWindowScreen.width) > machineScreen.width){
      mainWindowPosition.xaxis = machineScreen.width - mainWindowScreen.width - 10;
   }else{
      mainWindowPosition.xaxis = xloc;
   }
   if(yloc < 1){
      mainWindowPosition.yaxis = 1;
   }else if((yloc+mainWindowScreen.height) > machineScreen.height){
      mainWindowPosition.yaxis = machineScreen.height - mainWindowScreen.height;
   }else{
      mainWindowPosition.yaxis = yloc;
   }
   mainWindow.setPosition(mainWindowPosition.xaxis,mainWindowPosition.yaxis);
}
ipcMain.on('window-dragging', function(e, objectPosition, elmtPosition){   
   console.log(elmtPosition.additem);
   console.log(elmtPosition.rendereritem);
   setWindowPosition(objectPosition[0],objectPosition[1]);
   setProductPosition(objectPosition[0],-1, elmtPosition.additem);
   setRenderedWindowPosition(objectPosition[0],-1, elmtPosition.rendereritem);
});
const template = [
   {},
   {
      label: 'File',
      submenu: [
         {
            label: 'Exit',
            accelerator: process.platform ==  'darwin' ? 'Command+Q' : 'Ctrl+Q',
            click: function(){
               app.quit();
            }
         }
      ]
   }
];
// if mac, add empty object to menu
if(process.platform == 'darwin'){
   template.unshift({}); 
}
if(process.env.NODE_ENV !== 'production'){
   template.push({
      label: 'Developer Tools',
      submenu: [
         {
            label: 'Toggle DevTools',
            accelerator: process.platform ==  'darwin' ? 'Command+I' : 'Ctrl+I',
            click(item, focusedWindow){
               // devToolWin.show();
               // focusedWindow.toggleDevTools();

               // detach developer tool
               focusedWindow.webContents.openDevTools({ mode: 'detach'});
            }
         },
         {
            role: 'reload'
         }
      ]
   });
}