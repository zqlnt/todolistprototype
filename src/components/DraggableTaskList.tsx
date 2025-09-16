import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import TaskItem from './TaskItem';
import { Task } from '../types';

interface DraggableTaskItemProps {
  task: Task;
  level?: number;
}

const DraggableTaskItem: React.FC<DraggableTaskItemProps> = ({ task, level = 0 }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <div className="flex items-center">
        <div
          {...attributes}
          {...listeners}
          className="p-2 cursor-grab hover:bg-gray-100 rounded transition-colors opacity-0 group-hover:opacity-100"
          title="Drag to reorder"
        >
          <GripVertical size={16} className="text-gray-400" />
        </div>
        <div className="flex-1">
          <TaskItem task={task} level={level} />
        </div>
      </div>
    </div>
  );
};

interface DraggableTaskListProps {
  tasks: Task[];
  onReorder: (oldIndex: number, newIndex: number) => void;
  onMoveToCategory: (taskId: string, categoryId: string) => void;
}

const DraggableTaskList: React.FC<DraggableTaskListProps> = ({
  tasks,
  onReorder,
  onMoveToCategory,
}) => {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = tasks.findIndex((task) => task.id === active.id);
      const newIndex = tasks.findIndex((task) => task.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        onReorder(oldIndex, newIndex);
      }
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={tasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-0">
          {tasks.map((task) => (
            <div key={task.id} className="group">
              <DraggableTaskItem task={task} />
            </div>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default DraggableTaskList;
