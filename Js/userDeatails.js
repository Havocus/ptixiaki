document.addEventListener("DOMContentLoaded", async function () {

function fetchUserDetails() {
    fetch('/getUserDetails') 
        .then(response => {
            if (!response.ok) {
            }
            return response.json();
            
        })
        .then(user => {
            updateUserInfo(user);
        })
        .catch(error => {
            console.log('Error fetching user details:', error);
        });
}

function updateUserInfo(user) {
    const userNameElement = document.getElementById('userName');
    const userImageElement = document.getElementById('userImage');

    userNameElement.textContent = user.username; 

    if (user.imageData) {
        userImageElement.src = `data:image/*;base64,${user.imageData}`;
    }
}

fetchUserDetails();

});
