interface SkeletonProps {
    className?: string;
}

export function Skeleton({ className = '' }: SkeletonProps) {
    return <div className={`skeleton ${className}`} />;
}

export function CardSkeleton() {
    return (
        <div className="card p-4 space-y-4">
            <Skeleton className="h-40 w-full rounded-xl" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex justify-between items-center">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-10 w-24 rounded-xl" />
            </div>
        </div>
    );
}

export function MenuItemSkeleton() {
    return (
        <div className="card p-4 flex gap-4">
            <Skeleton className="w-24 h-24 rounded-xl flex-shrink-0" />
            <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/2" />
                <div className="flex justify-between items-center pt-2">
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-10 w-24 rounded-xl" />
                </div>
            </div>
        </div>
    );
}

export function VendorCardSkeleton() {
    return (
        <div className="card p-4 flex items-center gap-4">
            <Skeleton className="w-16 h-16 rounded-xl" />
            <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
            </div>
            <Skeleton className="h-8 w-20 rounded-full" />
        </div>
    );
}

export function OrderSkeleton() {
    return (
        <div className="card p-6 space-y-4">
            <div className="flex justify-between items-center">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-8 w-24 rounded-full" />
            </div>
            <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex justify-between">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-4 w-16" />
                    </div>
                ))}
            </div>
            <div className="pt-4 border-t">
                <div className="flex justify-between">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-6 w-24" />
                </div>
            </div>
        </div>
    );
}
