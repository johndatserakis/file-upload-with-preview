(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.FileUploadWithPreview = factory());
}(this, (function () { 'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var FileUploadWithPreview = function () {
    function FileUploadWithPreview(uploadId, options) {
        _classCallCheck(this, FileUploadWithPreview);

        // Make sure uploadId was specified
        if (!uploadId) {
            throw new Error('No uploadId found. You must initialize file-upload-with-preview with a unique uploadId.');
        }

        // Set initial variables
        this.uploadId = uploadId;
        this.options = options || {};
        this.options.showDeleteButtonOnImages = this.options.hasOwnProperty('showDeleteButtonOnImages') ? this.options.showDeleteButtonOnImages : true;
        this.cachedFileArray = [];
        this.selectedFilesCount = 0;

        // Grab the custom file container elements
        this.el = document.querySelector('.custom-file-container[data-upload-id="' + this.uploadId + '"]');
        if (!this.el) {
            throw new Error('Could not find a \'custom-file-container\' with the id of: ' + this.uploadId);
        }
        this.input = this.el.querySelector('input[type="file"]');
        this.inputLabel = this.el.querySelector('.custom-file-container__custom-file__custom-file-control');
        this.imagePreview = this.el.querySelector('.custom-file-container__image-preview');
        this.clearButton = this.el.querySelector('.custom-file-container__image-clear');

        // Make sure all elements have been attached
        if (!this.el || !this.input || !this.inputLabel || !this.imagePreview || !this.clearButton) {
            throw new Error('Cannot find all necessary elements. Please make sure you have all the necessary elements in your html for the id: ' + this.uploadId);
        }

        // Set the base64 background images
        this.baseImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAiQAAAD6CAMAAACmhqw0AAAA+VBMVEUAAAD29u3u7unt7ent7enu7uju7uihoqCio6Gio6KjpKOkpaSmpqSmp6WoqKaqq6mqq6qrq6qsrautrauur62wsa6xsa+xsrCys7GztLK0tbK1trS2t7S3t7W4uba5ure6u7e7vLm8vbu9vrvAwL3Awb3DxMHFxcPGxsPHx8TIycXLzMjLzMnMzMnNzsrPz8vP0MzQ0M3S0s/U1NDV1dLX19TY2NTY2NXZ2dba2tXb29bc3Nfc3Njc3dnd3dre3tre39vg4Nvh4dzi4t3i4t7j497k5N/k5ODl5eDl5eHl5uLm5uHn5+Lo6OPp6eTq6uXr6+bs7Oft7eh54KxIAAAAB3RSTlMAHKbl5uztvql9swAABA1JREFUeNrt3VlT01AYgOG0oEEE910URNzFBVFcqCgKirLU/P8fI3QYbEOSdtrMyJzzvHfMlFx833NBQuY0SRrN8UwqabzZSJLGaYNQVacaSdMUVF0zGTMEVTeWmIH6BYkgESSCRJAIEkEiSCRIBIkgESSCRJAIEkEiQSJIBIkgESSCRJAIEgkSQSJIBIkgESSCRJBIkAgSQSJIBIkgESSCRIJEkAgSQSJIBIkgkSARJIJEkAgSQSJIBIkEiSARJIJEkAgSQSJIJEgEiSARJIJEkAgSQSJBIkgEiSARJIJEkAgSCRJBIkgEiSARJIJEgkSQ5PvxbdS+tyEJuZVb0+noTV579geSQGs/SOvqxiYkYfYwra+rbUhC7NNEjUjSJ5CE2P06jaTnIAmxKwe7vb468t3N14WOki1IAuzMwWrf1HCh3Q6S95AEWGe1b0/WlSCBBBJIIAkdSXvt1aNXa21IICld7dJU5+epJUggKV7tzuzRA4/ZHUggKVrtfNdjsXlIIClY7XLPw9NlSCA5vtqLPUguQgLJsdX+zv0fZhsSSPKrXckhWSn5jV8zG5DEiuR1DsnrEiOX0vMbkESKZDWHZLXMSFqsBJIIkOz1vn40sVdqpFgJJDHc3dzsQXKzwkihEkhiQLI+2f3y+3qVkSIlkMSAJFvsQrJYbaRACSRRIMlenj0UcPZlPyPHlUASB5Jsc+7cwevMc5v9jRxTAkkkSPbb+riVZYMYySuBJB4kJRUYySmBJHYkhUZ6lUASOZISIz1KIIkbSamRbiWQxIZkvT2YkS4lkESGpDV9tz2YkX9KIIkLSWs6TY+U9DFypASSqJC0OicfHSrpa2T/k5BEh6R1eDpWR8kARtIZSGJD0jo6QW1fySBGIIkOSavrlL27PwcxAklsSFo9JzFOppBAkl9ta5jTOiGJCslQRiCJCslwRiCJCcmQRiCJCMmwRiCJB8mXoU+YhyQaJM9TSCCBBBJIIIEEEkgggQQSSCCJAsnyzLA9hiQWJCfnSpBAAgkkkATXxFCnPxfU7iB5B0mAXT5Y7Z3t0Y087SDZgCTA7tX6bZ5TGSQBtlwrkgVIgmy+RiMXdiEJsp3b9Rn5nEESaC/O1/P3yMJuBkm4bX94O2rvNiKbWXRIBIkgESSCRJAIEkEiQSJIBIkgESSCRJAIEgkSQSJIBIkgESSCRIJEkAgSQSJIBIkgESQSJIJEkAgSQSJIBIkgkSARJIJEkAgSQSJIBIkEiSARJIJEkAgSQSJIJEgEiSARJIJEkAgSCRJBIkgEiSARJIJEkEiQCBJBIkgEiSARJIJEgkSQCBJBIkgEiSARJBIkgkSQ6P8gGTMDVTeWNA1B1TWTxmlTUFWnGknSaI4bhMoabzaSv+4BHFVoHZzfAAAAAElFTkSuQmCC';
        this.successPdfImage = 'data:image/png;base64,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';
        this.successVideoImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAfQAAAD6CAYAAABXq7VOAAAABGdBTUEAALGPC/xhBQAAEpNJREFUeAHt3UtsXOd1B/BvJPFlWaRIPWxZcQLHUSorsEwLltMEMRzYQJBsvEi66C4IkFW7aldZpkHQbRdFu6nX3dVAgGyCAOkiruvIcfwCEtlyJAe2RSUUORJpmZRIccIrWX6QQ3Ie987cOfc3G0szc7/vO79zjL9mho/a3NylRnIjQIAAAQIEBlpg10Cf3uEJECBAgACBWwIC3SAQIECAAIEAAgI9QBOVQIAAAQIEBLoZIECAAAECAQQEeoAmKoEAAQIECAh0M0CAAAECBAIICPQATVQCAQIECBAQ6GaAAAECBAgEEBDoAZqoBAIECBAgINDNAAECBAgQCCAg0AM0UQkECBAgQECgmwECBAgQIBBAQKAHaKISCBAgQICAQDcDBAgQIEAggIBAD9BEJRAgQIAAAYFuBggQIECAQAABgR6giUogQIAAAQIC3QwQIECAAIEAAgI9QBOVQIAAAQIEBLoZIECAAAECAQQEeoAmKoEAAQIECAh0M0CAAAECBAIICPQATVQCAQIECBAQ6GaAAAECBAgEEBDoAZqoBAIECBAgINDNAAECBAgQCCAg0AM0UQkECBAgQECgmwECBAgQIBBAQKAHaKISCBAgQICAQDcDBAgQIEAggIBAD9BEJRAgQIAAAYFuBggQIECAQAABgR6giUogQIAAAQIC3QwQIECAAIEAAgI9QBOVQIAAAQIEBLoZIECAAAECAQQEeoAmKoEAAQIECAh0M0CAAAECBAIICPQATVQCAQIECBAQ6GaAAAECBAgEEBDoAZqoBAIECBAgINDNAAECBAgQCCAg0AM0UQkECBAgQECgmwECBAgQIBBAQKAHaKISCBAgQICAQDcDBAgQIEAggIBAD9BEJRAgQIAAAYFuBggQIECAQAABgR6giUogQIAAAQIC3QwQIECAAIEAAgI9QBOVQIAAAQIEBLoZIECAAAECAQQEeoAmKoEAAQIECAh0M0CAAAECBAIICPQATVQCAQIECBAQ6GaAAAECBAgEEBDoAZqoBAIECBAgINDNAAECBAgQCCAg0AM0UQkECBAgQECgmwECBAgQIBBAQKAHaKISCBAgQICAQDcDBAgQIEAggIBAD9BEJRAgQIAAAYFuBggQIECAQAABgR6giUogQIAAAQIC3QwQIECAAIEAAgI9QBOVQIAAAQIEBLoZIECAAAECAQQEeoAmKoEAAQIECAh0M0CAAAECBAIICPQATVQCAQIECBAQ6GaAAAECBAgEEBDoAZqoBAIECBAgINDNAAECBAgQCCAg0AM0UQkECBAgQECgmwECBAgQIBBAQKAHaKISCBAgQICAQDcDBAgQIEAggIBAD9BEJRAgQIAAAYFuBggQIECAQAABgR6giUogQIAAAQIC3QwQIECAAIEAAgI9QBOVQIAAAQIEBLoZIECAAAECAQQEeoAmKoEAAQIECAh0M0CAAAECBAIICPQATVQCAQIECBAQ6GaAAAECBAgEEBDoAZqoBAIECBAgINDNAAECBAgQCCAg0AM0UQkECBAgQECgmwECBAgQIBBAQKAHaKISCBAgQICAQDcDBAgQIEAggIBAD9BEJRAgQIAAAYFuBggQIECAQAABgR6giUogQIAAAQIC3QwQIECAAIEAAgI9QBOVQIAAAQIEBLoZIECAAAECAQQEeoAmKoEAAQIECAh0M0CAAAECBAIICPQATVQCAQIECBAQ6GaAAAECBAgEEBDoAZqoBAIECBAgINDNAAECBAgQCCAg0AM0UQkECBAgQECgmwECBAgQIBBAQKAHaKISCBAgQICAQDcDBAgQIEAggIBAD9BEJRAgQIAAAYFuBggQIECAQAABgR6giUogQIAAAQIC3QwQIECAAIEAAgI9QBOVQIAAAQIEBLoZIECAAAECAQQEeoAmKoEAAQIECAh0M0CAAAECBAIICPQATVQCAQIECBAQ6GaAAAECBAgEEBDoAZqoBAIECBAgINDNAAECBAgQCCAg0AM0UQkECBAgQECgmwECBAgQIBBAQKAHaKISCBAgQICAQDcDBAgQIEAggIBAD9BEJRAgQIAAAYFuBggQIECAQAABgR6giUogQIAAAQIC3QwQIECAAIEAAgI9QBOVQIAAAQIEBLoZIECAAAECAQQEeoAmKoEAAQIECAh0M0CAAAECBAIICPQATVQCAQIECBAQ6GaAAAECBAgEEBDoAZqoBAIECBAgINDNAAECBAgQCCAg0AM0UQkECBAgQECgmwECBAgQIBBAQKAHaKISCBAgQICAQDcDBAgQIEAggIBAD9BEJRAgQIAAAYFuBggQIECAQAABgR6giUogQIAAAQIC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';
        this.successFileAltImage = 'data:image/png;base64,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';
        this.successMultipleImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAfQAAAD6CAYAAABXq7VOAAAABGdBTUEAALGPC/xhBQAAE3FJREFUeAHt3UtsXNd5B/AzEmmbIiVZjkjRTiJLiZ5W2jh2Ejtt0wApUDRA0EXSfTdZtat01V0eKLrtqpvE6+5qIMugQFOkSRzbkoy6UGQrekVOTUokJdF8mg9N59KRbJmv4cydmXu/+xuDMDlz77nn+31H+mvuzOXUpqbG68mNAAECBAgQKLXArlLP3uQJECBAgACBNQGBbiEQIECAAIEAAgI9QBOVQIAAAQIEBLo1QIAAAQIEAggI9ABNVAIBAgQIEBDo1gABAgQIEAggINADNFEJBAgQIEBAoFsDBAgQIEAggIBAD9BEJRAgQIAAAYFuDRAgQIAAgQACAj1AE5VAgAABAgQEujVAgAABAgQCCAj0AE1UAgECBAgQEOjWAAECBAgQCCAg0AM0UQkECBAgQECgWwMECBAgQCCAgEAP0EQlECBAgAABgW4NECBAgACBAAICPUATlUCAAAECBAS6NUCAAAECBAIICPQATVQCAQIECBAQ6NYAAQIECBAIICDQAzRRCQQIECBAQKBbAwQIECBAIICAQA/QRCUQIECAAAGBbg0QIECAAIEAAgI9QBOVQIAAAQIEBLo1QIAAAQIEAggI9ABNVAIBAgQIEBDo1gABAgQIEAggINADNFEJBAgQIEBAoFsDBAgQIEAggIBAD9BEJRAgQIAAAYFuDRAgQIAAgQACAj1AE5VAgAABAgQEujVAgAABAgQCCAj0AE1UAgECBAgQEOjWAAECBAgQCCAg0AM0UQkECBAgQECgWwMECBAgQCCAgEAP0EQlECBAgAABgW4NECBAgACBAAICPUATlUCAAAECBAS6NUCAAAECBAIICPQATVQCAQIECBAQ6NYAAQIECBAIICDQAzRRCQQIECBAQKBbAwQIECBAIICAQA/QRCUQIECAAAGBbg0QIECAAIEAAgI9QBOVQIAAAQIEBLo1QIAAAQIEAggI9ABNVAIBAgQIEBDo1gABAgQIEAggINADNFEJBAgQIEBAoFsDBAgQIEAggIBAD9BEJRAgQIAAAYFuDRAgQIAAgQACAj1AE5VAgAABAgQEujVAgAABAgQCCAj0AE1UAgECBAgQEOjWAAECBAgQCCAg0AM0UQkECBAgQECgWwMECBAgQCCAgEAP0EQlECBAgAABgW4NECBAgACBAAICPUATlUCAAAECBAS6NUCAAAECBAIICPQATVQCAQIECBAQ6NYAAQIECBAIICDQAzRRCQQIECBAQKBbAwQIECBAIICAQA/QRCUQIECAAAGBbg0QIECAAIEAAgI9QBOVQIAAAQIEBLo1QIAAAQIEAggI9ABNVAIBAgQIEBDo1gABAgQIEAggINADNFEJBAgQIEBAoFsDBAgQIEAggIBAD9BEJRAgQIAAAYFuDRAgQIAAgQACAj1AE5VAgAABAgQEujVAgAABAgQCCAj0AE1UAgECBAgQEOjWAAECBAgQCCAg0AM0UQkECBAgQECgWwMECBAgQCCAgEAP0EQlECBAgAABgW4NECBAgACBAAICPUATlUCAAAECBAS6NUCAAAECBAIICPQATVQCAQIECBAQ6NYAAQIECBAIICDQAzRRCQQIECBAQKBbAwQIECBAIICAQA/QRCUQIECAAAGBbg0QIECAAIEAAgI9QBOVQIAAAQIEBLo1QIAAAQIEAggI9ABNVAIBAgQIEBDo1gABAgQIEAggINADNFEJBAgQIEBAoFsDBAgQIEAggIBAD9BEJRAgQIAAAYFuDRAgQIAAgQACAj1AE5VAgAABAgQEujVAgAABAgQCCAj0AE1UAgECBAgQEOjWAAECBAgQCCAg0AM0UQkECBAgQECgWwMECBAgQCCAgEAP0EQlECBAgAABgW4NECBAgACBAAICPUATlUCAAAECBAS6NUCAAAECBAIICPQATVQCAQIECBAQ6NYAAQIECBAIICDQAzRRCQQIECBAQKBbAwQIECBAIICAQA/QRCUQIECAAAGBbg0QIECAAIEAAgI9QBOVQIAAAQIEBLo1QIAAAQIEAggI9ABNVAIBAgQIEBDo1gABAgQIEAggINADNFEJBAgQIEBAoFsDBAgQIEAggIBAD9BEJRAgQIAAAYFuDRAgQIAAgQACAj1AE5VAgAABAgQEujVAgAABAgQCCAj0AE1UAgECBAgQEOjWAAECBAgQCCAg0AM0UQkECBAgQECgWwMECBAgQCCAgEAP0EQlECBAgAABgW4NECBAgACBAAICPUATlUCAAAECBAS6NUCAAAECBAIICPQATVQCAQIECBAQ6NYAAQIECBAIICDQAzRRCQQIECBAQKBbAwQIECBAIICAQA/QRCUQ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';
        this.blankImage = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAiQAAAD6CAYAAACRWFwGAAAABGdBTUEAALGPC/xhBQAADFNJREFUeAHt2jFOG1EUQNH5VpBGLnEVxB7CDpJVZRHZSLaRLIE9IFy5tSwRaTKjpEOU1i18XFmA7OfzXnEFjGl9nM+nx8vlz49lmb5N0/J5+5oHAQIECBAgQOB6AuM4xvRrnj993+8PL+NfjLw9rzFyf7039coECBAgQIAAgfcCa5Sc5vnuaff/NyNi5L2RrxAgQIAAAQJXFlh/IXLYWmS3Pvl65ffy8gQIECBAgACBDwW2Ftmt/zPy8OFP+AYBAgQIECBA4OoCy8MaJB4ECBAgQIAAgVZAkLT+3p0AAQIECBBYBQSJMyBAgAABAgRyAUGSr8AABAgQIECAgCBxAwQIECBAgEAuIEjyFRiAAAECBAgQECRugAABAgQIEMgFBEm+AgMQIECAAAECgsQNECBAgAABArmAIMlXYAACBAgQIEBAkLgBAgQIECBAIBcQJPkKDECAAAECBAgIEjdAgAABAgQI5AKCJF+BAQgQIECAAAFB4gYIECBAgACBXECQ5CswAAECBAgQICBI3AABAgQIECCQCwiSfAUGIECAAAECBASJGyBAgAABAgRyAUGSr8AABAgQIECAgCBxAwQIECBAgEAuIEjyFRiAAAECBAgQECRugAABAgQIEMgFBEm+AgMQIECAAAECgsQNECBAgAABArmAIMlXYAACBAgQIEBAkLgBAgQIECBAIBcQJPkKDECAAAECBAgIEjdAgAABAgQI5AKCJF+BAQgQIECAAAFB4gYIECBAgACBXECQ5CswAAECBAgQICBI3AABAgQIECCQCwiSfAUGIECAAAECBASJGyBAgAABAgRyAUGSr8AABAgQIECAgCBxAwQIECBAgEAuIEjyFRiAAAECBAgQECRugAABAgQIEMgFBEm+AgMQIECAAAECgsQNECBAgAABArmAIMlXYAACBAgQIEBAkLgBAgQIECBAIBcQJPkKDECAAAECBAgIEjdAgAABAgQI5AKCJF+BAQgQIECAAAFB4gYIECBAgACBXECQ5CswAAECBAgQICBI3AABAgQIECCQCwiSfAUGIECAAAECBASJGyBAgAABAgRyAUGSr8AABAgQIECAgCBxAwQIECBAgEAuIEjyFRiAAAECBAgQECRugAABAgQIEMgFBEm+AgMQIECAAAECgsQNECBAgAABArmAIMlXYAACBAgQIEBAkLgBAgQIECBAIBcQJPkKDECAAAECBAgIEjdAgAABAgQI5AKCJF+BAQgQIECAAAFB4gYIECBAgACBXECQ5CswAAECBAgQICBI3AABAgQIECCQCwiSfAUGIECAAAECBASJGyBAgAABAgRyAUGSr8AABAgQIECAgCBxAwQIECBAgEAuIEjyFRiAAAECBAgQECRugAABAgQIEMgFBEm+AgMQIECAAAECgsQNECBAgAABArmAIMlXYAACBAgQIEBAkLgBAgQIECBAIBcQJPkKDECAAAECBAgIEjdAgAABAgQI5AKCJF+BAQgQIECAAAFB4gYIECBAgACBXECQ5CswAAECBAgQICBI3AABAgQIECCQCwiSfAUGIECAAAECBASJGyBAgAABAgRyAUGSr8AABAgQIECAgCBxAwQIECBAgEAuIEjyFRiAAAECBAgQECRugAABAgQIEMgFBEm+AgMQIECAAAECgsQNECBAgAABArmAIMlXYAACBAgQIEBAkLgBAgQIECBAIBcQJPkKDECAAAECBAgIEjdAgAABAgQI5AKCJF+BAQgQIECAAAFB4gYIECBAgACBXECQ5CswAAECBAgQICBI3AABAgQIECCQCwiSfAUGIECAAAECBASJGyBAgAABAgRyAUGSr8AABAgQIECAgCBxAwQIECBAgEAuIEjyFRiAAAECBAgQECRugAABAgQIEMgFBEm+AgMQIECAAAECgsQNECBAgAABArmAIMlXYAACBAgQIEBAkLgBAgQIECBAIBcQJPkKDECAAAECBAgIEjdAgAABAgQI5AKCJF+BAQgQIECAAAFB4gYIECBAgACBXECQ5CswAAECBAgQICBI3AABAgQIECCQCwiSfAUGIECAAAECBASJGyBAgAABAgRyAUGSr8AABAgQIECAgCBxAwQIECBAgEAuIEjyFRiAAAECBAgQECRugAABAgQIEMgFBEm+AgMQIECAAAECgsQNECBAgAABArmAIMlXYAACBAgQIEBAkLgBAgQIECBAIBcQJPkKDECAAAECBAgIEjdAgAABAgQI5AKCJF+BAQgQIECAAAFB4gYIECBAgACBXECQ5CswAAECBAgQICBI3AABAgQIECCQCwiSfAUGIECAAAECBASJGyBAgAABAgRyAUGSr8AABAgQIECAgCBxAwQIECBAgEAuIEjyFRiAAAECBAgQECRugAABAgQIEMgFBEm+AgMQIECAAAECgsQNECBAgAABArmAIMlXYAACBAgQIEBAkLgBAgQIECBAIBcQJPkKDECAAAECBAgIEjdAgAABAgQI5AKCJF+BAQgQIECAAAFB4gYIECBAgACBXECQ5CswAAECBAgQICBI3AABAgQIECCQCwiSfAUGIECAAAECBASJGyBAgAABAgRyAUGSr8AABAgQIECAgCBxAwQIECBAgEAuIEjyFRiAAAECBAgQECRugAABAgQIEMgFBEm+AgMQIECAAAECgsQNECBAgAABArmAIMlXYAACBAgQIEBAkLgBAgQIECBAIBcQJPkKDECAAAECBAgIEjdAgAABAgQI5AKCJF+BAQgQIECAAAFB4gYIECBAgACBXECQ5CswAAECBAgQICBI3AABAgQIECCQCwiSfAUGIECAAAECBASJGyBAgAABAgRyAUGSr8AABAgQIECAgCBxAwQIECBAgEAuIEjyFRiAAAECBAgQECRugAABAgQIEMgFBEm+AgMQIECAAAECgsQNECBAgAABArmAIMlXYAACBAgQIEBAkLgBAgQIECBAIBcQJPkKDECAAAECBAgIEjdAgAABAgQI5AKCJF+BAQgQIECAAAFB4gYIECBAgACBXECQ5CswAAECBAgQICBI3AABAgQIECCQCwiSfAUGIECAAAECBASJGyBAgAABAgRyAUGSr8AABAgQIECAgCBxAwQIECBAgEAuIEjyFRiAAAECBAgQECRugAABAgQIEMgFBEm+AgMQIECAAAECgsQNECBAgAABArmAIMlXYAACBAgQIEBAkLgBAgQIECBAIBcQJPkKDECAAAECBAgIEjdAgAABAgQI5AKCJF+BAQgQIECAAAFB4gYIECBAgACBXECQ5CswAAECBAgQICBI3AABAgQIECCQCwiSfAUGIECAAAECBASJGyBAgAABAgRyAUGSr8AABAgQIECAgCBxAwQIECBAgEAuIEjyFRiAAAECBAgQECRugAABAgQIEMgFBEm+AgMQIECAAAECgsQNECBAgAABArmAIMlXYAACBAgQIEBAkLgBAgQIECBAIBcQJPkKDECAAAECBAgIEjdAgAABAgQI5AKCJF+BAQgQIECAAAFB4gYIECBAgACBXECQ5CswAAECBAgQICBI3AABAgQIECCQCwiSfAUGIECAAAECBASJGyBAgAABAgRyAUGSr8AABAgQIECAgCBxAwQIECBAgEAuIEjyFRiAAAECBAgQECRugAABAgQIEMgFBEm+AgMQIECAAAECgsQNECBAgAABArmAIMlXYAACBAgQIEBAkLgBAgQIECBAIBcQJPkKDECAAAECBAgIEjdAgAABAgQI5AKCJF+BAQgQIECAAAFB4gYIECBAgACBXECQ5CswAAECBAgQICBI3AABAgQIECCQCwiSfAUGIECAAAECBASJGyBAgAABAgRyAUGSr8AABAgQIECAgCBxAwQIECBAgEAuIEjyFRiAAAECBAgQECRugAABAgQIEMgFBEm+AgMQIECAAAECgsQNECBAgAABArmAIMlXYAACBAgQIEBAkLgBAgQIECBAIBcQJPkKDECAAAECBAgIEjdAgAABAgQI5AKCJF+BAQgQIECAAAFB4gYIECBAgACBXECQ5CswAAECBAgQICBI3AABAgQIECCQC6xBMl7zKQxAgAABAgQI3LDAeN2NMf2+YQEfnQABAgQIEIgFthYZ5/Pp8XJ5e16W6T6ex9sTIECAAAECNyawxshpnu+edvv94WV98mWM8XP9883xxhx8XAIECBAgQCARGMetPbYY2VrkL3ZQPayX+qtWAAAAAElFTkSuQmCC';

        // Set click events
        this.bindClickEvents();

        // Let's set the placeholder image
        this.imagePreview.style.backgroundImage = 'url("' + this.baseImage + '")';
    }

    _createClass(FileUploadWithPreview, [{
        key: 'bindClickEvents',
        value: function bindClickEvents() {
            var _this = this;

            // Grab the current instance
            var self = this;

            // Deal with the change event on the input
            self.input.addEventListener('change', function (event) {
                // In this case, the user most likely had hit cancel - which does something
                // a little strange if they had already selected a single or multiple images -
                // it acts like they now have *no* files - which isn't true. We'll just check here
                // for any cached images already captured, and proceed normally. If something *does* want
                // to clear their images, they'll use the clear button on the label we provide.
                if (this.files.length === 0) {
                    return;
                }

                // If the input is set to allow multiple files, then we'll add to
                // the existing file count and keep the cachedFileArray. If not,
                // then we'll reset the file count and reset the cachedFileArray
                if (self.input.multiple) {
                    self.selectedFilesCount += this.files.length;
                } else {
                    self.selectedFilesCount = this.files.length;
                    self.cachedFileArray = [];
                }

                // Now let's loop over the selected images and act accordingly based on there were multiple images or not
                for (var x = 0; x < this.files.length; x++) {
                    // Grab this index's file
                    var file = this.files[x];

                    // To make sure each image can be treated individually, let's give
                    // each file a unique token
                    file.token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

                    // File/files selected.
                    self.cachedFileArray.push(file);

                    // Process the image in our loop
                    self.processFile(file);
                }

                // Send out our event
                var imageSelectedEvent = new CustomEvent('fileUploadWithPreview:imageSelected', {
                    detail: {
                        uploadId: self.uploadId,
                        cachedFileArray: self.cachedFileArray,
                        selectedFilesCount: self.selectedFilesCount
                    }
                });
                window.dispatchEvent(imageSelectedEvent);
            }, true);

            //Listen for the clear button
            this.clearButton.addEventListener('click', function () {
                _this.clearImagePreviewPanel();
            }, true);

            // Listen for individual clear buttons on images
            this.imagePreview.addEventListener('click', function (event) {

                // Listen for the specific click of a clear button
                if (event.target.matches('.custom-file-container__image-multi-preview__single-image-clear__icon')) {
                    // Grab the clicked function
                    var clearFileButton = event.target;

                    // Get its token
                    var fileToken = clearFileButton.getAttribute('data-upload-token');

                    // Get the index of the file
                    var selectedFileIndex = _this.cachedFileArray.findIndex(function (x) {
                        return x.token === fileToken;
                    });

                    // Remove the file from the array
                    _this.cachedFileArray.splice(selectedFileIndex, 1);

                    // Reset the imagePreview pane
                    _this.imagePreview.innerHTML = '';

                    // Reset our selectedFilesCount with the new proper count
                    _this.selectedFilesCount = _this.cachedFileArray.length;

                    // Load back up the images in the pane with the new updated cachedFileArray
                    _this.cachedFileArray.forEach(function (file) {
                        return _this.processFile(file);
                    });

                    // If there's no images left after the latest deletion event,
                    // then let's reset the panel entirely
                    if (!_this.cachedFileArray.length) {
                        _this.clearImagePreviewPanel();
                    }

                    // Send out our deletion event
                    var imageDeletedEvent = new CustomEvent('fileUploadWithPreview:imageDeleted', {
                        detail: {
                            uploadId: _this.uploadId,
                            cachedFileArray: _this.cachedFileArray,
                            selectedFilesCount: _this.selectedFilesCount
                        }
                    });
                    window.dispatchEvent(imageDeletedEvent);
                }
            });
        }
    }, {
        key: 'processFile',
        value: function processFile(file) {
            var _this2 = this;

            // Update our input label here based on instance selectedFilesCount
            if (this.selectedFilesCount === 0) {
                this.inputLabel.innerHTML = 'Choose file...';
            } else if (this.selectedFilesCount === 1) {
                this.inputLabel.innerHTML = file.name;
            } else {
                this.inputLabel.innerHTML = this.selectedFilesCount + ' files selected';
            }

            // Apply the 'custom-file-container__image-preview--active' class
            this.imagePreview.classList.add('custom-file-container__image-preview--active');

            // Set up our reader
            var reader = new FileReader();
            reader.readAsDataURL(file);

            // Check the file and act accordingly
            reader.onload = function (e) {
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
                if (!_this2.input.multiple) {
                    //If png, jpg/jpeg, gif, use the actual image
                    if (file.type.match('image/png') || file.type.match('image/jpeg') || file.type.match('image/gif')) {
                        _this2.imagePreview.style.backgroundImage = 'url("' + reader.result + '")';
                    } else if (file.type.match('application/pdf')) {
                        //PDF Upload
                        _this2.imagePreview.style.backgroundImage = 'url("' + _this2.successPdfImage + '")';
                    } else if (file.type.match('video/*')) {
                        //Video upload
                        _this2.imagePreview.style.backgroundImage = 'url("' + _this2.successVideoImage + '")';
                    } else {
                        //Everything else
                        _this2.imagePreview.style.backgroundImage = 'url("' + _this2.successFileAltImage + '")';
                    }
                }

                //////////////////////////////////////////////////////////
                // The next logic set is for a multiple situation, and  //
                // they want to show multiple images                    //
                //////////////////////////////////////////////////////////
                if (_this2.input.multiple) {
                    // Set the main panel's background image to the blank one here
                    _this2.imagePreview.style.backgroundImage = 'url("' + _this2.blankImage + '")';

                    //If png, jpg/jpeg, gif, use the actual image
                    if (file.type.match('image/png') || file.type.match('image/jpeg') || file.type.match('image/gif')) {
                        if (_this2.options.showDeleteButtonOnImages) {
                            _this2.imagePreview.innerHTML += '\n                            <div>\n                                <span\n                                    class="custom-file-container__image-multi-preview"\n                                    style="background-image: url(\'' + reader.result + '\'); "\n                                >\n                                    <span class="custom-file-container__image-multi-preview__single-image-clear">\n                                        <span\n                                            class="custom-file-container__image-multi-preview__single-image-clear__icon"\n                                            data-upload-token="' + file.token + '"\n                                        >&times;</span>\n                                    </span>\n                                </span>\n\n                            </div>\n                        ';
                        } else {
                            _this2.imagePreview.innerHTML += '\n                            <div>\n                                <span\n                                    class="custom-file-container__image-multi-preview"\n                                    style="background-image: url(\'' + reader.result + '\'); "\n                                ></span>\n                            </div>\n                        ';
                        }
                    } else if (file.type.match('application/pdf')) {
                        //PDF Upload
                        if (_this2.options.showDeleteButtonOnImages) {
                            _this2.imagePreview.innerHTML += '\n                            <div>\n                                <span\n                                    class="custom-file-container__image-multi-preview"\n                                    style="background-image: url(\'' + _this2.successPdfImage + '\'); "\n                                >\n                                    <span class="custom-file-container__image-multi-preview__single-image-clear">\n                                        <span\n                                            class="custom-file-container__image-multi-preview__single-image-clear__icon"\n                                            data-upload-token="' + file.token + '"\n                                        >&times;</span>\n                                    </span>\n                                </span>\n\n                            </div>\n                        ';
                        } else {
                            _this2.imagePreview.innerHTML += '\n                            <div>\n                                <span\n                                    class="custom-file-container__image-multi-preview"\n                                    style="background-image: url(\'' + _this2.successPdfImage + '\'); "\n                                ></span>\n                            </div>\n                        ';
                        }
                    } else if (file.type.match('video/*')) {
                        //Video upload
                        if (_this2.options.showDeleteButtonOnImages) {
                            _this2.imagePreview.innerHTML += '\n                            <div>\n                                <span\n                                    class="custom-file-container__image-multi-preview"\n                                    style="background-image: url(\'' + _this2.successVideoImage + '\'); "\n                                >\n                                    <span class="custom-file-container__image-multi-preview__single-image-clear">\n                                        <span\n                                            class="custom-file-container__image-multi-preview__single-image-clear__icon"\n                                            data-upload-token="' + file.token + '"\n                                        >&times;</span>\n                                    </span>\n                                </span>\n\n                            </div>\n                        ';
                        } else {
                            _this2.imagePreview.innerHTML += '\n                            <div>\n                                <span\n                                    class="custom-file-container__image-multi-preview"\n                                    style="background-image: url(\'' + _this2.successVideoImage + '\'); "\n                                ></span>\n                            </div>\n                        ';
                        }
                    } else {
                        //Everything else
                        if (_this2.options.showDeleteButtonOnImages) {
                            _this2.imagePreview.innerHTML += '\n                            <div>\n                                <span\n                                    class="custom-file-container__image-multi-preview"\n                                    style="background-image: url(\'' + _this2.successFileAltImage + '\'); "\n                                >\n                                    <span class="custom-file-container__image-multi-preview__single-image-clear">\n                                        <span\n                                            class="custom-file-container__image-multi-preview__single-image-clear__icon"\n                                            data-upload-token="' + file.token + '"\n                                        >&times;</span>\n                                    </span>\n                                </span>\n\n                            </div>\n                        ';
                        } else {
                            _this2.imagePreview.innerHTML += '\n                            <div>\n                                <span\n                                    class="custom-file-container__image-multi-preview"\n                                    style="background-image: url(\'' + _this2.successFileAltImage + '\'); "\n                                ></span>\n                            </div>\n                        ';
                        }
                    }
                }
            };
        }
    }, {
        key: 'selectImage',
        value: function selectImage() {
            this.input.click();
        }
    }, {
        key: 'clearImagePreviewPanel',
        value: function clearImagePreviewPanel() {
            this.input.value = '';
            this.inputLabel.innerHTML = 'Choose file...';
            this.imagePreview.style.backgroundImage = 'url("' + this.baseImage + '")';
            this.imagePreview.classList.remove('custom-file-container__image-preview--active');
            this.cachedFileArray = [];
            this.imagePreview.innerHTML = '';
            this.selectedFilesCount = 0;
        }
    }]);

    return FileUploadWithPreview;
}();

return FileUploadWithPreview;

})));
