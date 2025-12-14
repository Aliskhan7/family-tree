import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TreePine, Users, Download, Shield, Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const HomePage = () => {
  const { isAuthenticated, user } = useAuth();

  const features = [
    {
      icon: TreePine,
      title: 'Интуитивное создание',
      description: 'Легко добавляйте членов семьи и создавайте связи между поколениями'
    },
    {
      icon: Users,
      title: 'Семейные связи',
      description: 'Визуализируйте родственные отношения в красивом интерактивном дереве'
    },
    {
      icon: Download,
      title: 'Экспорт изображений',
      description: 'Скачивайте ваше дерево как изображение для социальных сетей'
    },
    {
      icon: Shield,
      title: 'Безопасное хранение',
      description: 'Ваши данные надежно сохраняются и доступны только вам'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-green-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 pb-12 sm:pb-16">
          <div className="text-center">
            <div className="flex justify-center mb-6 sm:mb-8">
              <div className="relative">
                <TreePine className="h-12 w-12 sm:h-16 sm:w-16 text-green-600" />
                <Sparkles className="h-4 w-4 sm:h-6 sm:w-6 text-yellow-500 absolute -top-1 -right-1 sm:-top-2 sm:-right-2 animate-pulse" />
              </div>
            </div>
            
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold text-gray-900 mb-4 sm:mb-6">
              Создайте свое
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600 block">
                Родословное дерево
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8 max-w-3xl mx-auto px-4">
              Сохраните историю своей семьи в красивом интерактивном дереве. 
              Добавляйте родственников, создавайте связи и делитесь результатом с близкими.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center max-w-md sm:max-w-none mx-auto">
              <Link to="/tree/create" className="w-full sm:w-auto">
                <Button size="lg" className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-6 sm:px-8 py-3 text-base sm:text-lg w-full sm:w-auto">
                  Создать дерево бесплатно
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </Link>
              
              {!isAuthenticated && (
                <Link to="/register" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="px-6 sm:px-8 py-3 text-base sm:text-lg border-2 w-full sm:w-auto">
                    Зарегистрироваться
                  </Button>
                </Link>
              )}
              
              {isAuthenticated && (
                <Link to="/dashboard" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="px-6 sm:px-8 py-3 text-base sm:text-lg border-2 w-full sm:w-auto">
                    Мои деревья
                  </Button>
                </Link>
              )}
            </div>
            
            {isAuthenticated && (
              <p className="mt-4 text-green-600 font-medium">
                Добро пожаловать, {user?.username}!
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Почему выбирают нас?
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-2xl mx-auto px-4">
              Мы создали самый простой и красивый способ создания родословных деревьев
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-300 border-0 shadow-md">
                <CardHeader className="pb-4">
                  <div className="flex justify-center mb-3 sm:mb-4">
                    <div className="p-2 sm:p-3 bg-gradient-to-r from-green-100 to-blue-100 rounded-full">
                      <feature.icon className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                    </div>
                  </div>
                  <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900">
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-sm sm:text-base text-gray-600">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-gradient-to-r from-green-600 to-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Начните создавать свою семейную историю уже сегодня
          </h2>
          <p className="text-xl text-green-100 mb-8">
            Присоединяйтесь к тысячам семей, которые уже сохранили свою историю
          </p>
          <Link to="/tree/create">
            <Button size="lg" variant="secondary" className="bg-white text-green-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold">
              Создать первое дерево
              <TreePine className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HomePage;

