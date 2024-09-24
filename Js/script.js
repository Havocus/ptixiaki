document.addEventListener("DOMContentLoaded", function () {
  const productsContainer = document.getElementById('products');

  fetch('/test/products')
    .then(response => {
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.statusText}`);
      }
      return response.json();
    })
    .then(products => {
      
      const limitedProducts = products.slice(0, 5);

      limitedProducts.forEach(product => {
        const productContainer = createProductContainer(product);
        productsContainer.appendChild(productContainer);
      });
    })
    .catch(error => {
      console.error('Error fetching product data:', error);
    });

  function createProductContainer(product) {
    const productContainer = document.createElement('div');
    productContainer.className = 'div';
    productContainer.dataset.productId = product.id;

    const productImage = createImageDiv(product.image, product.product_name);
    const productName = createDivWithText('product-name', product.product_name);
    const productPrice = createDivWithText('product-price', `$${product.price}`);
    const showMoreButton = createButton('Show More', product.id); 

    productContainer.appendChild(productImage);
    productContainer.appendChild(productName);
    productContainer.appendChild(productPrice);
    productContainer.appendChild(showMoreButton);

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
    imageDiv.className = 'bubble'; 
    const image = document.createElement('img');
    image.src = `data:image/png;base64, ${imageData}`;
    image.alt = altText;
    imageDiv.appendChild(image);
    return imageDiv;
  }
  
  function createButton(text, productId) {
    const button = document.createElement('button');
    button.textContent = text;
    button.className = 'btn-show-more'; 
    button.addEventListener('click', () =>  pageRedirect(productId));
    return button;
  }

  function pageRedirect(productId) {
    window.location.href = `/productDetails.html?id=${productId}`;
  }
});
