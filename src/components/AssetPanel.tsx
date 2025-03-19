import React, { useState } from 'react';
import { Upload, Image, FileText, Music, Film, Folder, Type } from 'lucide-react';
import { useStore } from '../store/useStore';

type AssetCategory = 'all' | 'images' | 'audio' | 'fonts' | 'sprites';

export function AssetPanel() {
  const assets = useStore((state) => state.assets);
  const [selectedCategory, setSelectedCategory] = useState<AssetCategory>('all');

  const categories = [
    { id: 'all', name: 'All Files', icon: Folder },
    { id: 'images', name: 'Images', icon: Image },
    { id: 'sprites', name: 'Sprites', icon: Image },
    { id: 'audio', name: 'Audio', icon: Music },
    { id: 'fonts', name: 'Fonts', icon: Type },
  ];

  const getAssetIcon = (type: string) => {
    if (type.startsWith('image')) return <Image className="w-5 h-5" />;
    if (type.startsWith('text')) return <FileText className="w-5 h-5" />;
    if (type.startsWith('audio')) return <Music className="w-5 h-5" />;
    if (type.startsWith('video')) return <Film className="w-5 h-5" />;
    return <FileText className="w-5 h-5" />;
  };

  const filteredAssets = assets.filter(asset => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'images') return asset.type.startsWith('image') && !asset.name.includes('sprite');
    if (selectedCategory === 'sprites') return asset.type.startsWith('image') && asset.name.includes('sprite');
    if (selectedCategory === 'audio') return asset.type.startsWith('audio');
    if (selectedCategory === 'fonts') return asset.type.includes('font');
    return true;
  });

  return (
    <div className="w-64 bg-gray-50 border-l flex flex-col h-full">
      <div className="p-4 border-b">
        <h3 className="font-semibold mb-4">Assets</h3>
        <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg flex items-center justify-center space-x-2 hover:bg-blue-700">
          <Upload className="w-4 h-4" />
          <span>Upload Asset</span>
        </button>
      </div>

      <div className="border-b">
        <div className="p-2 grid grid-cols-2 gap-1">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id as AssetCategory)}
              className={`p-2 rounded text-sm flex items-center space-x-1 ${
                selectedCategory === category.id
                  ? 'bg-blue-100 text-blue-700'
                  : 'hover:bg-gray-100'
              }`}
            >
              <category.icon className="w-4 h-4" />
              <span>{category.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        {filteredAssets.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">
            No assets in this category
          </div>
        ) : (
          filteredAssets.map((asset) => (
            <div
              key={asset.id}
              className="p-3 hover:bg-gray-100 flex items-center space-x-3 cursor-pointer"
            >
              {getAssetIcon(asset.type)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{asset.name}</p>
                <p className="text-xs text-gray-500">
                  {(asset.size / 1024).toFixed(1)} KB
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}