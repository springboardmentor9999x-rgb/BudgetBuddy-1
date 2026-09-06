import React from 'react';
import {
  Utensils,
  Home,
  Car,
  ShoppingBag,
  Film,
  GraduationCap,
  HeartPulse,
  Sparkles,
  TrendingUp,
  MoreHorizontal,
  Briefcase,
  Laptop,
  Coins,
  Clock,
  Gift,
  HelpCircle,
  LucideIcon,
} from 'lucide-react';
import { ExpenseCategory, IncomeSource } from '../types/budget';

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  'Food & Dining': Utensils,
  'Housing & Utilities': Home,
  'Transportation': Car,
  'Shopping': ShoppingBag,
  'Entertainment & Fun': Film,
  'Education & Books': GraduationCap,
  'Health & Wellness': HeartPulse,
  'Personal Care': Sparkles,
  'Investments & Savings': TrendingUp,
  'Miscellaneous': MoreHorizontal,
  'Salary / Wages': Briefcase,
  'Freelance / Projects': Laptop,
  'Investments & Dividends': Coins,
  'Part-time Work': Clock,
  'Allowance & Stipend': Coins,
  'Side Hustle': TrendingUp,
  'Gifts & Rewards': Gift,
  'Other': HelpCircle,
};

interface CategoryIconProps {
  name: ExpenseCategory | IncomeSource | string;
  className?: string;
}

export const CategoryIcon: React.FC<CategoryIconProps> = ({ name, className = 'w-4 h-4' }) => {
  const IconComponent = CATEGORY_ICONS[name] || MoreHorizontal;
  return <IconComponent className={className} />;
};
