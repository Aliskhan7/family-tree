import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, 
  TreePine, 
  Edit, 
  Trash2, 
  Download, 
  Calendar,
  User,
  LogOut,
  Loader2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { treesAPI } from '../lib/api';

const DashboardPage = () => {
  const { user, logout, isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [trees, setTrees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Проверяем аутентификацию и дожидаемся завершения проверки
    if (!authLoading) {
      if (!isAuthenticated) {
        navigate('/login');
        return;
      }
      loadTrees();
    }
  }, [isAuthenticated, authLoading, navigate]);

  const loadTrees = async () => {
    setIsLoading(true);
    try {
      const response = await treesAPI.getUserTrees();
      setTrees(response.trees);
    } catch (error) {
      setError('Ошибка загрузки деревьев');
      console.error('Ошибка загрузки деревьев:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteTree = async (treeId) => {
    if (!confirm('Вы уверены, что хотите удалить это дерево?')) {
      return;
    }

    try {
      await treesAPI.deleteTree(treeId);
      setTrees(trees.filter(tree => tree.id !== treeId));
    } catch (error) {
      setError('Ошибка удаления дерева');
      console.error('Ошибка удаления дерева:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getBackgroundName = (background) => {
    const backgrounds = {
      mountains: 'Градиент',
      sunset: 'Закат',
      plain: 'Простой'
    };
    return backgrounds[background] || 'Закат';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 sm:py-6 gap-4 sm:gap-0">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link to="/" className="flex items-center space-x-2">
                <TreePine className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                <span className="text-lg sm:text-2xl font-bold text-gray-900">Родословное дерево</span>
              </Link>
            </div>
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
              <div className="flex items-center space-x-2 text-gray-600">
                <User className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="text-sm sm:text-base">Добро пожаловать, {user?.username}!</span>
              </div>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="flex items-center space-x-2 w-full sm:w-auto"
                size="sm"
              >
                <LogOut className="h-4 w-4" />
                <span>Выйти</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Мои деревья</h1>
          <p className="text-sm sm:text-base text-gray-600">Управляйте своими родословными деревьями</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Create New Tree Button */}
        <div className="mb-6 sm:mb-8">
          <Link to="/tree/create">
            <Button size="lg" className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-sm sm:text-base">Создать новое дерево</span>
            </Button>
          </Link>
        </div>

        {/* Trees Grid */}
        {(isLoading || authLoading) ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">{authLoading ? 'Проверка авторизации...' : 'Загрузка деревьев...'}</p>
            </div>
          </div>
        ) : trees.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <TreePine className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <CardTitle className="text-xl text-gray-600 mb-2">
                У вас пока нет деревьев
              </CardTitle>
              <CardDescription className="text-gray-500 mb-6">
                Создайте свое первое родословное дерево, чтобы начать сохранять семейную историю
              </CardDescription>
              <Link to="/tree/create">
                <Button className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
                  <Plus className="mr-2 h-4 w-4" />
                  Создать первое дерево
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {trees.map((tree) => (
              <Card key={tree.id} className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-base sm:text-lg font-semibold text-gray-900 mb-1 truncate">
                        {tree.name}
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm text-gray-600">
                        Фон: {getBackgroundName(tree.background_image)}
                      </CardDescription>
                    </div>
                    <TreePine className="h-5 w-5 sm:h-6 sm:w-6 text-green-600 flex-shrink-0" />
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-center text-xs sm:text-sm text-gray-600">
                      <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
                      <span className="truncate">Создано: {formatDate(tree.created_at)}</span>
                    </div>
                    
                    {tree.updated_at !== tree.created_at && (
                      <div className="flex items-center text-xs sm:text-sm text-gray-600">
                        <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-2 flex-shrink-0" />
                        <span className="truncate">Обновлено: {formatDate(tree.updated_at)}</span>
                      </div>
                    )}
                    
                    <div className="text-xs sm:text-sm text-gray-600">
                      Узлов в дереве: {tree.data?.nodes?.length || 0}
                    </div>
                    
                    <div className="flex space-x-2 pt-2">
                      <Link to={`/tree/${tree.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full text-xs sm:text-sm">
                          <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          <span className="hidden sm:inline">Редактировать</span>
                          <span className="sm:hidden">Изменить</span>
                        </Button>
                      </Link>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteTree(tree.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 px-2 sm:px-3"
                      >
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;

