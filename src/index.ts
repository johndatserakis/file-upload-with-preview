import './polyfill';
import './index.scss';

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
  baseImage?: string;
  backgroundImage?: string;
  successFileAltImage?: string;
  successPdfImage?: string;
  successVideoImage?: string;
}

type PresetFiles = string[];

interface Options {
  showDeleteButtonOnImages?: boolean;
  text: Text;
  maxFileCount?: number;
  images: Images;
  presetFiles?: PresetFiles;
}

type FileWithProps = File & {
  token: string;
};

export class FileUploadWithPreview {
  uploadId: string;
  cachedFileArray: FileWithProps[];
  currentFileCount: number;
  options: Required<Options> = {
    showDeleteButtonOnImages: true,
    text: {},
    maxFileCount: 0,
    images: {},
    presetFiles: [],
  };
  el: Element;
  input: HTMLInputElement;
  inputLabel: Element;
  imagePreview: HTMLDivElement;
  clearButton: Element;

  constructor(uploadId: string, options: Options = { text: {}, images: {} }) {
    if (!uploadId) {
      throw new Error(
        'No uploadId found. You must initialize file-upload-with-preview with a unique uploadId.',
      );
    }

    this.uploadId = uploadId;

    // Base options
    const { images, maxFileCount, presetFiles, showDeleteButtonOnImages, text } = options;
    this.options.showDeleteButtonOnImages = showDeleteButtonOnImages ?? true;
    this.options.maxFileCount = maxFileCount ?? 0;
    this.cachedFileArray = [];
    this.currentFileCount = 0;
    this.options.presetFiles = presetFiles ?? [];

    if (this.options.presetFiles) {
      // Using thenable promises because we're in the constructor
      this.addImagesFromPath(this.options.presetFiles).catch((error) => {
        console.warn(`${error.toString()}`);
        console.warn('An image you added from a path cannot be added to the cachedFileArray.');
      });
    }

    // Text options
    const { browse, chooseFile, selectedCount } = text;
    this.options.text.chooseFile = chooseFile ?? DEFAULT_CHOOSE_FILE_TEXT;
    this.options.text.browse = browse ?? DEFAULT_BROWSE_TEXT;
    this.options.text.selectedCount = selectedCount ?? DEFAULT_FILES_SELECTED_TEXT;

    // Elements
    const el = document.querySelector(`.custom-file-container[data-upload-id="${this.uploadId}"]`);

    if (!el) {
      throw new Error(`Could not find a 'custom-file-container' with the id of: ${this.uploadId}`);
    }

    this.el = el;

    const input = this.el.querySelector('input[type="file"]');
    const inputLabel = this.el.querySelector(
      '.custom-file-container__custom-file__custom-file-control',
    );
    const imagePreview = this.el.querySelector('.custom-file-container__image-preview');
    const clearButton = this.el.querySelector('.custom-file-container__image-clear');

    if (input && inputLabel && imagePreview && clearButton) {
      console.log('input', input);
      this.input = input as HTMLInputElement;
      this.inputLabel = inputLabel;
      this.inputLabel.innerHTML = this.options.text.chooseFile;
      this.imagePreview = imagePreview as HTMLDivElement;
      this.clearButton = clearButton;
    } else {
      throw new Error(
        `Cannot find all necessary elements. Please make sure you have all the necessary elements in your html for the id: ${this.uploadId}`,
      );
    }

    this.addBrowseButton(this.options.text.browse);

    // Images
    const { backgroundImage, baseImage, successFileAltImage, successPdfImage, successVideoImage } =
      images;
    this.options.images.baseImage = baseImage ?? DEFAULT_BASE_IMAGE;
    this.options.images.successPdfImage = successPdfImage ?? DEFAULT_SUCCESS_PDF_IMAGE;
    this.options.images.successVideoImage = successVideoImage ?? DEFAULT_SUCCESS_VIDEO_IMAGE;
    this.options.images.successFileAltImage = successFileAltImage ?? DEFAULT_SUCCESS_FILE_ALT_IMAGE;
    this.options.images.backgroundImage = backgroundImage ?? DEFAULT_BACKGROUND_IMAGE;
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
      },
      true,
    );

    this.clearButton.addEventListener(
      'click',
      (e) => {
        const clearButtonClickedEvent = new CustomEvent(
          'fileUploadWithPreview:clearButtonClicked',
          {
            detail: {
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              // @ts-ignore
              uploadId: e.target.uploadId,
            },
          },
        );
        window.dispatchEvent(clearButtonClickedEvent);
        this.clearPreviewPanel();
      },
      true,
    );

    this.imagePreview.addEventListener('click', (e) => {
      const target = e.target as HTMLDivElement;

      if (!target) return;

      if (target.matches('.custom-file-container__image-multi-preview__single-image-clear__icon')) {
        const fileToken = target.getAttribute('data-upload-token');
        const selectedFileIndex = this.cachedFileArray.findIndex((x) => x.token === fileToken);
        this.deleteFileAtIndex(selectedFileIndex);
      }
    });
  }

  // Populate the cachedFileArray with images as File objects
  addFiles(files: FileList) {
    // // Grab the current instance
    // const self = this;

    // In this case, the user most likely had hit cancel - which does something
    // a little strange if they had already selected a single or multiple images -
    // it acts like they now have *no* files - which isn't true. We'll just check here
    // for any cached images already captured,
    // and proceed normally. If something *does* want
    // to clear their images, they'll use the clear button on the label we provide.
    if (files.length === 0) return;

    let adjustedFilesLength = files.length;
    if (
      this.options.maxFileCount > 0 &&
      files.length + this.cachedFileArray.length > this.options.maxFileCount
    ) {
      adjustedFilesLength = this.options.maxFileCount - this.cachedFileArray.length;
    }

    // If the input is set to allow multiple files, then we'll add to
    // the existing file count and keep the cachedFileArray. If not,
    // then we'll reset the file count and reset the cachedFileArray
    if (this.input && this.input.multiple) {
      this.currentFileCount += adjustedFilesLength;
    } else {
      this.currentFileCount = adjustedFilesLength;
      this.cachedFileArray = [];
    }

    Array.from(files).forEach((file) => {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      file.token =
        Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      this.cachedFileArray.push(file as FileWithProps);
      this.renderFile(file as FileWithProps);
    });

    const imagesAddedEvent = new CustomEvent('fileUploadWithPreview:imagesAdded', {
      detail: {
        files,
        uploadId: this.uploadId,
        cachedFileArray: this.cachedFileArray,
        addedFilesCount: adjustedFilesLength,
      },
    });
    window.dispatchEvent(imagesAddedEvent);
  }

  // Take a single File object and append it to the image preview panel
  renderFile(file: FileWithProps) {
    if (this.currentFileCount === 0) {
      this.inputLabel.innerHTML = this.options.text.chooseFile || DEFAULT_CHOOSE_FILE_TEXT;
    } else if (this.currentFileCount === 1) {
      this.inputLabel.textContent = file.name;
    } else {
      this.inputLabel.innerHTML = `${this.currentFileCount} ${this.options.text.selectedCount}`;
    }

    this.addBrowseButton(this.options.text.browse || DEFAULT_BROWSE_TEXT);
    this.imagePreview.classList.add('custom-file-container__image-preview--active');

    const reader = new FileReader();
    reader.readAsDataURL(file);

    // Check the file and act accordingly
    reader.onload = () => {
      // We'll pivot here and go through our cases.
      // The logic we've set is basically as follows:
      // If this is an input that only accepts a single image, then just show
      // back that single image each time and their file count is always 1.
      // If they have `multiple` set on the input, then what we'll do is ADD
      // images to the `cachedImageArray`. We'll show the images in a grid style at all times when
      // `multiple` is set on the input. If the user wants to get rid of all the
      // images they'll used the `x` button near the input, or the `x` button on the image.

      // //////////////////////////////////////////////////
      // First, we'll deal with a single selected image //
      // //////////////////////////////////////////////////
      if (!this.input.multiple) {
        if (
          // If png, jpg/jpeg, gif, use the actual image
          file.type.match('image/png') ||
          file.type.match('image/jpeg') ||
          file.type.match('image/gif')
        ) {
          this.imagePreview.style.backgroundImage = `url("${reader.result}")`;
        } else if (file.type.match('application/pdf')) {
          // PDF Upload
          this.imagePreview.style.backgroundImage = `url("${this.options.images.successPdfImage}")`;
        } else if (file.type.match('video/*')) {
          // Video upload
          this.imagePreview.style.backgroundImage = `url("${this.options.images.successVideoImage}")`;
        } else {
          // Everything else
          this.imagePreview.style.backgroundImage = `url("${this.options.images.successFileAltImage}")`;
        }

        return;
      }

      // ////////////////////////////////////////////////////////
      // The next logic set is for a multiple situation, and  //
      // they want to show multiple images                    //
      // ////////////////////////////////////////////////////////
      if (this.input.multiple) {
        // Set the main panel's background image to the blank one here
        this.imagePreview.style.backgroundImage = `url("${this.options.images.backgroundImage}")`;

        // If png, jpg/jpeg, gif, use the actual image
        if (
          file.type.match('image/png') ||
          file.type.match('image/jpeg') ||
          file.type.match('image/gif')
        ) {
          if (this.options.showDeleteButtonOnImages) {
            this.imagePreview.innerHTML += `
              <div
                class="custom-file-container__image-multi-preview"
                data-upload-token="${file.token}"
                style="background-image: url('${reader.result}'); "
              >
                <span class="custom-file-container__image-multi-preview__single-image-clear">
                  <span
                    class="custom-file-container__image-multi-preview__single-image-clear__icon"
                    data-upload-token="${file.token}"
                  >
                    &times;
                  </span>
                </span>
              </div>
            `;
          } else {
            this.imagePreview.innerHTML += `
              <div
                class="custom-file-container__image-multi-preview"
                data-upload-token="${file.token}"
                style="background-image: url('${reader.result}'); "
              />
            `;
          }
        } else if (file.type.match('application/pdf')) {
          // PDF Upload
          if (this.options.showDeleteButtonOnImages) {
            this.imagePreview.innerHTML += `
              <div
                class="custom-file-container__image-multi-preview"
                data-upload-token="${file.token}"
                style="background-image: url('${this.options.images.successPdfImage}'); "
              >
                <span class="custom-file-container__image-multi-preview__single-image-clear">
                  <span
                    class="custom-file-container__image-multi-preview__single-image-clear__icon"
                    data-upload-token="${file.token}"
                  >&times;</span>
                </span>
              </div>
            `;
          } else {
            this.imagePreview.innerHTML += `
              <div
                class="custom-file-container__image-multi-preview"
                data-upload-token="${file.token}"
                style="background-image: url('${this.options.images.successPdfImage}'); "
              />
            `;
          }
        } else if (file.type.match('video/*')) {
          // Video upload
          if (this.options.showDeleteButtonOnImages) {
            this.imagePreview.innerHTML += `
              <div
                class="custom-file-container__image-multi-preview"
                style="background-image: url('${this.options.images.successVideoImage}'); "
                data-upload-token="${file.token}"
              >
                <span class="custom-file-container__image-multi-preview__single-image-clear">
                  <span
                    class="custom-file-container__image-multi-preview__single-image-clear__icon"
                    data-upload-token="${file.token}"
                  >&times;</span>
                </span>
              </div>
            `;
          } else {
            this.imagePreview.innerHTML += `
              <div
                class="custom-file-container__image-multi-preview"
                style="background-image: url('${this.options.images.successVideoImage}'); "
                data-upload-token="${file.token}"
              />
            `;
          }
        } else {
          // Everything else
          // eslint-disable-next-line no-lonely-if
          if (this.options.showDeleteButtonOnImages) {
            this.imagePreview.innerHTML += `
              <div
                class="custom-file-container__image-multi-preview"
                style="background-image: url('${this.options.images.successFileAltImage}'); "
                data-upload-token="${file.token}"
              >
                <span class="custom-file-container__image-multi-preview__single-image-clear">
                  <span
                    class="custom-file-container__image-multi-preview__single-image-clear__icon"
                    data-upload-token="${file.token}"
                  >&times;</span>
                </span>
              </div>
            `;
          } else {
            this.imagePreview.innerHTML += `
              <div
                class="custom-file-container__image-multi-preview"
                style="background-image: url('${this.options.images.successFileAltImage}'); "
                data-upload-token="${file.token}"
              />
            `;
          }
        }
      }
    };
  }

  // Take an array of image paths, convert them to File objects,
  // and display them in the image preview panel
  // https://stackoverflow.com/questions/25046301/convert-url-to-file-or-blob-for-filereader-readasdataurl
  addImagesFromPath(files: PresetFiles) {
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

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (blob) {
          const presetFile = new Blob([blob], {
            type: blob.type,
          });

          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
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

  // Take a single File object and index, replace existing file at that index
  replaceFileAtIndex(file: FileWithProps, index: number) {
    if (!file) {
      throw new Error('No file found.');
    }

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

    this.cachedFileArray.splice(index, 1);
    this.refreshPreviewPanel();

    const imageDeletedEvent = new CustomEvent('fileUploadWithPreview:imageDeleted', {
      detail: {
        index,
        uploadId: this.uploadId,
        cachedFileArray: this.cachedFileArray,
        currentFileCount: this.currentFileCount,
      },
    });
    window.dispatchEvent(imageDeletedEvent);
  }

  refreshPreviewPanel() {
    this.imagePreview.innerHTML = '';
    this.currentFileCount = this.cachedFileArray.length;
    this.cachedFileArray.forEach((file) => this.renderFile(file));

    // If there's no images left after the latest deletion event,
    // then let's reset the panel entirely
    if (!this.cachedFileArray.length) {
      this.clearPreviewPanel();
    }
  }

  addBrowseButton(text: string) {
    this.inputLabel.innerHTML += `<span class="custom-file-container__custom-file__custom-file-control__button">${text}</span>`;
  }

  emulateInputSelection() {
    this.input.click();
  }

  clearPreviewPanel() {
    this.addBrowseButton(this.options.text.browse || DEFAULT_CHOOSE_FILE_TEXT);
    this.input.value = '';
    this.inputLabel.innerHTML = DEFAULT_CHOOSE_FILE_TEXT;
    this.imagePreview.style.backgroundImage = `url("${this.options.images.baseImage}")`;
    this.imagePreview.classList.remove('custom-file-container__image-preview--active');
    this.imagePreview.innerHTML = '';
    this.cachedFileArray = [];
    this.currentFileCount = 0;
  }
}
