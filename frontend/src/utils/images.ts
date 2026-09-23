import type { ImageAspectFilter, ImageRecord } from '../types';

export function selectPrimaryImage(images: Array<ImageRecord | undefined>) {
  return images.find(image => image?.role === 'result_image') || images.find(Boolean);
}

export function imageDisplayPath(image?: ImageRecord) {
  return image?.preview_path || image?.original_path || image?.thumb_path || '';
}

export function imageThumbnailPath(image?: ImageRecord) {
  return image?.thumb_path || image?.preview_path || '';
}

export function imageHeroPath(image?: ImageRecord) {
  return image?.preview_path || image?.original_path || image?.thumb_path || '';
}

export function imageOriginalPath(image?: ImageRecord) {
  return image?.original_path || image?.preview_path || image?.thumb_path || '';
}

export function imageAspectFilter(image?: ImageRecord): ImageAspectFilter | undefined {
  if (!image?.width || !image?.height || image.width <= 0 || image.height <= 0) return undefined;
  if (image.width * 20 < image.height * 19) return 'portrait';
  if (image.width * 20 > image.height * 21) return 'landscape';
  return 'square';
}

export function swipedImageIndex(index: number, count: number, deltaX: number, deltaY: number) {
  if (count < 2 || Math.abs(deltaX) < 48 || Math.abs(deltaX) < Math.abs(deltaY) * 1.3) return index;
  return Math.max(0, Math.min(count - 1, index + (deltaX < 0 ? 1 : -1)));
}

export function downloadFileName(title: string, path?: string | null) {
  const extension = path?.split('?')[0]?.split('#')[0]?.split('.').pop() || 'png';
  const safeTitle = title.trim().toLowerCase().replace(/[^a-z0-9\u4e00-\u9fff\u3400-\u4dbf]+/gi, '-').replace(/^-+|-+$/g, '') || 'image';
  return `${safeTitle}.${extension}`;
}
