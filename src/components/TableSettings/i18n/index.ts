import {addComponentKeysets} from '@gravity-ui/uikit/i18n';

import {NAMESPACE} from '../../../utils';

import en from './en.json';
import ru from './ru.json';

const COMPONENT = `${NAMESPACE}table-settings`;

type TranslationParams = Parameters<ReturnType<typeof addComponentKeysets>>[1];

const i18n: (key: keyof typeof en, params?: TranslationParams) => string = addComponentKeysets(
    {en, ru},
    COMPONENT,
);

export default i18n;
