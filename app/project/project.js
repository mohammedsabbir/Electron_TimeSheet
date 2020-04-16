const electron = require('electron');
const $= require('jquery');
const Project = require('./../models/project')
const project = new Project();
const {ipcRenderer} = electron;
const form = document.querySelector('form');
let selectedFile;


form.addEventListener('submit', submitForm);
function submitForm(e){
    e.preventDefault();
    const proj = {
        ProjectName: $('#productname').val(),
        ProjectImagePath: selectedFile.path,
        ImageName: selectedFile.name.split('.')[0],
        // IconPath: selectedFile.path,
        // IconFileType: selectedFile.type,
        // IconFileSize:selectedFile.size
    }
    project.saveProject(proj, (result)=>{
        if(result.rowsAffected[0] >= 1){
            var condition = { 'ProjectName': proj.ProjectName , 'ImageName': proj.ImageName }
            project.getProject(condition, (proj1)=>{
                ipcRenderer.send('addproject', proj1[0]);
            })
        }else{
            console.log(result);
        }
    })
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
});

 
