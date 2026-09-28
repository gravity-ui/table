import {createMeasureRoot} from './createMeasureRoot';

describe('createMeasureRoot', () => {
    it('commits the current content before it can be measured', async () => {
        const container = document.createElement('div');
        document.body.appendChild(container);
        const root = await createMeasureRoot(container);

        try {
            root.render(<span>First cell</span>);
            expect(container).toHaveTextContent(/^First cell$/);

            root.render(<span>Next cell</span>);
            expect(container).toHaveTextContent(/^Next cell$/);

            root.render(null);
            expect(container).toBeEmptyDOMElement();
        } finally {
            root.unmount();
            container.remove();
        }
    });
});
