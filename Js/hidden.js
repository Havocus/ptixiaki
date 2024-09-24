fetch("/getUserId")
  .then((response) => response.json())
  .then((data) => {
    var userId = data.userId;
    var adminLink = document.getElementById("adminLink");
    var contactusMessages = document.getElementById("contactusMessages");
    var orders = document.getElementById("Orders");

    if (adminLink && contactusMessages) {
      if (userId === 1) {
        adminLink.style.display = "block";
        contactusMessages.style.display = "block"; 
        orders.style.display = "block"; 
      } else {
        adminLink.style.display = "none";
        contactusMessages.style.display = "none"; 
        orders.style.display = "none"; 
      }
    } else {
      console.error("adminLink or contactusMessages not found.");
    }
  })
  .catch((error) => {
    console.error("Error fetching data:", error);
  })


$(document).ready(function() {
    $.ajax({
        type: 'GET',
        url: '/checkLoginStatus', 
        success: function(data) {
            if (data.loggedIn) {
            
                $('#loginButton').hide();
                $('#signInButton').hide();
             
               


            } else {
              
                $('#loginButton').show();
                $('#signInButton').show();
                $('#userImage').hide();
                $('#dropdown-id').hide();
                $('#adminLink').hide();
                $('#cartLink').hide();
                $('#contactusMessages').hide();
                $('#addToFavorite').hide();
                $('#addToCartButton').hide();
                $('#Orders').hide();

            }
        },
        error: function(err) {
            console.error('Error checking login status:', err);
        }
    });
});