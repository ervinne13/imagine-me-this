import './selfie-capture.scss';
import template from './template.html?raw';

class SelfieCapture extends HTMLElement {
  setup() {
    this.video = this.querySelector('#video');
    this.canvas = this.querySelector('#canvas');
    this.photo = this.querySelector('#photo');
    this.captureBtn = this.querySelector('#capture');

    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
      .then(stream => this.video.srcObject = stream)
      .catch(err => alert('Camera access denied: ' + err));

    this.captureBtn.onclick = () => {
      const ctx = this.canvas.getContext('2d');
      this.canvas.width = this.video.videoWidth;
      this.canvas.height = this.video.videoHeight;
      ctx.drawImage(this.video, 0, 0, this.canvas.width, this.canvas.height);
      this.photo.src = this.canvas.toDataURL('image/jpeg');
    };
  }

  connectedCallback() {
    this.innerHTML = template;
    this.setup();
  }
}

customElements.define('selfie-capture', SelfieCapture);