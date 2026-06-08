interface CategoryRequiredNoticeProps {
  title: string;
  description?: string;
}

export function CategoryRequiredNotice({
  title,
  description = "Elige Sub-15, Sub-13 u otra categoría arriba. Separamos edades para que cada lista sea justa y clara.",
}: CategoryRequiredNoticeProps) {
  return (
    <div className="mf-card border-dashed p-8 text-center">
      <p className="text-sm font-medium text-mf-text">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-7 text-mf-text-secondary">
        {description}
      </p>
    </div>
  );
}
