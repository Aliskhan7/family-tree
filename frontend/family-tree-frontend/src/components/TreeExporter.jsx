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

        // Создаем canvas для композитного изображения
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Устанавливаем размер canvas
        const rect = reactFlowWrapper.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
        
        // Сначала рисуем фоновое изображение
        if (backgroundImage && backgroundImage !== 'mountains' && backgroundImage !== 'plain') {
          const bgImage = new Image();
          bgImage.crossOrigin = 'anonymous';
          
          const imageUrl = backgroundImage === 'mountains-original' ? '/backgrounds/mountains.jpg' :
                          backgroundImage === 'forest' ? '/backgrounds/forest.jpg' :
                          backgroundImage === 'ocean' ? '/backgrounds/ocean.jpg' :
                          backgroundImage === 'sunset' ? '/backgrounds/sunset.jpg' : null;
          
          if (imageUrl) {
            await new Promise((resolve, reject) => {
              bgImage.onload = () => {
                // Рисуем фоновое изображение с cover эффектом
                const scale = Math.max(canvas.width / bgImage.width, canvas.height / bgImage.height);
                const x = (canvas.width - bgImage.width * scale) / 2;
                const y = (canvas.height - bgImage.height * scale) / 2;
                
                ctx.drawImage(bgImage, x, y, bgImage.width * scale, bgImage.height * scale);
                resolve();
              };
              bgImage.onerror = reject;
              bgImage.src = imageUrl;
            });
          }
        } else if (backgroundImage === 'mountains') {
          // Рисуем градиент для горы
          const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
          gradient.addColorStop(0, '#2563eb');
          gradient.addColorStop(0.25, '#4338ca');
          gradient.addColorStop(0.5, '#7c3aed');
          gradient.addColorStop(0.75, '#a855f7');
          gradient.addColorStop(1, '#ec4899');
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        } else {
          // Белый фон для plain
          ctx.fillStyle = '#f8fafc';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        
        // Теперь захватываем React Flow поверх фона
        const reactFlowDataUrl = await toPng(reactFlowWrapper, {
          quality: 0.95,
          pixelRatio: 1,
          backgroundColor: 'transparent',
          useCORS: true,
          allowTaint: true
        });
        
        // Накладываем React Flow поверх фона
        const reactFlowImage = new Image();
        await new Promise((resolve) => {
          reactFlowImage.onload = () => {
            ctx.drawImage(reactFlowImage, 0, 0);
            resolve();
          };
          reactFlowImage.src = reactFlowDataUrl;
        });
        
        // Конвертируем canvas в data URL
        const finalDataUrl = canvas.toDataURL('image/png', 0.95);
        
        // Показываем элементы управления обратно
        controlsElements.forEach(el => {
          el.style.display = '';
        });
        
        // Скачиваем файл
        const link = document.createElement('a');
        link.download = 'family_tree.png';
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
      <span className="inline sm:hidden">📥</span>
    </Button>
  );
};

export default TreeExporter;

