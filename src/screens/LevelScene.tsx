import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import { RootState } from '../store';
import { initializeLevel, dropItem, removeItemFromZone, completeLevel } from '../store/gameSlice';
import { ArrowLeft, CheckCircle, X, RotateCcw } from 'lucide-react';
import { DraggableItem } from '../types/game';

export const LevelScene: React.FC = () => {
  const { moduleId, levelId } = useParams<{ moduleId: string; levelId: string }>();
  const { gameData, modules } = useSelector((state: RootState) => state.game);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [draggedItem, setDraggedItem] = useState<DraggableItem | null>(null);
  const [showFeedback, setShowFeedback] = useState<{ [key: string]: 'correct' | 'incorrect' }>({});

  const currentModule = modules.find(m => m.id === parseInt(moduleId || '0'));
  const currentLevel = currentModule?.levels.find(l => l.id === levelId);

  useEffect(() => {
    if (moduleId && levelId) {
      dispatch(initializeLevel({ moduleId: parseInt(moduleId), levelId }));
    }
  }, [moduleId, levelId, dispatch]);

  const handleDragStart = (e: React.DragEvent, item: DraggableItem) => {
    setDraggedItem(item);
    e.dataTransfer.setData('text/plain', item.id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, zoneId: string) => {
    e.preventDefault();
    if (draggedItem) {
      const zone = gameData.dropZones.find(z => z.id === zoneId);
      if (zone) {
        dispatch(dropItem({ itemId: draggedItem.id, zoneId }));
        
        // Show feedback
        const isCorrect = zone.acceptedItems.includes(draggedItem.id);
        setShowFeedback({ ...showFeedback, [zoneId]: isCorrect ? 'correct' : 'incorrect' });
        
        // Clear feedback after 2 seconds
        setTimeout(() => {
          setShowFeedback(prev => ({ ...prev, [zoneId]: undefined }));
        }, 2000);
      }
      setDraggedItem(null);
    }
  };

  const handleRemoveItem = (zoneId: string) => {
    dispatch(removeItemFromZone(zoneId));
  };

  const handleCompleteLevel = () => {
    dispatch(completeLevel());
    navigate(`/modules/${moduleId}/levels`);
  };

  const getAvailableItems = () => {
    const droppedItemIds = gameData.dropZones
      .filter(zone => zone.droppedItem)
      .map(zone => zone.droppedItem!.id);
    
    return gameData.draggableItems.filter(item => !droppedItemIds.includes(item.id));
  };

  if (!currentLevel) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Level not found</h2>
          <button
            onClick={() => navigate('/modules')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            Back to Modules
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate(`/modules/${moduleId}/levels`)}
            className="flex items-center text-white hover:text-blue-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Levels
          </button>
          
          <div className="text-white text-center">
            <h1 className="text-2xl font-bold">{currentLevel.title}</h1>
            <p className="opacity-90">Module {moduleId}</p>
          </div>
          
          <div className="text-white text-right">
            <p className="text-sm opacity-75">Score</p>
            <p className="text-xl font-bold">{gameData.score}</p>
          </div>
        </div>

        {/* Scenario */}
        <div className="bg-white rounded-xl p-6 mb-6 shadow-xl">
          <h2 className="text-xl font-bold text-gray-800 mb-3">Scenario</h2>
          <p className="text-gray-700 text-lg italic">"{currentLevel.scenario}"</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Draggable Items */}
          <div className="bg-white rounded-xl p-6 shadow-xl">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Available Options</h3>
            <div className="space-y-3">
              {getAvailableItems().map((item) => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, item)}
                  className={`p-3 rounded-lg cursor-move transition-all duration-200 hover:scale-105 shadow-md ${
                    item.category === 'violation'
                      ? 'bg-red-50 border-2 border-red-200 hover:border-red-300'
                      : 'bg-green-50 border-2 border-green-200 hover:border-green-300'
                  }`}
                >
                  <p className="text-sm font-medium text-gray-800">{item.text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Drop Zones */}
          <div className="lg:col-span-2 space-y-6">
            {gameData.dropZones.map((zone) => (
              <div
                key={zone.id}
                className="bg-white rounded-xl p-6 shadow-xl relative"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, zone.id)}
              >
                <h3 className={`text-lg font-bold mb-4 ${
                  zone.category === 'violation' ? 'text-red-600' : 'text-green-600'
                }`}>
                  {zone.title}
                </h3>
                
                <div className={`min-h-24 border-2 border-dashed rounded-lg p-4 transition-all duration-200 ${
                  zone.droppedItem
                    ? zone.category === 'violation'
                      ? 'border-red-300 bg-red-50'
                      : 'border-green-300 bg-green-50'
                    : 'border-gray-300 bg-gray-50 hover:border-gray-400'
                }`}>
                  {zone.droppedItem ? (
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-800">
                        {zone.droppedItem.text}
                      </p>
                      <button
                        onClick={() => handleRemoveItem(zone.id)}
                        className="text-gray-500 hover:text-red-500 transition-colors"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  ) : (
                    <p className="text-gray-500 text-center italic">
                      Drag an option here
                    </p>
                  )}
                </div>

                {/* Feedback */}
                {showFeedback[zone.id] && (
                  <div className={`absolute top-2 right-2 p-2 rounded-full ${
                    showFeedback[zone.id] === 'correct'
                      ? 'bg-green-500 text-white'
                      : 'bg-red-500 text-white'
                  }`}>
                    {showFeedback[zone.id] === 'correct' ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <X className="w-5 h-5" />
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Completion */}
        {gameData.isCompleted && (
          <div className="mt-6 bg-green-500 text-white rounded-xl p-6 text-center shadow-xl">
            <CheckCircle className="w-12 h-12 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Level Complete! 🎉</h2>
            <p className="text-lg mb-4">You scored {gameData.score} points!</p>
            <button
              onClick={handleCompleteLevel}
              className="bg-white text-green-600 font-semibold py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors"
            >
              Continue to Next Level
            </button>
          </div>
        )}

        {/* Reset Button */}
        <div className="mt-6 text-center">
          <button
            onClick={() => {
              if (moduleId && levelId) {
                dispatch(initializeLevel({ moduleId: parseInt(moduleId), levelId }));
              }
            }}
            className="bg-white text-blue-600 font-semibold py-2 px-4 rounded-lg hover:bg-gray-100 transition-colors shadow-lg"
          >
            <RotateCcw className="w-4 h-4 inline mr-2" />
            Reset Level
          </button>
        </div>
      </div>
    </div>
  );
};