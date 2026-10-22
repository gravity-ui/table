import type {TreeItem} from '../constants/tree';

import {getAdaptiveVirtualizationStatus} from './getAdaptiveVirtualizationStatus';

const serviceNames = ['billing', 'checkout', 'events', 'identity', 'orders', 'search'];

export function generateAdaptiveVirtualizationData(rootCount: number): TreeItem[] {
    return Array.from({length: rootCount}, (_rootValue, rootIndex) => {
        const rootName = serviceNames[rootIndex % serviceNames.length];
        const rootItemIndex = rootIndex * 25;
        return {
            age: 20 + ((rootItemIndex * 17) % 180),
            children: Array.from({length: 4}, (_serviceValue, serviceIndex) => {
                const serviceItemIndex = rootItemIndex + serviceIndex * 6 + 1;

                return {
                    age: 20 + ((serviceItemIndex * 17) % 180),
                    children: Array.from({length: 5}, (_instanceValue, instanceIndex) => {
                        const instanceItemIndex = serviceItemIndex + instanceIndex + 1;

                        return {
                            age: 20 + ((instanceItemIndex * 17) % 180),
                            id: `instance-${rootIndex}-${serviceIndex}-${instanceIndex}`,
                            name: `${rootName}-worker-${serviceIndex}-${instanceIndex}`,
                            status: getAdaptiveVirtualizationStatus(instanceItemIndex),
                        };
                    }),
                    id: `service-${rootIndex}-${serviceIndex}`,
                    name: `${rootName}-api-${serviceIndex}`,
                    status: getAdaptiveVirtualizationStatus(serviceItemIndex),
                };
            }),
            id: `domain-${rootIndex}`,
            name: `${rootName}-domain-${String(rootIndex).padStart(2, '0')}`,
            status: getAdaptiveVirtualizationStatus(rootItemIndex),
        };
    });
}
