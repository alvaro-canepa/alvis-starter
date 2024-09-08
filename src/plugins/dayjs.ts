import dayjs, { extend, locale } from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import localeData from 'dayjs/plugin/localeData';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import 'dayjs/locale/es';

extend(localeData);
extend(isoWeek);
extend(localizedFormat);
dayjs().localeData();
locale('es');
