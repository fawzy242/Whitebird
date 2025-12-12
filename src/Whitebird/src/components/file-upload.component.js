/**
 * File Upload Component
 * Drag & drop file upload with preview and progress
 */

import { DOMUtils } from '../utils/dom-utils.js';
import { Validation } from '../utils/validation.js';
import { apiService } from '../services/api/axios.service.js';
import { EventBus } from '../utils/event-bus.js';

export class FileUploadComponent {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      uploadUrl: '/api/upload',
      maxSize: 10, // MB
      allowedTypes: [], // Empty means all types
      multiple: false,
      autoUpload: false,
      showPreview: true,
      dragDrop: true,
      onProgress: null,
      onSuccess: null,
      onError: null,
      ...options,
    };

    this.files = [];
    this.init();
  }

  /**
   * Initialize component
   */
  init() {
    this.createUploadArea();
    this.setupEventListeners();
  }

  /**
   * Create upload area HTML
   */
  createUploadArea() {
    const uploadHTML = `
      <div class="file-upload-area ${this.options.dragDrop ? 'drag-drop' : ''}">
        <div class="upload-zone" data-upload-zone>
          <i class="fas fa-cloud-upload-alt fa-3x mb-3 text-primary"></i>
          <h5>Drag & Drop files here</h5>
          <p class="text-muted">or click to browse</p>
          <input type="file" class="file-input" 
                 ${this.options.multiple ? 'multiple' : ''}
                 accept="${this.getAcceptedTypes()}"
                 hidden>
          <button type="button" class="btn btn-primary mt-2" data-browse-btn>
            <i class="fas fa-folder-open me-2"></i>Browse Files
          </button>
        </div>
        <div class="upload-preview mt-3" data-preview></div>
        <div class="upload-progress mt-3" data-progress hidden>
          <div class="progress">
            <div class="progress-bar progress-bar-striped progress-bar-animated" 
                 role="progressbar" style="width: 0%">0%</div>
          </div>
        </div>
      </div>
    `;

    this.container.innerHTML = uploadHTML;
  }

  /**
   * Get accepted file types
   */
  getAcceptedTypes() {
    if (this.options.allowedTypes.length === 0) return '*';
    return this.options.allowedTypes
      .map((type) => {
        if (type.startsWith('.')) return type;
        return `.${type}`;
      })
      .join(',');
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    const zone = this.container.querySelector('[data-upload-zone]');
    const input = this.container.querySelector('.file-input');
    const browseBtn = this.container.querySelector('[data-browse-btn]');

    // Browse button
    browseBtn.addEventListener('click', () => input.click());

    // File input change
    input.addEventListener('change', (e) => {
      this.handleFiles(Array.from(e.target.files));
    });

    if (this.options.dragDrop) {
      // Drag and drop events
      ['dragenter', 'dragover', 'dragleave', 'drop'].forEach((eventName) => {
        zone.addEventListener(eventName, (e) => {
          e.preventDefault();
          e.stopPropagation();
        });
      });

      ['dragenter', 'dragover'].forEach((eventName) => {
        zone.addEventListener(eventName, () => {
          zone.classList.add('drag-over');
        });
      });

      ['dragleave', 'drop'].forEach((eventName) => {
        zone.addEventListener(eventName, () => {
          zone.classList.remove('drag-over');
        });
      });

      zone.addEventListener('drop', (e) => {
        const files = Array.from(e.dataTransfer.files);
        this.handleFiles(files);
      });
    }
  }

  /**
   * Handle selected files
   */
  handleFiles(files) {
    const validFiles = files.filter((file) => this.validateFile(file));

    if (validFiles.length === 0) return;

    this.files = this.options.multiple ? [...this.files, ...validFiles] : validFiles;

    if (this.options.showPreview) {
      this.showPreview();
    }

    if (this.options.autoUpload) {
      this.upload();
    }

    EventBus.emit('fileupload:selected', { files: this.files });
  }

  /**
   * Validate file
   */
  validateFile(file) {
    // Check file size
    if (!Validation.isValidFileSize(file, this.options.maxSize)) {
      this.showError(`File "${file.name}" exceeds maximum size of ${this.options.maxSize}MB`);
      return false;
    }

    // Check file type
    if (this.options.allowedTypes.length > 0) {
      if (!Validation.isValidFileType(file, this.options.allowedTypes)) {
        this.showError(`File type not allowed: ${file.type}`);
        return false;
      }
    }

    return true;
  }

  /**
   * Show file preview
   */
  showPreview() {
    const preview = this.container.querySelector('[data-preview]');

    const previewHTML = this.files
      .map((file, index) => {
        const isImage = file.type.startsWith('image/');
        const previewUrl = isImage ? URL.createObjectURL(file) : null;

        return `
        <div class="preview-item" data-index="${index}">
          ${
            isImage
              ? `
            <img src="${previewUrl}" alt="${file.name}" class="preview-image">
          `
              : `
            <i class="fas fa-file fa-3x text-secondary"></i>
          `
          }
          <div class="preview-info">
            <strong>${file.name}</strong>
            <small class="text-muted">${this.formatFileSize(file.size)}</small>
          </div>
          <button type="button" class="btn btn-sm btn-danger" data-remove="${index}">
            <i class="fas fa-times"></i>
          </button>
        </div>
      `;
      })
      .join('');

    preview.innerHTML = previewHTML;

    // Remove file handler
    DOMUtils.on(preview, 'click', '[data-remove]', (e) => {
      const index = parseInt(e.currentTarget.dataset.remove);
      this.removeFile(index);
    });
  }

  /**
   * Remove file from list
   */
  removeFile(index) {
    this.files.splice(index, 1);
    this.showPreview();
    EventBus.emit('fileupload:removed', { index });
  }

  /**
   * Upload files
   */
  async upload() {
    if (this.files.length === 0) {
      this.showError('No files selected');
      return;
    }

    const progressContainer = this.container.querySelector('[data-progress]');
    const progressBar = progressContainer.querySelector('.progress-bar');

    progressContainer.hidden = false;

    try {
      for (let i = 0; i < this.files.length; i++) {
        const file = this.files[i];

        await apiService.uploadFile(this.options.uploadUrl, file, (percent) => {
          progressBar.style.width = `${percent}%`;
          progressBar.textContent = `${percent}%`;

          if (this.options.onProgress) {
            this.options.onProgress(percent, file, i);
          }
        });
      }

      progressBar.style.width = '100%';
      progressBar.textContent = 'Complete!';

      if (this.options.onSuccess) {
        this.options.onSuccess(this.files);
      }

      EventBus.emit('fileupload:success', { files: this.files });

      setTimeout(() => {
        progressContainer.hidden = true;
        this.reset();
      }, 2000);
    } catch (error) {
      this.showError('Upload failed: ' + error.message);

      if (this.options.onError) {
        this.options.onError(error);
      }

      EventBus.emit('fileupload:error', { error });
    }
  }

  /**
   * Format file size
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Show error message
   */
  showError(message) {
    EventBus.emit('notification:error', message);
  }

  /**
   * Reset component
   */
  reset() {
    this.files = [];
    const preview = this.container.querySelector('[data-preview]');
    const input = this.container.querySelector('.file-input');

    if (preview) preview.innerHTML = '';
    if (input) input.value = '';
  }

  /**
   * Get files
   */
  getFiles() {
    return this.files;
  }

  /**
   * Destroy component
   */
  destroy() {
    this.reset();
    EventBus.emit('fileupload:destroyed');
  }
}

export default FileUploadComponent;
