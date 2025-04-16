import SiteAnimation from '../modules/SiteAnimation';
import gsap from 'gsap';

export default new (class CustomSelect extends SiteAnimation {
  init() {
    if (this.isWpAdmin) return;
    super.init('CustomSelect');

    this.styleBoxes = document.getElementById('wrapper');
    this.instances = [...document.querySelectorAll('.c-select:not(.init)')].map(
      (parent) => {
        return {
          parent,
          box: parent.querySelector('.c-select__box'),
          dropdown: parent.querySelector('.c-select__dropdown'),
          text: parent.querySelector('.c-select__text'),
          tags: parent.querySelector('.c-select__tags'),
          checkboxes: parent.querySelectorAll('input[type="checkbox"]'),
          items: parent.querySelectorAll('.c-select__dropdown label'),
        };
      },
    );

    this.instances.forEach((instance) => {
      this.initAnimation(instance);
    });

    if (this.isWpAdmin || this.styleBoxes.dataset.styleLoaded === 'true') {
      this.instances.forEach((instance) => this.initAnimation(instance));
    } else {
      this.styleFileLoadedFunc = this.styleFileLoaded.bind(this);
      window.addEventListener('styleFileLoaded', this.styleFileLoadedFunc, {
        passive: true,
      });
    }

    document.addEventListener('click', this.handleOutsideClick.bind(this));
  }

  initAnimation({ parent, box, dropdown, text, tags, checkboxes, items }) {
    if (parent.classList.contains('init')) return;
    parent.classList.add('init');

    box.setAttribute('tabindex', '0');

    gsap.set(dropdown, {
      opacity: 0,
      y: 10,
      display: 'none',
    });

    gsap.set(items, {
      opacity: 0,
      y: 20,
    });

    box.addEventListener('click', (e) => {
      if (!e.target.closest('.c-select__tag-remove')) {
        e.stopPropagation();
        this.toggleDropdown(parent, dropdown, items);
      }
    });

    box.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.toggleDropdown(parent, dropdown, items);
      }
    });

    checkboxes.forEach((checkbox) => {
      checkbox.addEventListener('change', () => {
        this.updateSelectedText(parent, text, tags, checkboxes);
      });
    });
  }

  toggleDropdown(parent, dropdown, items) {
    const isOpen = parent.classList.contains('is-open');

    this.instances.forEach(
      ({ parent: otherParent, dropdown: otherDropdown, items: otherItems }) => {
        if (otherParent !== parent) {
          otherParent.classList.remove('is-open');
          this.closeDropdown(otherDropdown, otherItems);
        }
      },
    );

    parent.classList.toggle('is-open');

    if (!isOpen) {
      this.openDropdown(dropdown, items);
    } else {
      this.closeDropdown(dropdown, items);
    }
  }

  openDropdown(dropdown, items) {
    const tl = gsap.timeline();

    tl.set(dropdown, { display: 'block' })
      .to(dropdown, {
        opacity: 1,
        y: 0,
        duration: 0.3,
        ease: 'power2.out',
      })
      .to(
        items,
        {
          opacity: 1,
          y: 0,
          duration: 0.2,
          stagger: 0.04,
          ease: 'power2.out',
        },
        '-=0.1',
      );
  }

  closeDropdown(dropdown, items) {
    gsap.timeline().to([dropdown, items], {
      opacity: 0,
      y: 10,
      duration: 0.2,
      ease: 'power2.in',
      onComplete: () => {
        gsap.set(dropdown, { display: 'none' });
      },
    });
  }

  createTag(text, value, tagsContainer, checkbox) {
    const tag = document.createElement('div');
    tag.className = 'c-select__tag';
    tag.innerHTML = `
      <span class="c-select__tag-text">${text}</span>
      <svg class="c-select__tag-remove" data-value="${value}"><use xlink:href="/img/symbol/svg/sprite.symbol.svg#close"></use></svg>
    `;

    gsap.set(tag, {
      opacity: 0,
      scale: 0.8,
      x: -10,
    });

    tag
      .querySelector('.c-select__tag-remove')
      .addEventListener('click', (e) => {
        e.stopPropagation();

        gsap.to(tag, {
          opacity: 0,
          scale: 0.8,
          x: -10,
          duration: 0.2,
          ease: 'power2.in',
          onComplete: () => {
            checkbox.checked = false;
            this.updateSelectedText(
              tagsContainer.closest('.c-select'),
              tagsContainer
                .closest('.c-select')
                .querySelector('.c-select__text'),
              tagsContainer,
              tagsContainer
                .closest('.c-select')
                .querySelectorAll('input[type="checkbox"]'),
            );
          },
        });
      });

    return tag;
  }

  updateSelectedText(parent, textElement, tagsContainer, checkboxes) {
    const selectedOptions = Array.from(checkboxes)
      .filter((checkbox) => checkbox.checked)
      .map((checkbox) => ({
        text: checkbox.parentElement.textContent.trim(),
        value: checkbox.value,
      }));

    if (selectedOptions.length > 0) {
      gsap.set(tagsContainer, { display: 'flex' });
      parent.classList.add('has-selection');
    } else {
      gsap.set(tagsContainer, { display: 'none' });
      parent.classList.remove('has-selection');
    }

    const previousValues = Array.from(
      tagsContainer.querySelectorAll('.c-select__tag-remove'),
    ).map((el) => el.dataset.value);

    const newValues = selectedOptions.map((option) => option.value);
    const hasNewSelections =
      selectedOptions.length > 0 && previousValues.length === 0;
    const allSelectionsRemoved =
      selectedOptions.length === 0 && previousValues.length > 0;

    const tagsToRemove = Array.from(
      tagsContainer.querySelectorAll('.c-select__tag'),
    ).filter((tag) => {
      const value = tag.querySelector('.c-select__tag-remove').dataset.value;
      return !newValues.includes(value);
    });

    if (tagsToRemove.length > 0) {
      gsap.to(tagsToRemove, {
        opacity: 0,
        scale: 0.8,
        x: -10,
        duration: 0.2,
        ease: 'power2.in',
        stagger: 0.05,
        onComplete: () => {
          tagsToRemove.forEach((tag) => tag.remove());
        },
      });
    } else if (allSelectionsRemoved) {
      gsap.set(textElement, { display: 'block' });
      gsap.to(textElement, {
        opacity: 1,
        y: 0,
        duration: 0.3,
        ease: 'power2.out',
      });
    }

    selectedOptions.forEach((option) => {
      const existingTag = Array.from(
        tagsContainer.querySelectorAll('.c-select__tag-remove'),
      ).find((el) => el.dataset.value === option.value);

      if (!existingTag) {
        const tag = this.createTag(
          option.text,
          option.value,
          tagsContainer,
          Array.from(checkboxes).find((cb) => cb.value === option.value),
        );
        tagsContainer.appendChild(tag);

        gsap.to(tag, {
          opacity: 1,
          scale: 1,
          x: 0,
          duration: 0.3,
          ease: 'power2.out',
          delay: 0.05,
        });
      }
    });
  }

  handleOutsideClick(e) {
    this.instances.forEach(({ parent, dropdown, items }) => {
      if (!parent.contains(e.target)) {
        parent.classList.remove('is-open');
        this.closeDropdown(dropdown, items);
      }
    });
  }

  styleFileLoaded() {
    if (this.styleBoxes.dataset.styleLoaded === 'true') {
      this.instances.forEach((instance) => this.initAnimation(instance));
    }
  }

  destroy(hardDestroy = false) {
    this.instances.forEach(({ parent, dropdown, items }) => {
      parent.classList.remove('init');
      parent.classList.remove('is-open');
      gsap.set([dropdown, items], { clearProps: 'all' });
    });
    document.removeEventListener('click', this.handleOutsideClick.bind(this));
    super.destroy(hardDestroy);
  }
})();
