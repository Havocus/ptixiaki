document.addEventListener("DOMContentLoaded", function () {
    const productsDisplay = document.getElementById('products');

    fetch('/test/products')
        .then(response => {
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }
            return response.json();
        })
        .then(products => {
            products.forEach(product => {
                const productContainer = createProductContainer(product);
                productsDisplay.appendChild(productContainer);
            });
        })
        .catch(error => {
            console.error('Error fetching product data:', error);
        });

    function createProductContainer(product) {
        const productContainer = document.createElement('div'); 
        productContainer.id = `product-${product.id}`;

        const productImage = createImageDiv(product.image, product.product_name);
        const productName = createDivWithText('product-name', product.product_name);
        const productPrice = createDivWithText('product-price', `$${product.price}`);
        const productID = createDivWithText('product-id', `ID: ${product.id}`);
        const productStock = createDivWithText('stock', `Stock: ${product.stock}`);
        
        const addStock = createStockButton(product.id, 'increase');
        const loseStock = createStockButton(product.id, 'decrease');

        const deleteButton = createDeleteButton(product.id);

        productContainer.appendChild(productImage);
        productContainer.appendChild(productName);
        productContainer.appendChild(productPrice);
        productContainer.appendChild(productID);
        productContainer.appendChild(productStock);
        productContainer.appendChild(addStock);
        productContainer.appendChild(loseStock);
        productContainer.appendChild(deleteButton); // Append delete button last to place it under stock buttons
        
        return productContainer;
    }

    function createDivWithText(className, text) {
        const div = document.createElement('div');
        div.className = className;
        div.textContent = text;
        return div;
    }

    function createImageDiv(imageData, altText) {
        const imageDiv = document.createElement('div');
        const image = document.createElement('img');
        image.src = `data:image/png;base64, ${imageData}`;
        image.alt = altText;
        imageDiv.appendChild(image);
        return imageDiv;
    }

    function createDeleteButton(productId) {
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Remove Product';
        deleteButton.classList.add('delete-button');
        deleteButton.addEventListener('click', () => {
            deleteProduct(productId);
        });
        return deleteButton;
    }

    function deleteProduct(productId) {
        fetch(`/deleteProduct/${productId}`, { method: 'DELETE' })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to delete product. Status: ${response.status} - ${response.statusText}`);
                }
                return response.text();
            })
            .then(responseText => {
                console.log(responseText);
                const productDelete = document.getElementById(`product-${productId}`);
                if (productDelete) {
                    productDelete.remove(); 
                }
            })
            .catch(error => {
                console.error('Error deleting product:', error);
                alert('Error deleting product. Please try again later.');
            });
    }
    
    async function adminStockControl(productId, action) {
        try {
            const productElement = document.getElementById(`product-${productId}`);
            const stockElement = productElement.querySelector('.stock');
    
            let currentStock = parseInt(stockElement.textContent.split(': ')[1]);
    
            if (action === 'increase') {
                currentStock++;
            } else if (action === 'decrease' && currentStock > 0) {
                currentStock--;
            } else {
                return;
            }
    
            stockElement.textContent = `Stock: ${currentStock}`;
    
            const response = await fetch('/updateStock', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    productId: productId,
                    newStock: currentStock
                }),
            });
    
            if (!response.ok) {
                throw new Error('Failed to update product stock');
            }
    
            const data = await response.json();
            console.log(data);
        } catch (error) {
            console.error('Error updating stock:', error);
        }
    }
    
    function createStockButton(productId, action) {
        const stockButton = document.createElement('span');
        stockButton.textContent = action === 'increase' ? '+' : '-';
        stockButton.classList.add('stock-button');
        stockButton.addEventListener('click', () => {
            adminStockControl(productId, action);
        });
        return stockButton;
    }
});
