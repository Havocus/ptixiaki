document.addEventListener('DOMContentLoaded', fetchFavorites);

function fetchFavorites() {
    fetch('/get_favorites', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'same-origin' 
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        favoriteProducts(data.favorites); 
    })
    .catch(error => {
        console.error('Error fetching favorites:', error);
    });
}

function favoriteProducts(favorites) {
    const favoritesList = document.querySelector('.favorites');
    favoritesList.innerHTML = '';

    if (favorites.length === 0) {
        const emptyMessage = document.createElement('p');
        emptyMessage.textContent = 'Your favorites list is empty.';
        emptyMessage.classList.add('empty-message');
        favoritesList.appendChild(emptyMessage);
        return; 
    }

    favorites.forEach(favorite => {
        const listItem = document.createElement('div');
        listItem.classList.add('favorite-item');

        if (favorite.image) {
            const imageElement = document.createElement('img');
            imageElement.src = favorite.image;
            imageElement.alt = favorite.productName;
            imageElement.classList.add('favorite-image');
            listItem.appendChild(imageElement);
        }

        const nameElement = document.createElement('p');
        nameElement.textContent = favorite.productName;
        nameElement.classList.add('favorite-name');
        listItem.appendChild(nameElement);

        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remove';
        removeButton.classList.add('remove-button');
        removeButton.addEventListener('click', () => removeFavorite(favorite.productId));
        listItem.appendChild(removeButton);

        favoritesList.appendChild(listItem);
    });
}

function removeFavorite(productId) {
    fetch('/remove_favorite', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'same-origin',
        body: JSON.stringify({ productId }) 
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        location.reload();
    })
    .catch(error => {
        console.error('Error removing favorite:', error);
    });
}
