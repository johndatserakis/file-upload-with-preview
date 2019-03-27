import './file-upload-with-preview.scss'

// fixes matching issue in older ie versions
import './polyfill'

export default class FileUploadWithPreview {

    constructor(uploadId, options) {
        // Make sure uploadId was specified
        if (!uploadId) { throw new Error('No uploadId found. You must initialize file-upload-with-preview with a unique uploadId.') }

        // Set initial variables
        this.uploadId = uploadId
        this.options = options || {}
        this.options.showDeleteButtonOnImages = (this.options.hasOwnProperty('showDeleteButtonOnImages')) ? this.options.showDeleteButtonOnImages : true
        this.options.text = (this.options.hasOwnProperty('text')) ? this.options.text : { chooseFile: 'Choose file...' }
        this.options.text.chooseFile = (this.options.text.hasOwnProperty('chooseFile')) ? this.options.text.chooseFile : 'Choose file...'
        this.options.text.browse = (this.options.text.hasOwnProperty('browse')) ? this.options.text.browse : 'Browse'
        this.cachedFileArray = []
        this.selectedFilesCount = 0

        // Grab the custom file container elements
        this.el = document.querySelector(`.custom-file-container[data-upload-id="${ this.uploadId }"]`)
        if (!this.el) { throw new Error(`Could not find a 'custom-file-container' with the id of: ${ this.uploadId }`) }
        this.input = this.el.querySelector('input[type="file"]')
        this.inputLabel = this.el.querySelector('.custom-file-container__custom-file__custom-file-control')
        this.imagePreview = this.el.querySelector('.custom-file-container__image-preview')
        this.clearButton = this.el.querySelector('.custom-file-container__image-clear')
        this.inputLabel.innerHTML = this.options.text.chooseFile
        this.addBrowseButton(this.options.text.browse)

        // Make sure all elements have been attached
        if (!this.el || !this.input || !this.inputLabel || !this.imagePreview || !this.clearButton) {
            throw new Error(`Cannot find all necessary elements. Please make sure you have all the necessary elements in your html for the id: ${ this.uploadId }`)
        }

        // Check if images option is set
        this.options.images = (this.options.hasOwnProperty('images')) ? this.options.images : {}
        // Set the base64 background images
        this.baseImage = (this.options.images.hasOwnProperty('baseImage')) ? this.options.images.baseImage : './src/assets/images/base-image.svg'
        this.successPdfImage = (this.options.images.hasOwnProperty('successPdfImage')) ? this.options.images.successPdfImage : './src/assets/images/pdf-success.svg'
        this.successVideoImage = (this.options.images.hasOwnProperty('successVideoImage')) ? this.options.images.successVideoImage : './src/assets/images/video-success.svg'
        this.successFileAltImage = (this.options.images.hasOwnProperty('successFileAltImage')) ? this.options.images.successFileAltImage : './src/assets/images/file-alt-success.svg'
        this.backgroundImage = (this.options.images.hasOwnProperty('backgroundImage')) ? this.options.images.backgroundImage : './src/assets/images/background.svg'

        // Set click events
        this.bindClickEvents()

        // Let's set the placeholder image
        this.imagePreview.style.backgroundImage = `url("${ this.baseImage }")`
    }

    bindClickEvents() {
        // Grab the current instance
        const self = this

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
                self.selectedFilesCount += this.files.length
            } else {
                self.selectedFilesCount = this.files.length
                self.cachedFileArray = []
            }

            // Now let's loop over the selected images and
            // act accordingly based on there were multiple images or not
            for (let x = 0; x < this.files.length; x++) {
                // Grab this index's file
                let file = this.files[x]

                // To make sure each image can be treated individually, let's give
                // each file a unique token
                file.token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

                // File/files selected.
                self.cachedFileArray.push(file)

                // Process the image in our loop
                self.processFile(file)
            }

            // Send out our event
            let imageSelectedEvent = new CustomEvent('fileUploadWithPreview:imageSelected', {
                detail: {
                    uploadId: self.uploadId,
                    cachedFileArray: self.cachedFileArray,
                    selectedFilesCount: self.selectedFilesCount,
                },
            })
            window.dispatchEvent(imageSelectedEvent)
        }, true)

        // Listen for the clear button
        this.clearButton.addEventListener('click', () => {
            this.clearImagePreviewPanel()
        }, true)

        // Listen for individual clear buttons on images
        this.imagePreview.addEventListener('click', (event) => {

            // Listen for the specific click of a clear button
            if (event.target.matches('.custom-file-container__image-multi-preview__single-image-clear__icon')) {
                // Grab the clicked function
                let clearFileButton = event.target

                // Get its token
                let fileToken = clearFileButton.getAttribute('data-upload-token')

                // Get the index of the file
                let selectedFileIndex = this.cachedFileArray.findIndex(x => x.token === fileToken)

                this.deleteImageAtIndex(selectedFileIndex)
            }
        })
    }

    deleteImageAtIndex(selectedFileIndex) {
        // check if index exists
        if (!this.cachedFileArray[selectedFileIndex]) {
            console.log('There is no file at index', selectedFileIndex)
        }

        // Remove the file from the array
        this.cachedFileArray.splice(selectedFileIndex, 1)

        // Call function to reset the preview
        this.resetImagePreviewPanel()

        // If there's no images left after the latest deletion event,
        // then let's reset the panel entirely
        if (!this.cachedFileArray.length) {
            this.clearImagePreviewPanel()
        }

        // Send out our deletion event
        let imageDeletedEvent = new CustomEvent('fileUploadWithPreview:imageDeleted', {
            detail: {
                uploadId: this.uploadId,
                cachedFileArray: this.cachedFileArray,
                selectedFilesCount: this.selectedFilesCount,
            },
        })
        window.dispatchEvent(imageDeletedEvent)
    }

    resetImagePreviewPanel() {
        // Clear the imagePreview pane
        this.imagePreview.innerHTML = ''

        // Reset our selectedFilesCount with the new proper count
        this.selectedFilesCount = this.cachedFileArray.length

        // Load back up the images in the pane with the new updated cachedFileArray
        this.cachedFileArray.forEach(file => this.processFile(file))
    }

    processFile(file) {
        // Update our input label here based on instance selectedFilesCount
        if (this.selectedFilesCount === 0) {
            this.inputLabel.innerHTML = this.options.text.chooseFile
        } else if (this.selectedFilesCount === 1) {
            this.inputLabel.innerHTML = file.name
        } else {
            this.inputLabel.innerHTML = `${ this.selectedFilesCount } files selected`
        }
        this.addBrowseButton(this.options.text.browse)

        // Apply the 'custom-file-container__image-preview--active' class
        this.imagePreview.classList.add('custom-file-container__image-preview--active')

        // Set up our reader
        let reader = new FileReader()
        reader.readAsDataURL(file)

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

            ////////////////////////////////////////////////////
            // First, we'll deal with a single selected image //
            ////////////////////////////////////////////////////
            if (!this.input.multiple) {
                //If png, jpg/jpeg, gif, use the actual image
                if (file.type.match('image/png') || file.type.match('image/jpeg') || file.type.match('image/gif')) {
                    this.imagePreview.style.backgroundImage = `url("${ reader.result }")`
                } else if (file.type.match('application/pdf')) { //PDF Upload
                    this.imagePreview.style.backgroundImage = `url("${ this.successPdfImage }")`
                } else if (file.type.match('video/*')) { //Video upload
                    this.imagePreview.style.backgroundImage = `url("${ this.successVideoImage }")`
                } else { //Everything else
                    this.imagePreview.style.backgroundImage = `url("${ this.successFileAltImage }")`
                }
            }

            //////////////////////////////////////////////////////////
            // The next logic set is for a multiple situation, and  //
            // they want to show multiple images                    //
            //////////////////////////////////////////////////////////
            if (this.input.multiple) {
                // Set the main panel's background image to the blank one here
                this.imagePreview.style.backgroundImage = `url("${ this.backgroundImage }")`

                //If png, jpg/jpeg, gif, use the actual image
                if (file.type.match('image/png') || file.type.match('image/jpeg') || file.type.match('image/gif')) {
                    if (this.options.showDeleteButtonOnImages) {
                        this.imagePreview.innerHTML += `
                            <div>
                                <span
                                    class="custom-file-container__image-multi-preview"
                                    style="background-image: url('${ reader.result }'); "
                                >
                                    <span class="custom-file-container__image-multi-preview__single-image-clear">
                                        <span
                                            class="custom-file-container__image-multi-preview__single-image-clear__icon"
                                            data-upload-token="${ file.token }"
                                        >&times;</span>
                                    </span>
                                </span>

                            </div>
                        `
                    } else {
                        this.imagePreview.innerHTML += `
                            <div>
                                <span
                                    class="custom-file-container__image-multi-preview"
                                    style="background-image: url('${ reader.result }'); "
                                ></span>
                            </div>
                        `
                    }
                } else if (file.type.match('application/pdf')) { //PDF Upload
                    if (this.options.showDeleteButtonOnImages) {
                        this.imagePreview.innerHTML += `
                            <div>
                                <span
                                    class="custom-file-container__image-multi-preview"
                                    style="background-image: url('${ this.successPdfImage }'); "
                                >
                                    <span class="custom-file-container__image-multi-preview__single-image-clear">
                                        <span
                                            class="custom-file-container__image-multi-preview__single-image-clear__icon"
                                            data-upload-token="${ file.token }"
                                        >&times;</span>
                                    </span>
                                </span>

                            </div>
                        `
                    } else {
                        this.imagePreview.innerHTML += `
                            <div>
                                <span
                                    class="custom-file-container__image-multi-preview"
                                    style="background-image: url('${ this.successPdfImage }'); "
                                ></span>
                            </div>
                        `
                    }
                } else if (file.type.match('video/*')) { //Video upload
                    if (this.options.showDeleteButtonOnImages) {
                        this.imagePreview.innerHTML += `
                            <div>
                                <span
                                    class="custom-file-container__image-multi-preview"
                                    style="background-image: url('${ this.successVideoImage }'); "
                                >
                                    <span class="custom-file-container__image-multi-preview__single-image-clear">
                                        <span
                                            class="custom-file-container__image-multi-preview__single-image-clear__icon"
                                            data-upload-token="${ file.token }"
                                        >&times;</span>
                                    </span>
                                </span>

                            </div>
                        `
                    } else {
                        this.imagePreview.innerHTML += `
                            <div>
                                <span
                                    class="custom-file-container__image-multi-preview"
                                    style="background-image: url('${ this.successVideoImage }'); "
                                ></span>
                            </div>
                        `
                    }
                } else { //Everything else
                    if (this.options.showDeleteButtonOnImages) {
                        this.imagePreview.innerHTML += `
                            <div>
                                <span
                                    class="custom-file-container__image-multi-preview"
                                    style="background-image: url('${ this.successFileAltImage }'); "
                                >
                                    <span class="custom-file-container__image-multi-preview__single-image-clear">
                                        <span
                                            class="custom-file-container__image-multi-preview__single-image-clear__icon"
                                            data-upload-token="${ file.token }"
                                        >&times;</span>
                                    </span>
                                </span>

                            </div>
                        `
                    } else {
                        this.imagePreview.innerHTML += `
                            <div>
                                <span
                                    class="custom-file-container__image-multi-preview"
                                    style="background-image: url('${ this.successFileAltImage }'); "
                                ></span>
                            </div>
                        `
                    }
                }
            }
        }
    }

    addBrowseButton(text) {
        this.inputLabel.innerHTML += `<span class="custom-file-container__custom-file__custom-file-control__button"> ${ text } </span>`
    }

    selectImage() {
        this.input.click()
    }

    clearImagePreviewPanel() {
        this.input.value = ''
        this.inputLabel.innerHTML = this.options.text.chooseFile
        this.addBrowseButton(this.options.text.browse)
        this.imagePreview.style.backgroundImage = `url("${ this.baseImage }")`
        this.imagePreview.classList.remove('custom-file-container__image-preview--active')
        this.cachedFileArray = []
        this.imagePreview.innerHTML = ''
        this.selectedFilesCount = 0
    }
}
