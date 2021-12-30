
function createElement(tagName, attrs) {
  let elem = document.createElement(tagName);
  Object.assign(elem, attrs);
  if ('class' in attrs) {
      elem.setAttribute('class', attrs['class']);
  }
  return elem
}

function updateTotal(rateId) {
    function doUpdate() {
        // TODO: Update this to make the request to add the sku to the order
        // Also need to remove other rates if one is already selected
        // i.e. ecommerceUpdateCartItem -> ecommerceAddToCart -> ecommerceRecalcEstimations
        let rates = document.getElementsByClassName('shipping-method-radio');
        let newRate = document.getElementById(rateId);
        const requests = [];

        for (const rate of rates) {
            requests.push({
                operationName: 'CheckoutAddShipping',
                query: `
                   mutation CheckoutAddShipping($sku: String, $count: Int) {
                      ecommerceUpdateCartItem(sku: $sku, count: $count) {
                        ok
                        __typename
                      }
                    }
                `,
                variables: {sku: rate.sku, count: 0}
            })
        }
        requests.push({
            operationName: 'CheckoutAddShipping',
            query: `
               mutation CheckoutAddShipping($sku: String, $count: Int) {
                  ecommerceAddToCart(sku: $sku, count: $count) {
                    ok
                    __typename
                  }
                }
            `,
            variables: {sku: newRate.sku, count: 1}
        });
        requests.push({
            operationName: 'CheckoutAddShipping',
            query: `
               mutation CheckoutAddShipping() {
                  ecommerceRecalcEstimations() {
                    ok
                    __typename
                  }
                }
            `,
            variables: {}
        });

        let request = new XMLHttpRequest();
        request.open('POST', `${window.location.origin}/.wf_graphql/apollo`);
        request.setRequestHeader('Content-Type', 'application/json');
        request.send(JSON.stringify(requests));

        // let subTotalPrice = document.getElementById('subtotal-price');
        // let ratePrice = document.getElementById('rate-price');
        // let totalPrice = document.getElementById('total-price');
        // ratePrice.innerText = `$ ${cost}`;
        // let subTotal = parseFloat(subTotalPrice.innerText.trim().replace('$', ''));
        // totalPrice.innerText = `$ ${parseFloat(cost) + subTotal}`;
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

    let request = new XMLHttpRequest();

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
                    {
                        type: 'radio',
                        id: rate.rateId,
                        name: 'shippingMethod',
                        class: 'shipping-method-radio',
                        sku: rate.sku,
                        cost: rate.cost
                    }
                );
                input.onclick = updateTotal(rate.rateId);
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

    // TODO: how do we add weight?
    request.send(JSON.stringify({
        weight: 1,
        shipTo: {
            name: name.value || name.innerText,
            addressLine1: street1.value || street1.innerText,
            addressLine2: street2.value || street2.innerText,
            city: city.value || city.innerText,
            state: state.value || state.innerText,
            zipCode: zip.value || zip.innerText,
        },
    }));
}
