import { DEFAULT_INITIALIZED_OBJECT_OPTIONS } from '../jest/constants/file';
import { FileUploadWithPreview } from './index';

const TEST_ID = 'myTestImage';

describe('Module Actions', () => {
  beforeAll(() => {
    document.body.innerHTML =
      '<div class="custom-file-container" data-upload-id="myTestImage"></div>';
  });

  it('loads module', () => {
    expect.assertions(1);

    expect(FileUploadWithPreview).toBeTruthy();
  });

  it('initializes default options', () => {
    expect.assertions(2);

    const upload = new FileUploadWithPreview(TEST_ID);

    expect(upload.uploadId).toBe(TEST_ID);
    expect(upload.options).toMatchObject(DEFAULT_INITIALIZED_OBJECT_OPTIONS);
  });

  // Testing an actual file upload is tough - so we'll at least check that
  // the cachedFileArray can be pushed to.
  it('test that the cachedFileArray can be pushed to', () => {
    expect.assertions(2);

    const upload = new FileUploadWithPreview(TEST_ID);

    const file = new Blob([''], { type: 'image/jpeg' });
    const file1 = new Blob([''], { type: 'image/jpeg' });
    upload.cachedFileArray.push(file as File);
    upload.cachedFileArray.push(file1 as File);

    expect(upload.cachedFileArray.length).toBe(2);
    expect(upload.uploadId).toBe(TEST_ID);
  });

  it('clears an added file when the clear button is clicked', () => {
    expect.assertions(3);

    const upload = new FileUploadWithPreview(TEST_ID);

    const file = new Blob([''], { type: 'image/jpeg' });
    upload.cachedFileArray.push(file as File);
    expect(upload.cachedFileArray.length).toBe(1);

    const event = new Event('click', {
      bubbles: true,
      cancelable: true,
    });
    upload.clearButton.dispatchEvent(event);

    expect(upload.uploadId).toBe(TEST_ID);
    expect(upload.cachedFileArray).toEqual([]);
  });
});
