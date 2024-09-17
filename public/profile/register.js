var val=0;
document.getElementById('register_form').addEventListener('submit', async (event) => {
  event.preventDefault();
  if(val==1){
      alert("Please wait for the previous operation to complete");
      return;
  }
  val=1;
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const name = document.getElementById('name').value;
  const phone = document.getElementById('phone').value;
  const address = document.getElementById('address').value;
  const state = document.getElementById('state').value;
  const userCategory = document.getElementById('user').value;

  const validationErrors = validateRegistrationForm(email, password, name, phone, address, state);

  if (validationErrors.length > 0) {
      alert(validationErrors.join('\n'));
      val=0;
      return;
  }

  // Predefined secret key for admin role
  const adminSecretKey = "AdminKey123";
  if (userCategory === "admin") {
    const enteredKey = prompt("Please enter the admin secret key:");

    if (enteredKey !== adminSecretKey) {
      alert("Incorrect secret key. You cannot register as an admin.");
      val=0;
      return; // Stop form submission
    }
    val=0;
  }

  try {
      const response = await fetch('../auth/register', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, password, name, phone, address, state, role: userCategory })
      });

      let data;
      try {
        data = await response.json();
      } catch (e) {
          console.error('Error parsing JSON:', e);
          alert('Unexpected response format from server.');
          val=0;
          return;
      }

      if (response.ok) {
          alert('Registration successful!');
          window.location.href = '../index.html';
      } else {
          alert(data.message || 'Registration failed. Please try again.');
      }
      val=0;
  } catch (error) {
      alert('Error: ' + error.message);
      val=0;
  }
});

