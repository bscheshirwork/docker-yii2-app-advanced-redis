Модули
==============

В данной главе описаны подключённые модули, их настройки, предназначение и особенности.

Информация <span id="start-modules-info"></span>
-----------------------

Компонент приложения | Отвечает за | Представлен модулем (имя класса, alias для настроек)
--- | --- | --- | ---
[user](#user) | управление пользователями | Da\User\Module
[rbac](#rbac) | графическое представление RBAC | githubjeka\rbac\Module


user <span id="start-modules-user"></span>
-----------------------

Отвечает за работу с пользователями.
Администрирование, аутентификация, регистрация, восстановление паролей, изменение своих данных.

Пути модуля, согласно документации:
```
/user/registration/register Displays registration form
/user/registration/resend Displays resend form
/user/registration/confirm Confirms a user (requires id and token query params)
/user/security/login Displays login form
/user/security/logout Logs the user out (available only via POST method)
/user/recovery/request Displays recovery request form
/user/recovery/reset Displays password reset form (requires id and token query params)
/user/settings/profile Displays profile settings form
/user/settings/account Displays account settings form (email, username, password)
/user/settings/networks Displays social network accounts settings page
/user/settings/confirm Confirms a new email (requires id and token query params)
/user/settings/privacy Displays GDPR data page
/user/settings/gdprdelete Displays delete personal data page
/user/profile/show Displays user's profile (requires id query param)
/user/admin/index Displays user management interface
/user/admin/create Displays create user form
/user/admin/update Displays update user form (requires id query param)
/user/admin/update-profile Displays update user's profile form (requires id query param)
/user/admin/info Displays user info (requires id query param)
/user/admin/assignments Displays rbac user assignments (requires id query param)
/user/admin/confirm Confirms a user (requires id query param)
/user/admin/delete Deletes a user (requires id query param)
/user/admin/block Blocks a user (requires id query param)
/user/admin/switch-identity Switch identities between the current admin and user on list
/user/role/index Displays rbac roles management interface
/user/role/create Displays create rbac role form
/user/role/update Displays update rbac role form (requires name query param)
/user/role/delete Deletes a rbac role (requires name query param)
/user/permission/index Displays rbac permissions management interface
/user/permission/create Displays create rbac permission form
/user/permission/update Displays update rbac permission form (requires name query param)
/user/permission/delete Deletes a rbac permission (requires name query param)
/user/rule/index Displays rbac permissions management interface
/user/rule/create Displays create rbac rule form
/user/rule/update Displays update rbac rule form (requires name query param)
/user/rule/delete Deletes a rbac rule (requires name query param)
```

Для упрощения некоторые из них переопределены (в формате urlRule):
```
'<id:\d+>' => 'profile/show',
'<action:(login|logout)>' => 'security/<action>',
'<action:(register|resend)>' => 'registration/<action>',
'confirm/<id:\d+>/<code:[A-Za-z0-9_-]+>' => 'registration/confirm',
'forgot' => 'recovery/request',
'recover/<id:\d+>/<code:[A-Za-z0-9_-]+>' => 'recovery/reset'
```

Итого получаем следующие пути:
```
/user/{id} Displays user's profile (requires id query param)
/user/login Displays login form
/user/logout Logs out a user
/user/register Displays registration form
/user/resend Displays resend form
/user/confirm/{id}/{token} Confirms a user (requires id and token query params)
/user/forgot Displays recovery request form
/user/recover/{id}/{token} Displays password reset form (requires id and token query params)
```
Вы можете переопределить это установив в настройках модуля `routes` как пустой массив. После этого можно настроить пути как угодно.

Конфигурация yii2-advanced-rbac/common/config/main.php

```php
    'modules' => [
        'user' => [
            'class' => Da\User\Module::class,
        ],
    ],
```



Источник: `[2amigos/yii2-usuario](https://github.com/2amigos/yii2-usuario)`

rbac <span id="start-modules-rbac"></span>
-----------------------

Отвечает за графическое представление RBAC. По умолчанию доступен по адресу
`index.php?r=rbac`

Конфигурация backend

```php
'modules' => [
    'rbac' => [
        'class' => githubjeka\rbac\Module::class,
        'as access' => [ // if you need to set access
            'class' => yii\filters\AccessControl::class,
            'rules' => [
                [
                    'allow' => true,
                    'permissions' => ['administrateRbac'],
                ],
            ]
        ]
    ],
],
```

Источник: `[gui-rbac-yii2](https://github.com/githubjeka/gui-rbac-yii2)`
