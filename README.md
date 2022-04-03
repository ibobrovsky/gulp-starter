# Gulp starter

Сборка упрощает и ускоряет процесс разработки проектов

## Установка

Клонируйте репозиторий:
```bash
git clone https://github.com/bobrovsky-dev/gulp-starter.git
```
Далее нужно установить зависимости из package.json с помощью npm или yarn:
```bash
npm i или yarn install
```
После можно запустить режим разработки:
```bash
npm run dev
```

## Основные команды
* `npm i` — установить зависимости
* `npm run dev` — старт разработки
* `npm run build` — запуск финальной сборки

## Структура

```
gulp-starter/
│
├── src/                 # Файлы разработки
├── dist/                # Итоговая сборка
├── core/                # Ядро
│
├── gulpfile.js
└── package.json
```

Папка разработки:
```
src/
│
├── pages/               # Страницы
│   ├── index.html
│   └── about.html
│
├── components/          # Компоненты
│       ├── block/
│       ├── block2/
│       └── block3/
│
├── public/              # Любые файлы, которые будут перемещены в итоговую сборку
│
├── config.ts            # Настройки
│
└── icon.png             # Иконка для создания favicons
```

Компонент, все файлы и папки опциональны:
```
block/
│
├── images/              # Изображения для стилей
│   │
│   ├── sprite/          # Иконки для создания спрайта (png и svg)
│   │   ├── mail.png
│   │
│   └── bg.png
│
├── symbols/             # Иконки для svg спрайта (только svg)
│   └── arrow.svg
│
├── assets/              # Любые файлы, которые нужны блоку
│   └── image.jpg
│
├── block.ts
├── block.twig
├── block.scss
│
├── deps.ts              # Зависимости блока
│
└── data.json            # В json можно хранить данные
```