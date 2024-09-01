document.addEventListener('DOMContentLoaded', async () => {
    if(getCookie('jwtToken')== null){
        window.location.href ="../index.html";
    }
    else{
    try {
        const response = await fetch('/accounts/branch-account-data', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getCookie('jwtToken')}`
            }
        });
        const branchData = await response.json();

        const config = {
            type: 'bar',
            data: branchData,
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        };

        const ctx = document.getElementById('branchAccountsChart').getContext('2d');
        new Chart(ctx, config);
    } catch (error) {
        console.error('Error fetching branch account data:', error);
    }
    await fetch('/accounts', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getCookie('jwtToken')}`
            }
        })
        .then(response => response.json())
        .then(data => {
            accountData = data;
            displayCards(data);
            // hideloader();
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            alert('Failed to load data.');
            // hideloader();
        });
    }
});
var accountData=[];

/*-------------------------------------- Display Card Details ----------------------------------*/
function displayCards(accounts) {
    const container = document.getElementById('display_data');
    container.innerHTML = '';
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = '';
    
    accounts.forEach(account => {
        const card = document.createElement('div');
        card.className = 'card';
        const balance = parseFloat(account.balance);

        card.innerHTML = `
            <div class="align_line"> 
                <h4>Account ID: ${account.id}</h4> 
                <div>
                    <button onclick="delete_By_Id(${account.id})">Delete</button>
                    <button onclick="update_By_Id(${account.id})">Update</button>
                </div>
            </div>
            <hr>
            <p><span class="label">Account Number:</span> ${account.account_number}</p>
            <p><span class="label">Customer Name:</span> ${account.account_name}</p>
            <p><span class="label">Account Type:</span> ${account.account_type}</p>
            <p><span class="label">Balance:</span> $${isNaN(balance) ? 'N/A' : balance.toFixed(2)}</p>
            <p><span class="label">Opening Date:</span> ${new Date(account.opening_date).toLocaleDateString()}</p>
            <p><span class="label">Last Transaction Date:</span> ${account.last_transaction_date ? new Date(account.last_transaction_date).toLocaleDateString() : 'N/A'}</p>
            <p><span class="label">Status:</span> ${account.status}</p>
            <p><span class="label">Branch Name:</span> ${account.branch_name}</p>
        `;
        container.appendChild(card);

        const row = document.createElement('tr');
        const balance1 = parseFloat(account.balance).toFixed(2);

        row.innerHTML = `
            <td>${account.id}</td>
            <td>${account.account_number}</td>
            <td>${account.account_name}</td>
            <td>${account.account_type}</td>
            <td>$${isNaN(balance1) ? 'N/A' : balance1}</td>
            <td>${new Date(account.opening_date).toLocaleDateString()}</td>
            <td>${account.last_transaction_date ? new Date(account.last_transaction_date).toLocaleDateString() : 'N/A'}</td>
            <td>${account.status}</td>
            <td>${account.branch_name}</td>
        `;
        tableBody.appendChild(row);
    });
}

/*-------------------------------------- Add Account ----------------------------------*/
document.getElementById('accountForm').addEventListener('submit', function(event) {
    event.preventDefault();
    const formData = new FormData(this);
    const data = Object.fromEntries(formData.entries());
    if(!localStorage.getItem('UserData')){
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
                window.location.href = '../index.html';
            }
            else{
                localStorage.setItem('UserData', JSON.stringify(data));
            }
        })
        .catch(error => console.error('Error:', error));
    }
    data.user_id = JSON.parse(localStorage.getItem('UserData')).id;
    if (!validateData(data)) {
        console.log('Invalid data');
        return;
    }
    fetch('/accounts', { 
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + getCookie('jwtToken')
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        alert('Account added successfully!');
        this.reset();
        location.reload();
    })
    .catch(error => {
        console.error('Error:', error);
        alert('Failed to add account.');
    });
});

/*-------------------------------------- Validate Function ----------------------------------*/
function validateData(data) {
    let isValid = true;

    clearErrors();

    if (!data.account_number || data.account_number.trim() === '') {
        isValid = false;
        showError('account_number', 'Account Number is required.');
    }

    if (!data.account_name || data.account_name.trim() === '') {
        isValid = false;
        showError('account_name', 'Account Name is required.');
    }

    if (!data.balance || isNaN(data.balance) || data.balance <= 0) {
        isValid = false;
        showError('balance', 'Balance must be a positive number.');
    }

    if (!data.opening_date) {
        isValid = false;
        showError('opening_date', 'Opening Date is required.');
    }

    const validAccountTypes = ['Loan', 'Savings', 'Business'];
    if (!validAccountTypes.includes(data.account_type)) {
        isValid = false;
        showError('account_type', 'Account Type is invalid.');
    }

    const openingDate = new Date(data.opening_date);
    const lastTransactionDate = new Date(data.last_transaction_date);
    if (lastTransactionDate < openingDate) {
        isValid = false;
        showError('last_transaction_date', 'Last Transaction Date cannot be earlier than Opening Date.');
    }

    return isValid;
}

function showError(fieldId, message) {
    const field = document.getElementById(fieldId);
    if (field) {
        const errorElement = document.createElement('span');
        errorElement.className = 'error-message';
        errorElement.textContent = message;
        field.parentElement.appendChild(errorElement);
    }
}

function clearErrors() {
    document.querySelectorAll('.error-message').forEach(el => el.remove());
}

/*-------------------------------------- Update Account Function ----------------------------------*/
document.getElementById('editForm').addEventListener('submit', function(event) {
    event.preventDefault();
    let data = {
        account_number: document.getElementById('edit_account_number').value,
        account_name: document.getElementById('edit_account_name').value,
        account_type: document.getElementById('edit_account_type').value,
        balance: document.getElementById('edit_balance').value,
        opening_date: document.getElementById('edit_opening_date').value,
        last_transaction_date: document.getElementById('edit_last_transaction_date').value,
        status: document.getElementById('edit_status').value,
        branch_name: document.getElementById('edit_branch_name').value
    };
    
    if (!validateData(data)) {
        console.log('Invalid data');
        return;
    }

    const id = document.getElementById('editId').value;

    fetch(`/accounts/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + getCookie('jwtToken')
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(result => {
        // document.getElementById('overshade4').style.display = 'none';
        location.reload(); 
        alert('Account updated successfully!');
        console.log('Account updated successfully:', result);
        // hideloader();
    })
    .catch(error => {
        if (error.message.includes('422')) {
            alert('The account number already exists.');
        } else {
            console.error('Error updating account:', error);
            alert('Failed to update account.');
        }
    });
});

// download data
async function view_data(){
    try {
        if(confirm('Do You Want To Download Data')){
            const response = await fetch('../accounts/download', {
                method: 'GET',
                headers: {
                    'Authorization': 'Bearer ' + getCookie('jwtToken')
                }
            });

            if (!response.ok) {
                console.log(response);
                throw new Error('Failed to download file');
            }

            const blob = await response.blob();
            console.log(await blob.text());
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'accounts.xlsx';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();
        }
    } catch (error) {
        console.error('Error downloading the file:', error);
    }
}
/*----------------------------------- Delete Account Details By ID ---------------------------------*/
function delete_By_Id(id) {
    if (!confirm('Are you sure you want to delete this bill?')) {
        return;
    }

    fetch(`/accounts/${id}`, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + getCookie('jwtToken')
        }
    })
    .then(response => {
        if (response.ok) {
            alert('Account deleted successfully!');
            location.reload();
        } else {
            alert('Failed to delete Account.');
        }
    })
    .catch(error => {
        console.error('Error deleting Account:', error);
        alert('Failed to delete the Account.');
    });
}

//search
function search_by_id(){
    try{
        let data = document.getElementById('searchAccountNumber').value;
        if(data == ''){
            alert('Please enter the Account number');
            return;
        }
        fetch(`/accounts/${data}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + getCookie('jwtToken')
            },
        })
        .then(response => response.json())
        .then(result => {
            if(result.id != undefined){
                document.getElementById('error').innerHTML = "";
                display_search(result);
            }
            else{
                const errorElement = document.createElement('span');
                errorElement.className = 'error-message';
                errorElement.textContent = 'Id not found';
                document.getElementById('error').innerHTML = "";
                document.getElementById('error').appendChild(errorElement);
            }
        })
        .catch(error => {
            console.error('Id not found:', error);
            alert('Id not found');
        });
    }
    catch(e){
        console.log(e.message);
    }
}
function display_search(account){
        let content = document.getElementById('show_search');
        content.innerHTML = "";
        const card = document.createElement('div');
        card.className = 'card';
        const balance = parseFloat(account.balance);
    
        card.innerHTML = `
        <div> <h2 style="margin:0;" id='closeid'>&times;</h2></div>
            <div class="align_line"> 
                <h4>ID Number: ${account.id}</h4> 
                <div>
                    <button onclick="delete_By_Id(${account.id})">Delete</button>
                    <button onclick="update_By_Id(${account.id})">Update</button>
                </div>
            </div>
            <p><span class="label">Account Number: ${account.account_number}</span></p>
            <p><span class="label">Customer Name:</span> ${account.account_name}</p>
            <p><span class="label">Account Type:</span> ${account.account_type}</p>
            <p><span class="label">Balance:</span> $${isNaN(balance) ? 'N/A' : balance.toFixed(2)}</p>
            <p><span class="label">Opening Date:</span> ${new Date(account.opening_date).toLocaleDateString()}</p>
            <p><span class="label">Last Transaction Date:</span> ${new Date(account.last_transaction_date).toLocaleDateString()}</p>
            <p><span class="label">Status:</span> ${account.status}</p>
            <p><span class="label">Branch Name:</span> ${account.branch_name}</p>
            <hr>
        `;
        content.appendChild(card);
        document.getElementById('closeid').addEventListener('click', function(){
            document.getElementById('show_search').innerHTML = "";
        });
    }
    function update_By(){
        const id = document.getElementById('searchAccountNumber1').value;
        console.log(id);    
        if(id != undefined){
            update_By_Id(id);
        }
        else{
            alert('Id not found');
        }
    }
    function update_By_Id(id) {
        const result = accountData.find(b => b.id == id);
        if (!result) {
            alert('Account not found');
            return;
        }
        document.getElementById('editId').value = result.id;
        document.getElementById('edit_account_number').value = result.account_number;
        document.getElementById('edit_account_name').value = result.account_name;
        document.getElementById('edit_account_type').value = result.account_type;
        document.getElementById('edit_balance').value = result.balance;
        document.getElementById('edit_opening_date').value = formatDate(result.opening_date);
        document.getElementById('edit_last_transaction_date').value = formatDate(result.last_transaction_date);
        document.getElementById('edit_status').value = result.status;
        document.getElementById('edit_branch_name').value = result.branch_name;
        window.scrollTo({
            top: document.getElementById("update").offsetTop,
            behavior: "smooth" 
          });
    }
    
    function formatDate(dateString) {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }
    