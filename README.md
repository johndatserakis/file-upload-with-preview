<p align="center"><a href="" target="_blank"><img src="public/file-upload-with-preview-animated.gif"></a></p>

<p align="center">
  <a href="https://www.npmjs.com/package/file-upload-with-preview"><img src="https://img.shields.io/npm/v/file-upload-with-preview.svg" alt="NPM Version"></a>
  <a href="https://www.npmjs.com/package/file-upload-with-preview"><img src="https://img.shields.io/npm/dt/file-upload-with-preview.svg" alt="NPM Downloads"></a>
  <a href="http://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License"></a>
  <a href="https://twitter.com/intent/tweet?url=https%3A%2F%2Fgithub.com%2Fpromosis%2Ffile-upload-with-preview&text=Check%20out%20file-upload-with-preview%20on%20GitHub&via=promosis">
  <img src="https://img.shields.io/twitter/url/https/github.com/promosis/file-upload-with-preview.svg?style=social" alt="Tweet"></a>
</p>

# file-upload-with-preview

This is a simple frontend utility to help the file-upload process on your website. It is written in pure JavaScript, has no dependencies, and is a small 13.55 kB (gzipped). You can check out the live demo [here](https://promosis.github.io/file-upload-with-preview/).

For the most part, browsers do a good job of handling image-uploads. That being said - we find that the ability to show our users a preview of their upload can go a long way in increasing the confidence in their upload.

**file-upload-with-preview** aims to address the issue of showing a preview of a user's uploaded image in a simple to use package.

### Features
- Shows the actual image preview in the case of a single uploaded .jpg, .jpeg, .gif, or .png image. Shows a *success-image* in the case of an uploaded .pdf file, uploaded video, or other unrenderable file - so the user knows their image was collected successfully. In the case of multiple selected files, the user's selected images will be shown in a grid.
- Shows the image name in the input bar. Shows the count of selected images in the case of multiple selections within the same input.
- Allows the user to clear their upload, and clear individual images in the `multiple` grid.
- Looks great - styling based on Bootstrap 4's [custom file-upload](https://getbootstrap.com/docs/4.0/components/forms/#file-browser) style.
- Framework agnostic - to access the uploaded file/files just use the `cachedFileArray` (always will be an array) property of your `FileUploadWithPreview` object.
- For every file-group you want just initialize another `FileUploadWithPreview` object with its own `uniqueId` - this way you can have multiple file-uploads on the same page. You also can just use a single input designated with a `multiple` property to allow multiple files on the same input.

### Installation

```bash
# npm
npm i file-upload-with-preview

# yarn
yarn add file-upload-with-preview
```
Or you can include it through the browser at the bottom of your page:

```html
<script src="https://unpkg.com/file-upload-with-preview"></script>
```

### Usage

When installed through npm or yarn:

```javascript
// using require
const FileUploadWithPreview = require('file-upload-with-preview')

// using import
import FileUploadWithPreview from 'file-upload-with-preview'

// initialize a new FileUploadWithPreview object
const upload = new FileUploadWithPreview('myUniqueUploadId')
```
...or through the browser:

```html
<script>
    var upload = new FileUploadWithPreview('myUniqueUploadId')
</script>
```

You'll also want to include the css in your `<head></head>`:

```javascript
// JavaScript
import 'file-upload-with-preview/dist/file-upload-with-preview.min.css'
```

```html
<!-- Browser -->
<link rel="stylesheet" type="text/css" href="https://unpkg.com/file-upload-with-preview/dist/file-upload-with-preview.min.css">
```

The JavaScript looks for a specific set of HTML elements to display the file input, label, image preview, and clear-button. Make sure to populate the `custom-file-container` element with the uniqueId:

```html
<div class="custom-file-container" data-upload-id="myFirstImage">
    <label>Upload File <a href="javascript:void(0)" class="custom-file-container__image-clear" title="Clear Image">&times;</a></label>
    <label class="custom-file-container__custom-file" >
        <input type="file" class="custom-file-container__custom-file__custom-file-input" accept="*" multiple aria-label="Choose File">
        <input type="hidden" name="MAX_FILE_SIZE" value="10485760" />
        <span class="custom-file-container__custom-file__custom-file-control"></span>
    </label>
    <div class="custom-file-container__image-preview"></div>
</div>
```

Then when you're ready to use the user's file for an API call or whatever, just access the user's uploaded file/files in the `cachedFileArray` property of your initialized object like this:

```javascript
upload.cachedFileArray
```

You can optionally trigger image browser and clear selected images by script code:

```javascript
upload.selectImage(); // to open image browser
upload.clearPreviewImage(); // clear all selected images
```

You may also want to capture the event that an image is selected:

```javascript
window.addEventListener('fileUploadWithPreview:imageSelected', function(e) {
    // e.detail.uploadId
    // e.detail.cachedFileArray
    // e.detail.selectedFilesCount
    // Use e.detail.uploadId to match up to your specific input
    if (e.detail.uploadId === 'mySecondImage') {
        console.log(e.detail.cachedFileArray)
        console.log(e.detail.selectedFilesCount)
    }
})
```

#### Note

The `cachedFileArray` property is always an array. So if you are only allowing the user to upload a single file, you can access that file at `cachedFileArray[0]` - otherwise just send the entire array to your backend to handle it normally.

Make sure to set `multiple` on your input if you want to allow the user to select multiple images.

### Properties

| name | type | description |
|---|---|---|
| uploadId | String | The id you set for the instance |
| options.showDeleteButtonOnImages | Boolean | Show a delete button on images in the grid. Default `true` |
| options.text.chooseFile | String | Edit input placeholder text. Default `'Choose file...'`|
| options.text.browse | String | Edit button text. Default `'Browse'`|
| cachedFileArray | Array | The current selected files |
| selectedFilesCount | Number | The count of the currently selected files |
| el | Element | The main container for the instance |
| input | Element | The main container for the instance |
| inputLabel | Element | The label for the image name/count |
| imagePreview | Element | The display panel for the images |
| clearButton | Element | The button to reset the instance |

### Methods

| method | parameters | description |
|---|---|---|
| selectImage | none | Open the image browser |
| clearPreviewImage | none | Clear the `cachedFileArray` |

### Events

| event | value | description |
|---|---|---|
| fileUploadWithPreview:imageSelected | `e` (e.detail.uploadId, e.detail.cachedFileArray, e.detail.selectedFilesCount) | Triggered each time file/files are selected. Delivers the `uploadId`, updated `cachedFilesArray`, and `selectedFilesCount` for the event. |
| fileUploadWithPreview:imageDeleted | `e` (e.detail.uploadId, e.detail.cachedFileArray, e.detail.selectedFilesCount) | Triggered each time a file is deleted. Delivers the `uploadId`, updated `cachedFilesArray`, and `selectedFilesCount` for the event. |

### Full Example

```html
<html>
    <head>
        ...
        <link rel="stylesheet" type="text/css" href="https://unpkg.com/file-upload-with-preview/dist/file-upload-with-preview.min.css">

        <!-- You'll want to make sure to at least set a width on the -->
        <!-- .custom-file-container class... -->
        ...
    </head>
    <body>

        ...

        <div class="custom-file-container" data-upload-id="myUniqueUploadId">
            <label>Upload File <a href="javascript:void(0)" class="custom-file-container__image-clear" title="Clear Image">&times;</a></label>

            <label class="custom-file-container__custom-file" >
                <input type="file" class="custom-file-container__custom-file__custom-file-input" accept="*" multiple aria-label="Choose File">
                <input type="hidden" name="MAX_FILE_SIZE" value="10485760" />
                <span class="custom-file-container__custom-file__custom-file-control"></span>
            </label>
            <div class="custom-file-container__image-preview"></div>
        </div>

        ...

        <script src="https://unpkg.com/file-upload-with-preview"></script>
        <script>
            var upload = new FileUploadWithPreview('myUniqueUploadId', {showDeleteButtonOnImages: true, text: {chooseFile: 'Custom Placeholder Copy', browse: 'Custom Button Copy'}})
        </script>

    </body>
</html>
```

In this example we set the `MAX_FILE_SIZE` value to `10485760` (10MB), the accepted images to `*` (everything), and designate `multiple` to allow the user to select multiple files - you can adjust those settings to whatever you like. For example, if you'd like to limit uploads to only images and pdf's and only allow a single file upload use the following:

```html
<input type="file" class="custom-file-container__custom-file__custom-file-input" accept="application/pdf,image/*" aria-label="Choose File">
<input type="hidden" name="MAX_FILE_SIZE" value="10485760" />
```

### Vue Example

View the Vue example on codesandbox:

[![Edit Vue Template](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/3z15v4106)

### Testing

Use `npm run test` to run the tests.

### Development

Clone the repo, then use the following to work on the project locally:

```bash
npm install

# watch changes
# (Open the index.html to work real-time. Refresh browser to test changes.)
npm run watch

# when done working
npm run build
```

### Other

Go ahead and fork the project! Submit an issue if needed. Have fun!

### License

Copywrite 2017 [Promosis](https://promosis.com)

[MIT](http://opensource.org/licenses/MIT)