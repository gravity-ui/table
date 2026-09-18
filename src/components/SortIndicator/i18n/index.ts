import {addComponentKeysets} from '@gravity-ui/uikit/i18n';

import {NAMESPACE} from '../../../utils';

import en from './en.json';
import ru from './ru.json';

const COMPONENT = `${NAMESPACE}sort-indicator`;

const i18n: (key: keyof typeof en) => string = addComponentKeysets({en, ru}, COMPONENT);

export default i18n;
