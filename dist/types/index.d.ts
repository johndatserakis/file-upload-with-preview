import './polyfill';
import './index.scss';
interface Text {
    browse?: string;
    chooseFile?: string;
    selectedCount?: string;
}
interface Images {
    baseImage?: string;
    backgroundImage?: string;
    successFileAltImage?: string;
    successPdfImage?: string;
    successVideoImage?: string;
}
declare type PresetFiles = string[];
interface Options {
    showDeleteButtonOnImages?: boolean;
    text: Text;
    maxFileCount?: number;
    images: Images;
    presetFiles?: PresetFiles;
}
declare type FileWithProps = File & {
    token: string;
};
export declare class FileUploadWithPreview {
    uploadId: string;
    cachedFileArray: FileWithProps[];
    currentFileCount: number;
    options: Required<Options>;
    el: Element;
    input: HTMLInputElement;
    inputLabel: Element;
    imagePreview: HTMLDivElement;
    clearButton: Element;
    constructor(uploadId: string, options?: Options);
    bindClickEvents(): void;
    addFiles(files: FileList): void;
    renderFile(file: FileWithProps): void;
    addImagesFromPath(files: PresetFiles): Promise<void>;
    replaceFiles(files: FileWithProps[]): void;
    replaceFileAtIndex(file: FileWithProps, index: number): void;
    deleteFileAtIndex(index: number): void;
    refreshPreviewPanel(): void;
    addBrowseButton(text: string): void;
    emulateInputSelection(): void;
    clearPreviewPanel(): void;
}
export {};
