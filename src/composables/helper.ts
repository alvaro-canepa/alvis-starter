import dayjs from 'dayjs';
import {
  chain,
  deburr,
  forEach,
  get,
  has,
  invoke,
  isBoolean,
  isEmpty,
  isFunction,
  isNil,
  isObjectLike,
  isString,
  map,
  split,
  toUpper,
} from 'lodash-es';
import * as yup from 'yup';

import type { FileData } from '@planetadeleste/pinia-orm-core';
import type { Maybe } from 'yup';

/**
 * Helper service
 */
export default function () {
  /**
   * Convert string into dot.case
   */
  const dotcase = (sValue: any) => {
    return chain(sValue).trim().kebabCase().replace(/-/g, '.').value();
  };

  const rules = (
    sType: string,
    sValue?:
      | string
      | boolean
      | unknown[]
      | yup.AnyObjectSchema
      | Record<string, any>,
    bRequired?: boolean
  ) => {
    if (isObjectLike(sValue) && !isBoolean(sValue)) {
      return sValue;
    }

    if (isBoolean(sValue)) {
      bRequired = sValue;
      sValue = undefined;
    }

    const obYup = sType === 'number' ? yup.number() : yup.string();

    if (bRequired) {
      obYup.required();
    }

    if (isString(sValue) && !isEmpty(sValue)) {
      const arRules = split(sValue, '|');
      forEach(arRules, sRule => {
        const arParams = split(sRule, ':');
        const sRuleName = arParams.splice(0, 1)[0];
        invoke(obYup, sRuleName, arParams);
      });
    }

    return obYup;
  };

  /**
   * Extract initials from sValue string
   */
  const initials = (sValue: string, upper = false) => {
    sValue = deburr(sValue);
    const hasTokens = sValue.includes(' ');
    sValue =
      sValue.substring(0, hasTokens ? 1 : 2) +
      (hasTokens ? sValue.charAt(sValue.lastIndexOf(' ') + 1) : '');

    return upper ? toUpper(sValue) : sValue;
  };

  const getFileList = <T extends Record<string, any>>(
    obData: T,
    sKey: keyof T = 'images'
  ) => {
    let obFiles: Maybe<File[]> = get(obData, sKey);

    if (isProxy(obFiles)) {
      obFiles = toRaw(obFiles);
    }

    if (isEmpty(obFiles)) {
      return undefined;
    }

    return chain(obFiles)
      .map(obFile => {
        if (obFile instanceof File) {
          return obFile;
        }

        if (has(obFile, 'src')) {
          return get(obFile, 'src');
        }

        return obFile;
      })
      .filter(obFile => !isNil(obFile))
      .value();
  };

  const getPreviewImages = (arFiles: FileData[]) => {
    return arFiles.length
      ? map(arFiles, obFile => {
          return { src: obFile.path };
        })
      : [];
  };

  /**
   * Check Promise function
   */
  const isPromise = (p: any): boolean => {
    return p.constructor.name === 'AsyncFunction' ||
      (isObjectLike(p) && isFunction(p.then));
  };

  /**
   * Get formatted date
   */
  const dateFormat = (sValue: string, sFormat = 'l') => {
    return dayjs(sValue).format(sFormat);
  };

  /**
   * Download file
   */
  const download = (obData: BlobPart, sFilename: string) => {
    const fileURL = window.URL.createObjectURL(new Blob([obData]));
    const fileLink = document.createElement('a');

    fileLink.href = fileURL;
    fileLink.setAttribute('download', sFilename);
    document.body.appendChild(fileLink);

    fileLink.click();
  };

  const getUploadUrl = (sUrl?: string, sId?: string | number) => {
    if (!sId || !sUrl) {
      return undefined;
    }

    return `/${sUrl}/upload/${sId}`;
  };

  /**
   * Calculate height from aspect ratio and width
   */
  const calculateHeight = (fWidth: number | string, fRatio: number | string): number => {
    fWidth = isString(fWidth) ? parseFloat(fWidth) : fWidth;
    fRatio = isString(fRatio) ? parseFloat(fRatio) : fRatio;

    return parseFloat((fWidth / fRatio).toFixed(2));
  };

  /**
   * Calculate width from aspect ratio and height
   */
  const calculateWidth = (fHeight: number | string, fRatio: number | string): number => {
    fHeight = isString(fHeight) ? parseFloat(fHeight) : fHeight;
    fRatio = isString(fRatio) ? parseFloat(fRatio) : fRatio;

    return parseFloat((fHeight * fRatio).toFixed(2));
  };

  return {
    calculateHeight,
    calculateWidth,
    dateFormat,
    dotcase,
    download,
    getFileList,
    getPreviewImages,
    getUploadUrl,
    initials,
    isPromise,
    rules,
  };
}
