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
    this.options['submitBtn'] = this.querySelector('[data-el="submit-btn"]');
    this.options['loading'] = this.querySelector('[data-el="loading"]');
    this.options['imageContainer'] = this.querySelector('[data-el="image-container"]');
    this.options['resultImage'] = this.querySelector('[data-el="result-image"]');
    this.options['downloadBtn'] = this.querySelector('[data-el="download-btn"]');
    this.options['againBtn'] = this.querySelector('[data-el="again-btn"]');
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
        this.showLoading(true);
        await this.sendPrompt(payload);
        this.showLoading(false);
      });
    }
    if (this.options['againBtn']) {
      this.options['againBtn'].addEventListener('click', (e) => {
        e.preventDefault();
        this.setImageState(false);
      });
    }
    // Download handled by <a> tag natively
  }

  showLoading(show = true) {
    if (this.options['submitBtn']) this.options['submitBtn'].style.display = show ? 'none' : '';
    if (this.options['loading']) this.options['loading'].style.display = show ? '' : 'none';
  }

  async sendPrompt(payload) {
    const baseUrl = import.meta.env.VITE_FASTAPI_BASE_URL || 'http://localhost:9000';
    const res = await fetch(`${baseUrl}/api/v1/prompt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      this.showResultImage(url);
    } else {
      // Show error in result div
      const resultDiv = this.options['result'];
      if (resultDiv) {
        let msg = 'Failed to generate image';
        try {
          const err = await res.json();
          msg = err.message || msg;
        } catch {}
        resultDiv.textContent = msg;
      }
    }
  }

  showResultImage(url) {
    // Hide form, show image container
    if (this.options['form']) this.options['form'].classList.add('hidden');
    if (this.options['imageContainer']) this.options['imageContainer'].classList.remove('hidden');
    if (this.options['resultImage']) this.options['resultImage'].src = url;
    if (this.options['downloadBtn']) this.options['downloadBtn'].href = url;
  }

  setImageState(show = true) {
    if (show) {
      if (this.options['form']) this.options['form'].classList.add('hidden');
      if (this.options['imageContainer']) this.options['imageContainer'].classList.remove('hidden');
    } else {
      if (this.options['form']) this.options['form'].classList.remove('hidden');
      if (this.options['imageContainer']) this.options['imageContainer'].classList.add('hidden');
      if (this.options['resultImage']) this.options['resultImage'].src = '';
      if (this.options['downloadBtn']) this.options['downloadBtn'].href = '#';
    }
  }
}

customElements.define('prompt-generator', PromptGenerator);
