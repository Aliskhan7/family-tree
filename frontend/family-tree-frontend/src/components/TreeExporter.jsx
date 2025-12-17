import React, { useCallback, useState } from 'react';
import { toPng } from 'html-to-image';
import { Button } from '@/components/ui/button';
import { Download, Loader2 } from 'lucide-react';

const TreeExporter = ({ 
  treeName = 'Родословное дерево',
  backgroundImage = 'mountains',
  className = '' 
}) => {
  const [isExporting, setIsExporting] = useState(false);

  const exportTree = useCallback(async () => {
    setIsExporting(true);
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
        
        setIsExporting(false);
        
        // Скачиваем файл с информацией о качестве
        const qualityInfo = isMobile ? '_mobile_hq' : '_desktop_hq';
        const fileName = `family_tree${qualityInfo}.png`;
        
        if (isMobile) {
          // Для мобильных устройств используем альтернативные методы
          try {
            // Метод 1: Попытка через navigator.share (если поддерживается)
            if (navigator.share && navigator.canShare) {
              // Конвертируем dataURL в blob
              const response = await fetch(finalDataUrl);
              const blob = await response.blob();
              const file = new File([blob], fileName, { type: 'image/png' });
              
              if (navigator.canShare({ files: [file] })) {
                await navigator.share({
                  title: 'Семейное дерево',
                  text: 'Мое семейное дерево',
                  files: [file]
                });
                return;
              }
            }
            
            // Метод 2: Открытие в новом окне для сохранения
            const newWindow = window.open();
            if (newWindow) {
              newWindow.document.write(`
                <html>
                  <head><title>Семейное дерево</title></head>
                  <body style="margin:0;padding:20px;text-align:center;font-family:Arial,sans-serif;">
                    <h3>Ваше семейное дерево готово!</h3>
                    <p>Нажмите и удерживайте изображение, затем выберите "Сохранить изображение"</p>
                    <img src="${finalDataUrl}" style="max-width:100%;height:auto;border:1px solid #ccc;" alt="Семейное дерево" />
                    <br><br>
                    <a href="${finalDataUrl}" download="${fileName}" style="background:#065f46;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;">
                      Скачать изображение
                    </a>
                  </body>
                </html>
              `);
              newWindow.document.close();
            } else {
              throw new Error('Не удалось открыть новое окно');
            }
          } catch (shareError) {
            console.log('Методы share не сработали, используем стандартный метод:', shareError);
            // Fallback к стандартному методу
            const link = document.createElement('a');
            link.download = fileName;
            link.href = finalDataUrl;
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
          }
        } else {
          // Для десктопа используем стандартный метод
          const link = document.createElement('a');
          link.download = fileName;
          link.href = finalDataUrl;
          link.style.display = 'none';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
        
      } catch (error) {
        console.error('Ошибка экспорта:', error);
        // Показываем элементы управления обратно при ошибке
        const controlsElements = document.querySelectorAll('.react-flow__controls, .react-flow__minimap, .react-flow__attribution, .react-flow__panel');
        controlsElements.forEach(el => {
          el.style.display = '';
        });
        setIsExporting(false);
        alert('Ошибка при экспорте изображения. Попробуйте еще раз.');
      }
    }
  }, [backgroundImage]);

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={exportTree} 
      disabled={isExporting}
      className={className}
    >
      {isExporting ? (
        <Loader2 className="h-4 w-4 sm:mr-2 animate-spin" />
      ) : (
        <Download className="h-4 w-4 sm:mr-2" />
      )}
      <span className="hidden sm:inline">
        {isExporting ? 'Экспорт...' : 'Скачать'}
      </span>
    </Button>
  );
};

export default TreeExporter;

