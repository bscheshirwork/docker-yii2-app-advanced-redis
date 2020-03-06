# Добавление контейнера node.js для сборки с помощью webpack проложений react и/или scss 

status: wip

При работе с вёрсткой, а также при работе с react приложениями необходимо иметь возможность запустить приложение в "режиме разработчика", а также собрать готовые файлы и использовать их в asset

Для данной цели добавим сервис node в композицию для разработки docker-run/docker-compose.yml

```
services:
  node:
    image: node:13.10-alpine3.11
    volumes:
      - ../node-data:/var/www/html #node-data
      - ~/.composer/cache:/root/.composer/cache
    depends_on:
      - php # backend
    environment:
      TZ: Europe/Moscow
```

Из контейнера, соответственно, работаем с npm для установки webpack и react

Переходим в контейнер сервиса (соответственно для запущенного и для случая, когда нет )
```
docker-compose exec node bash
docker-compose run --rm --entrypoint bash node
```
Выполняем нужные действия в месте, куду замапиил папку для фронтенд-нодовских исходников и сборок
```
cd /var/www/html
npm init
npm -i --save-dev webpack webpack-cli webpack-dev-server html-webpack-plugin react react-dom @babel/core babel-loader @babel/preset-env @babel/preset-react css-loader style-loader
```

Получаем шаблон, изменяем, и из контейнера, билдим. В дальнейшем, интересно перенести этот процесс на github actions, там такой пункт видел
```
npm run build
```
Для приложений, которые имеют только некоторые, разрозненные страницы на react, интересно следующее решение:
https://itnext.io/building-multi-page-application-with-react-f5a338489694

Пошаговая инструкция для установки приложения с нуля
https://medium.com/nuances-of-programming/%D0%BA%D0%B0%D0%BA-%D1%81-%D0%BD%D1%83%D0%BB%D1%8F-%D1%81%D0%BE%D0%B7%D0%B4%D0%B0%D1%82%D1%8C-%D0%BF%D1%80%D0%BE%D0%B5%D0%BA%D1%82-%D0%BD%D0%B0-react-%D0%B8%D1%81%D0%BF%D0%BE%D0%BB%D1%8C%D0%B7%D1%83%D1%8F-webpack-4-%D0%B8-babel-172c256d228
