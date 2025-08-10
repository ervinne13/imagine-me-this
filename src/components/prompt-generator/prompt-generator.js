import './prompt-generator.scss';
import template from './template.html?raw';

class PromptGenerator extends HTMLElement {
  constructor() {
    super();
    this.options = {};
  }

  async connectedCallback() {
    this.innerHTML = template;
    const apiOptions = await this.fetchOptions();
    this.cacheElements();
    this.populateOptions(apiOptions);
    this.addEventListeners();
  }

  async fetchOptions() {
    const baseUrl = import.meta.env.VITE_FASTAPI_BASE_URL || 'http://localhost:9000';
    const res = await fetch(`${baseUrl}/api/v1/prompt-options`);
    return await res.json();
  }

  cacheElements() {
    // Cache form elements by name for easy access
    this.options['form'] = this.querySelector('[data-el="form"]');
    this.options['composition'] = this.querySelector('[name="composition"]');
    this.options['type'] = this.querySelector('[name="type"]');
    this.options['style'] = this.querySelector('[name="style"]');
    this.options['background'] = this.querySelector('[name="background"]');
    this.options['extras'] = this.querySelector('[data-el="extras"]');
    this.options['result'] = this.querySelector('[data-el="result"]');
  }

  populateOptions(apiOptions) {
    // Populate dropdowns
    this.populateSelect(this.options['composition'], apiOptions.composition);
    this.populateSelect(this.options['type'], apiOptions.type);
    this.populateSelect(this.options['style'], apiOptions.style);
    this.populateSelect(this.options['background'], apiOptions.background);
    // Populate extras checkboxes using external template
    import('./extras-template.html?raw').then(module => {
      const template = module.default;
      this.options['extras'].innerHTML = apiOptions.extras.map(opt =>
        template.replace(/{{id}}/g, opt.id).replace(/{{name}}/g, opt.name)
      ).join('');
    });
  }

  populateSelect(select, options) {
    if (!select) return;
    options.forEach(opt => {
      const option = document.createElement('option');
      option.value = opt.id;
      option.textContent = opt.name;
      select.appendChild(option);
    });
  }

  addEventListeners() {
    const form = this.options['form'];
    if (form) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const data = new FormData(form);
        const payload = {
          composition: parseInt(data.get('composition'), 10),
          type: parseInt(data.get('type'), 10),
          style: parseInt(data.get('style'), 10),
          background: parseInt(data.get('background'), 10),
          extras: data.getAll('extras').map(x => parseInt(x, 10))
        };
        await this.sendPrompt(payload);
      });
    }
  }

  async sendPrompt(payload) {
    const baseUrl = import.meta.env.VITE_FASTAPI_BASE_URL || 'http://localhost:9000';
    const res = await fetch(`${baseUrl}/api/v1/prompt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const result = await res.json();
    const resultDiv = this.options['result'];
    if (resultDiv) {
      resultDiv.textContent = JSON.stringify(result, null, 2);
    }
  }
}

customElements.define('prompt-generator', PromptGenerator);
