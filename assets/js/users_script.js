console.log('users');
function viewUser(name,email){
    alert(`Name : ${name}   \nEmail : ${email}`);
}
function editUser(id,name,email,password){
    document.getElementById('inputName').value=name;
    document.getElementById('inputId').value=id;
    document.getElementById('inputEmail').value=email;
    document.getElementById('inputPassword').value=password;
    document.getElementById('inputConfirmPassword').value='';
    document.getElementById('btn_submit').value='Update';
    document.getElementById("inputEmail").disabled = true;
}