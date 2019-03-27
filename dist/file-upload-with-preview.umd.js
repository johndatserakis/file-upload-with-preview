(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.FileUploadWithPreview = factory());
}(this, function () { 'use strict';

  /* eslint-disable */

  // this is for matches in older ie browsers
  if (!Element.prototype.matches) {
      Element.prototype.matches =
      Element.prototype.matchesSelector ||
      Element.prototype.mozMatchesSelector ||
      Element.prototype.msMatchesSelector ||
      Element.prototype.oMatchesSelector ||
      Element.prototype.webkitMatchesSelector ||
      function(s) {
          var matches = (this.document || this.ownerDocument).querySelectorAll(s),
          i = matches.length;
          while (--i >= 0 && matches.item(i) !== this) {}
              return i > -1;
      };
  }

  // https://tc39.github.io/ecma262/#sec-array.prototype.findindex
  if (!Array.prototype.findIndex) {
      Object.defineProperty(Array.prototype, 'findIndex', {
          value: function(predicate) {
              // 1. Let O be ? ToObject(this value).
              if (this == null) {
                  throw new TypeError('"this" is null or not defined');
              }

              var o = Object(this);

              // 2. Let len be ? ToLength(? Get(O, "length")).
              var len = o.length >>> 0;

              // 3. If IsCallable(predicate) is false, throw a TypeError exception.
              if (typeof predicate !== 'function') {
                  throw new TypeError('predicate must be a function');
              }

              // 4. If thisArg was supplied, let T be thisArg; else let T be undefined.
              var thisArg = arguments[1];

              // 5. Let k be 0.
              var k = 0;

              // 6. Repeat, while k < len
              while (k < len) {
                  // a. Let Pk be ! ToString(k).
                  // b. Let kValue be ? Get(O, Pk).
                  // c. Let testResult be ToBoolean(? Call(predicate, T, « kValue, k, O »)).
                  // d. If testResult is true, return k.
                  var kValue = o[k];
                  if (predicate.call(thisArg, kValue, k, o)) {
                      return k;
                  }
                  // e. Increase k by 1.
                  k++;
              }

              // 7. Return -1.
              return -1;
          },
          configurable: true,
          writable: true
      });
  }

  // this is for custom events in older ie browsers
  // https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/CustomEvent
  (function () {

    if ( typeof window.CustomEvent === "function" ) { return false; }

    function CustomEvent ( event, params ) {
      params = params || { bubbles: false, cancelable: false, detail: null };
      var evt = document.createEvent( 'CustomEvent' );
      evt.initCustomEvent( event, params.bubbles, params.cancelable, params.detail );
      return evt;
     }

    CustomEvent.prototype = window.Event.prototype;

    window.CustomEvent = CustomEvent;
  })();

  /* eslint-enable */

  var FileUploadWithPreview = function FileUploadWithPreview(uploadId, options) {
      // Make sure uploadId was specified
      if (!uploadId) { throw new Error('No uploadId found. You must initialize file-upload-with-preview with a unique uploadId.') }

      // Set initial variables
      this.uploadId = uploadId;
      this.options = options || {};
      this.options.showDeleteButtonOnImages = (this.options.hasOwnProperty('showDeleteButtonOnImages')) ? this.options.showDeleteButtonOnImages : true;
      this.options.text = (this.options.hasOwnProperty('text')) ? this.options.text : { chooseFile: 'Choose file...' };
      this.options.text.chooseFile = (this.options.text.hasOwnProperty('chooseFile')) ? this.options.text.chooseFile : 'Choose file...';
      this.options.text.browse = (this.options.text.hasOwnProperty('browse')) ? this.options.text.browse : 'Browse';
      this.cachedFileArray = [];
      this.selectedFilesCount = 0;

      // Grab the custom file container elements
      this.el = document.querySelector((".custom-file-container[data-upload-id=\"" + (this.uploadId) + "\"]"));
      if (!this.el) { throw new Error(("Could not find a 'custom-file-container' with the id of: " + (this.uploadId))) }
      this.input = this.el.querySelector('input[type="file"]');
      this.inputLabel = this.el.querySelector('.custom-file-container__custom-file__custom-file-control');
      this.imagePreview = this.el.querySelector('.custom-file-container__image-preview');
      this.clearButton = this.el.querySelector('.custom-file-container__image-clear');
      this.inputLabel.innerHTML = this.options.text.chooseFile;
      this.addBrowseButton(this.options.text.browse);

      // Make sure all elements have been attached
      if (!this.el || !this.input || !this.inputLabel || !this.imagePreview || !this.clearButton) {
          throw new Error(("Cannot find all necessary elements. Please make sure you have all the necessary elements in your html for the id: " + (this.uploadId)))
      }

      // Check if images option is set
      this.options.images = (this.options.hasOwnProperty('images')) ? this.options.images : {};
      // Set the base64 background images
      this.baseImage = (this.options.images.hasOwnProperty('baseImage')) ? this.options.images.baseImage : './src/assets/images/base-image.svg';
      this.successPdfImage = (this.options.images.hasOwnProperty('successPdfImage')) ? this.options.images.successPdfImage : './src/assets/images/pdf-success.svg';
      this.successVideoImage = (this.options.images.hasOwnProperty('successVideoImage')) ? this.options.images.successVideoImage : './src/assets/images/video-success.svg';
      this.successFileAltImage = (this.options.images.hasOwnProperty('successFileAltImage')) ? this.options.images.successFileAltImage : './src/assets/images/file-alt-success.svg';
      this.backgroundImage = (this.options.images.hasOwnProperty('backgroundImage')) ? this.options.images.backgroundImage : './src/assets/images/background.svg';

      // Set click events
      this.bindClickEvents();

      // Let's set the placeholder image
      this.imagePreview.style.backgroundImage = "url(\"" + (this.baseImage) + "\")";
  };

  FileUploadWithPreview.prototype.bindClickEvents = function bindClickEvents () {
          var this$1 = this;

      // Grab the current instance
      var self = this;

      // Deal with the change event on the input
      self.input.addEventListener('change', function () {
          // In this case, the user most likely had hit cancel - which does something
          // a little strange if they had already selected a single or multiple images -
          // it acts like they now have *no* files - which isn't true. We'll just check here
          // for any cached images already captured,
          // and proceed normally. If something *does* want
          // to clear their images, they'll use the clear button on the label we provide.
          if (this.files.length === 0) { return }

          // If the input is set to allow multiple files, then we'll add to
          // the existing file count and keep the cachedFileArray. If not,
          // then we'll reset the file count and reset the cachedFileArray
          if (self.input.multiple) {
              self.selectedFilesCount += this.files.length;
          } else {
              self.selectedFilesCount = this.files.length;
              self.cachedFileArray = [];
          }

          // Now let's loop over the selected images and
          // act accordingly based on there were multiple images or not
          for (var x = 0; x < this.files.length; x++) {
              // Grab this index's file
              var file = this.files[x];

              // To make sure each image can be treated individually, let's give
              // each file a unique token
              file.token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

              // File/files selected.
              self.cachedFileArray.push(file);

              // Process the image in our loop
              self.processFile(file);
          }

          // Send out our event
          var imageSelectedEvent = new CustomEvent('fileUploadWithPreview:imageSelected', {
              detail: {
                  uploadId: self.uploadId,
                  cachedFileArray: self.cachedFileArray,
                  selectedFilesCount: self.selectedFilesCount,
              },
          });
          window.dispatchEvent(imageSelectedEvent);
      }, true);

      // Listen for the clear button
      this.clearButton.addEventListener('click', function () {
          this$1.clearImagePreviewPanel();
      }, true);

      // Listen for individual clear buttons on images
      this.imagePreview.addEventListener('click', function (event) {

          // Listen for the specific click of a clear button
          if (event.target.matches('.custom-file-container__image-multi-preview__single-image-clear__icon')) {
              // Grab the clicked function
              var clearFileButton = event.target;

              // Get its token
              var fileToken = clearFileButton.getAttribute('data-upload-token');

              // Get the index of the file
              var selectedFileIndex = this$1.cachedFileArray.findIndex(function (x) { return x.token === fileToken; });

              this$1.deleteImageAtIndex(selectedFileIndex);
          }
      });
  };

  FileUploadWithPreview.prototype.deleteImageAtIndex = function deleteImageAtIndex (selectedFileIndex) {
      // check if index exists
      if (!this.cachedFileArray[selectedFileIndex]) {
          console.log('There is no file at index', selectedFileIndex);
      }

      // Remove the file from the array
      this.cachedFileArray.splice(selectedFileIndex, 1);

      // Call function to reset the preview
      this.resetImagePreviewPanel();

      // If there's no images left after the latest deletion event,
      // then let's reset the panel entirely
      if (!this.cachedFileArray.length) {
          this.clearImagePreviewPanel();
      }

      // Send out our deletion event
      var imageDeletedEvent = new CustomEvent('fileUploadWithPreview:imageDeleted', {
          detail: {
              uploadId: this.uploadId,
              cachedFileArray: this.cachedFileArray,
              selectedFilesCount: this.selectedFilesCount,
          },
      });
      window.dispatchEvent(imageDeletedEvent);
  };

  FileUploadWithPreview.prototype.resetImagePreviewPanel = function resetImagePreviewPanel () {
          var this$1 = this;

      // Clear the imagePreview pane
      this.imagePreview.innerHTML = '';

      // Reset our selectedFilesCount with the new proper count
      this.selectedFilesCount = this.cachedFileArray.length;

      // Load back up the images in the pane with the new updated cachedFileArray
      this.cachedFileArray.forEach(function (file) { return this$1.processFile(file); });
  };

  FileUploadWithPreview.prototype.processFile = function processFile (file) {
          var this$1 = this;

      // Update our input label here based on instance selectedFilesCount
      if (this.selectedFilesCount === 0) {
          this.inputLabel.innerHTML = this.options.text.chooseFile;
      } else if (this.selectedFilesCount === 1) {
          this.inputLabel.innerHTML = file.name;
      } else {
          this.inputLabel.innerHTML = (this.selectedFilesCount) + " files selected";
      }
      this.addBrowseButton(this.options.text.browse);

      // Apply the 'custom-file-container__image-preview--active' class
      this.imagePreview.classList.add('custom-file-container__image-preview--active');

      // Set up our reader
      var reader = new FileReader();
      reader.readAsDataURL(file);

      // Check the file and act accordingly
      reader.onload = function () {
          // We'll pivot here and go through our cases.
          // The logic we've set is basically as follows:
          // If this is an input that only accepts a single image, then just show
          // back that single image each time, and their file count is always 1.
          // If they have `multiple` set on the input, then what we'll do is ADD
          // images to the `cachedImageArray`. We'll show the images in a grid style at all times when
          // `multiple` is set on the input. If the user wants to get rid of all the
          // images they'll used the `x` button near the input, or the `x` button on the image.

          ////////////////////////////////////////////////////
          // First, we'll deal with a single selected image //
          ////////////////////////////////////////////////////
          if (!this$1.input.multiple) {
              //If png, jpg/jpeg, gif, use the actual image
              if (file.type.match('image/png') || file.type.match('image/jpeg') || file.type.match('image/gif')) {
                  this$1.imagePreview.style.backgroundImage = "url(\"" + (reader.result) + "\")";
              } else if (file.type.match('application/pdf')) { //PDF Upload
                  this$1.imagePreview.style.backgroundImage = "url(\"" + (this$1.successPdfImage) + "\")";
              } else if (file.type.match('video/*')) { //Video upload
                  this$1.imagePreview.style.backgroundImage = "url(\"" + (this$1.successVideoImage) + "\")";
              } else { //Everything else
                  this$1.imagePreview.style.backgroundImage = "url(\"" + (this$1.successFileAltImage) + "\")";
              }
          }

          //////////////////////////////////////////////////////////
          // The next logic set is for a multiple situation, and  //
          // they want to show multiple images                //
          //////////////////////////////////////////////////////////
          if (this$1.input.multiple) {
              // Set the main panel's background image to the blank one here
              this$1.imagePreview.style.backgroundImage = "url(\"" + (this$1.backgroundImage) + "\")";

              //If png, jpg/jpeg, gif, use the actual image
              if (file.type.match('image/png') || file.type.match('image/jpeg') || file.type.match('image/gif')) {
                  if (this$1.options.showDeleteButtonOnImages) {
                      this$1.imagePreview.innerHTML += "\n                            <div>\n                                <span\n                                    class=\"custom-file-container__image-multi-preview\"\n                                    style=\"background-image: url('" + (reader.result) + "'); \"\n                                >\n                                    <span class=\"custom-file-container__image-multi-preview__single-image-clear\">\n                                        <span\n                                            class=\"custom-file-container__image-multi-preview__single-image-clear__icon\"\n                                            data-upload-token=\"" + (file.token) + "\"\n                                        >&times;</span>\n                                    </span>\n                                </span>\n\n                            </div>\n                        ";
                  } else {
                      this$1.imagePreview.innerHTML += "\n                            <div>\n                                <span\n                                    class=\"custom-file-container__image-multi-preview\"\n                                    style=\"background-image: url('" + (reader.result) + "'); \"\n                                ></span>\n                            </div>\n                        ";
                  }
              } else if (file.type.match('application/pdf')) { //PDF Upload
                  if (this$1.options.showDeleteButtonOnImages) {
                      this$1.imagePreview.innerHTML += "\n                            <div>\n                                <span\n                                    class=\"custom-file-container__image-multi-preview\"\n                                    style=\"background-image: url('" + (this$1.successPdfImage) + "'); \"\n                                >\n                                    <span class=\"custom-file-container__image-multi-preview__single-image-clear\">\n                                        <span\n                                            class=\"custom-file-container__image-multi-preview__single-image-clear__icon\"\n                                            data-upload-token=\"" + (file.token) + "\"\n                                        >&times;</span>\n                                    </span>\n                                </span>\n\n                            </div>\n                        ";
                  } else {
                      this$1.imagePreview.innerHTML += "\n                            <div>\n                                <span\n                                    class=\"custom-file-container__image-multi-preview\"\n                                    style=\"background-image: url('" + (this$1.successPdfImage) + "'); \"\n                                ></span>\n                            </div>\n                        ";
                  }
              } else if (file.type.match('video/*')) { //Video upload
                  if (this$1.options.showDeleteButtonOnImages) {
                      this$1.imagePreview.innerHTML += "\n                            <div>\n                                <span\n                                    class=\"custom-file-container__image-multi-preview\"\n                                    style=\"background-image: url('" + (this$1.successVideoImage) + "'); \"\n                                >\n                                    <span class=\"custom-file-container__image-multi-preview__single-image-clear\">\n                                        <span\n                                            class=\"custom-file-container__image-multi-preview__single-image-clear__icon\"\n                                            data-upload-token=\"" + (file.token) + "\"\n                                        >&times;</span>\n                                    </span>\n                                </span>\n\n                            </div>\n                        ";
                  } else {
                      this$1.imagePreview.innerHTML += "\n                            <div>\n                                <span\n                                    class=\"custom-file-container__image-multi-preview\"\n                                    style=\"background-image: url('" + (this$1.successVideoImage) + "'); \"\n                                ></span>\n                            </div>\n                        ";
                  }
              } else { //Everything else
                  if (this$1.options.showDeleteButtonOnImages) {
                      this$1.imagePreview.innerHTML += "\n                            <div>\n                                <span\n                                    class=\"custom-file-container__image-multi-preview\"\n                                    style=\"background-image: url('" + (this$1.successFileAltImage) + "'); \"\n                                >\n                                    <span class=\"custom-file-container__image-multi-preview__single-image-clear\">\n                                        <span\n                                            class=\"custom-file-container__image-multi-preview__single-image-clear__icon\"\n                                            data-upload-token=\"" + (file.token) + "\"\n                                        >&times;</span>\n                                    </span>\n                                </span>\n\n                            </div>\n                        ";
                  } else {
                      this$1.imagePreview.innerHTML += "\n                            <div>\n                                <span\n                                    class=\"custom-file-container__image-multi-preview\"\n                                    style=\"background-image: url('" + (this$1.successFileAltImage) + "'); \"\n                                ></span>\n                            </div>\n                        ";
                  }
              }
          }
      };
  };

  FileUploadWithPreview.prototype.addBrowseButton = function addBrowseButton (text) {
      this.inputLabel.innerHTML += "<span class=\"custom-file-container__custom-file__custom-file-control__button\"> " + text + " </span>";
  };

  FileUploadWithPreview.prototype.selectImage = function selectImage () {
      this.input.click();
  };

  FileUploadWithPreview.prototype.clearImagePreviewPanel = function clearImagePreviewPanel () {
      this.input.value = '';
      this.inputLabel.innerHTML = this.options.text.chooseFile;
      this.addBrowseButton(this.options.text.browse);
      this.imagePreview.style.backgroundImage = "url(\"" + (this.baseImage) + "\")";
      this.imagePreview.classList.remove('custom-file-container__image-preview--active');
      this.cachedFileArray = [];
      this.imagePreview.innerHTML = '';
      this.selectedFilesCount = 0;
  };

  return FileUploadWithPreview;

}));
