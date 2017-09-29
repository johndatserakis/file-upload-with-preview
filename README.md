<p align="center"><a href="" target="_blank"><img width="200" src="static/file-upload-with-preview.png"></a></p>

<p align="center">
  <a href="http://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License"></a>
  <a href="https://twitter.com/intent/tweet?url=https%3A%2F%2Fgithub.com%2Fpromosis%2Ffile-upload-with-preview&text=Check%20out%20file-upload-with-preview%20on%20GitHub&via=promosis">
  <img src="https://img.shields.io/twitter/url/https/github.com/promosis/file-upload-with-preview.svg?style=social" alt="Tweet"></a>
</p>

# file-upload-with-preview

This is a simple frontend utility to help the file-upload process on your website. It is written in pure JavaScript, has no dependencies, and is a tiny 3.75 kB (gzipped). You can check out the live demo [here](https://promosis.github.io/file-upload-with-preview/).

For the most part, browsers do a good job of handling image-uploads. That being said - we find that the ability to show our users a preview of their upload can go a long way in increasing the confidence in their upload.

**file-upload-with-preview** aims to address the issue of showing a preview of a user's uploaded image in a simple to use package.

## Features
- Shows the actual image preview in the case of uploaded .jpg, .jpeg, and .png images. Shows a *success-image* in the case of uploaded .pdf files, uploaded videos, and other uploaded file types - so the user knows their image was collected successfully.
- Shows the image name in the input bar.
- Allows the user to clear their upload.
- Looks great - styling based on Bootstrap 4's [custom file-upload](https://getbootstrap.com/docs/4.0/components/forms/#file-browser) style.
- Framework agnostic - to access the uploaded file just use the `cachedFile` property of your `FileUploadWithPreview` object.
- For every file you want just initialize another `FileUploadWithPreview` object with its own `uniqueId` - this way you can have multiple file-uploads on the same page.

## Installation

```bash
# npm
npm install --save file-upload-with-preview

# yarn
yarn add file-upload-with-preview
```
Or you can include it through the browser at the bottom of your page:

```html
<script src="https://unpkg.com/file-upload-with-preview"></script>
```

## Usage

When installed through npm or yarn:

```javascript
# using require
const FileUploadWithPreview = require('file-upload-with-preview')

# using import
import FileUploadWithPreview from 'file-upload-with-preview'

# initialize a new FileUploadWithPreview object
const upload = new FileUploadWithPreview('myUniqueUploadId')
```
...or through the browser:

```html
<script>
	var upload = new FileUploadWithPreview('myUniqueUploadId')
</script>
```

You'll also want to include the css in your `<head></head>`:

```html
<link rel="stylesheet" type="text/css" href="https://unpkg.com/file-upload-with-preview/dist/file-upload-with-preview.min.css">
```

The javascript looks for a specific set of HTML elements to display the file input, label, image preview, and clear-button. Make sure to populate the `custom-file-container` element with the uniqueId:

```html
<div class="custom-file-container" data-upload-id="myFirstImage">
    <label>Upload File <a href="javascript:void(0)" class="custom-file-container__image-clear" title="Clear Image">x</a></label>

    <label class="custom-file-container__custom-file" >
        <input type="hidden" name="MAX_FILE_SIZE" value="10485760" />
        <input type="file" class="custom-file-container__custom-file__custom-file-input" accept="application/pdf,image/*">
        <span class="custom-file-container__custom-file__custom-file-control"></span>
    </label>
    <div class="custom-file-container__image-preview"></div>
</div>
```

Then when you're ready to use the user's file for an API call or whatever, just access the user's uploaded file in the `cachedFile` property of your initialized object like this:

```javascript
upload.cachedFile
```

## Full Example

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
            <label>Upload File <a href="javascript:void(0)" class="custom-file-container__image-clear" title="Clear Image">x</a></label>

            <label class="custom-file-container__custom-file" >
                <input type="hidden" name="MAX_FILE_SIZE" value="10485760" />
                <input type="file" class="custom-file-container__custom-file__custom-file-input" accept="application/pdf,image/*">
                <span class="custom-file-container__custom-file__custom-file-control"></span>
            </label>
            <div class="custom-file-container__image-preview"></div>
        </div>

        ...

        <script src="https://unpkg.com/file-upload-with-preview"></script>
        <script>
            var upload = new FileUploadWithPreview('myUniqueUploadId')
        </script>

    </body>
</html>
```

In this example we set the `MAX_FILE_SIZE` value to `10485760` (10MB) and the accepted images to `*` (everything) - adjust those settings to whatever you like. For example, if you'd like to limit uploads to only images and pdf, use the following:

`<input type="file" class="custom-file-container__custom-file__custom-file-input" accept="application/pdf,image/*">`

## Testing

Use `npm run test` to run the tests.

## Development

Clone the repo, then use the following to work on the project locally:

```bash
npm install

# watch changes
npm run watch

# when done working
npm run build
```

## Other

Go ahead and fork the project! Submit an issue if needed. Have fun!

## License

Copywrite 2017 [Promosis](https://promosis.com)

[MIT](http://opensource.org/licenses/MIT)