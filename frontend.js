
function createElement(tagName, attrs) {
  let elem = document.createElement(tagName);
  Object.assign(elem, attrs);
  if ('class' in attrs) {
      elem.setAttribute('class', attrs['class']);
  }
  return elem
}

function updateTotal(cost) {
    function doUpdate() {
        let subTotalPrice = document.getElementById('subtotal-price');
        let ratePrice = document.getElementById('rate-price');
        let totalPrice = document.getElementById('total-price');
        ratePrice.innerText = `$ ${cost}`;
        let subTotal = parseFloat(subTotalPrice.innerText.trim().replace('$', ''));
        totalPrice.innerText = `$ ${parseFloat(cost) + subTotal}`;
    }
    return doUpdate
}

document.getElementById('calculate-shipping').onclick = function() {
    // text boxes
    let name = document.getElementById('name');
    let street1 = document.getElementById('street1');
    let street2 = document.getElementById('street2');
    let city = document.getElementById('city');
    let state = document.getElementById('state');
    let zip = document.getElementById('zip');

    // arrays?
    let shippingMethods = document.getElementById('shipping-methods');

    let request = new XMLHttpRequest()

    request.open('POST', 'https://us-central1-nots-backend-dev.cloudfunctions.net/widgets/shipping/estimate');
    request.setRequestHeader('Content-Type', 'application/json');

    request.onload = function() {
        if (request.status === 200) {
            let data = JSON.parse(request.response)

            // Set the updated address
            street1.value = data.address.addressLine1;
            street2.value = data.address.addressLine2;
            city.value = data.address.city;
            state.value = data.address.state;
            zip.value = data.address.zipCode;

            // Set the shipping rates
            shippingMethods.innerHTML = '';
            data.rates.map(rate => {
                let wrapper = createElement('div', {class: 'shipping-method-container'});

                let input = createElement(
                    'input',
                    {type: 'radio', id: rate.rateId, name: 'shippingMethod', class: 'shipping-method-radio'}
                );
                input.onclick = updateTotal(rate.cost);
                wrapper.appendChild(input);

                let label = createElement('label', {for: rate.rateId});
                label.innerText = `${rate.provider} | $ ${rate.cost} | ~${rate.estimatedDays} days`;
                wrapper.appendChild(label);

                shippingMethods.appendChild(wrapper);
            });
        } else {
            console.log(`${request.status} - ${request.response}`);
        }
    }

    request.send(JSON.stringify({
        weight: 1,
        shipTo: {
            name: name.value,
            addressLine1: street1.value,
            addressLine2: street2.value,
            city: city.value,
            state: state.value,
            zipCode: zip.value,
        },
    }));
}
