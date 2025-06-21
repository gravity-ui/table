import {Link} from '@gravity-ui/uikit';

import {b} from './RowLink.classname';

import './RowLink.scss';

export const RowLink = (props: Parameters<typeof Link>[0]) => {
    if (props.href) {
        return <Link className={b()} {...props} />;
    }

    return null;
};
