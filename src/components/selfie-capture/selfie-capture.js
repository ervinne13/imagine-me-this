import './selfie-capture.scss';
import template from './template.html?raw';

class SelfieCapture extends HTMLElement {
  constructor() {
    super();
    this.states = {
      selfieTaken: false
    };
    this._captureSelfieListener = null;
    this._proceedListener = null;
  }

  setup() {
    this.innerHTML = template;
    this.video = this.querySelector('[data-el="sc-video-preview"]');
    this.canvas = this.querySelector('[data-el="sc-canvas"]');
    this.photo = this.querySelector('[data-el="sc-photo"]');
    this.captureBtn = this.querySelector('[data-el="sc-capture-btn"]');
    this.proceedBtn = this.querySelector('[data-el="sc-proceed-btn"]');

    this.containers = {
      takingState: this.querySelector('[data-container-state="taking"]'),
      takenState: this.querySelector('[data-container-state="taken"]')
    };

    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
      .then(stream => this.video.srcObject = stream)
      .catch(err => alert('Camera access denied: ' + err));
  }

  onCaptureSelfie() {
    // Can't take a frame from <video> directly, we send it over to canvas,
    // then we create an image from the canvas
    const ctx = this.canvas.getContext('2d');
    this.canvas.width = this.video.videoWidth;
    this.canvas.height = this.video.videoHeight;
    ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
    this.photo.src = this.canvas.toDataURL('image/jpeg');

    this.setSelfieTaken(true);
  }

  async onProceed() {
    // Get the data URL from the <img>
    const dataUrl = this.photo.src;
    if (!dataUrl) {
      alert('No selfie to upload!');
      return;
    }
    // Convert dataURL to Blob
    const blob = await (await fetch(dataUrl)).blob();
    const formData = new FormData();
    formData.append('file', blob, 'selfie.jpg');

    // Get backend URL from .env (Vite exposes env vars as import.meta.env)
    const baseUrl = import.meta.env.VITE_FASTAPI_BASE_URL || import.meta.env.FASTAPI_BASE_URL || 'http://localhost:9000';
    try {
      const res = await fetch(`${baseUrl}/api/v1/use-face`, {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      alert(data.message || 'Uploaded!');
    } catch (e) {
      alert('Upload failed: ' + e);
    }
  }

  connectedCallback() {
    this.setup();
    this._captureSelfieListener = this.onCaptureSelfie.bind(this);
    this.captureBtn.addEventListener('click', this._captureSelfieListener);
    this._proceedListener = this.onProceed.bind(this);
    this.proceedBtn.addEventListener('click', this._proceedListener);
  }

  disconnectedCallback() {
    if (this._captureSelfieListener) {
      this.captureBtn.removeEventListener('click', this._captureSelfieListener);
    }
    if (this._proceedListener) {
      this.proceedBtn.removeEventListener('click', this._proceedListener);
    }
  }

  setSelfieTaken(taken = true) {
    this.states.selfieTaken = taken;
    if (taken) {
      this.containers.takingState.classList.add('hidden');
      this.containers.takenState.classList.remove('hidden');
    } else {
      this.containers.takingState.classList.remove('hidden');
      this.containers.takenState.classList.add('hidden');
    }
  }
}

customElements.define('selfie-capture', SelfieCapture);