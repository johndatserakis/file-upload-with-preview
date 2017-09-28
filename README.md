<p align="center"><a href="" target="_blank"><img width="200" src="static/file-upload-with-preview.png"></a></p>

<p align="center">
  <a href="http://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License"></a>
  <a href="https://twitter.com/intent/tweet?url=https%3A%2F%2Fgithub.com%2Fpromosis%2Ffile-upload-with-preview&text=Check%20out%20file-upload-with-preview%20on%20GitHub&via=promosis">
  <img src="https://img.shields.io/twitter/url/https/github.com/johndatserakis/koa-vue-notes-api.svg?style=social" alt="Tweet"></a>
</p>

# file-upload-with-preview

This is a simple frontend utility to help the image-upload process on your website. It is written in pure JavaScript, has no dependencies, and is a tiny 3.75 kB (gzipped).

For the most part, browsers do a good job of handling image-uploads. That being said - we find that the ability to show our users a preview of their upload can go a long way in increasing the confidence in their upload.

`file-upload-with-preview` aims to address the issue of showing a preview of a user's uploaded image - along with providing a cancel-buttom functionality that allows a user to clear their upload.

## Features
- Shows the actual image preview in the case of uploaded .jpg, .jpeg, and .png images. Shows a *success-image* in the case of uploaded .pdf files - so the user knows their image is uploaded safely.
- Shows the image name in the input bar.
- Allows user to clear their upload.
- Looks great - styling based on Bootstrap 4's [custom file-upload](https://getbootstrap.com/docs/4.0/components/forms/#file-browser) style.
- Framework agnostic.
- For every image you want just initialize another `FileUploadWithPreview` object.

Work in progress...