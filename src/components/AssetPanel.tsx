import React, { useState, useRef, useEffect } from 'react';
import { Upload, Image, FileText, Music, Film, Folder, Type, Plus, FolderPlus, Trash2, X, Search } from 'lucide-react';
import { useStore } from '../store/useStore';
import { Asset, ProjectFile, User } from '../types';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';

type AssetCategory = 'all' | 'images' | 'audio' | 'fonts' | 'sprites' | 'code';
export type FileLanguage = 'javascript' | 'typescript' | 'python' | 'java' | 'html' | 'css' | 'json' | 'text';

interface AssetPanelProps {
  isCollapsed?: boolean;
  onOpenFile: (file: ProjectFile) => void;
}

export function AssetPanel({ isCollapsed = false, onOpenFile }: AssetPanelProps) {
  const user = useStore((state) => state.user);
  const getCode = useStore((state) => state.getCode);
  const assets = useStore((state) => state.assets);
  const [selectedCategory, setSelectedCategory] = useState<AssetCategory>('all');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['root']));
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isCreatingNew, setIsCreatingNew] = useState<'file' | 'folder' | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [currentPath, setCurrentPath] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<FileLanguage>('javascript');
  const [showLanguageSelect, setShowLanguageSelect] = useState(false);
  const [projectFiles, setProjectFiles] = useState<ProjectFile[]>([]);
  const addFile = useStore((state) => state.addFile);
  const currentFile = useStore((state) => state.currentFile);
  const setAssets = useStore((state) => state.setAssets);
  const setCode = useStore((state) => state.setCode);

  const selectAsset = useStore((state) => state.selectAsset);

  const categories = [
    { id: 'all', name: 'All Files', icon: Folder },
    { id: 'code', name: 'Code', icon: FileText },
    { id: 'images', name: 'Images', icon: Image },
    { id: 'sprites', name: 'Sprites', icon: Image },
    { id: 'audio', name: 'Audio', icon: Music },
    { id: 'fonts', name: 'Fonts', icon: Type },
  ];

  const languageOptions: { id: FileLanguage; name: string; extension: string }[] = [
    { id: 'javascript', name: 'JavaScript', extension: '.js' },
    { id: 'typescript', name: 'TypeScript', extension: '.ts' },
    { id: 'python', name: 'Python', extension: '.py' },
    { id: 'java', name: 'Java', extension: '.java' },
    { id: 'html', name: 'HTML', extension: '.html' },
    { id: 'css', name: 'CSS', extension: '.css' },
    { id: 'json', name: 'JSON', extension: '.json' },
    { id: 'text', name: 'Plain Text', extension: '.txt' },
  ];

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

     // Fetch project files
    const fetchProjectFiles = () => {
      const getFilesRecursively = (assets: Asset[]): ProjectFile[] => {
        return assets.flatMap((asset) => {
          if (asset.type === 'file' && asset.fileType) {
            return [{ id: asset.id, name: asset.name, content: "", fileType: asset.fileType}];
          } else if (asset.children) {
            return getFilesRecursively(asset.children);
          }
          return [];
        });
      };
    
      const newFiles = getFilesRecursively(sampleAssets);
      setProjectFiles(newFiles);
    };

    setIsImporting(true);
    

    // Process each file
    Array.from(files).forEach(file => {
      console.log('FILE', file)
      const reader = new FileReader();
      reader.onload = () => {
        const newAsset: Asset = {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          type: 'file',
          fileType: file.type,
          size: file.size,
          lastModified: new Date(file.lastModified).toISOString(),
          url: reader.result as string,
        };
        // useStore.setState(state => ({assets: [...state.assets, newAsset]
        // }));
      };

      if (file.type.startsWith('image/')) {
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }
    });

    setIsImporting(false);
    event.target.value = ''; // Reset input
  };

  const getAssetIcon = (asset: Asset) => {
    if (asset.type === 'folder') return <Folder className="w-5 h-5" />;
    if (asset.fileType?.startsWith('image')) return <Image className="w-5 h-5" />;
    if (asset.fileType?.startsWith('text')) return <FileText className="w-5 h-5" />;
    if (asset.fileType?.startsWith('audio')) return <Music className="w-5 h-5" />;
    if (asset.fileType?.startsWith('video')) return <Film className="w-5 h-5" />;
    return <FileText className="w-5 h-5" />;
  };


  useEffect(() => {
    const fetchProjectFiles = async () => {
      if (!user) return;
  
      try {
        const q = query(collection(db, "projects"), where("userId", "==", user?.uid));
        const querySnapshot = await getDocs(q);
        const files = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as ProjectFile[];
        if(files.length > 0) {
          setProjectFiles(files)
        }
      } catch (error) {
        console.error("Error fetching project files:", error);
      }
    };
  
    fetchProjectFiles();
  }, [user]);


  const sampleAssets: Asset[] = [
    {
      id: 'src',
      name: 'src',
      type: 'folder',
      lastModified: '2024-03-19',
      size: 0,
      children: [
        {
          id: 'components',
          name: 'components',
          type: 'folder',
          lastModified: '2024-03-19',
          size: 0,
          children: [
            {
              id: 'Header.tsx',
              name: 'Header.tsx',
              type: 'file',
              fileType: 'text/typescript',
              size: 2500,
              lastModified: '2024-03-19',
            },
            {
              id: 'Editor.tsx',
              name: 'Editor.tsx',
              type: 'file',
              fileType: 'text/typescript',
              size: 4800,
              lastModified: '2024-03-19',
            },
          ],
        },
        {
          id: 'App.tsx',
          name: 'App.tsx',
          type: 'file',
          fileType: 'text/typescript',
          size: 1200,
          lastModified: '2024-03-19',
        },
      ],
    },
    {
      id: 'assets',
      name: 'assets',
      type: 'folder',
      lastModified: '2024-03-19',
      size: 0,
      children: [
        {
          id: 'images',
          name: 'images',
          type: 'folder',
          lastModified: '2024-03-19',
          size: 0,
          children: [],
        },
        {
          id: 'sprites',
          name: 'sprites',
          type: 'folder',
          lastModified: '2024-03-19',
          size: 0,
          children: [],
        },
        {
          id: 'audio',
          name: 'audio',
          type: 'folder',
          lastModified: '2024-03-19',
          size: 0,
          children: [],
        },
      ],
    },
  ];

  useEffect(() => { setAssets(sampleAssets)}, [])

  const toggleFolder = (id: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedFolders(newExpanded);
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return '';
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  const handleCreateNew = (type: 'file' | 'folder') => {
    if (type === 'file') {
      setShowLanguageSelect(true);
    } else {
      setShowLanguageSelect(false);
    }
    setIsCreatingNew(type);
    setNewItemName('');
  };

  const handleDelete = (asset: Asset) => {
    if (asset.type != 'file') return
    if (!confirm(`Are you sure you want to delete ${asset.name}?`)) return;
  
    const removeAsset = (assets: Asset[], assetId: string): Asset[] => {
      return assets.filter(a => {
        if (a.id === assetId ) return false;
        if (a.children) {
          a.children = removeAsset(a.children, assetId);
        }
        return true;
      });
    };

    setAssets(removeAsset([...assets], asset.id))

    if (selectedAsset === asset.id) {
      setSelectedAsset(null);
    }
  };

  const handleSubmitNew = () => {
    if (!newItemName.trim()) return;

    let name = newItemName.trim();
    let fileType: string | undefined;
    
    if (isCreatingNew === 'file') {
      const selectedLangOption = languageOptions.find(lang => lang.id === selectedLanguage);
      
      // Add file extension if missing
      if (selectedLangOption && !name.endsWith(selectedLangOption.extension)) {
        name += selectedLangOption.extension;
      }
      
      // Set appropriate file type
      switch (selectedLanguage) {
        case 'javascript':
          fileType = 'text/javascript';
          break;
        case 'typescript':
          fileType = 'text/typescript';
          break;
        case 'python':
          fileType = 'text/x-python';
          break;
        case 'java':
          fileType = 'text/x-java';
          break;
        case 'html':
          fileType = 'text/html';
          break;
        case 'css':
          fileType = 'text/css';
          break;
        case 'json':
          fileType = 'application/json';
          break;
        default:
          fileType = 'text/plain';
      }
    }

    const newAsset: Asset = {
      id: Math.random().toString(36).substr(2, 9),
      name: name,
      type: isCreatingNew === 'file' ? 'file' : 'folder',
      fileType: fileType,
      size: 0,
      lastModified: new Date().toISOString(),
      children: isCreatingNew === 'folder' ? [] : undefined,
      // Add metadata in a way compatible with the Asset type
      metadata: isCreatingNew === 'file' ? { language: selectedLanguage } : undefined,
    };

    const addAssetToPath = (assets: Asset[], path: string[], newAsset: Asset): Asset[] => {
      if (path.length === 0) {
        return [...assets, newAsset];
      }
      return assets.map(asset => {
        if (asset.id === path[0]) {
          return {
            ...asset,
            children: addAssetToPath(asset.children ?? [], path.slice(1), newAsset)
          };
        }
        return asset;
      });
    };

    useStore.setState(state => ({
      assets: addAssetToPath(state.assets, currentPath, newAsset)
    }));

    setIsCreatingNew(null);
    setNewItemName('');
    setShowLanguageSelect(false);
  };

  // Filter assets based on search query
  const searchFilteredAssets = assets.filter(asset => {
    const searchMatch = !searchQuery || 
      asset.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!searchMatch && asset.children?.some(child => child.name.toLowerCase().includes(searchQuery.toLowerCase()))) return true;
    if (!searchMatch) return false
    
    return true;
  });

  // Further filter by category
  const displayedAssets = searchFilteredAssets.filter(asset => {
    if (selectedCategory === 'all') return true;
    
    // For folders, we want to check if they contain any matching children
    if (asset.type === 'folder') {
      if (asset.children && asset.children.length > 0) {
        // Check if any child matches the selected category
        return asset.children.some(child => {
          if (child.type === 'folder') return true; // Keep folders visible
          
          // Apply category-specific filtering logic
          switch (selectedCategory) {
            case 'code':
              return isCodeFile(child.fileType);
            case 'images':
              return isImageFile(child.fileType) && !child.name.includes('sprite');
            case 'sprites':
              return isImageFile(child.fileType) && child.name.includes('sprite');
            case 'audio':
              return isAudioFile(child.fileType);
            case 'fonts':
              return isFontFile(child.fileType);
            default:
              return false;
          }
        });
      }
      return false; // Empty folders won't be shown if they don't match the category
    }
    
    // For files, directly check if they match the category
    switch (selectedCategory) {
      case 'code':
        return isCodeFile(asset.fileType);
      case 'images':
        return isImageFile(asset.fileType) && !asset.name.includes('sprite');
      case 'sprites':
        return isImageFile(asset.fileType) && asset.name.includes('sprite');
      case 'audio':
        return isAudioFile(asset.fileType);
      case 'fonts':
        return isFontFile(asset.fileType);
      default:
        return false;
    }
  });

  // Helper functions for file type categorization
  const isCodeFile = (fileType?: string): boolean => {
    return !!fileType && (
      fileType.startsWith('text/') || 
      fileType.includes('javascript') || 
      fileType.includes('typescript') || 
      fileType.includes('python') || 
      fileType.includes('java') ||
      fileType.includes('json')
    );
  };

  const isImageFile = (fileType?: string): boolean => {
    return !!fileType && fileType.startsWith('image/');
  };

  const isAudioFile = (fileType?: string): boolean => {
    return !!fileType && fileType.startsWith('audio/');
  };

  const isFontFile = (fileType?: string): boolean => {
    return !!fileType && (
      fileType.includes('font') || 
      fileType.endsWith('.ttf') || 
      fileType.endsWith('.otf') || 
      fileType.endsWith('.woff')
    );
  };

  const renderAsset = (asset: Asset, depth = 0) => {
    const isExpanded = expandedFolders.has(asset.id);
    const isSelected = selectedAsset === asset.id;
    
    // Skip assets that don't match the search
    if (searchQuery && !asset.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      // But if it's a folder that might contain matching children, we should render it
      if (asset.type !== 'folder' || !asset.children?.some(child => 
        child.name.toLowerCase().includes(searchQuery.toLowerCase()),
      )) {
        return null;
      }
    }
  
    if(asset.type === 'firebase'){
      return <div className='w-full text-left px-2 py-1.5 hover:bg-gray-100 flex items-center group text-gray-700' key={asset.id}
      onClick={() => {
        const newAsset = projectFiles.find((e) => e.id == asset.id);
        if(!newAsset) return;
        addFile({ id: newAsset.id, name: newAsset.name, content: newAsset.content, fileType: newAsset.fileType})
        onOpenFile({ id: newAsset.id, name: newAsset.name, content: newAsset.content, fileType: newAsset.fileType})
        setCode(newAsset.content)
      }}>
      <span className="mr-2">
        <FileText className="w-5 h-5" />
      </span>
      <span className="flex-1 truncate">{asset.name}</span>
    </div>
    }

    if(asset.type == 'file' && !asset.fileType){
      console.error("File does not have a file type", asset);
      return null
    }
    return (
      <div key={asset.id}>
        <div
          className={`w-full text-left px-2 py-1.5 hover:bg-gray-100 flex items-center group ${
            isSelected ? 'bg-primary/5 text-primary' : 'text-gray-700'
          }`}
          style={{ paddingLeft: `${depth * 16 + 8}px` }}
        >
          <button
            className="flex-1 flex items-center"
            onClick={() => {
              if(asset.type == 'file' && asset.fileType){
                  addFile({id: asset.id, name: asset.name, content: "", fileType: asset.fileType})
                  onOpenFile({id: asset.id, name: asset.name, content: "", fileType: asset.fileType})
              }
              else if (asset.type === 'folder') {
                toggleFolder(asset.id);
                setCurrentPath(prev => isExpanded ? prev.filter(p => p !== asset.id) : [...prev, asset.id]);
              }
              setSelectedAsset(asset.id);
              selectAsset(asset.id);
            }}
          >
            <span className="mr-2">
              {asset.type === 'folder' ? (
                <svg
                  className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              ) : (
                getAssetIcon(asset)
              )}
            </span>
            <span className="flex-1 truncate">{asset.name}</span>
          </button>
          

          <div className="flex items-center">
            {asset.type === 'file' && (
              <span className="text-xs text-gray-400 mr-2">
                {formatSize(asset.size)}
              </span>
            )}
            <button
              className="p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(asset);
              }}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        {asset.type === 'folder' && isExpanded && (
          <>
            {asset.children?.map((child) => renderAsset(child, depth + 1))}
            {isCreatingNew && currentPath[currentPath.length - 1] === asset.id && (
              <div
                className="flex items-center px-2 py-1.5 bg-gray-50"
                style={{ paddingLeft: `${(depth + 1) * 16 + 8}px` }}
              >
                <span className="mr-2">
                  {isCreatingNew === 'folder' ? (
                    <Folder className="w-4 h-4 text-gray-400" />
                  ) : (
                    <FileText className="w-4 h-4 text-gray-400" />
                  )}
                </span>
                <input
                  type="text"
                  className="flex-1 bg-transparent border-none focus:ring-0 text-sm p-0"
                  placeholder={`New ${isCreatingNew}`}
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSubmitNew();
                    } else if (e.key === 'Escape') {
                      setIsCreatingNew(null);
                      setNewItemName('');
                    }
                  }}
                  autoFocus
                />
                <button
                  className="p-1 text-gray-400 hover:text-gray-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsCreatingNew(null);
                    setNewItemName('');
                  }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col bg-white border-l border-gray-200 transition-all duration-300">
      <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
        {!isCollapsed && <h2 className="text-sm font-medium text-gray-700">Project Files</h2>}
        <div className="flex items-center space-x-2">
          {!isCollapsed && (
            <>
              <button
                className="text-gray-400 hover:text-gray-600"
                onClick={() => setExpandedFolders(new Set(['root']))}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </button>
              <button
                className="text-gray-400 hover:text-gray-600"
                onClick={handleImport}
              >
                <Upload className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      </div>

      {!isCollapsed && (
        <>
          {/* Add search input */}
          <div className="border-b border-gray-200 p-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text"
                className="w-full pl-8 pr-4 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="border-b border-gray-200 p-2">
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    selectedCategory === category.id
                      ? 'bg-primary/10 text-primary'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  onClick={() => setSelectedCategory(category.id as AssetCategory)}
                >
                  <category.icon className="w-4 h-4 inline-block mr-1" />
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
          {projectFiles.map((file) => (
              <div key={file.id}>
               {renderAsset({
                      id: file.id,
                      name: file.name,
                      type: "firebase",
                      fileType: file.fileType,
                      size: file.content.length,
                      lastModified: file.lastModified,
                      metadata: { language: file.fileType}
                    })}
              </div>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto">
            {displayedAssets.map((asset) => renderAsset(asset))}
          </div>

          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            multiple
            onChange={handleFileSelect}
          />

          {showLanguageSelect && isCreatingNew === 'file' ? (
            <div className="p-2 border-t border-gray-200">
              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Language
                </label>
                <select
                  className="w-full p-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value as FileLanguage)}
                >
                  {languageOptions.map(lang => (
                    <option key={lang.id} value={lang.id}>{lang.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex space-x-2">
                <button
                  className="flex-1 btn-secondary text-sm"
                  onClick={() => {
                    setShowLanguageSelect(false);
                    setIsCreatingNew(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  className="flex-1 btn-primary text-sm"
                  onClick={() => {
                    // Continue to file name input
                    setShowLanguageSelect(false);
                  }}
                >
                  Continue
                </button>
              </div>
            </div>
          ) : isCreatingNew ? (
            <div className="p-2 border-t border-gray-200">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-gray-500">
                  {isCreatingNew === 'file' ? (
                    <FileText className="w-4 h-4" />
                  ) : (
                    <Folder className="w-4 h-4" />
                  )}
                </span>
                <input
                  type="text"
                  className="flex-1 p-2 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder={`New ${isCreatingNew} name`}
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSubmitNew();
                    } else if (e.key === 'Escape') {
                      setIsCreatingNew(null);
                      setNewItemName('');
                    }
                  }}
                  autoFocus
                />
              </div>
              <div className="flex space-x-2">
                <button
                  className="flex-1 btn-secondary text-sm"
                  onClick={() => {
                    setIsCreatingNew(null);
                    setNewItemName('');
                  }}
                >
                  Cancel
                </button>
                <button
                  className="flex-1 btn-primary text-sm"
                  onClick={handleSubmitNew}
                >
                  Create
                </button>
              </div>
            </div>
          ) : (
            <div className="p-2 border-t border-gray-200 flex space-x-2">
              <button
                className="flex-1 btn-secondary text-sm flex items-center justify-center"
                onClick={() => handleCreateNew('file')}
              >
                <Plus className="w-4 h-4 mr-1" />
                New File
              </button>
              <button
                className="flex-1 btn-secondary text-sm flex items-center justify-center"
                onClick={() => handleCreateNew('folder')}
              >
                <FolderPlus className="w-4 h-4 mr-1" />
                New Folder
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}