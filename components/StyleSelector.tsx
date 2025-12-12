import React from 'react';
import { LEARNING_STYLES } from '../constants';
import { LearningStyleType } from '../types';
import * as Icons from 'lucide-react';

interface StyleSelectorProps {
  selectedStyle: LearningStyleType | null;
  onSelect: (style: LearningStyleType) => void;
  disabled?: boolean;
}

const StyleSelector: React.FC<StyleSelectorProps> = ({ selectedStyle, onSelect, disabled }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">Select Learning Style</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {LEARNING_STYLES.map((style) => {
          // Dynamic icon rendering
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const IconComponent = (Icons as any)[style.iconName];
          const isSelected = selectedStyle === style.id;

          return (
            <button
              key={style.id}
              onClick={() => onSelect(style.id)}
              disabled={disabled}
              className={`
                relative p-4 rounded-xl border-2 text-left transition-all duration-200 group
                ${isSelected 
                  ? style.color.replace('bg-', 'bg-opacity-10 dark:bg-opacity-20 bg-').replace('text-', 'text-') + ' border-current ring-1 ring-offset-2 ring-indigo-100 dark:ring-indigo-900/50 dark:ring-offset-slate-800' 
                  : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-600 dark:text-slate-300 hover:shadow-md'
                }
                ${disabled ? 'opacity-60 cursor-not-allowed grayscale' : 'cursor-pointer'}
              `}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg ${isSelected ? 'bg-white bg-opacity-60 dark:bg-opacity-10' : 'bg-slate-50 dark:bg-slate-700 group-hover:bg-slate-100 dark:group-hover:bg-slate-600'}`}>
                  {IconComponent && <IconComponent size={20} className={isSelected ? 'text-current' : 'text-slate-500 dark:text-slate-400'} />}
                </div>
                <div>
                  <h4 className={`font-semibold text-sm ${isSelected ? 'text-current' : 'text-slate-800 dark:text-slate-100'}`}>
                    {style.label}
                  </h4>
                  <p className="text-xs mt-1 text-slate-500 dark:text-slate-400 leading-relaxed">
                    {style.description}
                  </p>
                </div>
              </div>
              
              {isSelected && (
                <div className="absolute top-2 right-2">
                  <span className="flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-current"></span>
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default StyleSelector;