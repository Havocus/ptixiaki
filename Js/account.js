document.addEventListener('DOMContentLoaded', () => {
  fetchUserDetails();
});

function fetchUserDetails() {
  fetch('/getUserDetails')
      .then(response => {
          if (!response.ok) {
              throw new Error(`Failed to fetch user details: ${response.statusText}`);
          }
          return response.json();
      })
      .then(user => {
          updateUserInfo(user);
      })
      .catch(error => {
          console.error('Error fetching user details:', error);
      });
}



function updateUserInfo(user) {
  const userDetailsDiv = document.getElementById('userDetails');

  const userName = document.querySelector('.form-control-username');
  userName.placeholder = `${user.username}`;

  const userEmail = document.querySelector('.form-control-email');
  userEmail.placeholder = `${user.email}`;

  const phoneNumber = document.querySelector('.form-control-mobile');
  phoneNumber.placeholder = `${user.Number}`;

  const addressLine = document.querySelector('.form-control-address');
  addressLine.placeholder = `${user.Address}`;

  const userPostalcode = document.querySelector('.form-control-postcode');
  userPostalcode.placeholder = `${user.PostalCode}`;

  const userState = document.querySelector('.form-control-state');
  userState.placeholder = `${user.State}`;

  const userArea = document.querySelector('.form-control-area');
  userArea.placeholder = `${user.Area}`;


  const imagePreview = document.getElementById('imagePreview');
  const imageContainer = document.querySelector('.image-container');

  if (user.imageData) {
      imagePreview.src = `data:image/*;base64,${user.imageData}`;
  }
  

  const deleteButton = document.createElement('button');
  deleteButton.classList.add('delete-btn');
  deleteButton.textContent = 'X';
  deleteButton.addEventListener('click', () => {
      deletePhoto();
  });
  imageContainer.appendChild(deleteButton);
}

function deletePhoto() {
  fetch('/deleteUserPhoto', { method: 'DELETE' })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Failed to delete photo. Status: ${response.status} - ${response.statusText}`);
      }
      return response.json(); 
    })
    .then(responseData => {
      console.log(responseData);
      alert('User photo deleted successfully.');
      fetchUserDetails();
    })
    
}