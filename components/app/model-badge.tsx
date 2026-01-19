import { cva, type VariantProps } from 'class-variance-authority';
import { ModelName } from '@/types';

const modelBadgeVariants = cva(
  `
    inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-bold
    tracking-wide uppercase shadow-sm
  `,
  {
    variants: {
      model: {
        'Claude 3.5': `
          border border-purple-200 bg-purple-100 text-purple-700
          dark:border-purple-700 dark:bg-purple-900/30 dark:text-purple-300
        `,
        'GPT-4o': `
          border border-green-200 bg-green-100 text-green-700
          dark:border-green-700 dark:bg-green-900/30 dark:text-green-300
        `,
        'Llama 3': `
          border border-orange-200 bg-orange-100 text-orange-700
          dark:border-orange-700 dark:bg-orange-900/30 dark:text-orange-300
        `,
        'DeepSeek': `
          border border-blue-200 bg-blue-100 text-blue-700
          dark:border-blue-700 dark:bg-blue-900/30 dark:text-blue-300
        `,
        'GLM-4': `
          border border-red-200 bg-red-100 text-red-700
          dark:border-red-700 dark:bg-red-900/30 dark:text-red-300
        `,
        'Mistral': `
          border border-cyan-200 bg-cyan-100 text-cyan-700
          dark:border-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300
        `,
      },
      size: {
        sm: 'px-1.5 py-0.5 text-[10px]',
        md: 'px-2 py-1 text-xs',
        lg: 'px-3 py-1.5 text-sm',
      },
    },
    defaultVariants: {
      model: 'Claude 3.5',
      size: 'md',
    },
  }
);

export interface ModelBadgeProps extends VariantProps<typeof modelBadgeVariants> {
  model: ModelName;
  showDot?: boolean;
}

export function ModelBadge({ model, size, showDot = false }: ModelBadgeProps) {
  return (
    <div className={modelBadgeVariants({ model, size })}>
      {showDot && (
        <span className="size-2 rounded-full bg-current" />
      )}
      {model}
    </div>
  );
}
