import './selfie-capture.scss';
import template from './template.html?raw';

class SelfieCapture extends HTMLElement {
  constructor() {
    super();
    this.states = {
      selfieTaken: false
    };

    this._captureSelfieListener = null;
  }

  setup() {
    this.innerHTML = template;
    this.video = this.querySelector('[data-el="sc-video-preview"]');
    this.canvas = this.querySelector('[data-el="sc-canvas"]');
    this.photo = this.querySelector('[data-el="sc-photo"]');
    this.captureBtn = this.querySelector('[data-el="sc-capture-btn"]');

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

  connectedCallback() {
    this.setup();
    this._captureSelfieListener = this.onCaptureSelfie.bind(this);
    this.captureBtn.addEventListener('click', this._captureSelfieListener);
  }

  disconnectedCallback() {
    if (this._captureSelfieListener) {
      this.captureBtn.removeEventListener('click', this._captureSelfieListener);
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