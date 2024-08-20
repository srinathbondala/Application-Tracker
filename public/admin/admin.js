document.addEventListener('DOMContentLoaded', async () => {
    if(getCookie('jwtToken')== null){
        window.location.href ="../index.html";
    }
    else if(JSON.parse(localStorage.getItem('UserData')).role=='user'){
        window.location.href ="../index.html";
    }
    else{
        try {
            const response = await fetch('/admin/api//state-account-data', {
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
    
            const ctx = document.getElementById('stateAccountsChart').getContext('2d');
            new Chart(ctx, config);
        } catch (error) {
            console.error('Error fetching branch account data:', error);
        }
        await fetch('/admin/api/', {
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
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            alert('Failed to load data.');
        });
    }
});
var accountData=[];

//display data
function displayCards(accounts) {
    const container = document.getElementById('display_data');
    container.innerHTML = '';
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = '';
    
    accounts.forEach(account => {
        const card = document.createElement('div');
        card.className = 'card';

        card.innerHTML = `
            <div class="align_line"> 
                <h4>Account ID: ${account.id}</h4> 
                <div>
                    <button onclick="delete_By_Id(${account.id})">Delete</button>
                </div>
            </div>
            <hr>
            <p><span class="label">Name:</span> ${account.name}</p>
            <p><span class="label">Email:</span> ${account.email}</p>
            <p><span class="label">Phone:</span> ${account.phone}</p>
            <p><span class="label">Address:</span> ${account.address}</p>
            <p><span class="label">State:</span> ${account.state}</p>
            <p><span class="label">Role:</span> ${account.role}</p>
        `;
        container.appendChild(card);

        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${account.id}</td>
            <td>${account.name}</td>
            <td>${account.email}</td>
            <td>${account.phone}</td>
            <td>${account.address}</td>
            <td>${account.state}</td>
            <td>${account.role}</td>
        `;
        tableBody.appendChild(row);
    });
}

//delete account
function delete_By_Id(id) {
    if (!confirm('Are you sure you want to delete this account?')) {
        return;
    }

    fetch(`/admin/api/${id}`, {
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
            alert('Failed to delete account.');
        }
    })
    .catch(error => {
        console.error('Error deleting account:', error);
        alert('Failed to delete the account.');
    });
}

//search account
function search_by_id() {
    try {
        const data = document.getElementById('searchAccountNumber').value;
        if (data === '') {
            alert('Please enter the Account ID');
            return;
        }
        fetch(`/admin/api/${data}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + getCookie('jwtToken')
            },
        })
        .then(response => response.json())
        .then(result => {
            if (result.id !== undefined) {
                document.getElementById('error').innerHTML = "";
                display_search(result);
            } else {
                const errorElement = document.createElement('span');
                errorElement.className = 'error-message';
                errorElement.textContent = 'ID not found';
                document.getElementById('error').innerHTML = "";
                document.getElementById('error').appendChild(errorElement);
            }
        })
        .catch(error => {
            console.error('Error searching for ID:', error);
        });
    } catch (e) {
        console.log(e.message);
    }
}
function display_search(account) {
    const content = document.getElementById('show_search');
    content.innerHTML = "";
    const card = document.createElement('div');
    card.className = 'card';

    card.innerHTML = `
        <div> <h2 style="margin:0;" id='closeid'>&times;</h2></div>
        <div class="align_line"> 
            <h4>ID: ${account.id}</h4> 
            <div>
                <button onclick="delete_By_Id(${account.id})">Delete</button>
            </div>
        </div>
        <p><span class="label">Name:</span> ${account.name}</p>
        <p><span class="label">Email:</span> ${account.email}</p>
        <p><span class="label">Phone:</span> ${account.phone}</p>
        <p><span class="label">Address:</span> ${account.address}</p>
        <p><span class="label">State:</span> ${account.state}</p>
        <p><span class="label">Role:</span> ${account.role}</p>
        <hr>
    `;
    content.appendChild(card);
    document.getElementById('closeid').addEventListener('click', function() {
        document.getElementById('show_search').innerHTML = "";
    });
}
//create account
var val = 0;

document.getElementById('register_form').addEventListener('submit', async (event) => {
  event.preventDefault();

  if (val === 1) {
      alert("Please wait for the previous operation to complete");
      return;
  }
  val = 1;

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const name = document.getElementById('name').value;
  const phone = document.getElementById('phone').value;
  const address = document.getElementById('address').value;
  const state = document.getElementById('state').value;
  const userCategory = document.getElementById('user').value;

  // Validation function
  const validationErrors = validateRegistrationForm(email, password, name, phone, address, state);

  if (validationErrors.length > 0) {
      alert(validationErrors.join('\n'));
      val = 0;
      return;
  }

  // Predefined secret key for admin role
  const adminSecretKey = "AdminKey123";
  if (userCategory === "admin") {
    const enteredKey = prompt("Please enter the admin secret key:");

    if (enteredKey !== adminSecretKey) {
      alert("Incorrect secret key. You cannot register as an admin.");
      val = 0;
      return; // Stop form submission
    }
  }

  try {
      const response = await fetch('../auth/register', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': 'Bearer ' + getCookie('jwtToken')
          },
          body: JSON.stringify({ email, password, name, phone, address, state, role: userCategory })
      });

      let data;
      try {
        data = await response.json();
      } catch (e) {
          console.error('Error parsing JSON:', e);
          alert('Unexpected response format from server.');
          val = 0;
          return;
      }

      if (response.ok) {
          alert('User Created successfully!');
          location.reload();
      } else {
          alert(data.message || 'Registration failed. Please try again.');
      }
      val = 0;
  } catch (error) {
      alert('Error: ' + error.message);
      val = 0;
  }
});

function validateRegistrationForm(email, password, name, phone, address, state) {
    const errors = [];

    // Basic validation checks
    if (!email || !email.includes('@')) {
        errors.push('Please enter a valid email address.');
    }
    if (!password || password.length < 6) {
        errors.push('Password must be at least 6 characters long.');
    }
    if (!name) {
        errors.push('Name is required.');
    }
    if (!phone || phone.length < 10) {
        errors.push('Please enter a valid phone number.');
    }
    if (!address) {
        errors.push('Address is required.');
    }
    if (!state) {
        errors.push('State is required.');
    }

    return errors;
}