<p align="center"><a href="" target="_blank"><img src="https://raw.githubusercontent.com/johndatserakis/file-upload-with-preview/master/public/file-upload-with-preview.jpg"></a></p>

# file-upload-with-preview

🖼 Simple file-upload utility that shows a preview of the uploaded image. Written in TypeScript. No dependencies. Works well with or without a framework.

<p align="left">
  <a href="https://www.npmjs.com/package/file-upload-with-preview"><img src="https://img.shields.io/npm/v/file-upload-with-preview.svg" alt="NPM Version"></a>
  <a href="https://www.npmjs.com/package/file-upload-with-preview"><img src="https://img.shields.io/npm/dm/file-upload-with-preview.svg" alt="NPM Downloads"></a>
  <a href="http://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License"></a>
  <a href="https://twitter.com/intent/tweet?url=https%3A%2F%2Fgithub.com%johndatserakis%2Ffile-upload-with-preview&text=Check%20out%20file-upload-with-preview%20on%20GitHub&via=johndatserakis">
  <img src="https://img.shields.io/twitter/url/https/github.com/johndatserakis/file-upload-with-preview.svg?style=social" alt="Tweet"></a>
</p>

## Links

- [Demo](https://johndatserakis.github.io/file-upload-with-preview)
- [npm](https://www.npmjs.com/package/file-upload-with-preview)
- [GitHub](https://github.com/johndatserakis/file-upload-with-preview#readme)
- [CodeSandbox - TypeScript](https://codesandbox.io/s/file-upload-with-preview-4ypil8?file=/src/index.ts)
- [CodeSandbox - Browser](https://codesandbox.io/s/file-upload-with-preview-browser-446nc8?file=/src/index.js)
- [Docs](https://johndatserakis.github.io/file-upload-with-preview/typedoc/)

## Install

```bash
yarn add file-upload-with-preview
```

Or, you can include it through the browser.

```html
<link
  rel="stylesheet"
  type="text/css"
  href="https://unpkg.com/file-upload-with-preview/dist/style.css"
/>

<script src="https://unpkg.com/file-upload-with-preview/dist/file-upload-with-preview.iife.js"></script>
```

## About

This is a simple frontend utility meant to help the file-upload process on your website.

It is written in pure JavaScript using TypeScript and has no dependencies. You can check out the live demo [here](https://johndatserakis.github.io/file-upload-with-preview).

For the most part, browsers do a good job of handling image-uploads. That being said - I find the ability to show our users a preview of their upload can go a long way in increasing the confidence in their upload.

`file-upload-with-preview` aims to address the issue of showing a preview of a user's uploaded image in a simple to use package.

## Features

- Shows the actual image preview in the case of a single uploaded .jpg, .jpeg, .gif, or .png image. Shows a _success-image_ in the case of an uploaded .pdf file, uploaded video, or other un-renderable file - so the user knows their image was collected successfully. In the case of multiple selected files, the user's selected images will be shown in a grid.
- Shows the image name in the input bar. Shows the count of selected images in the case of multiple selections within the same input.
- Allows the user to clear their upload and clear individual images in the `multiple` grid
- Looks great
- Framework agnostic - to access the uploaded file/files just use the `cachedFileArray` (always will be an array) property of your `FileUploadWithPreview` object.
- For every file-group you want just initialize another `FileUploadWithPreview` object with its own `uniqueId` - this way you can have multiple file-uploads on the same page. You also can just use a single input designated with a `multiple` property to allow multiple files on the same input.

## Usage

This library looks for a specific HTML element to display the file-upload. Simply add the below `div` to your HTML. Make sure to populate your unique id in the `data-upload-id` attribute.

```html
<div class="custom-file-container" data-upload-id="my-unique-id"></div>
```

Then, initialize your file-upload in the JavaScript like below:

```javascript
import { FileUploadWithPreview } from 'file-upload-with-preview';
import 'file-upload-with-preview/dist/style.css';

const upload = new FileUploadWithPreview('my-unique-id');
```

If you're importing directly in the browser, use the following instead:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8" />
    <link
      rel="stylesheet"
      type="text/css"
      href="https://unpkg.com/file-upload-with-preview/dist/style.css"
    />
  </head>
  <body>
    <div class="custom-file-container" data-upload-id="my-unique-id"></div>
    <script src="https://unpkg.com/file-upload-with-preview/dist/file-upload-with-preview.iife.js"></script>
  </body>
</html>
```

Then initialize like this:

```javascript
const upload = new FileUploadWithPreview.FileUploadWithPreview('my-unique-id');
```

Then when you're ready to use the user's file for an API call or whatever, just access the user's uploaded file/files in the `cachedFileArray` property of your initialized object like this:

```javascript
upload.cachedFileArray;
```

You can optionally trigger the image browser and clear selected images programmatically. There are additional methods on the class if you'd like to take a look at the source code.

```javascript
upload.emulateInputSelection(); // to open image browser
upload.resetPreviewPanel(); // clear all selected images
```

You may also want to capture the event when an image is selected.

```javascript
import { Events, ImageAddedEvent } from 'file-upload-with-preview';

window.addEventListener(Events.IMAGE_ADDED, (e: Event) => {
  const { detail } = e as unknown as ImageAddedEvent;

  console.log('detail', detail);
});
```

### Note

The `cachedFileArray` property is always an array. So if you are only allowing the user to upload a single file, you can access that file at `cachedFileArray[0]` - otherwise just send the entire array to your backend to handle it normally.

Make sure to pass in `multiple: true` in your options if you want to allow the user to select multiple images.

## Docs

View the full docs [here](https://johndatserakis.github.io/file-upload-with-preview/typedoc/).

## Full Example

See the full example in the `./example/index.ts` folder. See the top of this README for some links to a few live CodeSandbox's.

## Browser Support

If you are supporting a browser like IE11, one way to add a polyfill for `fetch` and `promise` is by adding the following in the bottom of your `index.html`:

```html
<script src="https://cdn.jsdelivr.net/npm/es6-promise@4/dist/es6-promise.auto.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/fetch/2.0.3/fetch.js"></script>
```

## Development

```bash
# Install dependencies
yarn

# Watch changes during local development
yarn dev

# Run tests
yarn test

# Build library
yarn build
```

## Other

Go ahead and fork the project! Submit an issue if needed. Have fun!

## License

[MIT](http://opensource.org/licenses/MIT)
