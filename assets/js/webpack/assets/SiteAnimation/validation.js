function successForm(data, id) {}

let ajaxCalcAccess = true;
const arr_timers_form_input = [];
const arr_timers_form_textarea = [];
let submitError = false;

function createError(item) {
  createTimer(item);
  if (item.closest('.label')) {
    item.closest('.label').classList.add('error');
    item.closest('.label').querySelector('.errorText').style.display = 'block';
  }
}

function createTimer(item) {
  const type = item.tagName;
  const index = [...document.querySelectorAll('form input')].indexOf(item);
  const mass =
    type === 'INPUT'
      ? arr_timers_form_input[index]
      : arr_timers_form_textarea[index];
  clearTimeout(mass);
  arr_timers_form_input[index] = setTimeout(function () {
    if (item.closest('.label')) {
      item.closest('.label').classList.remove('error');
      item.closest('.label').querySelector('.errorText').style.display = 'none';
    } else if (item.closest('.orderFormTags')) {
      item.closest('.orderFormTags').classList.remove('error');
      item
        .closest('.orderFormTags')
        .querySelector(':scope > .errorText').style.display = 'none';
    } else if (item.classList.contains('uploadCV')) {
      item.classList.remove('error');
      item.querySelector(':scope > .errorText').style.display = 'none';
    }
  }, 7000);
}

function scrollToErrorInput() {
  let inputTop;
  let scrollTop;

  const headerSize = document.querySelector('header').offsetHeight;

  if (this.closest('.label')) {
    if (!this.closest('.subscribeForm')) {
      inputTop = this.closest('.label');
    }
  } else if (this.closest('.orderFormTags')) {
    inputTop = this.closest('.orderFormTags');
  }

  const inputTopY = inputTop.getBoundingClientRect().top + window.scrollY;

  scrollToPos(inputTopY - headerSize - 50, 0.5);
}
const capitalize = (text = ' ') => text[0].toUpperCase() + text.slice(1);

export function errorDo(text) {
  if (this.closest('.label')) {
    this.closest('.label').querySelector('.errorText').textContent = text;
  }
  if (!submitError) {
    scrollToErrorInput.call(this);
  }
  submitError = true;
  createError(this);
}

function validationFunc(form, validateIn = form, callback) {
  const lang = document.documentElement.getAttribute('lang');
  submitError = false;
  [...validateIn.querySelectorAll('.error')].forEach(function (error) {
    error.classList.remove('error');
  });
  [...validateIn.querySelectorAll('input')].forEach(function (input) {
    if (input.value === '' && input.required) {
      if (lang === 'uk') {
        errorDo.call(
          input,
          capitalize(input.getAttribute('data-name') + ' обов’язкове поле'),
        );
      } else {
        errorDo.call(
          input,
          capitalize(input.getAttribute('data-name') + ' is required'),
        );
      }
    }
    if (input.getAttribute('type') === 'tel') {
      if (input.classList.contains('withMask')) {
        if (input.value.includes('_')) {
          if (lang === 'uk') {
            errorDo.call(input, 'Невірний формат');
          } else {
            errorDo.call(input, 'Syntax error');
          }
        }
      }
    }
    if (
      input.getAttribute('type') === 'email' &&
      (input.required || input.dataset.validateIfNotEmpty)
    ) {
      const email_val = input.value;
      const test_email =
        /^([a-zA-Z0-9_.-])+@([a-zA-Z0-9_.-])+\.([a-zA-Z])+([a-zA-Z])+/;
      if ((!email_val && input.required) || !test_email.test(email_val)) {
        if (email_val.length) {
          if (lang === 'uk') {
            errorDo.call(input, 'Електронна адреса невірна');
          } else {
            errorDo.call(input, 'Incorrect email address');
          }
        } else {
          if (input.dataset.validateIfNotEmpty) return;

          if (lang === 'uk') {
            errorDo.call(
              input,
              capitalize(input.getAttribute('data-name') + ' обов’язкове поле'),
            );
          } else {
            errorDo.call(
              input,
              capitalize(input.getAttribute('data-name') + ' is required'),
            );
          }
        }
      }
    }
    if (input.getAttribute('data-type') === 'password' && input.required) {
      // Password must be at least EIGHT characters long, contain at least 1 number, 1 letter and one capital letter. White spaces or special characters are not allowed except the following characters ! @ $ % _ # ( )

      const password_val = input.value;
      const test_password =
        /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])[A-Za-z0-9!@$%_#()]{8,}$/;

      if (!password_val || !test_password.test(password_val)) {
        if (password_val.length) {
          if (lang === 'ru') {
            errorDo.call(
              input,
              'Пароль должен содержать не менее 8 символов, включать хотя бы 1 цифру, 1 букву и одну заглавную букву. Пробелы или специальные символы не допускаются, за исключением следующих символов: ! @ $ % _ # ( )',
            );
          } else {
            errorDo.call(
              input,
              'Password must be at least EIGHT characters long, contain at least 1 number, 1 letter and one capital letter. White spaces or special characters are not allowed except the following characters ! @ $ % _ # ( )',
            );
          }
        } else {
          if (lang === 'uk') {
            errorDo.call(
              input,
              capitalize(input.getAttribute('data-name') + ' обов’язкове поле'),
            );
          } else {
            errorDo.call(
              input,
              capitalize(input.getAttribute('data-name') + ' is required'),
            );
          }
        }
      }
    }

    if (
      input.getAttribute('data-type') === 'confirm-password' &&
      input.required
    ) {
      // проверить на соответствие с password
      const password_val = input.value;
      const password = input
        .closest('form')
        .querySelector('input[data-type="password"]').value;

      if (password_val !== password) {
        if (password_val.length) {
          if (lang === 'uk') {
            errorDo.call(input, 'Паролі не співпадають');
          } else {
            errorDo.call(input, 'Passwords do not match');
          }
        } else {
          if (lang === 'uk') {
            errorDo.call(
              input,
              capitalize(input.getAttribute('data-name') + ' обов’язкове поле'),
            );
          } else {
            errorDo.call(
              input,
              capitalize(input.getAttribute('data-name') + ' is required'),
            );
          }
        }
      }
    }
  });
  [...validateIn.querySelectorAll('textarea')].forEach(function (textarea) {
    if (textarea.value === '' && textarea.required) {
      if (lang === 'uk') {
        errorDo.call(
          textarea,
          capitalize(textarea.getAttribute('data-name') + ' обов’язкове поле'),
        );
      } else {
        errorDo.call(
          textarea,
          capitalize(textarea.getAttribute('data-name') + ' is required'),
        );
      }
    }
  });
  [...validateIn.querySelectorAll('select')].forEach(function (select) {
    if (select.value === '' && select.required) {
      if (lang === 'uk') {
        errorDo.call(
          select,
          capitalize(select.getAttribute('data-name') + ' обов’язкове поле'),
        );
      } else {
        errorDo.call(
          select,
          capitalize(select.getAttribute('data-name') + ' is required'),
        );
      }
    }
  });

  if (!submitError) {
    const formEl = form.tagName === 'FORM' ? form : form.querySelector('form');
    if (!callback) {
      const data = new URLSearchParams(new FormData(formEl)).toString();
      if (
        form.getAttribute('id') === 'footerContactForm' &&
        footerWave.inited
      ) {
        footerWave.formSuccess();
      }
      successForm(data, form.getAttribute('id'));
    } else {
      const data = Object.fromEntries(new FormData(formEl));
      // console.log(formEl);
      callback(data, formEl);
    }
  }
  return false;
}

function sendForm(selector, callback) {
  // const forms = document.querySelectorAll(selector);
  const forms =
    selector instanceof Node ? [selector] : document.querySelectorAll(selector);

  if (forms.length) {
    forms.forEach(function (el) {
      const form = el.tagName === 'FORM' ? el : el.querySelector('form');

      form.addEventListener('submit', function (e) {
        e.preventDefault();

        validationFunc(form, form, callback);
      });
    });
  }

  showHidePassword();
  disableBtnOnNotAgree();
  onlyNumInp();
  preventLenisOnTextarea();
}

/**
 * AGREE
 */
function disableBtnOnNotAgree() {
  const allAgrees = [...document.querySelectorAll('.agreeCheck input')];

  if (!allAgrees.length) return;

  allAgrees.forEach((el) => {
    const submitBtn = el.closest('form').querySelector('button[type="submit"]');
    if (!el.checked) {
      submitBtn.classList.add('disabled');
      submitBtn.setAttribute('disabled', true);
    }
    el.addEventListener('change', (e) => {
      submitBtn.classList[
        allAgrees.some((elem) => !elem.checked) ? 'add' : 'remove'
      ]('disabled');

      if (allAgrees.some((elem) => !elem.checked)) {
        submitBtn.setAttribute('disabled', true);
      } else {
        submitBtn.removeAttribute('disabled');
      }
    });
  });
}

/**
 * showHidePassword
 */

function showHidePassword() {
  const btns = document.querySelectorAll('.showPassBtn');

  if (!btns) return;

  btns.forEach((btn) => {
    btn.addEventListener('click', function (e) {
      const input = this.closest('.form-field').querySelector('input');
      this.classList.toggle('showed');
      input.type === 'password'
        ? input.setAttribute('type', 'text')
        : input.setAttribute('type', 'password');
    });
  });
}

/**
 * showSuccess
 */

class showSuccess {
  constructor() {}
  showHide(el) {
    const elem = document.querySelector(el);

    if (!elem) return;

    elem.classList.toggle('show');
  }
}

/**
 * Only num input
 */

export function onlyNumInp() {
  document.addEventListener('input', (e) => {
    if (e.target.classList.contains('onlyNum')) {
      const input = e.target;
      if (input.value.match(/[^0-9]/g)) {
        input.value = input.value.replace(/[^0-9]/g, '');
      }
    }
  });
}

/**
 * add lenis preven for textrea
 */
function preventLenisOnTextarea() {
  const elems = document.querySelectorAll('textarea');
  if (!elems.length) return;

  elems.forEach((el) => {
    el.addEventListener('input', (e) => {
      if (el.scrollHeight > el.clientHeight) {
        if (!el.getAttribute('data-lenis-prevent')) {
          el.setAttribute('data-lenis-prevent', true);
        }
      } else {
        if (el.getAttribute('data-lenis-prevent')) {
          el.removeAttribute('data-lenis-prevent');
        }
      }
    });
  });
}

window.showSuccess = new showSuccess();

export default sendForm;
