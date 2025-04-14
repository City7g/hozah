const capitalize = (text = ' ') => text[0].toUpperCase() + text.slice(1);

export function showLabelError(label, text = 'Error') {
  const field = label.closest('.c-label, .label');
  const fieldError = field.querySelector('.c-label__error, .label__error');

  if (label) {
    field.classList.add('--error');
  }

  if (fieldError) {
    field.querySelector('.c-label__error').textContent = text;
  }
}

export function showCheckboxError(label, text) {
  const field = label.closest('.c-checkbox');

  console.log(label);

  if (field) {
    field.classList.add('--error');
    field.querySelector('.c-checkbox__error').textContent = text;
  }
}

const test_email =
  /^([a-zA-Z0-9_.-])+@([a-zA-Z0-9_.-])+\.([a-zA-Z])+([a-zA-Z])+/;

const errors = {
  email: {
    uk: () => 'Електронна адреса невірна',
    en: () => 'Incorrect email address',
  },
  required: {
    uk: () => 'Обов’язкове поле',
    en: () => 'Field is required',
  },
  tel: {
    uk: () => 'Невірний формат',
    en: () => 'Syntax error',
  },
  oldEmail: {
    en: () => 'This email has already been used. Please use another email.',
  },
};

function validationFunc(form, callback) {
  const lang =
    document.documentElement.getAttribute('lang')?.substring(0, 2) || 'en';

  let submitError = false;

  const labels = form.querySelectorAll('.c-label');
  const checkboxes = form.querySelectorAll('.c-checkbox');

  labels.forEach((label) => {
    label.querySelector('input').addEventListener('input', () => {
      label.classList.remove('--error');
    });
  });

  checkboxes.forEach((checkbox) => {
    checkbox.querySelector('input').addEventListener('change', () => {
      checkbox.classList.remove('--error');
    });
  });

  [...form.querySelectorAll('.c-label')].forEach((label) => {
    label.classList.remove('--error');
  });

  [...form.querySelectorAll('input')].forEach((label) => {
    if (
      label.getAttribute('type') === 'checkbox' &&
      label.closest('.c-checkbox')
    ) {
      if (!label.checked) {
        showCheckboxError(label, errors['required'][lang]('checkbox'));

        submitError = true;
      }
    } else if (
      (label.getAttribute('type') === 'text' ||
        label.getAttribute('type') === 'email' ||
        label.getAttribute('type') === 'tel') &&
      label.value === '' &&
      label.required
    ) {
      showLabelError(label, errors['required'][lang]());

      submitError = true;
    } else if (
      label.getAttribute('type') === 'email' &&
      !test_email.test(label.value)
    ) {
      showLabelError(label, errors['email'][lang]());

      submitError = true;
    } else if (
      label.getAttribute('type') === 'email' &&
      (JSON.parse(localStorage.getItem('form') || 'null') || []).includes(
        label.value,
      )
    ) {
      showLabelError(label, errors['oldEmail'][lang]());

      submitError = true;
    }
  });

  [...form.querySelectorAll('textarea')].forEach((label) => {
    if (label.value === '' && label.required) {
      showLabelError(label, errors['required'][lang]['name']);

      submitError = true;
    }
  });

  if (!submitError) {
    const formEl = form.tagName === 'FORM' ? form : form.querySelector('form');

    const oldEmails = JSON.parse(localStorage.getItem('form') || '[]');

    localStorage.setItem(
      'form',
      JSON.stringify([
        ...oldEmails,
        formEl.querySelector('input[type=email]').value,
      ]),
    );

    const data = Object.fromEntries(new FormData(formEl));

    console.log(data, localStorage.getItem('form'));

    callback(data, formEl);
  }
  return false;
}

function sendForm(form, callback) {
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    validationFunc(form, callback);
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

window.showSuccess = new showSuccess();

export default sendForm;
