function previewImage() {
    var preview = document.querySelector('#imagePreview');
    var fileInput = document.querySelector('#imageInput');
    var file = fileInput.files[0];
    var reader = new FileReader();
    
    reader.onloadend = function () {
        preview.src = reader.result;
    }

    if (file) {
        reader.readAsDataURL(file);
    } else {
        preview.src = "";
    }
}

async function uploadImage() {
    try {
        const imageInput = document.getElementById('imageInput');
        const file = imageInput.files[0];

        if (!file) {
            console.error('No file selected.');
            return;
        }

        const responseData = await sendImageToServer(file);
    } catch (error) {
        console.error('Error uploading image:', error);
    }
}

async function sendImageToServer(file) {
    try {
        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch('/upload', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const responseData = await response.json();
        console.log('Image upload successful:', responseData);
        return responseData; 
    } catch (error) {
        console.error('Error sending image to server:', error);
    }
}