export interface DavosDirectoryOptions {
  csvUrl?: string;
  mode?: 'live' | 'preview';
  seedEvents?: Record<string, string>[];
  refreshMs?: number;
  storage?: Storage;
  now?: () => Date;
}
export interface DavosDirectoryHandle {
  refresh(): Promise<void>;
  destroy(): void;
}
export function mountDavosDirectory(root: HTMLElement, options?: DavosDirectoryOptions): DavosDirectoryHandle;
