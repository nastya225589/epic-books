ready(function () {
  // Кастомные селекты (кроме выбора языка)
  new Choices('.field-select:not(#lang) select.field-select__select', {
    searchEnabled: false,
    shouldSort: false,
  });

  // Кастомный селект выбора языка отдельно
  new Choices('#lang select.field-select__select', {
    searchEnabled: false,
    shouldSort: false,
    callbackOnCreateTemplates: function (template) {
      return {
        item: (classNames, data) => {
          return template(`
            <div class="${classNames.item} ${data.highlighted ? classNames.highlightedState : classNames.itemSelectable}" data-item data-id="${data.id}" data-value="${data.value}" ${data.active ? 'aria-selected="true"' : ''} ${data.disabled ? 'aria-disabled="true"' : ''}>
              ${getLangInSelectIcon(data.value)} ${data.label.substr(0, 3)}
            </div>
          `);
        },
        choice: (classNames, data) => {
          return template(`
            <div class="${classNames.item} ${classNames.itemChoice} ${data.disabled ? classNames.itemDisabled : classNames.itemSelectable}" data-select-text="${this.config.itemSelectText}" data-choice ${data.disabled ? 'data-choice-disabled aria-disabled="true"' : 'data-choice-selectable'} data-id="${data.id}" data-value="${data.value}" ${data.groupId > 0 ? 'role="treeitem"' : 'role="option"'}>
              ${getLangInSelectIcon(data.value)} ${data.label}
            </div>
          `);
        },
      };
    }
  });

  function getLangInSelectIcon(value) {
    if (value == 'ru') return '<span class="field-select__lang-ru"></span>';
    else if (value == 'en') return '<span class="field-select__lang-en"></span>';
    return '<span class="field-select__lang-null"></span>';
  }

  // Выбор диапазона цен
  let slider = document.getElementById('price-range');
  noUiSlider.create(slider, {
    start: [400, 1000],
    connect: true,
    step: 100,
    range: {
      'min': 200,
      'max': 2000
    }
  });

  let snapValues = [
    document.getElementById('price-from'),
    document.getElementById('price-to')
  ];

  const priceFrom = document.querySelector('#price-from');
  slider.noUiSlider.on('update', (values, handle) => {
    console.log(values[handle]);
    snapValues[handle].value = values[handle];
  })

});

// ВНИМАНИЕ!
// Нижеследующий код (кастомный селект и выбор диапазона цены) работает
// корректно и не вызывает ошибок в консоли браузера только на главной.
// Одна из ваших задач: сделать так, чтобы на странице корзины в консоли
// браузера не было ошибок.

function ready(fn) {
  if (document.attachEvent ? document.readyState === 'complete' : document.readyState !== 'loading') {
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

//В этом месте должен быть написан ваш код

////////____slider____///////
const popularSliderLeft = document.getElementById('popular-slider-left');
const popularSliderRight = document.getElementById('popular-slider-right');

if (popularSliderLeft !== null) {
  popularSliderLeft.onclick = sliderLeft;
}

if (popularSliderRight !== null) {
  popularSliderRight.onclick = sliderRight;
}

let left = 0;
let popularSlider = document.getElementById('popular-slider');

function sliderLeft() {
  left = left - 210;
  if (left < -420) {
    left = 0;
  }
  popularSlider.style.left = left + 'px';
}

function sliderRight() {
  left = left + 210;
  if (left > 0) {
    left = -420;
  }
  popularSlider.style.left = left + 'px';
}

////////____render-json____///////
const xhr = new XMLHttpRequest();

xhr.open('GET', 'https://api.myjson.com/bins/ch0pi');
xhr.addEventListener('readystatechange', function () {
  if (this.readyState != 4) return;   // Пропуск незавершённых запросов.
  if (this.status != 200) {
    console.log(xhr.status);          // Просмотр причины неудачи.
  } else {
    const data = JSON.parse(xhr.responseText);
 // Просмотр содержимого ответа.
    // data.forEach((item, i) => {
    //   item.id = i;
    // });
    const bookList = document.querySelector('.catalog__books-list');
    if (bookList !== null) {
      render(data);
      filterType(data);
    }
  }
});

xhr.send();

let cartBacket = JSON.parse(localStorage.getItem('cart')) || [];

const renderWidget = () => {
  const cartWidget = document.querySelector('.page-header__cart-num');
  const cartSum = document.querySelector('.cart__sum');
  let arrAmount = arraySum(cartBacket.map(a => a.amount));

  function arraySum(arr) {
    let sum = 0;
    if (arr.length) {
      sum = arr.reduce((a, b) => {
        return (parseFloat(a) || 0) + (parseFloat(b) || 0);
      });
    } else {
      sum = 0;
    }
    return sum;
  }

  cartWidget.textContent = arrAmount;
  if (cartSum !== null) {
    cartSum.textContent = arrAmount;
  }
};

renderWidget();

const render = data => {
  const bookList = document.querySelector('.catalog__books-list');
  bookList.innerHTML = '';
  const fragment = document.createDocumentFragment();
  const template = document.querySelector('#template');

  data.forEach(function (item, i) {
    // log(item)
    // item.id = i;
    const newCard = template.content.querySelector('.card').cloneNode(true);

    newCard.querySelector('.card__inner').href = 'index.html#' + item.id;
    newCard.querySelector('.card__inner').dataset.id = item.id;
    newCard.dataset.id = item.id;
    newCard.querySelector('.card__title').textContent = item.name;
    newCard.querySelector('.card__price').textContent = `${item.price} ₽`;
    newCard.querySelector('.card__img').src = `img/books/${item.id}.jpg`;
    newCard.querySelector('.card__img').alt = item.name;
    newCard.querySelector('.card__buy').dataset.id = item.id;

    if (i < 8) {
      fragment.appendChild(newCard);
    }
  });

  bookList.appendChild(fragment);

  let arrBtnBuy = document.getElementsByClassName('card__buy');

  for (let item of arrBtnBuy) {
    item.addEventListener('click', function (e) {
      e.stopPropagation();

      const id = this.dataset.id;

      const addedProduct = cartBacket.find(item => {
        return item.id === id
      });

      if (addedProduct) {
        cartBacket.map(function (item, i) {
          if (item.id === id)
            item.amount++;
        })
      } else {
        const currentProduct = data.find(item => {
          return item.id === id
        });
        currentProduct.amount = 1;
        cartBacket.push(currentProduct);
      }

      localStorage.setItem('cart', JSON.stringify(cartBacket));
      renderWidget();
    })
  }

  let arrCard = document.getElementsByClassName('card');
  for (let i = 0; i < arrCard.length; i++) {
    arrCard[i].addEventListener('click', function (e) {
      if (e.target.closest('.card') !== null) {
        let arr = data.filter(item => {
          let re = new RegExp(e.target.dataset.id, 'gi');
          return re.test(item.id)
        });
        // вызывать модалку
        renderModal(arr[i] || arr[0]);
      }
    });
  }
};

const filterType = data => {
  const tabs = document.querySelector('.page-header__book-tabs');

  tabs.addEventListener('click', (e) => {
    e.preventDefault();

    if (e.target.classList.contains('tabs__item-link')) {
      let filtered = data.filter(item => {
        return item.type === e.target.dataset.type;
      });
      console.log(filtered);
      render(filtered);
    }
  });
};

//////_____Modal_____///////
const renderModal = (item) => {
  const modalContent = document.querySelector('.modal__dialog');
  modalContent.innerHTML = '';
  const fragment = document.createDocumentFragment();
  const templateProduct = document.querySelector('#product-template');

  const newProduct = templateProduct.content.querySelector('.modal__content').cloneNode(true);

  newProduct.querySelector('.product__title').textContent = item.name;
  newProduct.querySelector('.btn--price').textContent = `${item.price} ₽`;
  newProduct.querySelector('.product__img-wrap img').src = `img/books/${item.id}.jpg`;

  fragment.appendChild(newProduct);
  modalContent.appendChild(fragment);

  // //////_____main-nav--open_____///////
  let modal = document.getElementById('modal-book-view');
  let html = document.querySelector('.js');
  modal.classList.toggle('modal--open');
  html.classList.toggle('js-modal-open');

  let modalCloseBtn = document.querySelector('.modal__close');
  modalCloseBtn.addEventListener('click', function () {
    modal.classList.remove('modal--open');
    html.classList.remove('js-modal-open');
  });
};

//////_____burger_____///////
let burger = document.querySelector('.burger');
let menuElem = document.getElementById('nav');
burger.addEventListener('click', function () {
  menuElem.classList.toggle('main-nav--open');
});

//////_____filters--open_____///////
let filterElem = document.getElementById('filters');
let filterBtn = document.getElementById('filters-trigger');
if (filterBtn != null) {
  filterBtn.addEventListener('click', function () {
    filterElem.classList.toggle('filters--open');
  });
}


////////____cart____///////
const cartSummator = data => {
  let result = 0;

  data.forEach(item => {
    result += item.amount * item.price
  });

  console.log(result);

  return result;
};

const renderCart = data => {
  const cartList = document.querySelector('.cart__table');
  cartList.innerHTML = '';
  const fragment = document.createDocumentFragment();
  const templateCart = document.getElementById('cart__product');
  console.log(templateCart);

  data.forEach(function (item) {
    const newCart = templateCart.content.querySelector('.cart__product').cloneNode(true);

    newCart.dataset.id = item.id;
    newCart.querySelector('.cart__item-name').textContent = item.name;
    newCart.querySelector('.cart__item-price').textContent = `${item.price * item.amount} ₽`;
    newCart.querySelector('.field-num__input').value = item.amount;
    newCart.querySelector('.cart__item-img').src = `img/books/${item.id}.jpg`;
    newCart.querySelector('.cart__item-name').alt = item.name;

    fragment.appendChild(newCart);
  });
  // cartList шапка таблицы
  cartList.appendChild(fragment);

  let btnPlus = document.querySelectorAll('.field-num__btn-plus');
  for (let i = 0; i < btnPlus.length; i++) {
    btnPlus[i].addEventListener('click', function (e) {
      e.stopPropagation();

      data[i].amount += 1;
      localStorage.setItem('cart', JSON.stringify(data));
      renderCart(cartBacket);
      renderTotal(cartBacket);
      renderWidget();
    });
  }

  let btnMinus = document.querySelectorAll('.field-num__btn-minus');
  for (let i = 0; i < btnMinus.length; i++) {
    btnMinus[i].addEventListener('click', function (e) {
      e.stopPropagation();

      data[i].amount -= 1;

      if (data[i].amount <= 1) {
        data[i].amount = 1
      }

      localStorage.setItem('cart', JSON.stringify(data));
      renderCart(cartBacket);
      renderTotal(cartBacket);
      renderWidget();
    });
  }

  let numInput = document.querySelectorAll('.field-num__input');
  for (let i = 0; i < numInput.length; i++) {
    numInput[i].addEventListener('change', function (e) {
      e.stopPropagation();

      data[i].amount = +numInput[i].value;

      if (data[i].amount <= 1) {
        data[i].amount = 1;
      }

      localStorage.setItem('cart', JSON.stringify(data));
      renderCart(cartBacket);
    });
  }

  const clearBtn = document.querySelectorAll('.cart__clear-btn');
  for (let i = 0; i < clearBtn.length; i++) {
    clearBtn[i].addEventListener('click', function (e) {
      e.stopPropagation();
      data.splice(i);

      localStorage.setItem('cart', JSON.stringify(data));
      renderCart(cartBacket);
      renderTotal(cartBacket);
      renderWidget();
    });
  }

  const delBtn = document.querySelectorAll('.cart__product-del-btn');
  for (let i = 0; i < delBtn.length; i++) {
    delBtn[i].addEventListener('click', function (e) {
      e.stopPropagation();
      data.splice(i, 1);

      localStorage.setItem('cart', JSON.stringify(data));
      renderCart(cartBacket);
      renderTotal(cartBacket);
      renderWidget();
    });
  }
};

if (cartBacket !== null) {
   renderCart(cartBacket);
}

const renderTotal = data => {
  const cartList = document.querySelector('.cart__table');
  const fragment = document.createDocumentFragment();
  const templateTotal = document.getElementById('total');
  console.log(templateTotal);
  const newCart = templateTotal.content.querySelector('.cart__total').cloneNode(true);
  newCart.querySelector('.cart__products-price-num').textContent = `${cartSummator(data)} ₽`;
  fragment.appendChild(newCart);
  cartList.appendChild(fragment);

  const cartResult = document.querySelector('.checkout__price');
  cartResult.textContent = `${cartSummator(data)} ₽`;

};

renderTotal(cartBacket);

////////____form____///////
  //
  // const orderForm = document.forms.order;

const form = document.forms.order;

form.addEventListener('submit', submitForm);

function submitForm(event) {
  event.preventDefault();
  validate();
}

function validate() {
  for (let i=0; i < form.elements.length; i++) {
    textFieldValid(form.elements[i].id);
  }
}

const errorMessage = (id, str) => {
  const error = document.querySelector(`#${id} + .form__error`);
  error.textContent = str;
};

const textFieldValid = id => {
  if (id === null) {
    return;
  }

  const input = document.getElementById(id);

  if (input === null) {
    return
  }

  if (input.type === 'text') {
    if (!input.value.length) {
      errorMessage(id, "Поле не должно быть пустым");
      input.classList.add('input--error');
    } else {
      errorMessage(id, "");
      input.classList.remove('input--error');
    }
  }

  if (input.type === 'tel') {
    const reg = new RegExp('^[0-9]+$');
    if (reg.test(input.value)) {
      errorMessage(id, "");
      input.classList.remove('input--error');
    } else {
      errorMessage(id, "В поле должны быть только цифры");
      input.classList.add('input--error');
    }
  }

  if (input.type === 'email') {
    const re = /\b[A-Z0-9]+@[A-Z0-9]+\.[A-Z]{2,4}\b/gim;
    if (!re.test(input.value)) {
      errorMessage(id, "Поле не должно быть пустым");
      input.classList.add('input--error');
    } else {
      errorMessage(id, "");
      input.classList.remove('input--error');
    }
  }
};

const selectTypeDelivery = (e) => {
  if (e.name !== 'delivery') {
    return;
  }

  if (e.value === '1') {
    const templateCart = document.getElementById('cart-delivery-1');
    templateCart.classList.remove('cart__delivery--hidden');
    const templateCart2 = document.getElementById('cart-delivery-2');
    templateCart2.classList.add('cart__delivery--hidden');
    const templateCart3 = document.getElementById('cart-delivery-3');
    templateCart3.classList.add('cart__delivery--hidden');
  }

  if (e.value === '2') {
    const templateCart = document.getElementById('cart-delivery-2');
    templateCart.classList.remove('cart__delivery--hidden');
    const templateCart1 = document.getElementById('cart-delivery-1');
    templateCart1.classList.add('cart__delivery--hidden');
    const templateCart3 = document.getElementById('cart-delivery-3');
    templateCart3.classList.add('cart__delivery--hidden');
  }

  if (e.value === '3') {
    const templateCart = document.getElementById('cart-delivery-3');
    templateCart.classList.remove('cart__delivery--hidden');
    const templateCart2 = document.getElementById('cart-delivery-2');
    templateCart2.classList.add('cart__delivery--hidden');
    const templateCart1 = document.getElementById('cart-delivery-1');
    templateCart1.classList.add('cart__delivery--hidden');
  }
};


form.addEventListener('input', (e) => {

  textFieldValid(e.target.id);

  selectTypeDelivery(e.target);
});





