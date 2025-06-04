# AddCourseModal

Модальное окно для добавления пользовательского курса. Поддерживает:

- Загрузку курса через drag-n-drop (с `CourseFileUploader`)
- Предпросмотр структуры курса (главы и темы)
- Установку публичности
- Валидацию JSON
- Сохранение курса в Zustand store

Использует:
- `CourseFileUploader`
- Zustand `useCourseStore`
