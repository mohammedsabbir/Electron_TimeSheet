const electron = require('electron');
const $= require('jquery');
const sql = require('mssql');
const {ipcRenderer} = electron;
const form = document.querySelector('form');
let selectedFile;

const config = {
    user: 'sa',
    password: '@sa',
    server: 'localhost', // You can use 'localhost\\instance' to connect to named instance
    database: 'TimeSheet',
 
    options: {
        encrypt: false // Use this if you're on Windows Azure
    }
}
form.addEventListener('submit', submitForm);
function submitForm(e){
    e.preventDefault();
    const product = {
        ProductName: $('#productname').val(),
        IconName: selectedFile.name,
        IconPath: selectedFile.path,
        IconFileType: selectedFile.type,
        IconFileSize:selectedFile.size
    }
    ipcRenderer.send('product:add', product);
}

$('#uploadIcon').on('change', (event)=>{
    selectedFile = event.target.files[0];
    var reader = new FileReader();

    var imgtag = document.getElementById("myimage");
    imgtag.title = selectedFile.name;
  
    reader.onload = function(event) {
      imgtag.src = event.target.result;
    };
  
    reader.readAsDataURL(selectedFile);
    // ConnectSQL();
});
//select * from dbo.Projects
ipcRenderer.on('init-data', function(e, data){
    console.log(data);
});
function ConnectSQL(){
    var value = 1
    sql.connect(config).then(pool => {
        // Query
        
        return pool.request()
        .query('select * from dbo.Projects;')
    }).then(result => {
        console.log(result)
    }).then(result => {
        console.log(result)
    }).catch(err => {
        // ... error checks
        console.log(err);
    })
     
    sql.on('error', err => {
        // ... error handler
    })
}
 
