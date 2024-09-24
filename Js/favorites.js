document.addEventListener('DOMContentLoaded', function() {
    var addToFavorite = document.getElementById("addToFavorite");

    addToFavorite.addEventListener('click', function () {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');

        addFavorite(productId);
    });

    function addFavorite(productId) {
        fetch(`/add_favorite`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ productId }),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.error) {
                console.error("Error adding product to favorites:", data.error);
            } else {
                successMessage();
            }
        })
        .catch(error => {
            console.error("Error adding product to favorites:", error.message);s
        });
    }

    function successMessage() {
        var popup = document.createElement('div');
        popup.innerHTML = 'Product Added To Favorites';
        popup.className = 'success-popup';

        document.body.appendChild(popup);

        setTimeout(function () {
            popup.classList.add('show');
        }, 0);

        setTimeout(function () {
            popup.remove();
        }, 3000);
    };

});