import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Panel,
  Handle,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, 
  Save, 
  Settings, 
  User, 
  TreePine, 
  Home,
  Loader2,
  Palette,
  Trash2,
  Edit3
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { treesAPI } from '../lib/api';
import TreeExporter from '../components/TreeExporter';

const TreeEditorPage = () => {
  const { treeId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [treeName, setTreeName] = useState('Новое дерево');
  const [backgroundImage, setBackgroundImage] = useState('mountains');
  const [customBackground, setCustomBackground] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [showAddPersonDialog, setShowAddPersonDialog] = useState(false);
  const [showEditPersonDialog, setShowEditPersonDialog] = useState(false);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [newPerson, setNewPerson] = useState({
    name: '',
    birthYear: '',
    deathYear: '',
    gender: 'male'
  });
  const [editingPerson, setEditingPerson] = useState(null);
  const [editPersonData, setEditPersonData] = useState({
    name: '',
    birthYear: '',
    deathYear: '',
    gender: 'male'
  });

  // Загрузка дерева при монтировании компонента
  useEffect(() => {
    if (treeId && treeId !== 'create') {
      loadTree();
    } else {
      // Добавляем тестового человека для демонстрации
      const testNode = {
        id: 'test-person-1',
        type: 'person',
        position: { x: 250, y: 200 },
        data: {
          name: 'Тестовый Человек',
          birthYear: '1990',
          deathYear: null,
          gender: 'male',
        },
      };
      setNodes([testNode]);
    }
  }, [treeId]);

  const loadTree = async () => {
    setIsLoading(true);
    try {
      const response = await treesAPI.getTree(treeId);
      const tree = response.tree;
      
      setTreeName(tree.name);
      setBackgroundImage(tree.background_image || 'mountains');
      
      if (tree.data && tree.data.nodes) {
        setNodes(tree.data.nodes);
        setEdges(tree.data.edges || []);
      }
    } catch (error) {
      setError('Ошибка загрузки дерева');
      console.error('Ошибка загрузки дерева:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onConnect = useCallback(
    (params) => {
      // Определяем тип связи по позициям handles
      let edgeStyle = { stroke: '#374151', strokeWidth: 2 };
      let edgeType = 'default';
      
      // Если связь между боковыми точками - это брак/партнерство  
      if ((params.sourceHandleId === 'spouse-left' || params.sourceHandleId === 'spouse-right') ||
          (params.targetHandleId === 'spouse-left' || params.targetHandleId === 'spouse-right')) {
        edgeStyle = { stroke: '#dc2626', strokeWidth: 3, strokeDasharray: '5,5' };
        edgeType = 'straight';
      }
      
      const newEdge = {
        ...params,
        style: edgeStyle,
        type: edgeType,
        animated: false,
        label: params.sourceHandleId?.includes('spouse') ? '💕' : '',
        labelStyle: { fontSize: 12 },
        labelBgStyle: { fill: 'white', fillOpacity: 0.8 }
      };
      
      setEdges((eds) => addEdge(newEdge, eds));
    },
    [setEdges]
  );

  // Обработчик клика на узел (дополнительный способ редактирования)
  const onNodeClick = useCallback((event, node) => {
    console.log('Клик на узел:', node.id, node.data);
    editPerson(node.id, node.data);
  }, []);



  // Функция для загрузки пользовательского изображения
  const handleCustomImageUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCustomBackground(e.target.result);
        setBackgroundImage('custom');
      };
      reader.readAsDataURL(file);
    }
  };

  // Функция для получения текущего стиля фона
  const getCurrentBackgroundStyle = () => {
    if (backgroundImage === 'custom' && customBackground) {
      return {
        backgroundImage: `url(${customBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        minHeight: '100vh',
        width: '100%'
      };
    }
    return backgroundStyles[backgroundImage] || backgroundStyles.mountains;
  };

  // Функция для открытия диалога редактирования персоны
  const editPerson = useCallback((nodeId, personData) => {
    console.log('Открытие диалога редактирования:', nodeId, personData);
    setEditingPerson(nodeId);
    setEditPersonData({
      name: personData.name || '',
      birthYear: personData.birthYear || '',
      deathYear: personData.deathYear || '',
      gender: personData.gender || 'male'
    });
    setShowEditPersonDialog(true);
  }, []);

  // Функция для сохранения изменений персоны
  const savePerson = useCallback(() => {
    if (!editPersonData.name.trim()) return;

    setNodes((nds) =>
      nds.map((node) =>
        node.id === editingPerson
          ? {
              ...node,
              data: {
                ...node.data,
                name: editPersonData.name,
                birthYear: editPersonData.birthYear || null,
                deathYear: editPersonData.deathYear || null,
                gender: editPersonData.gender,
              },
            }
          : node
      )
    );

    setEditPersonData({ name: '', birthYear: '', deathYear: '', gender: 'male' });
    setEditingPerson(null);
    setShowEditPersonDialog(false);
  }, [editPersonData, editingPerson, setNodes]);

  // Функция для удаления персоны
  const deletePerson = () => {
    if (!editingPerson) return;

    // Удаляем узел
    setNodes((nds) => nds.filter((node) => node.id !== editingPerson));
    
    // Удаляем связанные ребра
    setEdges((eds) => 
      eds.filter((edge) => 
        edge.source !== editingPerson && edge.target !== editingPerson
      )
    );

    setEditPersonData({ name: '', birthYear: '', deathYear: '', gender: 'male' });
    setEditingPerson(null);
    setShowEditPersonDialog(false);
  };

  const addPerson = useCallback(() => {
    if (!newPerson.name.trim()) return;

    const newNode = {
      id: `person-${Date.now()}`,
      type: 'person',
      position: { x: Math.random() * 400, y: Math.random() * 400 },
      data: {
        name: newPerson.name,
        birthYear: newPerson.birthYear || null,
        deathYear: newPerson.deathYear || null,
        gender: newPerson.gender,
      },
    };

    setNodes((nds) => nds.concat(newNode));
    setNewPerson({ name: '', birthYear: '', deathYear: '', gender: 'male' });
    setShowAddPersonDialog(false);
  }, [newPerson, setNodes]);

  const saveTree = async () => {
    if (!treeName.trim()) {
      setError('Введите название дерева');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      const treeData = {
        name: treeName,
        data: { nodes, edges },
        background_image: backgroundImage
      };

      let response;
      if (treeId && treeId !== 'create') {
        // Обновляем существующее дерево
        response = await treesAPI.updateTree(treeId, treeData);
      } else {
        // Создаем новое дерево
        if (isAuthenticated) {
          response = await treesAPI.createTree(treeData);
        } else {
          response = await treesAPI.createAnonymousTree(treeData);
        }
        
        // Перенаправляем на страницу редактирования созданного дерева
        navigate(`/tree/${response.tree.id}`, { replace: true });
      }
      
      // Показываем уведомление об успешном сохранении
      // TODO: Добавить toast уведомления
      console.log('Дерево сохранено:', response);
      
    } catch (error) {
      setError('Ошибка сохранения дерева');
      console.error('Ошибка сохранения:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const backgroundStyles = {
    mountains: {
      background: `
        linear-gradient(180deg, 
          rgba(255,255,255,0.1) 0%, 
          transparent 20%
        ),
        linear-gradient(135deg, 
          #2563eb 0%, 
          #4338ca 25%, 
          #7c3aed 50%, 
          #a855f7 75%, 
          #ec4899 100%
        )
      `,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      minHeight: '100vh',
      width: '100%',
      position: 'relative'
    },
    'mountains-original': {
      backgroundImage: 'url(/backgrounds/mountains.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed',
      minHeight: '100vh',
      width: '100%',
      height: '100%',
      position: 'relative'
    },
    forest: {
      backgroundImage: 'url(/backgrounds/forest.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed',
      minHeight: '100vh',
      width: '100%',
      height: '100%',
      position: 'relative'
    },
    ocean: {
      backgroundImage: 'url(/backgrounds/ocean.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed',
      minHeight: '100vh',
      width: '100%',
      height: '100%',
      position: 'relative'
    },
    sunset: {
      backgroundImage: 'url(/backgrounds/sunset.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed',
      minHeight: '100vh',
      width: '100%',
      height: '100%',
      position: 'relative'
    },
    plain: {
      backgroundColor: '#f8fafc',
      minHeight: '100vh',
      width: '100%'
    }
  };

  // Кастомный компонент узла для человека
  const PersonNode = useCallback(({ data, selected, id }) => {
    return (
      <div 
        className={`group px-4 py-3 shadow-lg rounded-lg border-2 bg-white min-w-[150px] relative hover:shadow-xl transition-all duration-200 ${
          selected ? 'border-blue-500' : 'border-gray-200'
        }`}
        title="Наведите для редактирования"
      >
        {/* Точка соединения сверху (входящие связи - от родителей) */}
        <Handle
          type="target"
          position={Position.Top}
          style={{ background: '#555', width: 8, height: 8 }}
        />
        
        {/* Точка соединения снизу (исходящие связи - к детям) */}
        <Handle
          type="source"
          position={Position.Bottom}
          style={{ background: '#555', width: 8, height: 8 }}
        />
        
        {/* Точки соединения по бокам (для супругов/партнеров) */}
        <Handle
          type="source"
          position={Position.Left}
          id="spouse-left"
          style={{ background: '#e11d48', width: 8, height: 8, top: '50%' }}
        />
        <Handle
          type="target"
          position={Position.Right}
          id="spouse-right"
          style={{ background: '#e11d48', width: 8, height: 8, top: '50%' }}
        />

        {/* Кнопка редактирования */}
        <button
          className="absolute -top-2 -right-2 w-8 h-8 bg-blue-500 hover:bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-200 z-50 opacity-100 hover:opacity-100"
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            console.log('Клик на кнопку редактирования:', id, data);
            editPerson(id, data);
          }}
          title="Редактировать"
        >
          <Edit3 className="h-4 w-4" />
        </button>

        <div className="flex items-center space-x-2 mb-2">
          <User className="h-4 w-4 text-gray-600" />
          <div className="font-semibold text-gray-900 text-sm">{data.name}</div>
        </div>
        {data.birthYear && (
          <div className="text-xs text-gray-600">
            Род. {data.birthYear}
            {data.deathYear && ` - ум. ${data.deathYear}`}
          </div>
        )}
        <div className="text-xs text-blue-600 mt-1">{data.gender === 'male' ? 'Мужчина' : 'Женщина'}</div>
      </div>
    );
  }, [editPerson]);

  const nodeTypes = useMemo(() => ({
    person: PersonNode,
  }), []);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Загрузка дерева...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className=" bg-white border-b border-gray-200 px-2 sm:px-4 py-2 sm:py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0 fixed top-0 left-0 right-0 z-50 w-full">
        <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/')}
            className="flex items-center space-x-1 sm:space-x-2 p-1 sm:p-2"
          >
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Главная</span>
          </Button>
          
          <div className="flex items-center space-x-1 sm:space-x-2 flex-1">
            <TreePine className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
            <Input
              value={treeName}
              onChange={(e) => setTreeName(e.target.value)}
              className="font-semibold border-none shadow-none text-sm sm:text-lg p-0 h-auto flex-1"
              placeholder="Название дерева"
            />
          </div>
        </div>

        <div className="flex items-center space-x-1 sm:space-x-2 w-full sm:w-auto overflow-x-auto">
          <Dialog open={showAddPersonDialog} onOpenChange={setShowAddPersonDialog}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-green-600 hover:bg-green-700 whitespace-nowrap">
                <Plus className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Добавить человека</span>
                <span className="sm:hidden">Добавить</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-lg sm:text-xl">Добавить нового человека</DialogTitle>
                <DialogDescription className="text-sm">
                  Заполните информацию о новом человеке для добавления в дерево
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Имя *</Label>
                  <Input
                    id="name"
                    value={newPerson.name}
                    onChange={(e) => setNewPerson({...newPerson, name: e.target.value})}
                    placeholder="Введите имя"
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Пол</Label>
                  <Select value={newPerson.gender} onValueChange={(value) => setNewPerson({...newPerson, gender: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Мужчина</SelectItem>
                      <SelectItem value="female">Женщина</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="birthYear">Год рождения</Label>
                  <Input
                    id="birthYear"
                    type="number"
                    value={newPerson.birthYear}
                    onChange={(e) => setNewPerson({...newPerson, birthYear: e.target.value})}
                    placeholder="1990"
                  />
                </div>
                <div>
                  <Label htmlFor="deathYear">Год смерти (если применимо)</Label>
                  <Input
                    id="deathYear"
                    type="number"
                    value={newPerson.deathYear}
                    onChange={(e) => setNewPerson({...newPerson, deathYear: e.target.value})}
                    placeholder="2020"
                  />
                </div>
                <Button onClick={addPerson} className="w-full">
                  Добавить
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Диалог редактирования персоны */}
          <Dialog open={showEditPersonDialog} onOpenChange={setShowEditPersonDialog}>
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-lg sm:text-xl">Редактировать человека</DialogTitle>
                <DialogDescription className="text-sm">
                  Измените информацию о человеке
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-name">Имя *</Label>
                  <Input
                    id="edit-name"
                    value={editPersonData.name}
                    onChange={(e) => setEditPersonData({...editPersonData, name: e.target.value})}
                    placeholder="Введите имя"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-gender">Пол</Label>
                  <Select value={editPersonData.gender} onValueChange={(value) => setEditPersonData({...editPersonData, gender: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Мужчина</SelectItem>
                      <SelectItem value="female">Женщина</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-birthYear">Год рождения</Label>
                  <Input
                    id="edit-birthYear"
                    type="number"
                    value={editPersonData.birthYear}
                    onChange={(e) => setEditPersonData({...editPersonData, birthYear: e.target.value})}
                    placeholder="1990"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-deathYear">Год смерти (если применимо)</Label>
                  <Input
                    id="edit-deathYear"
                    type="number"
                    value={editPersonData.deathYear}
                    onChange={(e) => setEditPersonData({...editPersonData, deathYear: e.target.value})}
                    placeholder="2020"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button onClick={savePerson} className="flex-1">
                    Сохранить изменения
                  </Button>
                  <Button 
                    onClick={deletePerson} 
                    variant="destructive"
                    className="px-4"
                    title="Удалить персону"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Удалить
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="whitespace-nowrap">
                <Settings className="h-4 w-4 mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Настройки</span>
                <span className="sm:hidden">⚙️</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-lg sm:text-xl">Настройки дерева</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Фон дерева</Label>
                  <Select value={backgroundImage} onValueChange={setBackgroundImage}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mountains">🏔️ Горы (HD градиент)</SelectItem>
                      <SelectItem value="mountains-original">🏔️ Горы (оригинал)</SelectItem>
                      <SelectItem value="forest">🌲 Лес</SelectItem>
                      <SelectItem value="ocean">🌊 Океан</SelectItem>
                      <SelectItem value="sunset">🌅 Закат</SelectItem>
                      <SelectItem value="plain">⚪ Простой</SelectItem>
                      {customBackground && <SelectItem value="custom">🖼️ Ваше изображение</SelectItem>}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="custom-background">Загрузить своё изображение</Label>
                  <div className="mt-2">
                    <Input
                      id="custom-background"
                      type="file"
                      accept="image/*"
                      onChange={handleCustomImageUpload}
                      className="file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                    <p className="text-sm text-gray-500 mt-1">
                      Поддерживаются форматы: JPG, PNG, WebP
                    </p>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <Button
            onClick={saveTree}
            disabled={isSaving}
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 whitespace-nowrap"
          >
            {isSaving ? (
              <Loader2 className="h-4 w-4 mr-1 sm:mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-1 sm:mr-2" />
            )}
            <span className="hidden sm:inline">Сохранить</span>
            <span className="sm:hidden">💾</span>
          </Button>

          <TreeExporter 
            treeName={treeName}
            backgroundImage={backgroundImage}
          />
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mx-4 mt-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* React Flow Canvas */}
      <div className="flex-1 h-full w-full background-container cover" style={getCurrentBackgroundStyle()}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
          className="react-flow h-full w-full"
          style={{ background: 'transparent' }}
        >
          <Controls />
          <MiniMap />
          {/* Убираем Background компонент, чтобы не перекрывать фоновое изображение */}
          
          <Panel position="bottom-left" className="hidden sm:block">
            <Card className="w-48 sm:w-64">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs sm:text-sm">Инструкция</CardTitle>
              </CardHeader>
              <CardContent className="text-xs text-gray-600 space-y-1">
                <p>• <span className="font-semibold">Кликните на синюю кнопку ✏️</span> или на блок</p>
                <p>• Перетаскивайте узлы для изменения позиции</p>
                <p>• <span className="font-semibold">Создание связей:</span></p>
                <p className="pl-2">🔸 Серые точки: родители ↕ дети</p>
                <p className="pl-2">🔴 Красные точки: супруги ↔</p>
                <p>• Перетащите от точки одного узла к точке другого</p>
                <p>• Добавляйте новых людей через кнопку "+"</p>
                <p>• Сохраняйте изменения регулярно</p>
              </CardContent>
            </Card>
          </Panel>
        </ReactFlow>
      </div>
    </div>
  );
};

export default TreeEditorPage;

