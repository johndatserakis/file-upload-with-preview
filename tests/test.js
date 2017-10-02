import FileUploadWithPreview from '../dist/file-upload-with-preview.js'

describe('Module Actions', () => {

    beforeAll(() => {
        document.body.innerHTML = '<div class="custom-file-container" data-upload-id="myTestImage"> <label>Upload File <a href="javascript:void(0)" class="custom-file-container__image-clear" title="Clear Image">x</a></label> <label class="custom-file-container__custom-file" > <input type="hidden" name="MAX_FILE_SIZE" value="10485760" /> <input type="file" class="custom-file-container__custom-file__custom-file-input" accept="*"> <span class="custom-file-container__custom-file__custom-file-control"></span> </label> <div class="custom-file-container__image-preview"></div>  </div>'
    });

    it('loads module', async () => {
        expect.assertions(1)

        console.log(FileUploadWithPreview)
        expect(FileUploadWithPreview).toBeTruthy()
    })

    it('initializes object', async () => {
        expect.assertions(1)

        const upload = new FileUploadWithPreview('myTestImage')
        expect(upload.uploadId).toBe('myTestImage')
    })

    it('test the clear button', async () => {
        expect.assertions(3)

        const upload = new FileUploadWithPreview('myTestImage')

        //Creat a fake file
        let file = new Blob([""], { type: 'text/html' });
        file["lastModifiedDate"] = "";
        file["name"] = "filename";

        //Attach the fake file
        upload.cachedFileArray.push(file)
        expect(upload.cachedFileArray.length).toBe(1)

        //Clear that fake file
        let event = new Event('click', {
            'bubbles': true,
            'cancelable': true
        });
        upload.clearButton.dispatchEvent(event);

        expect(upload.uploadId).toBe('myTestImage')
        expect(upload.cachedFileArray).toEqual([])
    })

})