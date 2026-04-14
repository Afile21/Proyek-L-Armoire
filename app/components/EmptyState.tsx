import Link from "next/link";
import Icon from "./Icon";
import { ArchiveX, Plus } from "lucide-react";

interface EmptyStateProps {
    title?: string;
    description?: string;
    actionHref?: string;
    actionLabel?: string;
}

export default function EmptyState({
    title = "No Archive Found",
    description = "The requested collection or item is currently empty. Please add an entry to begin.",
    actionHref = "/add",
    actionLabel = "Add New Item",
}: EmptyStateProps) {
    return (
        <div className="w-full flex flex-col items-center justify-center py-24 border-t border-b border-[#E5E5E5] my-12">
            <Icon
                icon={ArchiveX}
                size={40}
                strokeWidth={1}
                className="text-[#A3A3A3] mb-6"
                decorative={true}
            />
            <h3 className="font-playfair text-xl uppercase tracking-widest text-black mb-3 text-center">
                {title}
            </h3>
            <p className="font-inter text-[10px] tracking-[0.2em] text-[#A3A3A3] uppercase text-center max-w-sm leading-relaxed mb-10">
                {description}
            </p>

            {actionHref && (
                <Link
                    href={actionHref}
                    className="flex items-center gap-3 text-[11px] font-inter tracking-[0.2em] uppercase text-black border-b border-black pb-1 hover:text-[#A3A3A3] hover:border-[#A3A3A3] transition-all"
                >
                    <Icon icon={Plus} size={14} decorative={true} />
                    <span>{actionLabel}</span>
                </Link>
            )}
        </div>
    );
}