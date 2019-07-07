// Selecting DOM Elements from HTML
const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector('.close-cart');
const clearCartBtn = document.querySelector('.clear-cart');
const cartDOM = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartItems = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart-content');
const productsDOM = document.querySelector('.products-center');
// Ends here

let cart = [];
var buttonsDOM = [];

// Getting the products
class Products {
  // Get the products from JSON file
  async getProducts() {
    try {
      let result = await fetch("../products.json");
      let data = await result.json();
      let products = data.items;
      products = products.map(item => {
        const {
          title,
          price
        } = item.fields;
        const {
          id
        } = item.sys;
        const image = item.fields.image.fields.file.url;
        return {
          title,
          price,
          id,
          image
        }
      });
      return products;
    } catch (errors) {
      console.log(erros);
    }
  }
}

// Displaying the Products
class DisplayProducts {
  // Show the products in browser
  showProducts(products) {
    let result = '';
    products.forEach(product => {
      result += `<article class="product">
            <div class="img-container">
              <img
                src="${product.image}"
                alt="product"
                class="product-img"
              />
              <button class="product-cart-btn" data-id="${product.id}">
                <i class="fas fa-shopping-cart"></i> Add to Cart
              </button>
            </div>
            <h3>${product.title}</h3>
            <h4><i class="fas fa-rupee-sign"></i> ${product.price}</h4>
          </article> `;
    });
    productsDOM.innerHTML = result;
  }

  // Get the Cart buttons from each product
  getCartButtons() {
    let cartButtons = [...document.querySelectorAll('.product-cart-btn')];
    buttonsDOM = cartButtons;
    cartButtons.forEach(cartButton => {
      let id = cartButton.dataset.id;
      let inCart = cart.find(item => item.id === id);
      // If the item is already in cart
      if (inCart) {
        cartButton.innerHTML = '<i class="fas fa-shopping-bag"></i> In Cart';
        cartButton.disabled = true;
      }
      cartButton.addEventListener('click', (e) => {
        e.target.innerHTML = '<i class="fas fa-shopping-bag"></i> In Cart';
        e.target.disabled = true;
        // Get product from products in LocalStorage and add another property in the object as amount
        let cartItem = {
          ...Storage.getProducts(id),
          amount: 1
        };
        // Add the item clicked in cart array
        cart.push(cartItem);
        // Save the cart now in localStorage
        Storage.saveCart(cart);
        // Set Cart Values
        this.setCartValues(cart);
        // Adding the cart Items in DOM
        this.addCartItem(cartItem);
        // Showing the cart from right side
        this.showCart();
      });
    });
  }

  // Calculate the total price when cart Items are added and also update total cart items in navbar
  setCartValues(cart) {
    let tempCartTotal = 0;
    let tempCartItems = 0;
    cart.map(item => {
      tempCartTotal += item.price * item.amount;
      tempCartItems += item.amount;
    });
    cartTotal.innerText = parseFloat(tempCartTotal.toFixed(2));
    cartItems.innerText = tempCartItems;
  }

  // Adding the cart items in DOM
  addCartItem(cartItem) {
    const div = document.createElement('div');
    div.classList.add('cart-item');
    div.innerHTML = `<img src="${cartItem.image}" alt="product" />
    <div>
      <h4>${cartItem.title}</h4>
      <h5><i class="fas fa-rupee-sign"></i> ${cartItem.price}</h5>
      <span class="remove-item" data-id="${cartItem.id}"><i class="fas fa-trash-alt"></i></span>
    </div>
    <div>
        <i class="fas fa-chevron-up" data-id="${cartItem.id}"></i>
        <p class="item-amount">${cartItem.amount}</p>
        <i class="fas fa-chevron-down" data-id="${cartItem.id}"></i>
    </div> `;
    cartContent.appendChild(div);
  }

  // Show the cart
  showCart() {
    cartOverlay.classList.add('transparentBcg');
    cartDOM.classList.add('show-cart');
    document.body.style.overflow = 'hidden';
    // Making the clear cart button to disable if no items are present
    if (cart.length === 0) {
      clearCartBtn.disabled = true;
    } else {
      clearCartBtn.disabled = false;
    }
  }

  // Hide the Cart
  hideCart() {
    cartOverlay.classList.remove('transparentBcg');
    cartDOM.classList.remove('show-cart');
    document.body.style.overflow = 'auto';
  }

  // Settting up tthe initial cart items if they are present, when page is loaded
  setUpInitialCart() {
    cart = Storage.getCart();
    this.setCartValues(cart);
    this.populateCart(cart);
    cartBtn.addEventListener('click', this.showCart);
    closeCartBtn.addEventListener('click', this.hideCart);
  }

  // Populate the cart list
  populateCart(cart) {
    cart.forEach(item => this.addCartItem(item));
  }

  // Clear the whole Cart
  clearCart() {
    let cartItems = cart.map(item => item.id);
    cartItems.forEach(id => this.removeItem(id));
    // Clearing the cart in DOM
    while (cartContent.children.length > 0) {
      cartContent.removeChild(cartContent.children[0]);
    }
    // Ends here
    this.hideCart();
  }

  // Remove the item from the cart
  removeItem(id) {
    cart = cart.filter(item => item.id !== id);
    this.setCartValues(cart);
    Storage.saveCart(cart);
    let button = this.getBackPreviousButtons(id);
    button.innerHTML = `<i class="fas fa-shopping-cart"></i> Add to Cart`;
    button.disabled = false;
  }

  // Get Back the buttons to previous state
  getBackPreviousButtons(id) {
    return buttonsDOM.find(button => button.dataset.id === id);
  }

  // Cart Logic of clearing the cart, increasing, or decreasing the item number
  cartLogic() {
    // When Clear Cart Button is clicked
    clearCartBtn.addEventListener('click', () => {
      this.clearCart();
    })

    // When Cart Content is Clicked
    cartContent.addEventListener('click', event => {
      // When remove/trash button is clicked for each item in the cart
      if (event.target.parentElement.classList.contains('remove-item')) {
        let removeItem = event.target.parentElement;
        this.removeItem(removeItem.dataset.id);
        // Clearing the cart in DOM
        cartContent.removeChild(removeItem.parentElement.parentElement);
        this.showCart();
      }
      // When Chevron-up is clicked
      else if (event.target.classList.contains('fa-chevron-up')) {
        let addAmount = event.target;
        let id = addAmount.dataset.id;
        let tempItem = cart.find(item => item.id === id);
        tempItem.amount++;
        Storage.saveCart(cart);
        this.setCartValues(cart);
        addAmount.nextElementSibling.innerText = tempItem.amount;
      }
      // When Chevron-down is clicked
      else if (event.target.classList.contains('fa-chevron-down')) {
        let subAmount = event.target;
        let id = subAmount.dataset.id;
        let tempItem = cart.find(item => item.id === id);
        if (tempItem.amount > 1) {
          tempItem.amount--;
        }
        Storage.saveCart(cart);
        this.setCartValues(cart);
        subAmount.previousElementSibling.innerText = tempItem.amount;
      }


    });
  }

}

// Storing in LocalStorage
class Storage {
  // Save the products in Local Storage
  static saveProducts(products) {
    localStorage.setItem('products', JSON.stringify(products));
  }
  // Get the products from Local Storage
  static getProducts(id) {
    let products = JSON.parse(localStorage.getItem('products'));
    return products.find(product => product.id === id);
  }
  // Save the cart Item in local Storage
  static saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
  }
  // Get the cart items from local Storage
  static getCart() {
    return localStorage.getItem('cart') ? JSON.parse(localStorage.getItem('cart')) : [];
  }
}

// Calling methods in classes
document.addEventListener('DOMContentLoaded', () => {
  const products = new Products();
  const displayProducts = new DisplayProducts();

  // Setting up the initial Cart
  displayProducts.setUpInitialCart();

  // Getting the products from class and displaying them and storing them in LocalStaorge
  products.getProducts().then(products => {
    displayProducts.showProducts(products)
    Storage.saveProducts(products)
  }).then(() => {
    // When Cart Buttons are loaded call the function
    displayProducts.getCartButtons();
    // Call the cart logic
    displayProducts.cartLogic();
  });
});


// Smooth Scroll
$(document).ready(function () {
  // Add smooth scrolling to all links
  $("a").on('click', function (event) {

    // Make sure this.hash has a value before overriding default behavior
    if (this.hash !== "") {
      // Prevent default anchor click behavior
      event.preventDefault();

      // Store hash
      var hash = this.hash;

      // Using jQuery's animate() method to add smooth page scroll
      // The optional number (800) specifies the number of milliseconds it takes to scroll to the specified area
      $('html, body').animate({
        scrollTop: $(hash).offset().top
      }, 800, function () {

        // Add hash (#) to URL when done scrolling (default click behavior)
        window.location.hash = hash;
      });
    } // End if
  });
});

// Get the year for the footer
const year = document.querySelector('.year');
year.innerText = new Date().getFullYear();