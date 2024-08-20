document.addEventListener('DOMContentLoaded', async () => {
    if(getCookie('jwtToken')== null){
        window.location.href ="../index.html";
    }
    else{
        loadProfile();
    }
});
document.getElementById('logout').addEventListener('click', async () => {
    localStorage.removeItem('jwtToken');
    localStorage.removeItem('UserData');
    deleteCookie('jwtToken');
    window.location.href = '../index.html';
});
function loadProfile(){
    if(localStorage.getItem('UserData')!=null){
        displayProfile(JSON.parse(localStorage.getItem('UserData')));
    }
    else{
        fetch('/auth/profile', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + getCookie('jwtToken')
            }
        }).then( response => response.json())
        .then(data => {
            if(data.message){
                alert("Session Expired. Please login again");
                // window.location.href = '../index.html';
            }
            else{
                localStorage.setItem('UserData', JSON.stringify(data));
                displayProfile(data);
            }
        })
        .catch(error => console.error('Error:', error));
    }
}
function displayProfile(data){
    // data = data.user;
    document.getElementById('name').innerText = data.name;
    document.getElementById('email').innerText = data.email;
    document.getElementById('ename').value = data.name;
    document.getElementById('ephone').value = data.phone;
    document.getElementById('eaddress').value = data.address;
    document.getElementById('estate').value = data.state;
}
var val=0;
document.getElementById('edit_profile').addEventListener('submit', async (event) => {
    if(val==1){
        alert("Please wait for the previous operation to complete");
        return;
    }
    val=1;
    event.preventDefault();
    const updatedData = {
        name: document.getElementById('ename').value,
        phone: document.getElementById('ephone').value,
        address: document.getElementById('eaddress').value,
        state: document.getElementById('estate').value
    };
    let l = validupdate(updatedData.name, updatedData.phone, updatedData.address, updatedData.state).length;
    if( l >0){
        alert("Please fill correct details");
        return; 
    }
    fetch('/auth/profile', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + getCookie('jwtToken')
        },
        body: JSON.stringify(updatedData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('Profile updated successfully.');
            localStorage.removeItem('UserData');
            loadProfile();
        } else {
            alert(data.message);
        }
        val=0;
    })
    .catch(error => {console.error('Error:', error); val=0;});
});