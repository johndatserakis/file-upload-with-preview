import './main.scss'
import FileUploadWithPreview from '../src/file-upload-with-preview'
import '../src/file-upload-with-preview.scss'

const importedBaseImage = require('./custom-image.svg')

// First upload
const firstUpload = new FileUploadWithPreview('myFirstImage')
const firstUploadInfoButton = document.querySelector('.upload-info-button--first')
firstUploadInfoButton.addEventListener('click', function () {
    console.log('First upload:', firstUpload, firstUpload.cachedFileArray)
})

// Second upload
const secondUpload = new FileUploadWithPreview('mySecondImage', {
    showDeleteButtonOnImages: true,
    text: {
        chooseFile: 'Custom Placeholder Copy',
        browse: 'Custom Button Copy',
    },
    images: {
        baseImage: importedBaseImage,
    },
})

const secondUploadInfoButton = document.querySelector('.upload-info-button--second')
secondUploadInfoButton.addEventListener('click', function () {
    console.log('Second upload:', secondUpload, secondUpload.cachedFileArray)
})

// Image selected event listener
window.addEventListener('fileUploadWithPreview:imageSelected', function (e) {
    // e.detail.uploadId
    // e.detail.cachedFileArray
    // e.detail.selectedFilesCount
    // Use `e.detail.uploadId` to match up to your specific input
    if (e.detail.uploadId === 'myFirstImage') {
        console.log(e.detail.selectedFilesCount)
        console.log(e.detail.cachedFileArray)
    }

    if (e.detail.uploadId === 'mySecondImage') {
        console.log(e.detail.selectedFilesCount)
        console.log(e.detail.cachedFileArray)
    }
})

// Image deleted event listener
window.addEventListener('fileUploadWithPreview:imageDeleted', function (e) {
    if (e.detail.uploadId === 'mySecondImage') {
        console.log(e.detail.selectedFilesCount)
        console.log(e.detail.cachedFileArray)
    }
})
