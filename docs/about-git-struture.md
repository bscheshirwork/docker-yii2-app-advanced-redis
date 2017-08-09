# Структура наследования репозиториев

Данный проект имеет определённу цепочку предков и подмодулей, обновление исходного кода которых может повлечь 
за собой улучшение кода и актуализацию его относительно исходного. Также данная схема признана помочь при ломании вендорами
обратной совместимости (обновлённый код, скорее всего, будет работать с обновлёнными зависимостями)


## Подмодули и пути

```
docker-yii2-app-advanced-rbac
url = https://github.com/bscheshirwork/docker-yii2-app-advanced-rbac.git
|
|---- docker-codeception-yii2
|     path = docker-codeception-run/docker-codeception-yii2/build
|     url = https://github.com/bscheshirwork/docker-codeception-yii2.git
|
|---- docker-php
|     path = docker-run/docker-php
|     url = https://github.com/bscheshirwork/docker-php.git
|
|---- yii2-app-advanced-rbac
      path = php-code
      url = https://github.com/bscheshirwork/yii2-app-advanced-rbac.git
```


## Предки

Соответствущие цепочки для окружения приложения `docker` и подмодуля с кодом приложения `php-code`

```
docker-yii2-app-advanced-rbac
url = https://github.com/bscheshirwork/docker-yii2-app-advanced-rbac.git
⇑
docker-yii2-app-advanced
url = https://github.com/bscheshirwork/docker-yii2-app-advanced.git
```

```
yii2-app-advanced-rbac
url = https://github.com/bscheshirwork/yii2-app-advanced-rbac.git
⇑
yii2-app-advanced
url = https://github.com/yiisoft/yii2-app-advanced.git
```

### Обновление

Важно помнить, что без соответствующего опубликованого коммита в подмодуле `php-code` репозиторий `docker`
будет ссылатся на несуществующие данные.  
С другой стороны при публикации подмодуля `php-code` без публикации `docker` с соответствующим коммитом 
при клонировании репозитория с подмодулями даст устаревшие данные
Конечно, раздельный `git pull` даёт актуальную информацию, но указывать будет не на конечный коммит.

Таким образом, необходимо актуализировать оба репозитория, см.псевдокод. 
`php-code`: `git commit; git push bitbucket`, `docker`: `git add php-code; git commit; git push bitbucket`

Раздельный `git pull` даёт актуальную информацию
`php-code`: `git pull origin`, `docker`: `git pull origin`

## Актуализация

Добавив репозитории предков под псевдонимом `parent` либо обращаясь напрямую по адресу, можно сделать `pull` изначального кода.
Доступно как по цепочке (если есть доступ), так и последовательно, над каждым предком, из верхнеуровнего.