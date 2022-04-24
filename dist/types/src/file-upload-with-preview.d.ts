export interface Text {
    browse?: string;
    chooseFile?: string;
    label?: string;
    selectedCount?: string;
}
export interface Images {
    backgroundImage?: string;
    baseImage?: string;
    successFileAltImage?: string;
    successPdfImage?: string;
    successVideoImage?: string;
}
export declare type PresetFiles = string[];
export interface Options {
    accept?: HTMLInputElement['accept'];
    images?: Images;
    maxFileCount?: number;
    multiple?: boolean;
    presetFiles?: PresetFiles;
    showDeleteButtonOnImages?: boolean;
    text?: Text;
}
export declare type RequiredOptions = Required<Options> & {
    images: Required<Images>;
    text: Required<Text>;
};
export declare class FileUploadWithPreview {
    cachedFileArray: File[];
    clearButton: Element;
    el: Element;
    imagePreview: HTMLDivElement;
    inputHidden: HTMLInputElement;
    inputVisible: Element;
    options: RequiredOptions;
    uploadId: string;
    constructor(uploadId: string, options?: Options);
    bindClickEvents(): void;
    addImagesFromPath(presetFiles: PresetFiles): Promise<void>;
    addFiles(files: FileList | File[]): void;
    addFileToPreviewPanel(file: File): void;
    replaceFiles(files: File[]): void;
    replaceFileAtIndex(file: File, index: number): void;
    deleteFileAtIndex(index: number): void;
    refreshPreviewPanel(): void;
    addBrowseButton(text: string): void;
    emulateInputSelection(): void;
    resetPreviewPanel(): void;
}
//# sourceMappingURL=file-upload-with-preview.d.ts.map