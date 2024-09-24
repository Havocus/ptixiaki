function updateInformations() {
    var mobileNumber = document.querySelector('.form-control-mobile').value;
    var address = document.querySelector('.form-control-address').value;
    var postcode = document.querySelector('.form-control-postcode').value;
    var state = document.querySelector('.form-control-state').value;
    var area = document.querySelector('.form-control-area').value;

    var data = {
        Number: mobileNumber,
        Address: address,
        PostalCode: postcode,
        State: state,
        Area: area
    };

    fetch('/uploadDetails', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Error updating details. Please try again.');
        }
        return response.text();
    })
    .then(response => {
        alert(response);
    })
    .catch(error => {
        console.error(error);
    });
}