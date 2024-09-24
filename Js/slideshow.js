let slideIndex = 0;

function changeSlide(n) {
  showSlide(slideIndex += n);
}

function showSlide(n) {
  const slides = document.getElementsByClassName("carousel-container")[0].getElementsByTagName("img");

  if (slides.length === 0) {
    return;
  }

  if (n >= slides.length) {
    slideIndex = 0;
  }
  if (n < 0) {
    slideIndex = slides.length - 1;
  }

  for (let i = 0; i < slides.length; i++) {
    slides[i].style.display = "none";
  }

  slides[slideIndex].style.display = "block";
}

fetch('/test/products')
  .then(response => {
    if (!response.ok) {
      throw new Error(`Network response was not ok: ${response.statusText}`);
    }
    return response.json();
  })
  .then(products => {
    const productImages = products.map(product => product.image);
    shuffleArray(productImages);

    const carouselContainer = document.querySelector('.carousel');
    const numberOfSlides = 7;
    for (let i = 0; i < numberOfSlides && i < productImages.length; i++) {
      const img = document.createElement('img');
      img.src = `data:image/png;base64,${productImages[i]}`;
      carouselContainer.appendChild(img);
    }

    showSlide(slideIndex);
  })
  .catch(error => {
    console.error('Error fetching product data:', error);
  });

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}