import { Options, PresetFiles, RequiredOptions } from './types/options';
export declare class FileUploadWithPreview {
    /**
     * Currently selected files
     *
     * @default []
     */
    cachedFileArray: File[];
    /**
     * Button to reset the instance
     */
    clearButton: Element;
    /**
     * Main container for the instance
     */
    el: Element;
    /**
     * Display panel for the images
     */
    imagePreview: HTMLDivElement;
    /**
     * Hidden input
     */
    inputHidden: HTMLInputElement;
    /**
     * Visible input
     */
    inputVisible: Element;
    options: RequiredOptions;
    /**
     * The `id` you set for the instance
     */
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