import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface SummaryCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  variant?: 'default' | 'success' | 'warning';
  onClick?: () => void;
}

export const SummaryCard = ({ title, value, icon: Icon, variant = 'default', onClick }: SummaryCardProps) => {
  const variantClasses = {
    default: 'bg-gradient-primary text-primary-foreground',
    success: 'bg-gradient-success text-success-foreground',
    warning: 'bg-warning text-warning-foreground',
  };

  return (
    <Card 
      className={cn(
        "shadow-card hover:shadow-hover transition-all duration-200 cursor-pointer",
        onClick && "hover:scale-105"
      )}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold mt-2">{value}</p>
          </div>
          <div className={cn("p-3 rounded-lg", variantClasses[variant])}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
