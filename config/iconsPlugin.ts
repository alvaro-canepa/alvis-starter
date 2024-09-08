import { promises as fs } from 'node:fs';
import { resolve } from 'node:path';

import {
  cleanupSVG,
  deOptimisePaths,
  isEmptyColor,
  parseColors,
  runSVGO,
  SVG,
} from '@iconify/tools';
import { compareColors, stringToColor } from '@iconify/utils/lib/colors';
import fg from 'fast-glob';
import { castArray, forEach, kebabCase, set } from 'lodash-es';
import Icons from 'unplugin-icons/vite';

const sBase = '/mnt/Trabajos/Devel/UI/Icons/SVG';

const collectionIcon = async (sIcon: string, sCollection: string) => {
  const sPath = resolve(`${sBase}/${sCollection}`);
  const arFilePath = fg.sync(`**/${sIcon}.svg`, { cwd: sPath });

  if (!arFilePath?.length) {
    return;
  }

  const sFilePath = `${sPath}/${arFilePath[0]}`;
  const content = await fs.readFile(sFilePath, 'utf-8');
  const svg = new SVG(content);

  // Clean up icon
  cleanupSVG(svg);

  // Optimise
  runSVGO(svg);

  // Update paths for compatibility with old software
  deOptimisePaths(svg);

  if (sCollection !== 'logos') {
    parseColors(svg, {
      defaultColor: 'currentColor',
      callback: (attr, colorStr, color) => {
        if (!color || colorStr === 'currentColor') {
          // color === null, so color cannot be parsed
          // Return colorStr to keep old value
          return colorStr;
        }

        if (isEmptyColor(color)) {
          // Color is empty: 'none' or 'transparent'
          // Return color object to keep old value
          return color;
        }

        // Black color: change to 'currentColor'
        const sBlack = stringToColor('black');
        const sWhite = stringToColor('white');
        if (sBlack && compareColors(color, sBlack)) {
          return 'currentColor';
        }

        // White color: belongs to white background rectangle: remove rectangle
        if (sWhite && compareColors(color, sWhite)) {
          return 'remove';
        }

        // Unexpected color. Add code to check for it
        return colorStr;
        // throw new Error(`Unexpected color "${colorStr}" in attribute ${attr}`);
      },
    });
  }

  return svg.toMinifiedString({});
};

export function iconsPlugin(sCollection: string | string[]): any {
  const arCollectionNameList = castArray(sCollection);
  const obCollection: Record<string, any> = {};

  forEach(arCollectionNameList, sCollectionName => {
    set(
      obCollection,
      sCollectionName,
      async (sName: string) => await collectionIcon(sName, sCollectionName)
    );
  });

  return Icons({
    compiler: 'vue3',
    customCollections: obCollection,
    transform(svg, collection, icon) {
      // console.log(icon, collection);
      const sCollection = kebabCase(collection);
      const arClassList = [
        'svg-icon',
        `icons-pkg-${sCollection}`,
        `icon-${icon}`,
      ];
      const sClass = arClassList.join(' ');
      return `<span class="${sClass}">${svg}</span>`;
    },
    autoInstall: true,
  });
}
