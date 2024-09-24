document.addEventListener("DOMContentLoaded", function () {
    var addToCartButton = document.getElementById("addToCartButton");

    addToCartButton.addEventListener('click', function () {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');

        checkStockAndAddToCart(productId);
    });

    function checkStockAndAddToCart(productId) {
        fetch(`/check_stock/${productId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.stock > 0) {
                addToCart(productId);
            } else {
                outOfStockMessage();
            }
        })
        .catch(error => {
            console.error("Error checking stock:", error);
        });
    }

    function addToCart(productId) {
        fetch(`/add_cart`, {
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
            successMessage();
        })
        .catch(error => {
            console.error("Error adding product to the cart:", error);
        });
    }

    function successMessage() {
        var popup = document.createElement('div');
        popup.innerHTML = 'Product Added Successfully';
        popup.className = 'success-popup';

        document.body.appendChild(popup);

        setTimeout(function () {
            popup.classList.add('show');
        }, 0);

        setTimeout(function () {
            popup.remove();
        }, 3000);
    };

    function outOfStockMessage() {
        var popup = document.createElement('div');
        popup.innerHTML = 'Product Out of Stock';
        popup.className = 'popup';

        document.body.appendChild(popup);

        setTimeout(function () {
            popup.classList.add('show');
        }, 0);

        setTimeout(function () {
            popup.remove();
        }, 3000);
    };
});
