import SiteAnimation from '../modules/SiteAnimation';
import sendForm from './validation';

export default new (class FormCompany extends SiteAnimation {
  init() {
    if (this.isWpAdmin) return;
    super.init('FormCompany');
    this.styleBoxes = document.getElementById('wrapper');

    this.instances = [
      ...document.querySelectorAll('.js-footer-form:not(.init)'),
    ].map((parent) => {
      return {
        parent,
        fields: parent.querySelectorAll('.c-label'),
        checkbox: parent.querySelectorAll('.c-agree'),
        button: parent.querySelector('button'),
      };
    });

    if (this.isWpAdmin || this.styleBoxes.dataset.styleLoaded === 'true') {
      this.instances.forEach((instance) => this.initInstance(instance));
    } else {
      this.styleFileLoadedFunc = this.styleFileLoaded.bind(this);
      window.addEventListener('styleFileLoaded', this.styleFileLoadedFunc, {
        passive: true,
      });
    }
  }

  styleFileLoaded() {
    if (this.styleBoxes.dataset.styleLoaded === 'true') {
      this.instances.forEach((instance) => this.initInstance(instance));
    }
  }

  initInstance(instance) {
    const { parent, fields, checkbox, button } = instance;

    if (parent.classList.contains('inited')) return;

    // fields.forEach((field) => {
    //   this.addListener(
    //     field.querySelector('input') || field.querySelector('textarea'),
    //     'input',
    //     this.checkNotEmpty.bind(this, field, 'change'),
    //   );
    // });

    // checkbox.forEach((field) => {
    //   this.addListener(
    //     field.querySelector('input'),
    //     'change',
    //     this.check.bind(this, field.querySelector('input'), 'change'),
    //   );
    // });

    // textareas.forEach((field) => {
    //   this.addListener(field, 'focus', () => {
    //     field.setAttribute('data-lenis-prevent', '');
    //   });

    //   this.addListener(field, 'blur', () => {
    //     field.removeAttribute('data-lenis-prevent');
    //   });
    // });

    sendForm(parent, () => {
      Modals.openModal('#thanks');
      this.removeValue(parent);
    });

    parent.classList.add('inited');
  }

  removeValue(parent) {
    parent.querySelectorAll('.c-label').forEach((label) => {
      label.querySelector('input').value = '';
    });

    parent.querySelectorAll('.c-checkbox').forEach((checkbox) => {
      checkbox.querySelector('input').checked = false;
    });

    parent.querySelectorAll('.c-select').forEach((select) => {
      select.querySelectorAll('input').forEach((input) => {
        input.checked = false;
      });
      select.classList.remove('has-selection');
      select.querySelector('.c-select__tags').removeAttribute('style');
    });
  }

  checkNotEmpty(field, type) {
    if (field.value !== '') {
      field.querySelector('.label__error').style.display = '';
    }
  }

  check(field, type) {
    if (field.checked) {
      field
        .closest('.checkbox')
        .querySelector('.checkbox__error').style.display = '';
    }
  }

  validateForm(fields) {
    let submitError = false;

    [...fields].forEach((field) => {
      if (field.value === '') {
        submitError = true;
      }
    });

    return submitError;
  }

  destroy(hardDestroy = false) {
    super.destroy(hardDestroy);

    this.instances.forEach((instance) => {
      const { parent, formWrapper } = instance;
      parent.classList.remove('inited');
      if (formWrapper) formWrapper.classList.remove('thanks', 'wp-error');
    });
  }
})();
