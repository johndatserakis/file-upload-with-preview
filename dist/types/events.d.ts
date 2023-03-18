export interface ImageAddedEventDetail {
    addedFilesCount: number;
    cachedFileArray: File[];
    files: FileList | File[];
    uploadId: string;
}
export interface ImageAddedEvent {
    detail: ImageAddedEventDetail;
}
export interface ImageDeletedEventDetail {
    cachedFileArray: File[];
    currentFileCount: number;
    index: number;
    uploadId: string;
}
export interface ImageDeletedEvent {
    detail: ImageDeletedEventDetail;
}
export interface ClearButtonClickedEventDetail {
    uploadId: string;
}
export interface ClearButtonClickedEvent {
    detail: ClearButtonClickedEventDetail;
}
export interface ImageMultiItemClickedEventDetail {
    cachedFileArray: File[];
    file: File;
    index: number;
    uploadId: string;
}
export interface ImageMultiItemClickedEvent {
    detail: ImageMultiItemClickedEventDetail;
}
//# sourceMappingURL=events.d.ts.map