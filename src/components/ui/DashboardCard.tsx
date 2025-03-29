
import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

interface DashboardCardProps {
  title: string;
  icon: React.ReactNode;
  to: string;
  className?: string;
  animate?: boolean;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  icon,
  to,
  className,
  animate = true,
}) => {
  return (
    <Link 
      to={to}
      className={cn(
        "relative overflow-hidden rounded-xl border border-border bg-white p-6 shadow-sm transition-all hover:shadow-md card-hover text-center",
        animate && "animate-scale-in",
        className
      )}
    >
      <div className="flex flex-col items-center space-y-3">
        <div className="rounded-full bg-systemair-blue/10 p-3 text-systemair-blue">
          {icon}
        </div>
        <h3 className="text-xl font-semibold">{title}</h3>
      </div>
      
      <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-systemair-blue to-systemair-lightblue opacity-0 transition-opacity duration-300 hover:opacity-100" />
    </Link>
  );
};
