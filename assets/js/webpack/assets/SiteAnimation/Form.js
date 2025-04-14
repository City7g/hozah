import SiteAnimation from '../modules/SiteAnimation';
import sendForm from './validation';
import * as XLSX from 'xlsx';

export default new (class FormCompany extends SiteAnimation {
  constructor() {
    super();
    this.excelFilePath = 'forms_data.xlsx';
  }

  init() {
    if (this.isWpAdmin) return;
    super.init('FormCompany');
    this.styleBoxes = document.getElementById('wrapper');

    this.instances = [
      ...document.querySelectorAll('.js-company:not(.init)'),
    ].map((parent) => {
      return {
        parent,
        fields: parent.querySelectorAll('.label'),
        checkbox: parent.querySelectorAll('.checkbox'),
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

    if (parent.classList.contains('init')) return;

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

    this.sendForm(parent, () => {
      // this.showSuccess(
      //   form.closest('.js-contact').querySelector('.contact-form__success'),
      // );
    });

    parent.classList.add('init');
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
      parent.classList.remove('init');
      if (formWrapper) formWrapper.classList.remove('thanks', 'wp-error');
    });
  }

  sendForm(parent, callback) {
    const form = parent.querySelector('form');
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    data.timestamp = new Date().toISOString();

    // Добавляем данные в Excel
    this.addToExcel(data);

    // Отправка данных на сервер
    fetch('/api/submit-form', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((result) => {
        if (result.success) {
          callback();
        } else {
          console.error('Ошибка при отправке формы:', result.error);
        }
      })
      .catch((error) => {
        console.error('Ошибка при отправке формы:', error);
      });
  }

  addToExcel(data) {
    try {
      let workbook;
      try {
        // Пытаемся загрузить существующий файл
        workbook = XLSX.readFile(this.excelFilePath);
      } catch (e) {
        // Если файл не существует, создаем новый
        workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet([data]);
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Forms');
      }

      // Получаем первый лист
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];

      // Добавляем новую строку
      const newRow = XLSX.utils.json_to_sheet([data], {
        header: Object.keys(data),
      });
      const range = XLSX.utils.decode_range(worksheet['!ref']);
      const newRowIndex = range.e.r + 1;

      // Копируем данные из новой строки в существующий лист
      Object.keys(data).forEach((key) => {
        const cellRef = XLSX.utils.encode_cell({
          r: newRowIndex,
          c: Object.keys(data).indexOf(key),
        });
        worksheet[cellRef] =
          newRow[
            XLSX.utils.encode_cell({ r: 0, c: Object.keys(data).indexOf(key) })
          ];
      });

      // Обновляем диапазон листа
      worksheet['!ref'] = XLSX.utils.encode_range({
        s: { r: 0, c: 0 },
        e: { r: newRowIndex, c: Object.keys(data).length - 1 },
      });

      // Сохраняем файл
      XLSX.writeFile(workbook, this.excelFilePath);
      console.log('Данные успешно добавлены в Excel');
    } catch (error) {
      console.error('Ошибка при работе с Excel:', error);
    }
  }
})();
