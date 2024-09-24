document.addEventListener('DOMContentLoaded', () => {
  const searchForm = document.querySelector('form[role="search"]');
  const searchInput = document.getElementById('searchInput');
  const searchResults = document.getElementById('searchResults');

  searchForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    await fetchAndDisplayProducts();
  });

  async function fetchAndDisplayProducts() {
    const searchTerm = searchInput.value.trim();
  
    searchResults.innerHTML = '';
  
    if (!searchTerm) {
      return;
    }
  
    const url = `http://localhost:4000/test/products?product_name=${encodeURIComponent(searchTerm)}`;
  
    let products;
  
    try {
      const response = await fetch(url);
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      products = await response.json();
  
      if (products.length === 0) {
        // Handle empty results if necessary
      } else {
        products.forEach((product) => {
          const li = createProductListItem(product);
          searchResults.appendChild(li);
        });
      }
    } catch (error) {
      searchResults.innerHTML = `<li>Error: ${error.message}</li>`;
    }
  }

  searchInput.addEventListener("input", function() {
    searchResults.classList.add('search-results-active');
  });

  function createProductListItem(product) {
    const card = document.createElement('div');
    card.classList.add('product-card');
    
    const contentContainer = document.createElement('div');
  
    const productName = document.createElement('div');
    productName.textContent = product.product_name;
    productName.classList.add('product-name');
  
    const img = document.createElement('img');
    img.src = `data:image/jpeg;base64,${product.image}`; 
  
    contentContainer.appendChild(img);
    contentContainer.appendChild(productName);
  
    card.appendChild(contentContainer);
  
    return card;
  }

  document.addEventListener('click', (event) => {
    const isClickInsideSearch = searchForm.contains(event.target);
    const isClickInsideResults = searchResults.contains(event.target);

    if (!isClickInsideSearch && !isClickInsideResults) {
      searchInput.value = ''; 
      searchResults.innerHTML = ''; 
    }
  });
});
