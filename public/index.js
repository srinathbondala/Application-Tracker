function openlink(){
    window.location.href = '../user/user.html';
}
var val=0;
document.getElementById('login_form').addEventListener('submit', async (event) => {
    if(val==1){
        alert("Please wait for the previous operation to complete");
        return;
    }
    val=1;
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('../auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('jwtToken', data.token);
            localStorage.setItem('UserData', JSON.stringify(data.details));
            setCookie('jwtToken', data.token);
            if(data.details.role === 'user')
                window.location.href = '../user/user.html';
            else{
                window.location.href = '../admin/admin.html';
            }
        } else {
            alert(data.message || 'Login failed. Please try again.');
        }
        val=0;
    } catch (error) {
        alert('Error: ' + error.message);
        val=0;
    }
});