/**
 * Type declarations for the Document Picture-in-Picture API.
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Document_Picture-in-Picture_API
 */

interface DocumentPictureInPicture extends EventTarget {
  requestWindow(options?: {
    width?: number;
    height?: number;
  }): Promise<Window>;
  readonly window: Window | null;
  onenter: ((this: DocumentPictureInPicture, ev: DocumentPictureInPictureEvent) => unknown) | null;
}

declare class DocumentPictureInPictureEvent extends Event {
  constructor(type: string, eventInitDict: DocumentPictureInPictureEventInit);
  readonly window: Window;
}

interface DocumentPictureInPictureEventInit extends EventInit {
  window: Window;
}

interface Window {
  documentPictureInPicture?: DocumentPictureInPicture;
}
