import * as React from 'react';

import {Link} from '@gravity-ui/uikit';

import {b} from './RowLink.classname';

import './RowLink.scss';

export const interactiveElementLinkRowClassName = b('interactive-element');

type RowLinkProps<T> = {
    entity: T;
    index: number;
    getLinkProps: (e: T, i: number) => {href: string; target: string};
};

export const RowLink = <T,>({getLinkProps, entity, index}: RowLinkProps<T>) => {
    const content = React.useMemo(() => {
        const linkProps = getLinkProps(entity, index);

        if (linkProps.href) {
            return (
                <Link
                    className={b('main-link-cell')}
                    href={linkProps.href}
                    target={linkProps.target}
                    aria-label={linkProps.href}
                />
            );
        }

        return null;
    }, [entity, getLinkProps, index]);

    return content;
};
