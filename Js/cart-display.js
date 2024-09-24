document.addEventListener("DOMContentLoaded", async function () {
    var cartContainer = document.getElementById("cartContainer");
    var cartItems;
    var selectedCourierService = "";

    async function totalPrice(existingCartItems, selectedCourierService) {
        var productTotal = 0;

        await Promise.all(existingCartItems.map(async (item) => {
            try {
                if (item && item.productId) {
                    const productDetails = await fetchProductDetails(item.productId);

                    if (productDetails && item.quantity > 0) {
                        productTotal += item.quantity * productDetails.price;
                    }
                }
            } catch (error) {
                console.error('Error fetching product details:', error);
            }
        }));

        var courierFee = courierFeeinPrice(selectedCourierService);
        var grandTotal = productTotal + courierFee;

        var totalPriceElement = document.getElementById("totalPrice");
        totalPriceElement.innerText = `Total Price: $${grandTotal.toFixed(2)}`;
        return { productTotal, grandTotal, courierFee };
    }

    document.querySelectorAll('input[name="courierService"]').forEach((radio) => {
        radio.addEventListener("change", async function() {
            selectedCourierService = this.value;
            await totalPrice(cartItems, selectedCourierService); 
        });
    });

    function courierFeeinPrice(selectedCourierService) {
        var courierFee = 0;

        switch (selectedCourierService) {
            case "acs":
                courierFee = 3;
                break;
            case "speedex":
                courierFee = 5;
                break;
            case "store":
                courierFee = 0;
                break;
        }

        return courierFee;
    }

    try {
        const userCartResponse = await fetch('/get_user_cart');
        cartItems = await userCartResponse.json();
        storedItems(cartItems);
    } catch (error) {
        console.error('Error fetching userCart details:', error);
    }


    async function storedItems(cartItems) {
        cartContainer.innerHTML = '';

        if (cartItems.length === 0) {
            const emptyCartMessage = document.createElement('p');
            emptyCartMessage.textContent = 'Your Cart Is Empty';
            cartContainer.appendChild(emptyCartMessage);
        } else {
            for (const item of cartItems) {
                if (item && item.productId) {
                    try {
                        const productDetails = await fetchProductDetails(item.productId);

                        if (productDetails) {
                            if (item.quantity > 0) {
                                cartItem(item, productDetails);
                            }
                        }
                    } catch (error) {
                        console.error('Error fetching product details:', error);
                    }
                }
            }
        } 
    }

    const totalPriceValue = await totalPrice(cartItems);
paypal.Buttons({
    createOrder: function(data, actions) {
        return actions.order.create({
            purchase_units: [{
                amount: {
                    currency_code: 'USD',
                    value: totalPriceValue.grandTotal.toFixed(2)
                }
            }]
        });
    },
    onApprove: function(data, actions) {
        return actions.order.capture().then(async function(order) {
            const userData = JSON.parse(localStorage.getItem('checkoutData'));
            const productDetailsList = await Promise.all(cartItems.map(item => fetchProductDetails(item.productId)));
            
            let productsHTML = productDetailsList.map((product, index) => `
                <p><strong>Product Name:</strong> ${product.product_name}</p>
                <p><strong>Product Price:</strong> ${product.price}</p>
                <p><strong>Quantity:</strong> ${cartItems[index].quantity}</p>
            `).join('');
    
            const total = await totalPrice(cartItems, selectedCourierService);
        
            const orderId = Math.random().toString(36).substr(2, 9).toUpperCase();
            
            const currentDateTime = new Date();
            const formattedDate = currentDateTime.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
            const formattedTime = currentDateTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
            fetch('/receipt.html').then(response => response.text()).then(template => {
                let receiptContent = template
                    .replace('{{firstName}}', userData.firstName)
                    .replace('{{lastName}}', userData.lastName)
                    .replace('{{address}}', userData.address)
                    .replace('{{email}}', userData.email)
                    .replace('{{zipCode}}', userData.zipCode)
                    .replace('{{orderId}}', orderId)
                    .replace('{{productsHTML}}', productsHTML)
                    .replace('{{courierFee}}', total.courierFee.toFixed(2))
                    .replace('{{grandTotal}}', total.grandTotal.toFixed(2))
                    .replace('{{formattedDate}}', formattedDate)
                    .replace('{{formattedTime}}', formattedTime);
                
                fetch('/save_receipt', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        receiptContent: receiptContent,
                        orderId: orderId
                    }),
                }).then(function(response) {
                    if (response.ok) {
                        console.log('Receipt saved successfully');
                    } else {
                        console.error('Failed to save receipt');
                    }
                }).catch(function(error) {
                    console.error('Error saving receipt:', error);
                });

                fetch('/send-receipt', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userData: userData,
                        receiptContent: receiptContent
                    }),
                }).then(function(response) {
                    if (response.ok) {
                        console.log('Receipt email sent successfully');
                    } else {
                        console.error('Failed to send receipt email');
                    }
                }).catch(function(error) {
                    console.error('Error sending receipt email:', error);
                });
        
                fetch('/success', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({...order, orderId}),
                })
                .then(function(response) {
                    if (response.ok) {
                        console.log('Cart cleared successfully');
                    } else {
                        console.error('Failed to clear cart');
                    }
                })
                .catch(function(error) {
                    console.error('Error clearing cart:', error);
                });
            });
            window.location.reload();
            localStorage.setItem('purchaseSuccess', 'true');
            });
    }
}).render('#paypal-button-container');

    
    async function fetchProductDetails(productId) {
        try {
            const response = await fetch(`/add_cart/${productId}`);
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching product details:', error);
            throw error;
        }
    }

    function cartItem(item, productDetails) {
        const cartItemElement = document.createElement("div");
        cartItemElement.classList.add("cart-item");
        cartItemElement.setAttribute("data-product-id", item.productId);
      
        const imageContainer = document.createElement("div");
        imageContainer.classList.add("image-container");
      
        const productImageElement = document.createElement("img");
        productImageElement.src = `data:image/jpeg;base64,${productDetails.image}`;
        productImageElement.alt = productDetails.product_name;
      
        const cartItemDetails = document.createElement("div");
        cartItemDetails.classList.add("cart-item-details");
      
        const productNameElement = document.createElement("h3");
        productNameElement.textContent = productDetails.product_name;
      
        const priceElement = document.createElement("p");
        priceElement.textContent = `Price: £${productDetails.price}`;
      
        const quantityElement = document.createElement("p");
        quantityElement.textContent = `Quantity: ${item.quantity}`;
      
        const removeButton = document.createElement("button");
        removeButton.textContent = "Remove";
        removeButton.classList.add("remove-button");
        removeButton.addEventListener("click", function () {
          removeItem(item);
        });
      
        const subtotalPriceElement = document.createElement("p");
        const subtotal = productDetails.price * item.quantity;
        subtotalPriceElement.textContent = `Subtotal: £${subtotal.toFixed(2)}`;
      
        imageContainer.appendChild(productImageElement);
        cartItemElement.appendChild(imageContainer);
      
        cartItemDetails.appendChild(productNameElement);
        cartItemDetails.appendChild(priceElement);
        cartItemDetails.appendChild(quantityElement);
        cartItemDetails.appendChild(subtotalPriceElement);
      
        cartItemElement.appendChild(cartItemDetails);
        cartItemElement.appendChild(removeButton);
      
        cartContainer.appendChild(cartItemElement);
      }

    async function removeItem(itemToRemove) {
        try {
            const response = await fetch(`/remove_cart/${itemToRemove.productId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });
    
            if (response.ok) {
                const updatedCart = await response.json();
                storedItems(updatedCart.cart);
                totalPrice(updatedCart.cart, selectedCourierService); 
                
            } else {
                console.error('Error removing item from cart:', response.statusText);
            }
        } catch (error) {
            console.error('Error removing item from cart:', error);
        }
    }     

    if (localStorage.getItem('purchaseSuccess') === 'true') {
        purchaseMessage();
        localStorage.removeItem('purchaseSuccess');
    }

    function purchaseMessage() {
        var popup = document.createElement('div');
        popup.innerHTML = 'Thank you for your purchase. The receipt has been sent to your email.';
        popup.className = 'purchase-popup';
    
        document.body.appendChild(popup);
    
        setTimeout(function () {
            popup.classList.add('show');
        }, 0);
    
        setTimeout(function () {
            popup.classList.remove('show');
            setTimeout(function () {
                popup.remove();
            }, 300); 
        }, 5000);
    }
});
