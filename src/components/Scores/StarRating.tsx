import React from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
}

export const StarRating: React.FC<StarRatingProps> = ({ rating, size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  return (
    <div className="flex space-x-1">
      {[1, 2, 3].map((star) => (
        <Star
          key={star}
          className={`${sizeClasses[size]} ${
            star <= rating 
              ? 'text-yellow-400 fill-current' 
              : 'text-gray-300'
          } transition-colors duration-200`}
        />
      ))}
    </div>
  );
};