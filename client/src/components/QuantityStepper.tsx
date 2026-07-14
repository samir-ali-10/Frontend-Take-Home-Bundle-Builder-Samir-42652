import { MinusIcon, PlusIcon } from './icons';

type QuantityStepperProps = {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  size?: 'md' | 'sm';
  variant?: 'pill' | 'square';
  disabled?: boolean;
  'aria-label'?: string;
};

export function QuantityStepper({
  value,
  onChange,
  min = 0,
  max = 99,
  size = 'md',
  variant = 'pill',
  disabled = false,
  'aria-label': ariaLabel = 'Quantity',
}: QuantityStepperProps) {
  const canDec = !disabled && value > min;
  const canInc = !disabled && value < max;

  return (
    <div
      className={`qty-stepper qty-stepper--${size} qty-stepper--${variant}`}
      role="group"
      aria-label={ariaLabel}
    >
      <button
        type="button"
        className="qty-stepper__btn"
        disabled={!canDec}
        aria-label="Decrease quantity"
        onClick={() => canDec && onChange(value - 1)}
      >
        <MinusIcon />
      </button>
      <span className="qty-stepper__value" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        className="qty-stepper__btn"
        disabled={!canInc}
        aria-label="Increase quantity"
        onClick={() => canInc && onChange(value + 1)}
      >
        <PlusIcon />
      </button>
    </div>
  );
}
