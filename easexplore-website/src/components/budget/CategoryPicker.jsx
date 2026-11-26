import Chip from '@/components/ui/Chip';
import { CATEGORIES } from '@/config/budget';

/** Row of category chips. `labelledBy` is the id of the heading that names this group. */
export default function CategoryPicker({ value, onChange, labelledBy, error }) {
  return (
    <div>
      <div role="group" aria-labelledby={labelledBy} className="flex flex-wrap gap-2">
        {CATEGORIES.map((category) => (
          <Chip
            key={category.id}
            icon={category.icon}
            selected={value === category.id}
            onClick={() => onChange(category.id)}
          >
            {category.label}
          </Chip>
        ))}
      </div>
      {error && <p className="mt-1 text-body-sm text-error">{error}</p>}
    </div>
  );
}
