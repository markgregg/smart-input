import './FilterPill.css';

interface FilterPillProps {
  field: string;
  operator: string;
  value: string;
}

function FilterPill({ field, operator, value }: FilterPillProps) {
  return (
    <span className="filter-pill">
      <span className="pill-field">{field}</span>
      <span className="pill-operator">{operator}</span>
      <span className="pill-value">{value}</span>
    </span>
  );
}

export default FilterPill;
