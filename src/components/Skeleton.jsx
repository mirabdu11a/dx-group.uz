/**
 * Placeholder blocks shown while a section loads, so the layout does not
 * jump when the real cards arrive.
 */
export default function Skeleton({ count, className, testId }) {
  return Array.from({ length: count }, (_, index) => (
    <div key={index} className={className} data-testid={testId} aria-hidden="true" />
  ))
}
