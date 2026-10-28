/** One step of the tutorial. */
export type TutorialStep = {
  id: string;
  /** `data-tutorial` values to spotlight. The hole covers all their elements. */
  target?: string[];
  title: string;
  body: string;
  /** Label of the button that goes to the next step, or closes on the last one. No button when absent. */
  nextLabel?: string;
  /** Buttons that jump to the step with the `next` id. */
  choices?: { label: string; next: string }[];
  /** Called when entering the step, e.g. to switch tabs or record state. */
  onEnter?(): void;
  /** Advances to the next step automatically once this returns true. */
  waitFor?(): boolean;
};
