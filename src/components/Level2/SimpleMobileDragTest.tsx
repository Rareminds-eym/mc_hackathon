import React, { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  TouchSensor,
  MouseSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core';

// Ultra-simple draggable for mobile testing
const SimpleDraggable = ({ id, children }: { id: string; children: React.ReactNode }) => {
  const [isTouching, setIsTouching] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({ id });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onTouchStart={() => {
        setIsTouching(true);
        if ('vibrate' in navigator) navigator.vibrate(50);
      }}
      onTouchEnd={() => setIsTouching(false)}
      className={`
        p-6 bg-blue-500 text-white rounded-xl font-bold text-lg
        cursor-grab touch-manipulation select-none
        min-h-[80px] min-w-[200px] flex items-center justify-center
        transition-all duration-100
        ${isDragging ? 'opacity-80 scale-110' : 'opacity-100'}
        ${isTouching ? 'scale-110 shadow-2xl bg-blue-600' : ''}
        active:scale-115 active:shadow-2xl
        border-4 border-blue-300
      `}
      style={{
        ...style,
        touchAction: 'none',
      }}
    >
      {children}
    </div>
  );
};

// Simple drop zone
const SimpleDropZone = ({ id, children }: { id: string; children: React.ReactNode }) => {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`
        p-8 border-4 border-dashed rounded-xl min-h-[150px]
        flex items-center justify-center text-lg font-bold
        transition-all duration-200
        ${isOver 
          ? 'border-green-500 bg-green-100 text-green-700 scale-105' 
          : 'border-gray-400 bg-gray-50 text-gray-500'
        }
      `}
    >
      {children}
    </div>
  );
};

// Main test component
const SimpleMobileDragTest = () => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [droppedItems, setDroppedItems] = useState<string[]>([]);

  // Ultra-simple sensors for mobile
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 1 }
    }),
    useSensor(TouchSensor, {
      activationConstraint: { 
        delay: 0, 
        tolerance: 20 
      }
    }),
    useSensor(PointerSensor, {
      activationConstraint: { 
        distance: 1,
        delay: 0,
        tolerance: 20
      }
    })
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={(event) => setActiveId(event.active.id as string)}
      onDragEnd={(event) => {
        const { active, over } = event;
        if (over && over.id === 'dropzone') {
          setDroppedItems(prev => [...prev, active.id as string]);
        }
        setActiveId(null);
      }}
    >
      <div className="p-6 max-w-md mx-auto space-y-8">
        <h1 className="text-2xl font-bold text-center">
          Mobile Drag Test
        </h1>
        
        <div className="text-center text-sm text-gray-600">
          Touch and drag the items below to the drop zone
        </div>

        {/* Draggable Items */}
        <div className="space-y-4">
          <SimpleDraggable id="item1">
            📱 Touch Me!
          </SimpleDraggable>
          <SimpleDraggable id="item2">
            🎯 Drag Me!
          </SimpleDraggable>
          <SimpleDraggable id="item3">
            ⚡ Move Me!
          </SimpleDraggable>
        </div>

        {/* Drop Zone */}
        <SimpleDropZone id="dropzone">
          {droppedItems.length > 0 ? (
            <div>
              <div>✅ Dropped:</div>
              {droppedItems.map(item => (
                <div key={item} className="text-sm">{item}</div>
              ))}
            </div>
          ) : (
            <div>📦 Drop Here</div>
          )}
        </SimpleDropZone>

        {/* Reset */}
        <button
          onClick={() => setDroppedItems([])}
          className="w-full p-4 bg-red-500 text-white rounded-xl font-bold"
        >
          Reset
        </button>

        {/* Mobile Status */}
        <div className="text-center text-xs text-gray-500">
          {activeId && <div className="text-red-600 font-bold">DRAGGING: {activeId}</div>}
          <div>Touch Action: none | User Select: none</div>
        </div>
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeId ? (
          <div className="p-6 bg-red-500 text-white rounded-xl font-bold text-lg shadow-2xl scale-125 border-4 border-red-300">
            🚀 {activeId}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
};

export default SimpleMobileDragTest;
