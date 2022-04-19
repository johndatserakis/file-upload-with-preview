import './index.scss';

import { DEFAULT_LABEL_TEXT } from './constants/elements';
import { Events } from './constants/events';
import {
  DEFAULT_BACKGROUND_IMAGE,
  DEFAULT_BASE_IMAGE,
  DEFAULT_SUCCESS_FILE_ALT_IMAGE,
  DEFAULT_SUCCESS_PDF_IMAGE,
  DEFAULT_SUCCESS_VIDEO_IMAGE,
} from './constants/images';
import {
  DEFAULT_BROWSE_TEXT,
  DEFAULT_CHOOSE_FILE_TEXT,
  DEFAULT_FILES_SELECTED_TEXT,
} from './constants/text';

interface Text {
  browse?: string;
  chooseFile?: string;
  selectedCount?: string;
}

interface Images {
  backgroundImage?: string;
  baseImage?: string;
  successFileAltImage?: string;
  successPdfImage?: string;
  successVideoImage?: string;
}

type PresetFiles = string[];

interface Options {
  accept?: HTMLInputElement['accept'];
  images?: Images;
  label?: string;
  maxFileCount?: number;
  multiple?: boolean;
  presetFiles?: PresetFiles;
  showDeleteButtonOnImages?: boolean;
  text?: Text;
}

type RequiredOptions = Required<Options> & {
  images: Required<Images>;
  text: Required<Text>;
};

type FileWithProps = File & {
  token: string;
};

export class FileUploadWithPreview {
  cachedFileArray: FileWithProps[];
  clearButton: Element;
  currentFileCount: number;
  el: Element;
  imagePreview: HTMLDivElement;
  input: HTMLInputElement;
  inputLabel: Element;
  uploadId: string;
  options: RequiredOptions = {
    accept: '*',
    images: {
      backgroundImage: DEFAULT_BACKGROUND_IMAGE,
      baseImage: DEFAULT_BASE_IMAGE,
      successFileAltImage: DEFAULT_SUCCESS_FILE_ALT_IMAGE,
      successPdfImage: DEFAULT_SUCCESS_PDF_IMAGE,
      successVideoImage: DEFAULT_SUCCESS_VIDEO_IMAGE,
    },
    label: DEFAULT_LABEL_TEXT,
    maxFileCount: 0,
    multiple: false,
    presetFiles: [],
    showDeleteButtonOnImages: true,
    text: {
      browse: DEFAULT_BROWSE_TEXT,
      chooseFile: DEFAULT_CHOOSE_FILE_TEXT,
      selectedCount: DEFAULT_FILES_SELECTED_TEXT,
    },
  };

  constructor(uploadId: string, options: Options = {}) {
    if (!uploadId) {
      throw new Error(
        'No uploadId found. You must initialize file-upload-with-preview with a unique uploadId.',
      );
    }

    this.uploadId = uploadId;
    this.cachedFileArray = [];
    this.currentFileCount = 0;

    // Base options
    const { label, maxFileCount, multiple, presetFiles, showDeleteButtonOnImages } = options;
    this.options.showDeleteButtonOnImages = showDeleteButtonOnImages ?? true;
    this.options.maxFileCount = maxFileCount ?? 0;
    this.options.presetFiles = presetFiles ?? [];
    this.options.multiple = multiple ?? false;
    this.options.label = label ?? DEFAULT_LABEL_TEXT;

    // Text options
    const { browse, chooseFile, selectedCount } = options.text || {};
    this.options.text.chooseFile = chooseFile ?? this.options.text.chooseFile;
    this.options.text.browse = browse ?? this.options.text.browse;
    this.options.text.selectedCount = selectedCount ?? this.options.text.selectedCount;

    // Elements
    const el = document.querySelector(`.custom-file-container[data-upload-id="${this.uploadId}"]`);

    if (!el) {
      throw new Error(`Could not find a 'custom-file-container' with the id of: ${this.uploadId}`);
    }

    this.el = el;
    this.el.innerHTML += `
      <label>
        ${this.options.label}
        <a
          class="image-clear"
          href="javascript:void(0)"
          title="Clear Image"
        >
          &times;
        </a>
      </label>
      <label class="custom-file">
        <input
          accept="${this.options.accept ? this.options.accept : '*'}"
          aria-label="Choose File"
          class="custom-file-input"
          id="file-upload-with-preview-${uploadId}"
          ${this.options.multiple ? 'multiple' : ''}
          type="file"
        />
        <span class="custom-file-control"></span>
      </label>
      <div class="image-preview"></div>
    `;

    const input = this.el.querySelector('.custom-file-container input[type="file"]');
    const inputLabel = this.el.querySelector('.custom-file-container .custom-file-control');
    const imagePreview = this.el.querySelector('.custom-file-container .image-preview');
    const clearButton = this.el.querySelector('.custom-file-container .image-clear');
    const allRequiredElementsFound =
      input != null && inputLabel != null && imagePreview != null && clearButton != null;

    if (allRequiredElementsFound) {
      this.input = input as HTMLInputElement;
      this.inputLabel = inputLabel;
      this.inputLabel.innerHTML = this.options.text.chooseFile;
      this.imagePreview = imagePreview as HTMLDivElement;
      this.clearButton = clearButton;
    } else {
      throw new Error(`Cannot find all necessary elements for the id: ${this.uploadId}`);
    }

    // Images
    const { backgroundImage, baseImage, successFileAltImage, successPdfImage, successVideoImage } =
      options.images || {};
    this.options.images.baseImage = baseImage ?? this.options.images.baseImage;
    this.options.images.successPdfImage = successPdfImage ?? this.options.images.successPdfImage;
    this.options.images.successVideoImage =
      successVideoImage ?? this.options.images.successVideoImage;
    this.options.images.successFileAltImage =
      successFileAltImage ?? this.options.images.successFileAltImage;
    this.options.images.backgroundImage = backgroundImage ?? this.options.images.backgroundImage;

    // Using thenable promises because we're in the constructor
    if (this.options.presetFiles) {
      this.addImagesFromPath(this.options.presetFiles).catch((error) => {
        console.warn(`${error.toString()}`);
        console.warn('An image you added from a path cannot be added to the cachedFileArray.');
      });
    }

    this.addBrowseButton(this.options.text.browse);

    this.imagePreview.style.backgroundImage = `url("${this.options.images.baseImage}")`;

    this.bindClickEvents();
  }

  bindClickEvents() {
    this.input.addEventListener(
      'change',
      (e) => {
        const target = e.target as HTMLInputElement;
        const { files } = target;
        if (files == null) return;

        this.addFiles(files);

        // Handle issue with the same file being selected
        // https://stackoverflow.com/a/54633061/8014660
        target.value = '';
      },
      true,
    );

    this.clearButton.addEventListener(
      'click',
      (e) => {
        const clearButtonClickedEvent = new CustomEvent(Events.CLEAR_BUTTON_CLICKED, {
          detail: {
            // @ts-ignore
            uploadId: e.target.uploadId,
          },
        });
        window.dispatchEvent(clearButtonClickedEvent);
        this.resetPreviewPanel();
      },
      true,
    );

    this.imagePreview.addEventListener('click', (e) => {
      const target = e.target as HTMLDivElement;

      if (!target) return;

      if (target.matches('.custom-file-container .single-image-clear-icon')) {
        const fileToken = target.getAttribute('data-upload-token');
        const selectedFileIndex = this.cachedFileArray.findIndex((x) => x.token === fileToken);
        this.deleteFileAtIndex(selectedFileIndex);
      }
    });
  }

  addFiles(files: FileList) {
    console.log('addFiles files', files);

    if (!files.length) return;

    let fileArray = Array.from(files);

    if (this.options.multiple && this.options.maxFileCount > 0) {
      const totalFileCount = this.cachedFileArray.length + fileArray.length;
      const differenceFromMax = totalFileCount - this.options.maxFileCount;

      if (differenceFromMax > 0) {
        fileArray = fileArray.slice(0, fileArray.length - differenceFromMax);
      }
    }

    if (!this.options.multiple) {
      this.cachedFileArray = [];
    }

    fileArray.forEach((file) => {
      // @ts-ignore
      file.token =
        Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      this.cachedFileArray.push(file as FileWithProps);
      this.addFileToPreviewPanel(file as FileWithProps);
    });

    const imagesAddedEvent = new CustomEvent(Events.IMAGE_ADDED, {
      detail: {
        addedFilesCount: fileArray.length,
        cachedFileArray: this.cachedFileArray,
        files,
        uploadId: this.uploadId,
      },
    });

    window.dispatchEvent(imagesAddedEvent);
  }

  addFileToPreviewPanel(file: FileWithProps) {
    if (this.cachedFileArray.length === 0) {
      this.inputLabel.innerHTML = this.options.text.chooseFile;
    } else if (this.cachedFileArray.length === 1) {
      this.inputLabel.textContent = file.name;
    } else {
      this.inputLabel.innerHTML = `${this.cachedFileArray.length} ${this.options.text.selectedCount}`;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = () => {
      if (!this.input.multiple) {
        let backgroundImage = this.options.images.successFileAltImage;

        if (
          file.type.match('image/png') ||
          file.type.match('image/jpeg') ||
          file.type.match('image/gif')
        ) {
          backgroundImage = `url("${reader.result}")`;
        } else if (file.type.match('application/pdf')) {
          backgroundImage = `url("${this.options.images.successPdfImage}")`;
        } else if (file.type.match('video/*')) {
          backgroundImage = `url("${this.options.images.successVideoImage}")`;
        }

        this.imagePreview.style.backgroundImage = backgroundImage;

        return;
      }

      this.imagePreview.style.backgroundImage = `url("${this.options.images.backgroundImage}")`;

      const imageClearContent = (token: string) => `
        <span class="single-image-clear">
          <span class="single-image-clear-icon" data-upload-token="${token}">
            &times;
          </span>
        </span>
      `;

      let backgroundImage: string | ArrayBuffer | null | undefined =
        this.options.images.successFileAltImage;

      if (
        file.type.match('image/png') ||
        file.type.match('image/jpeg') ||
        file.type.match('image/gif')
      ) {
        backgroundImage = reader.result;
      } else if (file.type.match('application/pdf')) {
        backgroundImage = this.options.images.successPdfImage;
      } else if (file.type.match('video/*')) {
        backgroundImage = this.options.images.successVideoImage;
      }

      this.imagePreview.innerHTML += `
        <div
          class="image-multi-preview"
          data-upload-token="${file.token}"
          style="background-image: url('${backgroundImage}'); "
        >
          ${this.options.showDeleteButtonOnImages ? imageClearContent(file.token) : undefined}
        </div>
      `;
    };
  }

  addImagesFromPath(files: PresetFiles) {
    // Take an array of image paths and convert them to File objects
    // https://stackoverflow.com/questions/25046301

    // eslint-disable-next-line no-async-promise-executor
    return new Promise<void>(async (resolve, reject) => {
      const presetFiles: Blob[] | FileList = [];

      files.forEach(async (file) => {
        let response;
        let blob: Blob;
        try {
          response = await fetch(file, { mode: 'cors' });
          blob = await response.blob();
        } catch (error) {
          reject(error);
        }

        // @ts-ignore
        if (blob) {
          const presetFile = new Blob([blob], {
            type: blob.type,
          });

          // @ts-ignore
          presetFile.name = file.split('/').pop();
          presetFiles.push(presetFile);
        }
      });

      this.addFiles(presetFiles as unknown as FileList);
      resolve();
    });
  }

  replaceFiles(files: FileWithProps[]) {
    if (!files.length) {
      throw new Error('Array must contain at least one file.');
    }

    this.cachedFileArray = files;
    this.refreshPreviewPanel();
  }

  replaceFileAtIndex(file: FileWithProps, index: number) {
    if (!this.cachedFileArray[index]) {
      throw new Error(`There is no file at index: ${index}`);
    }

    this.cachedFileArray[index] = file;
    this.refreshPreviewPanel();
  }

  deleteFileAtIndex(index: number) {
    if (!this.cachedFileArray[index]) {
      throw new Error(`There is no file at index ${index}`);
    }

    this.cachedFileArray = [
      ...this.cachedFileArray.slice(0, index),
      ...this.cachedFileArray.slice(index + 1),
    ];
    this.refreshPreviewPanel();

    const imageDeletedEvent = new CustomEvent(Events.IMAGE_DELETED, {
      detail: {
        cachedFileArray: this.cachedFileArray,
        currentFileCount: this.cachedFileArray.length,
        index,
        uploadId: this.uploadId,
      },
    });
    window.dispatchEvent(imageDeletedEvent);
  }

  refreshPreviewPanel() {
    this.imagePreview.innerHTML = '';
    this.cachedFileArray.forEach((file) => this.addFileToPreviewPanel(file));

    // Reset the panel if there are no files
    if (!this.cachedFileArray.length) {
      this.resetPreviewPanel();
    }
  }

  addBrowseButton(text: string) {
    this.inputLabel.innerHTML += `<span class="custom-file-control-button">${text}</span>`;
  }

  emulateInputSelection() {
    this.input.click();
  }

  resetPreviewPanel() {
    this.addBrowseButton(this.options.text.browse);
    this.input.value = '';
    this.inputLabel.innerHTML = DEFAULT_CHOOSE_FILE_TEXT;
    this.imagePreview.style.backgroundImage = `url("${this.options.images.baseImage}")`;
    this.imagePreview.innerHTML = '';
    this.cachedFileArray = [];
  }
}
