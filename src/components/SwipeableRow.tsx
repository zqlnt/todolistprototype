import React, { useState, useRef, useEffect } from 'react';
import { motion, PanInfo, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { StarIcon, TrashIcon } from '@heroicons/react/24/solid';

interface SwipeableRowProps {
  children: React.ReactNode;
  onPrioritise: () => void;
  onDelete: () => void;
  isPrioritized?: boolean;
  disabled?: boolean;
  className?: string;
}

const SwipeableRow: React.FC<SwipeableRowProps> = ({
  children,
  onPrioritise,
  onDelete,
  isPrioritized = false,
  disabled = false,
  className = '',
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [showUndo, setShowUndo] = useState(false);
  const [pendingAction, setPendingAction] = useState<'prioritize' | 'delete' | null>(null);
  const x = useMotionValue(0);
  const xSpring = useSpring(x, { stiffness: 400, damping: 40 });
  const rowRef = useRef<HTMLDivElement>(null);

  // Thresholds
  const REVEAL_THRESHOLD = 12;
  const COMMIT_THRESHOLD = 72;
  const MAX_DRAG = 160;
  const VELOCITY_THRESHOLD = 1200;

  // Transform values for animations
  const leftActionOpacity = useTransform(x, [0, REVEAL_THRESHOLD, COMMIT_THRESHOLD], [0, 0.3, 1]);
  const rightActionOpacity = useTransform(x, [-COMMIT_THRESHOLD, -REVEAL_THRESHOLD, 0], [1, 0.3, 0]);
  
  const leftActionScale = useTransform(x, [0, REVEAL_THRESHOLD, COMMIT_THRESHOLD], [0.5, 0.7, 1]);
  const rightActionScale = useTransform(x, [-COMMIT_THRESHOLD, -REVEAL_THRESHOLD, 0], [1, 0.7, 0.5]);

  const leftActionTranslate = useTransform(x, [0, COMMIT_THRESHOLD], [20, 0]);
  const rightActionTranslate = useTransform(x, [-COMMIT_THRESHOLD, 0], [0, 20]);

  const handleDragStart = () => {
    if (disabled) return;
    setIsDragging(true);
    setShowUndo(false);
    setPendingAction(null);
  };

  const handleDrag = (event: any, info: PanInfo) => {
    if (disabled) return;
    
    const currentX = info.offset.x;
    
    // Apply resistance at the edges
    let cappedX = currentX;
    if (currentX > 0) {
      // Swiping right - apply resistance after threshold
      if (currentX > COMMIT_THRESHOLD) {
        cappedX = COMMIT_THRESHOLD + (currentX - COMMIT_THRESHOLD) * 0.3;
      }
    } else {
      // Swiping left - apply resistance after threshold
      if (currentX < -COMMIT_THRESHOLD) {
        cappedX = -COMMIT_THRESHOLD + (currentX + COMMIT_THRESHOLD) * 0.3;
      }
    }
    
    // Final cap
    cappedX = Math.max(-MAX_DRAG, Math.min(MAX_DRAG, cappedX));
    x.set(cappedX);
  };

  const handleDragEnd = (event: any, info: PanInfo) => {
    if (disabled) return;
    
    setIsDragging(false);
    const currentX = info.offset.x;
    const velocity = Math.abs(info.velocity.x);
    
    // Determine action based on position and velocity
    const shouldCommit = Math.abs(currentX) >= COMMIT_THRESHOLD || velocity >= VELOCITY_THRESHOLD;
    const isRightSwipe = currentX > 0;
    const isLeftSwipe = currentX < 0;

    if (shouldCommit) {
      if (isRightSwipe) {
        setPendingAction('prioritize');
        onPrioritise();
        // Quick snap back with success feedback
        x.set(0);
        setPendingAction(null);
      } else if (isLeftSwipe) {
        setPendingAction('delete');
        onDelete();
        // Show undo option
        setShowUndo(true);
        // Quick snap back
        x.set(0);
        setPendingAction(null);
      }
    } else {
      // Snap back smoothly
      x.set(0);
    }
  };

  const handleUndo = () => {
    setShowUndo(false);
    // You might want to implement an undo mechanism here
    // For now, we'll just hide the undo button
  };

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (disabled || !rowRef.current?.contains(document.activeElement)) return;
      
      switch (event.key) {
        case 'ArrowRight':
          event.preventDefault();
          onPrioritise();
          break;
        case 'ArrowLeft':
          event.preventDefault();
          onDelete();
          break;
        case 'Enter':
          event.preventDefault();
          // Toggle priority on Enter
          onPrioritise();
          break;
        case 'Escape':
          event.preventDefault();
          // Cancel any pending action
          setShowUndo(false);
          setPendingAction(null);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onPrioritise, onDelete, disabled]);

  return (
    <div className={`relative overflow-hidden swipe-container ${className}`}>
      {/* Background Actions */}
      <div className="absolute inset-0 flex">
        {/* Left Action - Prioritize */}
        <motion.div
          className="flex-1 bg-amber-50 dark:bg-amber-900/10 flex items-center justify-center"
          style={{
            opacity: leftActionOpacity,
          }}
        >
        <motion.div
          className="flex flex-col items-center space-y-1 swipe-action"
          style={{
            scale: leftActionScale,
            translateX: leftActionTranslate,
          }}
        >
            <StarIcon className={`w-6 h-6 ${isPrioritized ? 'text-amber-600' : 'text-amber-500'}`} />
            <span className="text-xs font-medium text-amber-700 dark:text-amber-300">
              {isPrioritized ? 'Unprioritize' : 'Prioritize'}
            </span>
          </motion.div>
        </motion.div>

        {/* Right Action - Delete */}
        <motion.div
          className="flex-1 bg-red-50 dark:bg-red-900/10 flex items-center justify-center"
          style={{
            opacity: rightActionOpacity,
          }}
        >
          <motion.div
            className="flex flex-col items-center space-y-1 swipe-action"
            style={{
              scale: rightActionScale,
              translateX: rightActionTranslate,
            }}
          >
            <TrashIcon className="w-6 h-6 text-red-500" />
            <span className="text-xs font-medium text-red-700 dark:text-red-300">
              Delete
            </span>
          </motion.div>
        </motion.div>
      </div>

      {/* Main Row Content */}
      <motion.div
        ref={rowRef}
        className="relative bg-white dark:bg-gray-900 z-10 swipe-row border-b border-gray-100 dark:border-gray-700"
        style={{
          x: xSpring,
          cursor: disabled ? 'default' : 'grab',
        }}
        drag="x"
        dragConstraints={{ left: -MAX_DRAG, right: MAX_DRAG }}
        dragElastic={0.05}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        tabIndex={0}
        role="button"
        aria-description="Swipe right to prioritise, left to delete. Use arrow keys for keyboard navigation."
        aria-label="Task row with swipe gestures"
        whileDrag={{ cursor: 'grabbing' }}
      >
        {children}
      </motion.div>

      {/* Undo Banner */}
      {showUndo && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="absolute top-0 left-0 right-0 bg-red-500 text-white p-2 text-center z-20"
        >
          <div className="flex items-center justify-center space-x-2">
            <span className="text-sm">Task deleted</span>
            <button
              onClick={handleUndo}
              className="px-3 py-1 bg-white text-red-500 rounded text-sm font-medium hover:bg-gray-100 transition-colors"
            >
              Undo
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default SwipeableRow;
