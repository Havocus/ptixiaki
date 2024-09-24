document.addEventListener("DOMContentLoaded", function () {
   
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

   
    fetchProductDetails(productId)
        .then(product => {
            productDeatils(product);
        })
        .catch(error => {
            console.error('Error fetching and displaying product details:', error);
        });

    async function fetchProductDetails(productId) {
        const productDetails = `/test/products/${productId}`;
        console.log('Fetching product details from:', productDetails);

        return fetch(productDetails)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Network response was not ok: ${response.statusText}`);
                }
                return response.json();
            })
            .catch(error => {
                console.error(`Error fetching product details for ID ${productId}:`, error);
            });
    }

    function productDeatils(product) {
        const productContainer = document.createElement('div');
        productContainer.className = 'mainContainer';

        const textContainer = document.createElement('div');
        textContainer.className = 'textContainer';

        const productName = document.createElement('h2');
        productName.className = 'product-name';
        productName.textContent = product.product_name;

        const productPrice = document.createElement('h2');
        productPrice.className = 'product-price';
        productPrice.textContent = `$${product.price}`;

        const productId = document.createElement('h2');
        productId.className = 'product-id';
        productId.textContent = `ID: ${product.id}`;

        const productStock = document.createElement('span')
        productStock.className - 'Stock'
        productStock.textContent = `Stock: ${product.stock}`;

        const productSpec = document.createElement('h2');
        productSpec.textContent= `Specs`;

        productSpec.className = 'productSpecs';
        const productSpecs = document.createElement('text');
        productSpecs.textContent = product.Specs;
          

        const imageContainer = document.createElement('div');
        imageContainer.className = 'imageContainer'
        const productImage = document.createElement('img');
        productImage.className = 'product-image';
        productImage.src = `data:image/jpeg;base64,${product.image}`; 
        productImage.id = 'imageID';
        productImage.alt = product.product_name;

    

        textContainer.appendChild(productName);
        textContainer.appendChild(productPrice);
        textContainer.appendChild(productId);
        textContainer.appendChild(productStock); 
        productContainer.appendChild(textContainer);
        productContainer.appendChild(imageContainer);
        textContainer.appendChild(productSpec);
        textContainer.appendChild(productSpecs);
        imageContainer.appendChild(productImage);
    
         
        document.getElementById('product-details').appendChild(productContainer);
    }
});
