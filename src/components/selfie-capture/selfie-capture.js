import './selfie-capture.scss';

class SelfieCapture extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <div class="selfie-container">
        <video id="video" autoplay playsinline></video>
        <button id="capture">📸 Take Selfie</button>
        <canvas id="canvas" style="display:none;"></canvas>
        <img id="photo" alt="Selfie Preview" />
      </div>
    `;
    this.setup();
  }

  setup() {
    const video = this.querySelector('#video');
    const canvas = this.querySelector('#canvas');
    const photo = this.querySelector('#photo');
    const captureBtn = this.querySelector('#capture');

    navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
      .then(stream => video.srcObject = stream)
      .catch(err => alert('Camera access denied: ' + err));

    captureBtn.onclick = () => {
      const ctx = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      photo.src = canvas.toDataURL('image/jpeg');
    };
  }
}

customElements.define('selfie-capture', SelfieCapture);