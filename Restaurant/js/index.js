//@TODO NOTIFICATIONS

//---------
// Vue components
//---------
Vue.component('products', {
  
  ready: function () {
    var self = this;
    document.addEventListener("keydown", function(e) {
      if (self.showModal && e.keyCode == 37) {
        self.changeProductInModal("prev");
      } else if (self.showModal && e.keyCode == 39) {
        self.changeProductInModal("next");
      } else if (self.showModal && e.keyCode == 27) {
        self.hideModal();
      }
    });
  },

  template: "<h1>Products</h1>" + 
  "<div class='products'>" +
  "<div v-for='product in productsData' track-by='$index' class='product {{ product.product | lowercase }}'>" + 
  "<div class='image' @click='viewProduct(product)' v-bind:style='{ backgroundImage: \"url(\" + product.image + \")\" }' style='background-size: cover; background-position: center;'></div>" +
  "<div class='name'>{{ product.product }}</div>" +
  "<div class='description'>{{ product.description }}</div>" +
  "<div class='price'>{{ product.price | currency }}</div>" +
  "<button @click='addToCart(product)'>Add to Cart</button><br><br></div>" +
  "</div>" +
  "<div class='modalWrapper' v-show='showModal'>" +
  "<div class='prevProduct' @click='changeProductInModal(\"prev\")'><i class='fa fa-angle-left'></i></div>" +
  "<div class='nextProduct' @click='changeProductInModal(\"next\")'><i class='fa fa-angle-right'></i></div>" +
  "<div class='overlay' @click='hideModal()'></div>" + 
  "<div class='modal'>" + 
  "<i class='close fa fa-times' @click='hideModal()'></i>" + 
  "<div class='imageWrapper'><div class='image' v-bind:style='{ backgroundImage: \"url(\" + modalData.image + \")\" }' style='background-size: cover; background-position: center;' v-on:mouseover='imageMouseOver($event)' v-on:mousemove='imageMouseMove($event)' v-on:mouseout='imageMouseOut($event)'></div></div>" +
  "<div class='additionalImages' v-if='modalData.images'>" + 
  "<div v-for='image in modalData.images' class='additionalImage' v-bind:style='{ backgroundImage: \"url(\" + image.image + \")\" }' style='background-size: cover; background-position: center;' @click='changeImage(image.image)'></div>" +
  "</div>" +
  "<div class='name'>{{ modalData.product }}</div>" +
  "<div class='description'>{{ modalData.description }}</div>" +
  "<div class='details'>{{ modalData.details }}</div>" +
  "<h3 class='price'>{{ modalData.price | currency }}</h3>" +
  "<label for='modalAmount'>QTY</label>" +
  "<input id='modalAmount' value='{{ modalAmount }}' v-model='modalAmount' class='amount' @keyup.enter='modalAddToCart(modalData), hideModal()'/>" +
  "<button @click='modalAddToCart(modalData), hideModal()'>Add to Cart</button>" +
  "</div></div>",

  props: ['productsData', 'cart', 'tax', 'cartSubTotal', 'cartTotal'],

  data: function() {
    return {
      showModal: false,
      modalData: {},
      modalAmount: 1,
      timeout: "",
      mousestop: ""
    }
  },

  methods: {
    addToCart: function(product) {
      var found = false;

      for (var i = 0; i < vue.cart.length; i++) {

        if (vue.cart[i].sku === product.sku) {
          var newProduct = vue.cart[i];
          newProduct.quantity = newProduct.quantity + 1;
          vue.cart.$set(i, newProduct);
          //console.log("DUPLICATE",  vue.cart[i].product + "'s quantity is now: " + vue.cart[i].quantity);
          found = true;
          break;
        }
      }

      if(!found) {
        product.quantity = 1;
        vue.cart.push(product);
      }

      vue.cartSubTotal = vue.cartSubTotal + product.price;
      vue.cartTotal = vue.cartSubTotal + (vue.tax * vue.cartSubTotal);
      vue.checkoutBool = true;
    },

    modalAddToCart: function(modalData) {
      var self = this;

      for(var i = 0; i < self.modalAmount; i++) {
        self.addToCart(modalData);
      }

      self.modalAmount = 1;
    },

    viewProduct: function(product) {      
      var self = this;
      //self.modalData = product;
      self.modalData = (JSON.parse(JSON.stringify(product)));
      self.showModal = true;
    },

    changeProductInModal: function(direction) {
      var self = this,
          productsLength = vue.productsData.length,
          currentProduct = self.modalData.sku,
          newProductId,
          newProduct;

      if(direction === "next") {
        newProductId = currentProduct + 1;

        if(currentProduct >= productsLength) {
          newProductId = 1;
        }

      } else if(direction === "prev") {
        newProductId = currentProduct - 1;

        if(newProductId === 0) {
          newProductId = productsLength;
        }
      }

      //console.log(direction, newProductId);

      for (var i = 0; i < productsLength; i++) {
        if (vue.productsData[i].sku === newProductId) {
          self.viewProduct(vue.productsData[i]);
        }
      }
    },

    hideModal: function() {
      //hide modal and empty modal data
      var self = this;
      self.modalData = {};
      self.showModal = false;
    },

    changeImage: function(image) {
      var self = this;
      self.modalData.image = image;
    },

    imageMouseOver: function(event) {
      event.target.style.transform = "scale(2)";
    },

    imageMouseMove: function(event) {
      var self = this;
      
      event.target.style.transform = "scale(2)";
      
      self.timeout = setTimeout(function() {
        event.target.style.transformOrigin = ((event.pageX - event.target.getBoundingClientRect().left) / event.target.getBoundingClientRect().width) * 100 + '% ' + ((event.pageY - event.target.getBoundingClientRect().top - window.pageYOffset) / event.target.getBoundingClientRect().height) * 100 + "%";
      }, 50);
      
      self.mouseStop = setTimeout(function() {
        event.target.style.transformOrigin = ((event.pageX - event.target.getBoundingClientRect().left) / event.target.getBoundingClientRect().width) * 100 + '% ' + ((event.pageY - event.target.getBoundingClientRect().top - window.pageYOffset) / event.target.getBoundingClientRect().height) * 100 + "%";
      }, 100);
    },

    imageMouseOut: function(event) {
      event.target.style.transform = "scale(1)";
    }
  }
});

Vue.component('cart', {
  template: '<div class="cart">' + 
  '<span class="cart-size" @click="showCart = !showCart"> {{ cart | cartSize }} </span><i class="fa fa-shopping-cart" @click="showCart = !showCart"></i>' +
  '<div class="cart-items" v-show="showCart">' +
  '<table class="cartTable">' +
  '<tbody>' +
  '<tr class="product" v-for="product in cart">' +
  '<td class="align-left"><div class="cartImage" @click="removeProduct(product)" v-bind:style="{ backgroundImage: \'url(\' + product.image + \')\' }" style="background-size: cover; background-position: center;"><i class="close fa fa-times"></i></div></td>' +
  '<td class="align-center"><button @click="quantityChange(product, \'decriment\')"><i class="close fa fa-minus"></i></button></td>' +
  '<td class="align-center">{{ cart[$index].quantity }}</td>' +
  '<td class="align-center"><button @click="quantityChange(product, \'incriment\')"><i class="close fa fa-plus"></i></button></td>' +
  '<td class="align-center">{{ cart[$index] | customPluralize }}</td>' +
  '<td>{{ product.price | currency }}</td>' +
  '</tbody>' +
  '<table>' +
  '</div>' +
  '<h4 class="cartSubTotal" v-show="showCart"> {{ cartSubTotal | currency }} </h4></div>' +
  '<button class="clearCart" v-show="checkoutBool" @click="clearCart()"> Clear Cart </button>' +
  '<button class="checkoutCart" v-show="checkoutBool" @click="propagateCheckout()"> Checkout </button>',

  props: ['checkoutBool', 'cart', 'cartSize', 'cartSubTotal', 'tax', 'cartTotal'],

  data: function() {
    return {
      showCart: false
    }
  },

  filters: {
    customPluralize: function(cart) {      
      var newName;

      if(cart.quantity > 1) {
        if(cart.product === "Peach") {
          newName = cart.product + "es";
        } else if(cart.product === "Puppy") {
          newName = cart.product + "ies";
          newName = newName.replace("y", "");
        } else {
          newName = cart.product + "s";
        }

        return newName;
      }

      return cart.product;
    },

    cartSize: function(cart) {
      var cartSize = 0;

      for (var i = 0; i < cart.length; i++) {
        cartSize += cart[i].quantity;
      }

      return cartSize;
    }
  },

  methods: {
    removeProduct: function(product) {
      vue.cart.$remove(product);
      vue.cartSubTotal = vue.cartSubTotal - (product.price * product.quantity);
      vue.cartTotal = vue.cartSubTotal + (vue.tax * vue.cartSubTotal);

      if(vue.cart.length <= 0) {
        vue.checkoutBool = false;
      }
    },

    clearCart: function() {
      vue.cart = [];
      vue.cartSubTotal = 0;
      vue.cartTotal = 0;
      vue.checkoutBool = false;
      this.showCart = false;
    },

    quantityChange: function(product, direction) {
      var qtyChange;

      for (var i = 0; i < vue.cart.length; i++) {
        if (vue.cart[i].sku === product.sku) {

          var newProduct = vue.cart[i];

          if(direction === "incriment") {
            newProduct.quantity = newProduct.quantity + 1;
            vue.cart.$set(i, newProduct);

          } else {
            newProduct.quantity = newProduct.quantity - 1;

            if(newProduct.quantity == 0) {
              vue.cart.$remove(newProduct);

            } else {
              vue.cart.$set(i, newProduct);
            }
          }
        }
      }

      if(direction === "incriment") {
        vue.cartSubTotal = vue.cartSubTotal + product.price;

      } else {
        vue.cartSubTotal = vue.cartSubTotal - product.price;
      }

      vue.cartTotal = vue.cartSubTotal + (vue.tax * vue.cartSubTotal);

      if(vue.cart.length <= 0) {
        vue.checkoutBool = false;
      }
    },
    //send our request up the chain, to our parent
    //our parent catches the event, and sends the request back down
    propagateCheckout: function() {
      vue.$dispatch("checkoutRequest");
    }
  }
});

Vue.component('checkout-area', {
  template: "<h1>Checkout Area</h1>" + 
  '<div class="checkout-area">' + 
  '<span> {{ cart | cartSize }} </span><i class="fa fa-shopping-cart"></i>' +
  '<table>' +
  '<thead>' +
  '<tr>' +
  '<th class="align-center">SKU</th>' +
  '<th>Name</th>' +
  '<th>Description</th>' +
  '<th class="align-right">Amount</th>' +
  '<th class="align-right">Price</th>' +
  '</tr>' +
  '</thead>' +
  '<tbody>' +
  '<tr v-for="product in cart" track-by="$index">' +
  '<td class="align-center">{{ product.sku }}</td>' +
  '<td>{{ product.product }}</td>' +
  '<td>{{ product.description }}</td>' +
  '<td class="align-right">{{ cart[$index].quantity }}</td>' +
  '<td class="align-right">{{ product.price | currency }}</td>' +
  '</tr>' +
  //'<button @click="removeProduct(product)"> X </button></div>' +
  '<tr>' +
  '<td>&nbsp;</td>' +
  '<td>&nbsp;</td>' +
  '<td>&nbsp;</td>' +
  '<td>&nbsp;</td>' +
  '<td>&nbsp;</td>' +
  '</tr>' +
  '<tr>' +
  '<td></td>' +
  '<td></td>' +
  '<td></td>' +
  '<td class="align-right">Subtotal:</td>' +
  '<td class="align-right"><h4 v-if="cartSubTotal != 0"> {{ cartSubTotal | currency }} </h4></td>' +
  '</tr>' +
  '<tr>' +
  '<td></td>' +
  '<td></td>' +
  '<td></td>' +
  '<td class="align-right">Tax:</td>' +
  '<td class="align-right"><h4 v-if="cartSubTotal != 0"> {{ cartTotal - cartSubTotal | currency }} </h4></td>' +
  '</tr>' +
  '<tr>' +
  '<td></td>' +
  '<td></td>' +
  '<td></td>' +
  '<td class="align-right vert-bottom">Total:</td>' +
  '<td class="align-right vert-bottom"><h2 v-if="cartSubTotal != 0"> {{ cartTotal | currency }} </h2></td>' +
  '</tr>' +
  '</tbody>' +
  '</table>' +
  '<button v-show="cartSubTotal" @click="checkoutModal()">Checkout</button></div>' + 
  "<div class='modalWrapper' v-show='showModal'>" +
  "<div class='overlay' @click='hideModal()'></div>" + 
  "<div class='modal checkout'>" + 
  "<i class='close fa fa-times' @click='hideModal()'></i>" + 
  "<h1>Checkout</h1>" +
  "<div>We accept: <i class='fa fa-stripe'></i> <i class='fa fa-cc-visa'></i> <i class='fa fa-cc-mastercard'></i> <i class='fa fa-cc-amex'></i> <i class='fa fa-cc-discover'></i></div><br>" +
  "<h3> Subtotal: {{ cartSubTotal | currency }} </h3>" +
  "<h3> Tax: {{ cartTotal - cartSubTotal | currency }} </h4>" +
  "<h1> Total: {{ cartTotal | currency }} </h3>" +
  "<br><div>This is where our payment processor goes</div>" +
  "</div>",

  props: ['cart', 'cartSize', 'cartSubTotal', 'tax', 'cartTotal'],

  data: function() {
    return {
      showModal: false
    }
  },

  filters: {
    customPluralize: function(cart) {      
      var newName;

      if(cart.quantity > 1) {
        newName = cart.product + "s";
        return newName;
      }

      return cart.product;
    },

    cartSize: function(cart) {
      var cartSize = 0;

      for (var i = 0; i < cart.length; i++) {
        cartSize += cart[i].quantity;
      }

      return cartSize;
    }
  },

  methods: {
    removeProduct: function(product) {
      vue.cart.$remove(product);
      vue.cartSubTotal = vue.cartSubTotal - (product.price * product.quantity);
      vue.cartTotal = vue.cartSubTotal + (vue.tax * vue.cartSubTotal);

      if(vue.cart.length <= 0) {
        vue.checkoutBool = false;
      }
    },

    checkoutModal: function() {
      var self = this;
      self.showModal = true;

      console.log("CHECKOUT", self.cartTotal);

    },

    hideModal: function() {
      //hide modal and empty modal data
      var self = this;
      self.showModal = false;
    }
  },
  
  //intercept the checkout request broadcast
  //run our function
  events: {
    "checkoutRequest": function() {
      var self = this;
      self.checkoutModal();
    }
  }
});

//---------
// Vue init
//---------
Vue.config.debug = false;
var vue = new Vue({
  el: "#vue",

  data: {
    productsData: [
      {
        sku: 1,
        product: "Steak",
        image: "https://www.homewetbar.com/blog/wp-content/uploads/2014/04/how-to-grill-steak.jpg",
        images: [
          { image: "https://s3-us-west-2.amazonaws.com/s.cdpn.io/241793/chimpanzee.jpg" },
          { image: "https://s3-us-west-2.amazonaws.com/s.cdpn.io/241793/gorilla.jpg" },
          { image: "https://s3-us-west-2.amazonaws.com/s.cdpn.io/241793/red-monkey.jpg" },
          { image: "https://s3-us-west-2.amazonaws.com/s.cdpn.io/241793/mandrill-monkey.jpg" }
        ],
        description: "This is a monkey",
        details: "This is where some detailes on monkies would go. This monkey done seent some shit.",
        price: 5.50
      },

      {
        sku: 2,
        product: "Cheeseburger",
        image: "https://www.recipetineats.com/wp-content/uploads/2016/02/Beef-Burger4_landscape-680x469.jpg",
        description: "This is a kitten",
        details: "This is where some detailes on kittens would go. Shout out kittens for being adorable.",
        price: 10
      },

      {
        sku: 3,
        product: "Kebeb",
        image: "https://recipethis.com/wp-content/uploads/Slimming-World-Chicken-Doner-Kebab-Fakeaway.jpg",
        description: "This is a shark",
        details: "This is where some detailes on sharks would go. Damn nature, you scary.",
        price: 15
      },

      {
        sku: 4,
        product: "gnocchi",
        image: "https://assets.epicurious.com/photos/573cd76640389de9670b8fa2/master/pass/shutterstock_380467537.jpg",
        description: "This is a puppy",
        details: "This is where some detailes on puppies would go. Shout out puppies for being adorable.",
        price: 5
      },

      {
        sku: 5,
        product: "Sushi",
        image: "https://static.independent.co.uk/s3fs-public/thumbnails/image/2017/01/13/10/sushi.jpg",
        description: "This is an apple",
        details: "This is where some detailes on apples would go. Shout out apples for being delicious.",
        price: 1
      },

      {
        sku: 6,
        product: "Chicken wings",
        image: "https://static01.nyt.com/images/2016/02/09/dining/09COOKING_CHICKENWINGS2/09COOKING_CHICKENWINGS2-superJumbo.jpg",
        description: "This is an orange",
        details: "This is where some detailes on oranges would go. Shout out oranges for being delicious.",
        price: 1.1
      },

      {
        sku: 7,
        product: "Hummus",
        image: "https://www.goya.com/media/3958/hummus1.jpg?quality=80",
        description: "This is a peach",
        details: "This is where some detailes on peaches would go. Shout out peaches for being delicious.",
        price: 1.5
      },

      {
        sku: 8,
        product: "Pizza",
        image: "https://blog.oxforddictionaries.com/wp-content/uploads/pizza.jpg",
        description: "This is a mango",
        details: "This is where some detailes on mangos would go. Shout out mangos for being delicious.",
        price: 2
      },




    ],
    checkoutBool: false,
    cart: [],
    cartSubTotal: 0,
    tax: 0.065,
    cartTotal: 0
  },
  
  //intercept the checkout request dispatch
  //send it back down the chain
  events: {
    "checkoutRequest": function() {
      vue.$broadcast("checkoutRequest");
    }
  }
});


/**
 * borderMenu.js v1.0.0
 * http://www.codrops.com
 *
 * Licensed under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 * 
 * Copyright 2013, Codrops
 * http://www.codrops.com
 */
(function() {

 	// http://stackoverflow.com/a/11381730/989439
	function mobilecheck() {
		var check = false;
		(function(a){if(/(android|ipad|playbook|silk|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
		return check;
	}

	function init() {

		var menu = document.getElementById( 'bt-menu' ),
			trigger = menu.querySelector( 'a.bt-menu-trigger' ),
			// triggerPlay only for demo 6
			triggerPlay = document.querySelector( 'a.bt-menu-trigger-out' ),
			// event type (if mobile use touch events)
			eventtype = mobilecheck() ? 'touchstart' : 'click',
			resetMenu = function() {
				classie.remove( menu, 'bt-menu-open' );
				classie.add( menu, 'bt-menu-close' );
			},
			closeClickFn = function( ev ) {
				resetMenu();
				overlay.removeEventListener( eventtype, closeClickFn );
			};

		var overlay = document.createElement('div');
		overlay.className = 'bt-overlay';
		menu.appendChild( overlay );

		trigger.addEventListener( eventtype, function( ev ) {
			ev.stopPropagation();
			ev.preventDefault();
			
			if( classie.has( menu, 'bt-menu-open' ) ) {
				resetMenu();
			}
			else {
				classie.remove( menu, 'bt-menu-close' );
				classie.add( menu, 'bt-menu-open' );
				overlay.addEventListener( eventtype, closeClickFn );
			}
		});

		if( triggerPlay ) {
			triggerPlay.addEventListener( eventtype, function( ev ) {
				ev.stopPropagation();
				ev.preventDefault();

				classie.remove( menu, 'bt-menu-close' );
				classie.add( menu, 'bt-menu-open' );
				overlay.addEventListener( eventtype, closeClickFn );
			});
		}

	}

	init();

})();


/*!
 * classie - class helper functions
 * from bonzo https://github.com/ded/bonzo
 * 
 * classie.has( elem, 'my-class' ) -> true/false
 * classie.add( elem, 'my-new-class' )
 * classie.remove( elem, 'my-unwanted-class' )
 * classie.toggle( elem, 'my-class' )
 */

/*jshint browser: true, strict: true, undef: true */
/*global define: false */

( function( window ) {

'use strict';

// class helper functions from bonzo https://github.com/ded/bonzo

function classReg( className ) {
  return new RegExp("(^|\\s+)" + className + "(\\s+|$)");
}

// classList support for class management
// altho to be fair, the api sucks because it won't accept multiple classes at once
var hasClass, addClass, removeClass;

if ( 'classList' in document.documentElement ) {
  hasClass = function( elem, c ) {
    return elem.classList.contains( c );
  };
  addClass = function( elem, c ) {
    elem.classList.add( c );
  };
  removeClass = function( elem, c ) {
    elem.classList.remove( c );
  };
}
else {
  hasClass = function( elem, c ) {
    return classReg( c ).test( elem.className );
  };
  addClass = function( elem, c ) {
    if ( !hasClass( elem, c ) ) {
      elem.className = elem.className + ' ' + c;
    }
  };
  removeClass = function( elem, c ) {
    elem.className = elem.className.replace( classReg( c ), ' ' );
  };
}

function toggleClass( elem, c ) {
  var fn = hasClass( elem, c ) ? removeClass : addClass;
  fn( elem, c );
}

var classie = {
  // full names
  hasClass: hasClass,
  addClass: addClass,
  removeClass: removeClass,
  toggleClass: toggleClass,
  // short names
  has: hasClass,
  add: addClass,
  remove: removeClass,
  toggle: toggleClass
};

// transport
if ( typeof define === 'function' && define.amd ) {
  // AMD
  define( classie );
} else {
  // browser global
  window.classie = classie;
}

})( window );


$(document).ready(function() {
  

	$( "a" ).click(function( event ) {
  		event.preventDefault();
	});

	var numOfOrders = 0;
	$(".num").text(numOfOrders);

	// hide dialogs on start
	$("#thanksMessage, #checkOrderHamburger, #checkOrderMacaroni, #checkOrderPizza, #checkOrderSalad, #checkOrderSpaghetti, #checkOrderRisotto, #finishOrderDialog").hide();

	// open dialog on click
	$("#addToCartHamburger").on("click", function () {
		$("#checkOrderHamburger").dialog({
				hide: "blind",
            	show : "blind",
            	width: "400px",
              closeText: "X"});
	})

	$("#addToCartMacaroni").on("click", function () {
		$("#checkOrderMacaroni").dialog({
				hide: "blind",
            	show : "blind",
            	width: "400px",
              closeText: "X"});
	})

	$("#addToCartPizza").on("click", function () {
		$("#checkOrderPizza").dialog({
				hide: "blind",
            	show : "blind",
            	width: "400px",
              closeText: "X"});
	})

	$("#addToCartSalad").on("click", function () {
		$("#checkOrderSalad").dialog({
				hide: "blind",
            	show : "blind",
            	width: "400px",
              closeText: "X"});
	})

	$("#addToCartSpaghetti").on("click", function () {
		$("#checkOrderSpaghetti").dialog({
				hide: "blind",
            	show : "blind",
            	width: "400px",
              closeText: "X"});
	})

	$("#addToCartRisotto").on("click", function () {
		$("#checkOrderRisotto").dialog({
				hide: "blind",
            	show : "blind",
            	width: "400px",
              closeText: "X"});
	})

	// increase/decrease the price of order if an item is added/removed
	function checkboxChange(x) {
		var priceDialog = 0;
		$("#recipe"+x).children("li").children("input").each(function () {
			if($(this).is(":checked")){
				priceDialog+=3;
			}
				$("#totalDialog"+x+">span").text(priceDialog);
			$(this).change(function () {
				if ($(this).is(":checked")) {
					priceDialog += 3;
					console.log(priceDialog);
					$("#totalDialog"+x+">span").text(priceDialog);
				}else{
					priceDialog -= 3;
					$("#totalDialog"+x+">span").text(priceDialog);
				}
			})
		});
	}

	$('#recipe1').children('li').click(checkboxChange(1));
	$('#recipe2').children('li').click(checkboxChange(2));
	$('#recipe3').children('li').click(checkboxChange(3));
	$('#recipe3').children('li').click(checkboxChange(4));
	$('#recipe3').children('li').click(checkboxChange(5));
	$('#recipe3').children('li').click(checkboxChange(6));

	$(".addIngredient").on("click", function () {
		// Creates input field and two buttons for adding an ingrediant that's not on the list
		var inputIng = '<input type="text" id="newIngredient">';
		var confirmInput = '<a class="btnStyle3 btnStyle confirmInput">&#10004;</a>';
		var cancelInput = '<a class="btnStyle3 btnStyle cancelInput">&#10008;</a>';
		var inputWrap = '<div class="addIngredientWrap">' + inputIng + confirmInput + cancelInput + '</div>'
		$(this).parent().children("ul").after(inputWrap);
    $("#newIngredient").focus();
    $("#newIngredient").attr("placeholder", "separate ingredients with a comma");

		// Confirm button adds the new ingrediant to the list of ingrediants
		$(".addIngredientWrap > .confirmInput").on("click", function () {
			if ($("#newIngredient").val() != "") {
        //split takes the value of the input and splits it into separate array elements after every comma
				var newIngredient = ($(".addIngredientWrap input").val()).split(",");
				var newCheckbox = '<input type="checkbox" checked>';
        
        for (var i = 0; i < newIngredient.length; i++){
         $(this).parent().siblings("ul").append("<li>" + newCheckbox + newIngredient[i] + "  (+3$)</li>");
        }
				

				$('#recipe1').children('li').click(checkboxChange(1));
				$('#recipe2').children('li').click(checkboxChange(2));
				$('#recipe3').children('li').click(checkboxChange(3));
				$('#recipe3').children('li').click(checkboxChange(4));
				$('#recipe3').children('li').click(checkboxChange(5));
				$('#recipe3').children('li').click(checkboxChange(6));

				$(this).parent().remove();
			}else{
				$("#newIngredient").attr("placeholder", "Please add ingrediant");
			}
		});
		// Remove button hides the input
		$(".addIngredientWrap > .cancelInput").on("click", function () {
			$(this).parent().remove();
		})
	})// add ingredient button

	$(".listOver").on("click", function () {
		var orderName = '<h3 class="orderName"><span>' + $(this).parent().siblings(".ui-dialog-titlebar").children("span").text() + '</span><a class="delBtn">&#10008;</a>' +'</h3>';
		var orderIngredients = '<ul class="orderIngredients"></ul>';
		var orderPrice = '<h3 class="orderPrice"><span>' + $(this).parent().children(".totalDialog").children("span").text() + '</span>$<h3>'
		var horisontalLine = '<hr>';
		$(".cart").children("#listOfOrders").append("<li>" + orderName + orderIngredients + orderPrice + horisontalLine + "</li>");

		$(this).parent().children("ul").children().children("input:checked").each(function () {
			var selectedIngredient = $(this).parent().text();
			$(".orderIngredients").last().append("<li>" + selectedIngredient + "</li>");
		})

		// opens the cart side menu
		if ($('#cartToggle').prop('checked')) {
			$("#cartToggle").prop("checked", true);
		}else{
			$("#cartToggle").prop("checked", true);
		}

		$(this).parent(".ui-dialog-content").dialog("close");

		numOfOrders = $("#listOfOrders").children().length;
		$(".num").text(numOfOrders);

		// display total price in cart orders
		var totalOrderPrice = 0;
		$("#listOfOrders").children("li").children(".orderPrice").children("span").each(function () {
			var price = parseFloat($(this).text());
			totalOrderPrice += price;
			$(".cart > h3 > span").text(totalOrderPrice + "$");
		});

		// remove order from cart
		$(".delBtn").on("click", function () {
			var removePrice = $(this).parent().parent().children(".orderPrice").children("span").text();
			totalOrderPrice -= removePrice;
			$(".cart > h3 > span").text(totalOrderPrice + "$");

			$(this).parents("li").remove();
			numOfOrders = $("#listOfOrders").children().length;
			$(".num").text(numOfOrders);
		})
	}); // List over (done button)

	$(".finishOrder").on("click", function () {
     $("#finalOrderList > ol").children().remove();
		$(".orderName").children("span").each(function(){
			var finalOrder = '<li>' + $(this).text() + '</li>';
			$("#finalOrderList > ol").append(finalOrder);
		})

		$("#finishOrderDialog").dialog({
			hide: "blind",
	    	show : "blind",
	    	width: "500px",
        closeText: "X"
	    });
	})

	$(".order").on("click", function () {
		var name = $("#buyerName").val();
		var number = $("#buyerNumber").val();
		var address = $("#buyerAddress").val();

		if (name != "" && number != "" && address != "") {
			$("#finishOrderDialog").dialog("close");
			$("#buyerInfo").children("p").remove();
			$("#thanksMessage").dialog({
				hide: "blind",
		    	show : "blind",
		    	width: "400px"
		    });
		    setTimeout(function(){
		    	$("#thanksMessage").dialog("close");
		    }, 3000);
		}else{
			$("#buyerInfo").append('<p>Fill up all the inputs</p>');
		}
	})

})


