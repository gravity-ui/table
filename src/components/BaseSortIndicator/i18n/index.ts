import {addComponentKeysets} from '@gravity-ui/uikit/i18n';

import {NAMESPACE} from '../../../utils';

import en from './en.json';
import ru from './ru.json';

const COMPONENT = `${NAMESPACE}base-sort-indicator`;

export default addComponentKeysets({en, ru}, COMPONENT);
