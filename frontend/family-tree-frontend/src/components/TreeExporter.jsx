import React, { useRef, useCallback } from 'react';
import { toPng, toJpeg, toSvg } from 'html-to-image';
import { getRectOfNodes, getTransformForBounds, getNodesBounds } from 'reactflow';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Download, Image, FileImage, Palette } from 'lucide-react';
import { useState } from 'react';

const TreeExporter = ({ 
  treeName = 'Родословное дерево', 
  backgroundImage = 'mountains',
  onBackgroundChange,
  className = '' 
}) => {
  const [exportFormat, setExportFormat] = useState('png');
  const [isExporting, setIsExporting] = useState(false);
  const [showExportDialog, setShowExportDialog] = useState(false);

  const backgroundOptions = {
    mountains: { 
      name: '🏔️ Горы (HD градиент)', 
      image: null,
      style: `
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
      `
    },
    'mountains-original': { name: '🏔️ Горы (оригинал)', image: '/backgrounds/mountains.jpg' },
    forest: { name: '🌲 Лес', image: '/backgrounds/forest.jpg' },
    ocean: { name: '🌊 Океан', image: '/backgrounds/ocean.jpg' },
    sunset: { name: '🌅 Закат', image: '/backgrounds/sunset.jpg' },
    plain: { name: '⚪ Простой', image: null }
  };

  const exportTree = useCallback(async () => {
    setIsExporting(true);
    console.log('Начинаем экспорт дерева...');
    
    try {
      // Ищем React Flow элементы
      const reactFlowWrapper = document.querySelector('.react-flow');
      const reactFlowViewport = document.querySelector('.react-flow__viewport');
      
      if (!reactFlowWrapper || !reactFlowViewport) {
        console.error('Не удалось найти React Flow контейнер');
        alert('Не удалось найти дерево для экспорта. Убедитесь, что дерево загружено.');
        return;
      }

      // Получаем все узлы
      const nodeElements = document.querySelectorAll('.react-flow__node');
      if (nodeElements.length === 0) {
        alert('В дереве нет узлов для экспорта. Добавьте людей в дерево.');
        return;
      }

      // Временно скрываем элементы управления
      const controlsElements = document.querySelectorAll('.react-flow__controls, .react-flow__minimap, .react-flow__attribution');
      controlsElements.forEach(el => {
        el.style.opacity = '0';
      });

      // Создаем контейнер для экспорта с фоном
      const exportContainer = document.createElement('div');
      exportContainer.style.position = 'fixed';
      exportContainer.style.top = '-9999px';
      exportContainer.style.left = '-9999px';
      exportContainer.style.width = '1200px';
      exportContainer.style.height = '800px';
      exportContainer.style.zIndex = '-1';
      
      // Копируем стили фона
      const backgroundContainer = document.querySelector('.background-container');
      if (backgroundContainer) {
        const computedStyle = window.getComputedStyle(backgroundContainer);
        exportContainer.style.background = computedStyle.background;
        exportContainer.style.backgroundImage = computedStyle.backgroundImage;
        exportContainer.style.backgroundSize = 'cover';
        exportContainer.style.backgroundPosition = 'center';
        exportContainer.style.backgroundRepeat = 'no-repeat';
      }

      // Добавляем заголовок
      const titleElement = document.createElement('div');
      titleElement.textContent = treeName;
      titleElement.style.position = 'absolute';
      titleElement.style.top = '30px';
      titleElement.style.left = '50%';
      titleElement.style.transform = 'translateX(-50%)';
      titleElement.style.fontSize = '28px';
      titleElement.style.fontWeight = 'bold';
      titleElement.style.color = '#1f2937';
      titleElement.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
      titleElement.style.padding = '15px 30px';
      titleElement.style.borderRadius = '12px';
      titleElement.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
      titleElement.style.zIndex = '10';
      
      exportContainer.appendChild(titleElement);

      // Клонируем viewport с узлами
      const viewportClone = reactFlowViewport.cloneNode(true);
      viewportClone.style.position = 'absolute';
      viewportClone.style.top = '0';
      viewportClone.style.left = '0';
      viewportClone.style.width = '100%';
      viewportClone.style.height = '100%';
      
      exportContainer.appendChild(viewportClone);
      document.body.appendChild(exportContainer);
      
      // Ждем рендеринга
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let dataUrl;
      const fileName = `${treeName.replace(/\s+/g, '_')}_family_tree.${exportFormat}`;
      
      const options = {
        quality: 0.95,
        pixelRatio: 1,
        backgroundColor: exportFormat === 'jpeg' ? '#ffffff' : null,
        width: 1200,
        height: 800,
        skipFonts: false,
        cacheBust: false
      };
      
      console.log(`Экспортируем в формате ${exportFormat}...`);
      
      switch (exportFormat) {
        case 'png':
          dataUrl = await toPng(exportContainer, options);
          break;
        case 'jpeg':
          dataUrl = await toJpeg(exportContainer, options);
          break;
        case 'svg':
          dataUrl = await toSvg(exportContainer, options);
          break;
        default:
          dataUrl = await toPng(exportContainer, options);
      }
      
      // Удаляем временный контейнер
      document.body.removeChild(exportContainer);
      
      // Восстанавливаем элементы управления
      controlsElements.forEach(el => {
        el.style.opacity = '';
      });
      
      // Проверяем, что данные получены
      if (!dataUrl || dataUrl === 'data:,') {
        throw new Error('Не удалось создать изображение - пустые данные');
      }
      
      console.log('Изображение создано успешно, размер:', Math.round(dataUrl.length / 1024), 'KB');
      
      // Скачиваем файл
      const link = document.createElement('a');
      link.download = fileName;
      link.href = dataUrl;
      link.click();
      
      setShowExportDialog(false);
      
    } catch (error) {
      console.error('Ошибка экспорта:', error);
      
      // Удаляем временный контейнер и восстанавливаем интерфейс при ошибке
      try {
        const tempContainer = document.querySelector('div[style*="position: fixed"][style*="top: -9999px"]');
        if (tempContainer) {
          document.body.removeChild(tempContainer);
        }
        
        // Восстанавливаем элементы управления React Flow
        const controlsElements = document.querySelectorAll('.react-flow__controls, .react-flow__minimap, .react-flow__attribution');
        controlsElements.forEach(el => {
          el.style.opacity = '';
        });
      } catch (cleanupError) {
        console.warn('Ошибка при очистке:', cleanupError);
      }
      
      alert(`Ошибка при экспорте изображения: ${error.message}. Попробуйте еще раз или выберите другой формат.`);
    } finally {
      setIsExporting(false);
    }
  }, [treeName, backgroundImage, exportFormat]);

  return (
    <>
      <Dialog open={showExportDialog} onOpenChange={setShowExportDialog}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm" className={`whitespace-nowrap ${className}`}>
            <Download className="h-4 w-4 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Скачать</span>
            <span className="sm:hidden">📥</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Экспорт родословного дерева</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="format">Формат файла</Label>
              <Select value={exportFormat} onValueChange={setExportFormat}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="png">PNG (рекомендуется)</SelectItem>
                  <SelectItem value="jpeg">JPEG</SelectItem>
                  <SelectItem value="svg">SVG</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label>Фон изображения</Label>
              <Select value={backgroundImage} onValueChange={onBackgroundChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(backgroundOptions).map(([key, option]) => (
                    <SelectItem key={key} value={key}>
                      {option.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Image className="h-4 w-4" />
              <span>Размер: 1200x800 пикселей</span>
            </div>
            
            <Button 
              onClick={exportTree} 
              disabled={isExporting}
              className="w-full"
            >
              {isExporting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Экспорт...
                </>
              ) : (
                <>
                  <FileImage className="h-4 w-4 mr-2" />
                  Скачать изображение
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TreeExporter;

