import './index.scss';
import '../src/index.scss';

import { FileUploadWithPreview } from '../src/index';
import importedBaseImage from './custom-image.svg';

const firstUpload = new FileUploadWithPreview('myFirstImage');

const secondUpload = new FileUploadWithPreview('mySecondImage', {
  images: {
    baseImage: importedBaseImage,
  },
  label: 'Custom Label Text',
  maxFileCount: 5,
  multiple: true,
  presetFiles: [
    'https://images.unsplash.com/photo-1557090495-fc9312e77b28?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=668&q=80',
  ],
  text: {
    browse: 'Choose',
    chooseFile: 'Take your pick...',
  },
});

const firstUploadInfoButton = document.querySelector('.upload-info-button--first');
const secondUploadInfoButton = document.querySelector('.upload-info-button--second');

if (firstUploadInfoButton) {
  firstUploadInfoButton.addEventListener('click', () => {
    console.log('First upload:', firstUpload, firstUpload.cachedFileArray);
  });
}

if (secondUploadInfoButton) {
  secondUploadInfoButton.addEventListener('click', () => {
    console.log('Second upload:', secondUpload, secondUpload.cachedFileArray);
  });
}

window.addEventListener('fileUploadWithPreview:imagesAdded', (e) => {
  console.log('here');
  console.log('e', e);

  // const target = e.target as HTMLInputElement;

  // e.detail.uploadId
  // e.detail.cachedFileArray
  // e.detail.selectedFilesCount
  // Use `e.detail.uploadId` to match up to your specific input
  // if (e.detail.uploadId === 'myFirstImage') {
  //   console.log(e.detail.addedFilesCount);
  //   console.log(e.detail.cachedFileArray);
  // }

  // if (e.detail.uploadId === 'mySecondImage') {
  //   console.log(e.detail.addedFilesCount);
  //   console.log(e.detail.cachedFileArray);
  // }
});

// Image deleted event listener
window.addEventListener('fileUploadWithPreview:imageDeleted', () => {
  // if (e.detail.uploadId === 'mySecondImage') {
  //   console.log(e.detail.currentFileCount);
  //   console.log(e.detail.cachedFileArray);
  // }
});

// Clear button event listener
window.addEventListener('fileUploadWithPreview:clearButtonClicked', () => {
  // if (e.detail.uploadId === 'mySecondImage') {
  //   console.log('clearButtonClicked');
  //   console.log(e.detail.uploadId);
  // }
});
