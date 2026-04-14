import { LucideIcon, LucideProps } from "lucide-react";

interface IconProps extends LucideProps {
    icon: LucideIcon;
    decorative?: boolean; // kontrol aksesibilitas
    label?: string;       // untuk screen reader jika bukan dekoratif
}

export default function Icon({
    icon: IconComponent,
    size = 18,
    strokeWidth = 1.5,
    className = "",
    decorative = true,
    label,
    ...props
}: IconProps) {
    return (
        <IconComponent
            size={size}
            strokeWidth={strokeWidth}
            className={`shrink-0 ${className}`}
            aria-hidden={decorative}
            aria-label={!decorative ? label : undefined}
            role={!decorative ? "img" : undefined}
            {...props}
        />
    );
}