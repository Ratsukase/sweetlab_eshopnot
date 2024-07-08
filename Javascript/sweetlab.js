const products = [
    { id: 1, name: 'Tarta nude', image: '../Multimedia/Imagenes/Tartas/creaciones/nude.png', prices: { small: 30, medium: 45, large: 70 } },
    { id: 2, name: 'Tarta Cartoon', image: '../Multimedia/Imagenes/Tartas/creaciones/Cartoon.png', prices: { small: 55, medium: 75, large: 105 } },
    { id: 3, name: 'Tarta sorpresa', image: '../Multimedia/Imagenes/Tartas/creaciones/duotono sorpresa.png', prices: { small: 45, medium: 65, large: 80 } },
    { id: 4, name: 'Tarta naranja chocolate', image: '../Multimedia/Imagenes/Tartas/creaciones/naranja.png', prices: { small: 30, medium: 45, large: 70 } },
    { id: 5, name: 'Semifrio mango', image: '../Multimedia/Imagenes/Tartas/creaciones/entremet mango entero.png', prices: { small: 25, medium: 40, large: 60 } },
    { id: 6, name: 'Semifrío frutos rojos', image: '../Multimedia/Imagenes/Tartas/creaciones/entremet frutos rojos entero.png', prices: { small: 25, medium: 40, large: 60 } },
    { id: 7, name: 'Dripcake', image: '../Multimedia/Imagenes/Tartas/creaciones/dripcake.jpg', prices: { small: 59, medium: 68, large: 75 } },
    { id: 8, name: 'Tarta unicornio', image: '../Multimedia/Imagenes/Tartas/creaciones/unicornio.png', prices: { small: 45, medium: 65, large: 80 } },
    { id: 9, name: 'Tarta red velvet', image: '../Multimedia/Imagenes/Tartas/creaciones/redvelvet1.png', prices: { small: 30, medium: 45, large: 70 } },
];

let cart = JSON.parse(localStorage.getItem('cart')) || [];

$(document).ready(function() {
    loadProducts();

    // Llamar a updateCart al cargar la página para mostrar el carrito actual
    updateCart();

    $('#cart-button').click(function() {
        $('#cart-modal').toggle();
    });

    $('#close-cart').click(function() {
        $('#cart-modal').hide();
    });

    $('#checkout-button').click(function() {
        checkout();
    });

    $('#empty-cart-button').click(function() {
        emptyCart();
    });

    $('#thank-you-modal').on('hidden.bs.modal', function () {
        $('#cart-modal').hide();
    });
});

function loadProducts() {
    const productList = $('#product-list');
    products.forEach(product => {
        const productCard = `
            <div class="col-md-4 mb-4">
                <div class="card">
                    <img src="${product.image}" class="card-img-top" alt="${product.name}">
                    <div class="card-body">
                        <h5 class="card-title">${product.name}</h5>
                        <select class="form-control mb-2" id="size-${product.id}">
                            <option value="small">Pequeño - ${product.prices.small} €</option>
                            <option value="medium">Mediano - ${product.prices.medium} €</option>
                            <option value="large">Grande - ${product.prices.large} €</option>
                        </select>
                        <button class="btn btn-primary add-to-cart" data-id="${product.id}">Añadir al carrito</button>
                    </div>
                </div>
            </div>
        `;
        productList.append(productCard);
    });

    $('.add-to-cart').click(function() {
        const productId = $(this).data('id');
        const selectedSize = $(`#size-${productId}`).val();
        const product = products.find(p => p.id == productId);
        const price = product.prices[selectedSize];

        const cartItem = cart.find(item => item.id == productId && item.size == selectedSize);
        if (cartItem) {
            cartItem.quantity += 1;
        } else {
            cart.push({ ...product, size: selectedSize, price: price, quantity: 1 });
        }

        updateCart();
    });
}

function updateCart() {
    const cartItems = $('#cart-items');
    cartItems.empty();
    let total = 0;
    let totalItems = 0; // Para contar el número total de productos

    cart.forEach(item => {
        total += item.price * item.quantity;
        totalItems += item.quantity; // Sumar la cantidad de cada producto al total
        const cartItem = `
            <li class="list-group-item">
                ${item.name} - ${item.size} 
                <button class="btn btn-sm btn-secondary decrease-quantity" data-id="${item.id}" data-size="${item.size}">-</button>
                ${item.quantity}
                <button class="btn btn-sm btn-secondary increase-quantity" data-id="${item.id}" data-size="${item.size}">+</button> x ${item.price} €
                <button class="btn btn-sm btn-danger float-right remove-from-cart" data-id="${item.id}" data-size="${item.size}">&times;</button>
            </li>
        `;
        cartItems.append(cartItem);
    });

    $('.remove-from-cart').click(function() {
        const productId = $(this).data('id');
        const size = $(this).data('size');
        const cartItemIndex = cart.findIndex(item => item.id == productId && item.size == size);
        cart.splice(cartItemIndex, 1);
        updateCart();
    });

    $('.increase-quantity').click(function() {
        const productId = $(this).data('id');
        const size = $(this).data('size');
        const cartItem = cart.find(item => item.id == productId && item.size == size);
        cartItem.quantity += 1;
        updateCart();
    });

    $('.decrease-quantity').click(function() {
        const productId = $(this).data('id');
        const size = $(this).data('size');
        const cartItem = cart.find(item => item.id == productId && item.size == size);
        if (cartItem.quantity > 1) {
            cartItem.quantity -= 1;
        } else {
            const cartItemIndex = cart.findIndex(item => item.id == productId && item.size == size);
            cart.splice(cartItemIndex, 1);
        }
        updateCart();
    });

    $('#cart-count').text(totalItems); // Mostrar el número total de productos en el carrito

    const shippingCost = total > 100 ? 0 : 7.95;
    $('#cart-total').text(total.toFixed(2));
    $('#shipping-cost').text(shippingCost.toFixed(2));
    $('#total-pay').text((total + shippingCost).toFixed(2));

    // Guardar el carrito en localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
}

function checkout() {
    cart.length = 0; // Vaciar el carrito
    updateCart();
    $('#thank-you-modal').modal('show');
    localStorage.removeItem('cart'); // Eliminar el carrito del localStorage
}

function emptyCart() {
    cart.length = 0; // Vaciar el carrito
    updateCart();
    localStorage.removeItem('cart'); // Eliminar el carrito del localStorage
}