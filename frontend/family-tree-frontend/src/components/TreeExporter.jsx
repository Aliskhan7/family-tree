import React, { useCallback } from 'react';
import { toPng } from 'html-to-image';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';

const TreeExporter = ({ 
  treeName = 'Родословное дерево',
  backgroundImage = 'mountains',
  className = '' 
}) => {

  const exportTree = useCallback(async () => {
    const reactFlowWrapper = document.querySelector('.react-flow');
    
    if (reactFlowWrapper) {
      try {
        // Временно скрываем элементы управления
        const controlsElements = document.querySelectorAll('.react-flow__controls, .react-flow__minimap, .react-flow__attribution, .react-flow__panel');
        controlsElements.forEach(el => {
          el.style.display = 'none';
        });

        // Определяем качество в зависимости от устройства
        const isMobile = window.innerWidth <= 768;
        const devicePixelRatio = window.devicePixelRatio || 1;
        const exportPixelRatio = Math.max(devicePixelRatio, isMobile ? 3 : 2); // Минимум 3x для мобильных, 2x для десктопа
        
        // Создаем canvas для композитного изображения
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Устанавливаем размер canvas с учетом высокого разрешения
        const rect = reactFlowWrapper.getBoundingClientRect();
        const scaledWidth = rect.width * exportPixelRatio;
        const scaledHeight = rect.height * exportPixelRatio;
        
        canvas.width = scaledWidth;
        canvas.height = scaledHeight;
        
        // Масштабируем контекст для высокого разрешения
        ctx.scale(exportPixelRatio, exportPixelRatio);
        
        // Сначала рисуем фоновое изображение
        if (backgroundImage === 'sunset') {
          const bgImage = new Image();
          bgImage.crossOrigin = 'anonymous';
          
          await new Promise((resolve, reject) => {
            bgImage.onload = () => {
              // Рисуем фоновое изображение с cover эффектом
              const scale = Math.max(rect.width / bgImage.width, rect.height / bgImage.height);
              const x = (rect.width - bgImage.width * scale) / 2;
              const y = (rect.height - bgImage.height * scale) / 2;
              
              ctx.drawImage(bgImage, x, y, bgImage.width * scale, bgImage.height * scale);
              resolve();
            };
            bgImage.onerror = reject;
            bgImage.src = '/backgrounds/sunset.jpg';
          });
        } else if (backgroundImage === 'mountains') {
          // Рисуем градиент для горы (обновленный кавказский стиль)
          const gradient = ctx.createLinearGradient(0, 0, rect.width, rect.height);
          gradient.addColorStop(0, '#1f2937'); // slate-900
          gradient.addColorStop(0.25, '#374151'); // gray-800
          gradient.addColorStop(0.5, '#065f46'); // emerald-900
          gradient.addColorStop(0.75, '#a16207'); // amber-800
          gradient.addColorStop(1, '#1f2937'); // slate-900
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, rect.width, rect.height);
        } else {
          // Темно-серый фон для plain (кавказский стиль)
          ctx.fillStyle = '#1f2937'; // slate-900
          ctx.fillRect(0, 0, rect.width, rect.height);
        }
        
        // Теперь захватываем React Flow поверх фона с высоким качеством
        const reactFlowDataUrl = await toPng(reactFlowWrapper, {
          quality: 1.0, // Максимальное качество
          pixelRatio: exportPixelRatio, // Высокое разрешение
          backgroundColor: 'transparent',
          useCORS: true,
          allowTaint: true,
          width: rect.width,
          height: rect.height
        });
        
        // Накладываем React Flow поверх фона
        const reactFlowImage = new Image();
        await new Promise((resolve) => {
          reactFlowImage.onload = () => {
            ctx.drawImage(reactFlowImage, 0, 0, rect.width, rect.height);
            resolve();
          };
          reactFlowImage.src = reactFlowDataUrl;
        });
        
        // Конвертируем canvas в data URL с максимальным качеством
        const finalDataUrl = canvas.toDataURL('image/png', 1.0);
        
        // Показываем элементы управления обратно
        controlsElements.forEach(el => {
          el.style.display = '';
        });
        
        // Скачиваем файл с информацией о качестве
        const link = document.createElement('a');
        const qualityInfo = isMobile ? '_mobile_hq' : '_desktop_hq';
        link.download = `family_tree${qualityInfo}.png`;
        link.href = finalDataUrl;
        link.click();
        
      } catch (error) {
        console.error('Ошибка экспорта:', error);
        // Показываем элементы управления обратно при ошибке
        const controlsElements = document.querySelectorAll('.react-flow__controls, .react-flow__minimap, .react-flow__attribution, .react-flow__panel');
        controlsElements.forEach(el => {
          el.style.display = '';
        });
        alert('Ошибка при экспорте изображения. Попробуйте еще раз.');
      }
    }
  }, [backgroundImage]);

  return (
    <Button variant="outline" size="sm" onClick={exportTree} className={className}>
      <Download className="h-4 w-4 sm:mr-2" />
      <span className="hidden sm:inline">Скачать</span>
    </Button>
  );
};

export default TreeExporter;

