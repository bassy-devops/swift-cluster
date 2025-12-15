import { render, screen, fireEvent } from '@testing-library/react';
import { DateConditionBuilder } from '../UserSegmentView';
import { describe, it, expect, vi } from 'vitest';

describe('DateConditionBuilder', () => {
    const defaultProps = {
        value: {
            mode: 'absolute' as const,
            absolute: { start: '', end: '' },
            relative: {
                type: 'preset' as const,
                presetId: 'last_30d',
                custom: {
                    from: { value: 7, unit: 'days' as const, direction: 'ago' as const },
                    to: { value: 0, unit: 'days' as const, direction: 'ago' as const }
                }
            }
        },
        onChange: vi.fn()
    };

    it('renders absolute mode by default', () => {
        const { container } = render(<DateConditionBuilder {...defaultProps} />);
        // screen.debug(); 
        expect(screen.getByText('Absolute')).toHaveClass('bg-slate-800');
        // Check for the inputs themselves which confirms the absolute block is rendered
        const startInput = container.querySelector('input[type="date"]'); // First one
        expect(startInput).toBeInTheDocument();
    });

    it('switches to relative mode', () => {
        render(<DateConditionBuilder {...defaultProps} />);
        const relativeBtn = screen.getByText('Relative');
        fireEvent.click(relativeBtn);
        expect(defaultProps.onChange).toHaveBeenCalledWith(expect.objectContaining({
            mode: 'relative'
        }));
    });

    it('updates absolute values', () => {
        const { container } = render(<DateConditionBuilder {...defaultProps} />);
        const input = container.querySelector('input[type="date"]');
        expect(input).toBeInTheDocument();
        if (input) {
            fireEvent.change(input, { target: { value: '2023-01-01' } });
            expect(defaultProps.onChange).toHaveBeenCalledWith(expect.objectContaining({
                absolute: expect.objectContaining({ start: '2023-01-01' })
            }));
        }
    });
});
