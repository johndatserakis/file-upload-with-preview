import { Events } from './constants/events';
import { UNIQUE_ID_IDENTIFIER } from './constants/file';
import {
  DEFAULT_BACKGROUND_IMAGE,
  DEFAULT_BASE_IMAGE,
  DEFAULT_SUCCESS_FILE_ALT_IMAGE,
  DEFAULT_SUCCESS_PDF_IMAGE,
  DEFAULT_SUCCESS_VIDEO_IMAGE,
} from './constants/images';
import { MULTI_ITEM_CLEAR_ANIMATION_CLASS } from './constants/style';
import {
  DEFAULT_BROWSE_TEXT,
  DEFAULT_CHOOSE_FILE_TEXT,
  DEFAULT_FILES_SELECTED_TEXT,
  DEFAULT_LABEL_TEXT,
} from './constants/text';
import {
  ClearButtonClickedEvent,
  ImageAddedEvent,
  ImageDeletedEvent,
  ImageMultiItemClickedEvent,
} from './types/events';
import { generateUniqueId } from './utils/file';

export interface Text {
  /**
   * Browse button text
   *
   * @default "Browse"
   */
  browse?: string;
  /**
   * Placeholder text
   *
   * @default "Choose file..."
   */
  chooseFile?: string;
  /**
   * Main input label text
   *
   * @default "Upload"
   */
  label?: string;
  /**
   * Count descriptor text. Defaults to `${ n } files selected`.
   *
   * @default "files selected"
   */
  selectedCount?: string;
}

export interface Images {
  /**
   * Background image for image grid
   *
   * @default DEFAULT_BACKGROUND_IMAGE
   */
  backgroundImage?: string;
  /**
   * Placeholder image
   *
   * @default DEFAULT_BASE_IMAGE
   */
  baseImage?: string;
  /**
   * Alternate file upload image
   *
   * @default DEFAULT_SUCCESS_FILE_ALT_IMAGE
   */
  successFileAltImage?: string;
  /**
   * PDF upload image
   *
   * @default DEFAULT_SUCCESS_PDF_IMAGE
   */
  successPdfImage?: string;
  /**
   * Video upload image
   *
   * @default DEFAULT_SUCCESS_VIDEO_IMAGE
   */
  successVideoImage?: string;
}

export type PresetFiles = string[];

/**
 * Options to customize the library
 */
export interface Options {
  /**
   * Type of files to accept in your input
   *
   * @default '*'
   */
  accept?: HTMLInputElement['accept'];
  /**
   * Configurable images for the library
   */
  images?: Images;
  /**
   * Set a maximum number of files you'd like the component to deal with. Must be `> 0` if set. By default there is no limit.
   *
   * @default 0
   */
  maxFileCount?: number;
  /**
   * Set to `true` if you want to allow the user to selected multiple images. Will use grid view in the image preview if set.
   *
   * @default false
   */
  multiple?: boolean;
  /**
   * Provide an array of image paths to be automatically uploaded and displayed on page load (can be images hosted on server or URLs)
   *
   * @default []
   */
  presetFiles?: PresetFiles;
  /**
   * Show a delete button on images in the grid
   *
   * @default true
   */
  showDeleteButtonOnImages?: boolean;
  /**
   * Configurable text for the library
   */
  text?: Text;
}

export type RequiredOptions = Required<Options> & {
  images: Required<Images>;
  text: Required<Text>;
};

export class FileUploadWithPreview {
  /**
   * Currently selected files
   *
   * @default []
   */
  cachedFileArray: File[];
  /**
   * Button to reset the instance
   */
  clearButton: Element;
  /**
   * Main container for the instance
   */
  el: Element;
  /**
   * Display panel for the images
   */
  imagePreview: HTMLDivElement;
  /**
   * Hidden input
   */
  inputHidden: HTMLInputElement;
  /**
   * Visible input
   */
  inputVisible: Element;
  options: RequiredOptions = {
    accept: '*',
    images: {
      backgroundImage: DEFAULT_BACKGROUND_IMAGE,
      baseImage: DEFAULT_BASE_IMAGE,
      successFileAltImage: DEFAULT_SUCCESS_FILE_ALT_IMAGE,
      successPdfImage: DEFAULT_SUCCESS_PDF_IMAGE,
      successVideoImage: DEFAULT_SUCCESS_VIDEO_IMAGE,
    },
    maxFileCount: 0,
    multiple: false,
    presetFiles: [],
    showDeleteButtonOnImages: true,
    text: {
      browse: DEFAULT_BROWSE_TEXT,
      chooseFile: DEFAULT_CHOOSE_FILE_TEXT,
      label: DEFAULT_LABEL_TEXT,
      selectedCount: DEFAULT_FILES_SELECTED_TEXT,
    },
  };
  /**
   * The `id` you set for the instance
   */
  uploadId: string;

  constructor(uploadId: string, options: Options = {}) {
    if (!uploadId) {
      throw new Error(
        'No uploadId found. You must initialize file-upload-with-preview with a unique uploadId.',
      );
    }

    this.uploadId = uploadId;
    this.cachedFileArray = [];

    // Base options
    const { accept, maxFileCount, multiple, presetFiles, showDeleteButtonOnImages } = options;
    this.options.showDeleteButtonOnImages = showDeleteButtonOnImages ?? true;
    this.options.maxFileCount = maxFileCount ?? 0;
    this.options.presetFiles = presetFiles ?? [];
    this.options.multiple = multiple ?? false;
    this.options.accept = accept ?? this.options.accept;

    // Text options
    const { browse, chooseFile, label, selectedCount } = options.text || {};
    this.options.text.chooseFile = chooseFile ?? this.options.text.chooseFile;
    this.options.text.browse = browse ?? this.options.text.browse;
    this.options.text.label = label ?? DEFAULT_LABEL_TEXT;
    this.options.text.selectedCount = selectedCount ?? this.options.text.selectedCount;

    // Elements
    const el = document.querySelector(`.custom-file-container[data-upload-id="${this.uploadId}"]`);

    if (!el) {
      throw new Error(`Could not find a 'custom-file-container' with the id of: ${this.uploadId}`);
    }

    this.el = el;
    this.el.innerHTML += `
      <div class="label-container">
        <label>${this.options.text.label}</label>
        <a class="clear-button" href="javascript:void(0)" title="Clear Image">
          &times;
        </a>
      </div>
      <label class="input-container">
        <input
          accept="${this.options.accept}"
          aria-label="Choose File"
          class="input-hidden"
          id="file-upload-with-preview-${uploadId}"
          ${this.options.multiple ? 'multiple' : ''}
          type="file"
        />
        <span class="input-visible"></span>
      </label>
      <div class="image-preview"></div>
    `;

    const inputHidden = this.el.querySelector('.custom-file-container .input-hidden');
    const inputVisible = this.el.querySelector('.custom-file-container .input-visible');
    const imagePreview = this.el.querySelector('.custom-file-container .image-preview');
    const clearButton = this.el.querySelector('.custom-file-container .clear-button');
    const allRequiredElementsFound =
      inputHidden != null && inputVisible != null && imagePreview != null && clearButton != null;

    if (allRequiredElementsFound) {
      this.inputHidden = inputHidden as HTMLInputElement;
      this.inputVisible = inputVisible;
      this.inputVisible.innerHTML = this.options.text.chooseFile;
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

    this.addImagesFromPath(this.options.presetFiles);
    this.addBrowseButton(this.options.text.browse);
    this.imagePreview.style.backgroundImage = `url("${this.options.images.baseImage}")`;
    this.bindClickEvents();
  }

  bindClickEvents() {
    this.inputHidden.addEventListener(
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
      () => {
        const eventPayload: ClearButtonClickedEvent = {
          detail: {
            uploadId: this.uploadId,
          },
        };
        const clearButtonClickedEvent = new CustomEvent(Events.CLEAR_BUTTON_CLICKED, eventPayload);
        window.dispatchEvent(clearButtonClickedEvent);
        this.resetPreviewPanel();
      },
      true,
    );

    this.imagePreview.addEventListener('click', (e) => {
      const target = e.target as HTMLDivElement;

      if (!target) return;

      if (target.matches('.custom-file-container .image-preview-item-clear-icon')) {
        const fileName = target.getAttribute('data-upload-name');
        const selectedFileIndex = this.cachedFileArray.findIndex(({ name }) => name === fileName);
        this.deleteFileAtIndex(selectedFileIndex);
      }

      if (target.matches('.custom-file-container .image-preview-item')) {
        const clearIcon = target.querySelector('.image-preview-item-clear-icon');
        const fileName = clearIcon?.getAttribute('data-upload-name');
        const fileIndex = this.cachedFileArray.findIndex(({ name }) => name === fileName);

        if (fileIndex < 0) return;

        const eventPayload: ImageMultiItemClickedEvent = {
          detail: {
            cachedFileArray: this.cachedFileArray,
            file: this.cachedFileArray[fileIndex],
            index: fileIndex,
            uploadId: this.uploadId,
          },
        };
        const imageClickedEvent = new CustomEvent(Events.IMAGE_MULTI_ITEM_CLICKED, eventPayload);
        window.dispatchEvent(imageClickedEvent);
      }
    });
  }

  async addImagesFromPath(presetFiles: PresetFiles) {
    presetFiles.forEach(async (path) => {
      try {
        const defaultType = 'image/jpeg';
        const response = await fetch(path, { mode: 'cors' });
        const blob = await response.blob();
        const file = new File([blob], 'preset-file', {
          type: blob.type || defaultType,
        });
        this.addFiles([file]);
      } catch (error) {
        if (error instanceof Error) {
          console.warn(`${error.message.toString()}`);
        }

        console.warn('Image cannot be added to the cachedFileArray.');
      }
    });
  }

  addFiles(files: FileList | File[]) {
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
      const fileWithUniqueName = new File(
        [file],
        `${file.name || 'fallback-name'}${UNIQUE_ID_IDENTIFIER}${generateUniqueId()}`,
        {
          type: file.type,
        },
      );

      this.cachedFileArray.push(fileWithUniqueName);
      this.addFileToPreviewPanel(fileWithUniqueName);
    });

    const eventPayload: ImageAddedEvent = {
      detail: {
        addedFilesCount: fileArray.length,
        cachedFileArray: this.cachedFileArray,
        files,
        uploadId: this.uploadId,
      },
    };
    const imagesAddedEvent = new CustomEvent(Events.IMAGE_ADDED, eventPayload);

    window.dispatchEvent(imagesAddedEvent);
  }

  addFileToPreviewPanel(file: File) {
    if (this.cachedFileArray.length === 0) {
      this.inputVisible.innerHTML = this.options.text.chooseFile;
    } else if (this.cachedFileArray.length === 1) {
      this.inputVisible.textContent = file.name.split(UNIQUE_ID_IDENTIFIER)[0];
    } else {
      this.inputVisible.innerHTML = `${this.cachedFileArray.length} ${this.options.text.selectedCount}`;
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = () => {
      if (!this.options.multiple) {
        let image = this.options.images.successFileAltImage;

        if (
          file.type.match('image/png') ||
          file.type.match('image/jpeg') ||
          file.type.match('image/webp') ||
          file.type.match('image/gif')
        ) {
          image = `url("${reader.result}")`;
        } else if (file.type.match('application/pdf')) {
          image = `url("${this.options.images.successPdfImage}")`;
        } else if (file.type.match('video/*')) {
          image = `url("${this.options.images.successVideoImage}")`;
        }

        this.imagePreview.style.backgroundImage = image;

        return;
      }

      this.imagePreview.style.backgroundImage = `url("${this.options.images.backgroundImage}")`;

      const imageClearContent = (name: string) => `
        <span class="image-preview-item-clear">
          <span class="image-preview-item-clear-icon" data-upload-name="${name}">
            &times;
          </span>
        </span>
      `;

      let backgroundImage: string | ArrayBuffer | null | undefined =
        this.options.images.successFileAltImage;

      if (
        file.type.match('image/png') ||
        file.type.match('image/jpeg') ||
        file.type.match('image/webp') ||
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
          class="image-preview-item"
          data-upload-name="${file.name}"
          style="background-image: url('${backgroundImage}'); "
        >
          ${this.options.showDeleteButtonOnImages ? imageClearContent(file.name) : undefined}
        </div>
      `;
    };
  }

  replaceFiles(files: File[]) {
    if (!files.length) {
      throw new Error('Array must contain at least one file.');
    }

    this.cachedFileArray = files;
    this.refreshPreviewPanel();
  }

  replaceFileAtIndex(file: File, index: number) {
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

    const eventPayload: ImageDeletedEvent = {
      detail: {
        cachedFileArray: this.cachedFileArray,
        currentFileCount: this.cachedFileArray.length,
        index,
        uploadId: this.uploadId,
      },
    };
    const imageDeletedEvent = new CustomEvent(Events.IMAGE_DELETED, eventPayload);
    window.dispatchEvent(imageDeletedEvent);
  }

  refreshPreviewPanel() {
    const timeoutWait = 200; // Match the opacity animation on the MULTI_ITEM_CLEAR_ANIMATION_CLASS
    const imagePreviewItems = this.imagePreview.querySelectorAll('.image-preview-item');
    const imagePreviewItemsArray = Array.from(imagePreviewItems);
    imagePreviewItemsArray.forEach((item) => item.classList.add(MULTI_ITEM_CLEAR_ANIMATION_CLASS));

    // Use the setTimeout to process images after the MULTI_ITEM_CLEAR_ANIMATION_CLASS is done
    setTimeout(() => {
      this.imagePreview.innerHTML = '';

      // Reset the panel if there are no files
      if (!this.cachedFileArray.length) {
        this.resetPreviewPanel();
        return;
      }

      this.cachedFileArray.forEach((file) => this.addFileToPreviewPanel(file));
    }, timeoutWait);
  }

  addBrowseButton(text: string) {
    this.inputVisible.innerHTML += `<span class="browse-button">${text}</span>`;
  }

  emulateInputSelection() {
    this.inputHidden.click();
  }

  resetPreviewPanel() {
    this.inputHidden.value = '';
    this.inputVisible.innerHTML = this.options.text.chooseFile;
    this.addBrowseButton(this.options.text.browse);
    this.imagePreview.style.backgroundImage = `url("${this.options.images.baseImage}")`;
    this.imagePreview.innerHTML = '';
    this.cachedFileArray = [];
  }
}
