import {
  DEFAULT_BASE_IMAGE,
  DEFAULT_SUCCESS_PDF_IMAGE,
  DEFAULT_SUCCESS_VIDEO_IMAGE,
  DEFAULT_SUCCESS_FILE_ALT_IMAGE,
  DEFAULT_BACKGROUND_IMAGE,
} from './constants/images';
import './polyfill'; // Fixes matching issue in older ie versions
import './index.scss';
import {
  DEFAULT_CHOOSE_FILE_TEXT,
  DEFAULT_BROWSE_TEXT,
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

interface Options {
  showDeleteButtonOnImages?: boolean;
  text: Text;
  maxFileCount?: number;
  images: Images;
  presetFiles?: string[];
}

type FileWithProps = File & {
  token: string;
};

export class FileUploadWithPreview {
  uploadId: string;
  options: Required<Options> = {
    showDeleteButtonOnImages: true,
    text: {},
    maxFileCount: 0,
    images: {},
    presetFiles: [],
  };
  cachedFileArray: FileWithProps[];
  currentFileCount: number;
  el: Element | null;
  input: HTMLInputElement | null;
  inputLabel: Element | null;
  imagePreview: HTMLDivElement | null;
  clearButton: Element | null;

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
    this.addBrowseButton(this.options.text.browse);

    // Elements
    this.el = document.querySelector(`.custom-file-container[data-upload-id="${this.uploadId}"]`);
    if (!this.el) {
      throw new Error(`Could not find a 'custom-file-container' with the id of: ${this.uploadId}`);
    }
    this.input = this.el.querySelector('input[type="file"]');
    this.inputLabel = this.el.querySelector(
      '.custom-file-container__custom-file__custom-file-control',
    );
    this.imagePreview = this.el.querySelector('.custom-file-container__image-preview');
    this.clearButton = this.el.querySelector('.custom-file-container__image-clear');
    if (this.inputLabel) {
      this.inputLabel.innerHTML = this.options.text.chooseFile;
    }
    const requiredElementsMissing =
      !this.el || !this.input || !this.inputLabel || !this.imagePreview || !this.clearButton;
    if (requiredElementsMissing) {
      throw new Error(
        `Cannot find all necessary elements. Please make sure you have all the necessary elements in your html for the id: ${this.uploadId}`,
      );
    }

    // Images
    const { backgroundImage, baseImage, successFileAltImage, successPdfImage, successVideoImage } =
      images;
    this.options.images = this.options.hasOwnProperty('images') ? this.options.images : {};
    this.options.images.baseImage = baseImage ?? DEFAULT_BASE_IMAGE;
    this.options.images.successPdfImage = successPdfImage ?? DEFAULT_SUCCESS_PDF_IMAGE;
    this.options.images.successVideoImage = successVideoImage ?? DEFAULT_SUCCESS_VIDEO_IMAGE;
    this.options.images.successFileAltImage = successFileAltImage ?? DEFAULT_SUCCESS_FILE_ALT_IMAGE;
    this.options.images.backgroundImage = backgroundImage ?? DEFAULT_BACKGROUND_IMAGE;

    if (this.imagePreview) {
      this.imagePreview.style.backgroundImage = `url("${this.options.images.baseImage}")`;
    }

    // Set click events
    this.bindClickEvents();
  }

  bindClickEvents() {
    if (this.input) {
      this.input.addEventListener(
        'change',
        (e) => {
          const target = e.target as HTMLInputElement;
          const files = target.files;
          this.addFiles(files);
        },
        true,
      );
    }

    if (this.clearButton) {
      this.clearButton.addEventListener(
        'click',
        (e) => {
          const clearButtonClickedEvent = new CustomEvent(
            'fileUploadWithPreview:clearButtonClicked',
            {
              detail: {
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
    }

    if (this.imagePreview) {
      this.imagePreview.addEventListener('click', (e) => {
        const target = e.target as HTMLDivElement;

        if (!target) return;

        if (
          target.matches('.custom-file-container__image-multi-preview__single-image-clear__icon')
        ) {
          const fileToken = target.getAttribute('data-upload-token');
          const selectedFileIndex = this.cachedFileArray.findIndex((x) => x.token === fileToken);
          this.deleteFileAtIndex(selectedFileIndex);
        }
      });
    }
  }

  // Populate the cachedFileArray with images as File objects
  addFiles(files: FileList) {
    // Grab the current instance
    const self = this;

    // In this case, the user most likely had hit cancel - which does something
    // a little strange if they had already selected a single or multiple images -
    // it acts like they now have *no* files - which isn't true. We'll just check here
    // for any cached images already captured,
    // and proceed normally. If something *does* want
    // to clear their images, they'll use the clear button on the label we provide.
    if (files.length === 0) return;

    let adjustedFilesLength = files.length;
    if (
      self.options.maxFileCount > 0 &&
      files.length + self.cachedFileArray.length > self.options.maxFileCount
    ) {
      adjustedFilesLength = self.options.maxFileCount - self.cachedFileArray.length;
    }

    // If the input is set to allow multiple files, then we'll add to
    // the existing file count and keep the cachedFileArray. If not,
    // then we'll reset the file count and reset the cachedFileArray
    if (self.input && self.input.multiple) {
      self.currentFileCount += adjustedFilesLength;
    } else {
      self.currentFileCount = adjustedFilesLength;
      self.cachedFileArray = [];
    }

    // // Now let's loop over the added images and
    // // act accordingly based on if there were multiple images or not
    // // eslint-disable-next-line no-plusplus
    // for (let x = 0; x < adjustedFilesLength; x++) {
    //   // Grab this index's file
    //   const file = files[x];

    //   // To make sure each image can be treated individually, let's give
    //   // each file a unique token
    //   file.token =
    //     Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

    //   // File/files added.
    //   self.cachedFileArray.push(file);

    //   // Process file
    //   self.processFile(file);
    // }

    // Send out our event
    const imagesAddedEvent = new CustomEvent('fileUploadWithPreview:imagesAdded', {
      detail: {
        files,
        uploadId: self.uploadId,
        cachedFileArray: self.cachedFileArray,
        addedFilesCount: adjustedFilesLength,
      },
    });
    window.dispatchEvent(imagesAddedEvent);
  }

  // Take a single File object and append it to the image preview panel
  processFile(file) {
    // Update our input label here based on instance currentFileCount
    if (this.currentFileCount === 0) {
      this.inputLabel.innerHTML = this.options.text.chooseFile;
    } else if (this.currentFileCount === 1) {
      this.inputLabel.textContent = file.name;
    } else {
      this.inputLabel.innerHTML = `${this.currentFileCount} ${this.options.text.selectedCount}`;
    }
    this.addBrowseButton(this.options.text.browse);

    // Apply the 'custom-file-container__image-preview--active' class
    this.imagePreview.classList.add('custom-file-container__image-preview--active');

    // Set up our reader
    const reader = new FileReader();
    reader.readAsDataURL(file);

    // Check the file and act accordingly
    reader.onload = () => {
      // We'll pivot here and go through our cases.
      // The logic we've set is basically as follows:
      // If this is an input that only accepts a single image, then just show
      // back that single image each time, and their file count is always 1.
      // If they have `multiple` set on the input, then what we'll do is ADD
      // images to the `cachedImageArray`. We'll show the images in a grid style at all times when
      // `multiple` is set on the input. If the user wants to get rid of all the
      // images they'll used the `x` button near the input, or the `x` button on the image.

      // //////////////////////////////////////////////////
      // First, we'll deal with a single selected image //
      // //////////////////////////////////////////////////
      if (!this.input.multiple) {
        // If png, jpg/jpeg, gif, use the actual image
        if (
          file.type.match('image/png') ||
          file.type.match('image/jpeg') ||
          file.type.match('image/gif')
        ) {
          this.imagePreview.style.backgroundImage = `url("${reader.result}")`;
        } else if (file.type.match('application/pdf')) {
          // PDF Upload
          this.imagePreview.style.backgroundImage = `url("${this.successPdfImage}")`;
        } else if (file.type.match('video/*')) {
          // Video upload
          this.imagePreview.style.backgroundImage = `url("${this.successVideoImage}")`;
        } else {
          // Everything else
          this.imagePreview.style.backgroundImage = `url("${this.successFileAltImage}")`;
        }
      }

      // ////////////////////////////////////////////////////////
      // The next logic set is for a multiple situation, and  //
      // they want to show multiple images                    //
      // ////////////////////////////////////////////////////////
      if (this.input.multiple) {
        // Set the main panel's background image to the blank one here
        this.imagePreview.style.backgroundImage = `url("${this.backgroundImage}")`;

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
              ></div>
            `;
          }
        } else if (file.type.match('application/pdf')) {
          // PDF Upload
          if (this.options.showDeleteButtonOnImages) {
            this.imagePreview.innerHTML += `
              <div
                class="custom-file-container__image-multi-preview"
                data-upload-token="${file.token}"
                style="background-image: url('${this.successPdfImage}'); "
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
                style="background-image: url('${this.successPdfImage}'); "
              ></div>
            `;
          }
        } else if (file.type.match('video/*')) {
          // Video upload
          if (this.options.showDeleteButtonOnImages) {
            this.imagePreview.innerHTML += `
              <div
                class="custom-file-container__image-multi-preview"
                style="background-image: url('${this.successVideoImage}'); "
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
                style="background-image: url('${this.successVideoImage}'); "
                data-upload-token="${file.token}"
              ></div>
            `;
          }
        } else {
          // Everything else
          // eslint-disable-next-line no-lonely-if
          if (this.options.showDeleteButtonOnImages) {
            this.imagePreview.innerHTML += `
              <div
                class="custom-file-container__image-multi-preview"
                style="background-image: url('${this.successFileAltImage}'); "
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
                style="background-image: url('${this.successFileAltImage}'); "
                data-upload-token="${file.token}"
              ></div>
            `;
          }
        }
      }
    };
  }

  // Take an array of image paths, convert them to File objects,
  // and display them in the image preview panel
  // https://stackoverflow.com/questions/25046301/convert-url-to-file-or-blob-for-filereader-readasdataurl
  addImagesFromPath(files) {
    return new Promise(async (resolve, reject) => {
      const presetFiles = [];

      // eslint-disable-next-line no-plusplus
      for (let x = 0; x < files.length; x++) {
        /* eslint-disable no-await-in-loop */

        let response;
        let blob;
        try {
          // Grab the file using fetch
          response = await fetch(files[x], { mode: 'cors' });

          // Create a blob of your file
          blob = await response.blob();
        } catch (error) {
          reject(error);
          // eslint-disable-next-line no-continue
          continue;
        }

        /* eslint-enable no-await-in-loop */

        // Create blob and added
        const presetFile = new Blob([blob], {
          type: blob.type,
        });

        presetFile.name = files[x].split('/').pop();
        presetFiles.push(presetFile);
      }

      this.addFiles(presetFiles);
      resolve();
    });
  }

  // Take an array of File objects and display them in the image preview panel
  replaceFiles(files) {
    if (!files.length) {
      throw new Error('Array must contain at least one file.');
    }

    this.cachedFileArray = files;
    this.refreshPreviewPanel();
  }

  // Take a single File object and index, replace existing file at that index
  replaceFileAtIndex(file, index) {
    if (!file) {
      throw new Error('No file found.');
    }

    if (!this.cachedFileArray[index]) {
      throw new Error('There is no file at index', index);
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

    // Send out our deletion event
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
    if (this.imagePreview) {
      this.imagePreview.innerHTML = '';
    }

    this.currentFileCount = this.cachedFileArray.length;
    this.cachedFileArray.forEach((file) => this.processFile(file));

    // If there's no images left after the latest deletion event,
    // then let's reset the panel entirely
    if (!this.cachedFileArray.length) {
      this.clearPreviewPanel();
    }
  }

  addBrowseButton(text: string) {
    if (!this.inputLabel) return;

    this.inputLabel.innerHTML += `<span class="custom-file-container__custom-file__custom-file-control__button">${text}</span>`;
  }

  emulateInputSelection() {
    if (!this.input) return;

    this.input.click();
  }

  clearPreviewPanel() {
    this.addBrowseButton(this.options.text.browse || DEFAULT_CHOOSE_FILE_TEXT);

    if (this.input) {
      this.input.value = '';
    }

    if (this.inputLabel) {
      this.inputLabel.innerHTML = DEFAULT_CHOOSE_FILE_TEXT;
    }

    if (this.imagePreview) {
      this.imagePreview.style.backgroundImage = `url("${this.options.images.baseImage}")`;
      this.imagePreview.classList.remove('custom-file-container__image-preview--active');
      this.imagePreview.innerHTML = '';
    }

    this.cachedFileArray = [];
    this.currentFileCount = 0;
  }
}
