import type {Modifier} from '@dnd-kit/core';

import type {ReorderType, TableDndScopeConfig} from '../types';

import {getReorderType} from './reorderType';

function applyModifiers(modifiers: Modifier[], args: Parameters<Modifier>[0]) {
    return modifiers.reduce<ReturnType<Modifier>>(
        (transform, modifier) => modifier({...args, transform}),
        args.transform,
    );
}

export function createMergedModifiers(scopes: TableDndScopeConfig[]): Modifier[] {
    const modifiersByType = scopes.reduce<Partial<Record<ReorderType, Modifier[]>>>(
        (acc, scope) => {
            if (!scope.modifiers?.length) {
                return acc;
            }

            return {...acc, [scope.type]: scope.modifiers};
        },
        {},
    );

    const scopeTypes = Object.keys(modifiersByType) as ReorderType[];

    if (scopeTypes.length === 0) {
        return [];
    }

    return [
        (args) => {
            const type = getReorderType(args.active);
            const modifiers = type ? modifiersByType[type] : undefined;

            if (!modifiers?.length) {
                return args.transform;
            }

            return applyModifiers(modifiers, args);
        },
    ];
}
