import './index.scss';
import '../src/index.scss';

import {
  ClearButtonClickedEvent,
  Events,
  FileUploadWithPreview,
  ImageAddedEvent,
  ImageDeletedEvent,
  ImageMultiItemClickedEvent,
} from '../src/index';
import importedBaseImage from './custom-image.svg';

const firstUpload = new FileUploadWithPreview('myFirstImage');

const secondUpload = new FileUploadWithPreview('mySecondImage', {
  images: {
    baseImage: importedBaseImage,
  },
  maxFileCount: 5,
  multiple: true,
  presetFiles: [
    'https://images.unsplash.com/photo-1557090495-fc9312e77b28?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=668&q=80',
    importedBaseImage,
    'https://images.unsplash.com/photo-1632333650998-8842b63f5cfc?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2787&q=80',
  ],
  text: {
    browse: 'Choose',
    chooseFile: 'Take your pick...',
    label: 'Choose Files to Upload',
  },
});

const firstUploadInfoButton = document.querySelector('.upload-info-button-first');
const secondUploadInfoButton = document.querySelector('.upload-info-button-second');

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

window.addEventListener(Events.IMAGE_ADDED, (e: Event) => {
  const { detail } = e as unknown as ImageAddedEvent;

  console.log('detail', detail);
});

window.addEventListener(Events.IMAGE_DELETED, (e: Event) => {
  const { detail } = e as unknown as ImageDeletedEvent;

  console.log('detail', detail);
});

window.addEventListener(Events.CLEAR_BUTTON_CLICKED, (e: Event) => {
  const { detail } = e as unknown as ClearButtonClickedEvent;

  console.log('detail', detail);
});

window.addEventListener(Events.IMAGE_MULTI_ITEM_CLICKED, (e: Event) => {
  const { detail } = e as unknown as ImageMultiItemClickedEvent;

  console.log('detail', detail);
});
