// button
console.log('HERE!');
let calculateShipping = document.getElementById('calculate-shipping');

calculateShipping.onclick = () => {
    // text boxes
    let ratePrice = document.getElementById('rate-price');
    let totalPrice = document.getElementById('total-price');
    let name = document.getElementById('name');
    let street1 = document.getElementById('street1');
    let street2 = document.getElementById('street2');
    let city = document.getElementById('city');
    let state = document.getElementById('state');
    let zip = document.getElementById('zip');

    // arrays?
    let shippingMethods = document.getElementById('shipping-methods');
    let orders = document.getElementById('orders');

    let request = new XMLHttpRequest()

    request.open('POST', 'https://us-central1-nots-backend-dev.cloudfunctions.net/widgets/shipping/estimate');
    request.setRequestHeader('Content-Type', 'application/json');
    request.onload = () => {
        if (this.status === 200) {
            let data = JSON.parse(this.response)

            // Set the updated address
            street1.innerText = data.address.addressLine1;
            street2.innerText = data.address.addressLine2;
            city.innerText = data.address.city;
            state.innerText = data.address.state;
            zip.innerText = data.address.zipCode;

            // Set the shipping rates

        } else {
            console.log(`${this.status} - ${this.response}`);
        }
    }
    request.send(JSON.stringify({
        weight: 1,
        shipTo: {
            name: name.innerText,
            addressLine1: street1.innerText,
            addressLine2: street2.innerText,
            city: city.innerText,
            state: state.innerText,
            zipCode: zip.innerText,
        },
    }));
}
