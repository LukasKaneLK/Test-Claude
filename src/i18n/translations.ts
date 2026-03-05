/**
 * translations.ts
 * All UI strings for English, German (Deutsch), and Ukrainian (Українська).
 */

export type Lang = 'en' | 'de' | 'uk'

export interface Translations {
  phaseFocus: string
  phaseShortBreak: string
  phaseLongBreak: string
  tooltipSettings: string
  tooltipTutorial: string
  tooltipLightMode: string
  tooltipDarkMode: string
  dropToQueue: string
  sessionsCompleted: string
  tooltipReset: string
  tooltipPause: string
  tooltipResume: string
  tooltipStart: string
  btnPause: string
  btnResume: string
  btnStart: string
  tooltipSkip: string
  queueHint: string
  tooltipUnmute: string
  tooltipMute: string
  muted: string
  soundOn: string
  tooltipHidePlaylist: string
  tooltipOpenPlaylist: string
  playlistLabel: string
  tooltipPrevTrack: string
  tooltipPauseMusic: string
  tooltipPlayMusic: string
  tooltipNextTrack: string
  tooltipDisableRepeat: string
  tooltipLoopPlaylist: string
  tooltipAddAudio: string
  noTracks: string
  tooltipRemoveFromPlaylist: string
  queue: string
  untitledTask: string
  tooltipMarkDone: string
  tooltipReturnPlanned: string
  timerSettings: string
  fieldFocus: string
  fieldShortBreak: string
  fieldLongBreak: string
  fieldSessions: string
  btnResetDefaults: string
  btnSave: string
  language: string
  restTitle: string
  restBody: string
  focusTitle: string
  focusBody: string
  gotIt: string
  planned: string
  addTask: string
  tooltipDragReorder: string
  writeTask: string
  tooltipDeleteTask: string
  footerStart: string
  footerReset: string
  footerSkip: string
  footerCredit: string
  skipTutorial: string
  back: string
  next: string
  finish: string
  tutorial1Title: string
  tutorial1Body: string
  tutorial2Title: string
  tutorial2Body: string
  tutorial3Title: string
  tutorial3Body: string
  tutorial4Title: string
  tutorial4Body: string
  tutorial5Title: string
  tutorial5Body: string
  tutorial6Title: string
  tutorial6Body: string
  tutorial7Title: string
  tutorial7Body: string
  tutorial8Title: string
  tutorial8Body: string
}

const en: Translations = {
  phaseFocus: 'Focus',
  phaseShortBreak: 'Short Break',
  phaseLongBreak: 'Long Break',
  tooltipSettings: 'Settings',
  tooltipTutorial: 'Open tutorial',
  tooltipLightMode: 'Switch to light mode',
  tooltipDarkMode: 'Switch to dark mode',
  dropToQueue: 'Drop to add to queue',
  sessionsCompleted: '{n} of {total} focus sessions completed',
  tooltipReset: 'Reset timer to full duration',
  tooltipPause: 'Pause timer',
  tooltipResume: 'Resume timer',
  tooltipStart: 'Start focus session',
  btnPause: 'Pause',
  btnResume: 'Resume',
  btnStart: 'Start',
  tooltipSkip: 'Skip to next phase',
  queueHint: 'Add a task to the queue before starting the timer.',
  tooltipUnmute: 'Unmute session sounds',
  tooltipMute: 'Mute session sounds',
  muted: 'Muted',
  soundOn: 'Sound on',
  tooltipHidePlaylist: 'Hide playlist',
  tooltipOpenPlaylist: 'Open playlist',
  playlistLabel: 'Playlist',
  tooltipPrevTrack: 'Previous track',
  tooltipPauseMusic: 'Pause music',
  tooltipPlayMusic: 'Play music',
  tooltipNextTrack: 'Next track',
  tooltipDisableRepeat: 'Disable repeat',
  tooltipLoopPlaylist: 'Loop playlist',
  tooltipAddAudio: 'Add audio file to playlist',
  noTracks: 'No tracks yet — press + to add audio files.',
  tooltipRemoveFromPlaylist: 'Remove from playlist',
  queue: 'Queue',
  untitledTask: 'Untitled task',
  tooltipMarkDone: 'Mark as done',
  tooltipReturnPlanned: 'Return to planned list',
  timerSettings: 'Timer settings',
  fieldFocus: 'Focus (minutes)',
  fieldShortBreak: 'Short break (minutes)',
  fieldLongBreak: 'Long break (minutes)',
  fieldSessions: 'Sessions before long break',
  btnResetDefaults: 'Reset to defaults',
  btnSave: 'Save',
  language: 'Language',
  restTitle: 'Time to rest!',
  restBody: 'Great work! Step away from the screen, stretch, and recharge. Your break has begun.',
  focusTitle: 'Time to focus!',
  focusBody: "Break's over. Clear your mind, pick your next task, and dive back in. You've got this.",
  gotIt: 'Got it',
  planned: 'Planned',
  addTask: 'Add task',
  tooltipDragReorder: 'Drag to reorder or drop onto timer',
  writeTask: 'Write your task…',
  tooltipDeleteTask: 'Delete task',
  footerStart: 'start/pause',
  footerReset: 'reset',
  footerSkip: 'skip',
  footerCredit: 'Pomodoro Timer — created for personal productivity purposes',
  skipTutorial: 'Skip tutorial',
  back: 'Back',
  next: 'Next',
  finish: 'Finish',
  tutorial1Title: 'Plan your tasks',
  tutorial1Body: 'This is your task list. Add tasks here for everything you need to get done today.',
  tutorial2Title: 'Add a new task',
  tutorial2Body: 'Click this button to create a task. Type anything you want to focus on — then drag it to the timer.',
  tutorial3Title: 'The Pomodoro timer',
  tutorial3Body: "Drag a task from either column and drop it here to add it to your focus queue. The timer won't start until you have a task ready.",
  tutorial4Title: 'Start your session',
  tutorial4Body: 'Once a task is in the queue, press Start to begin a 25-minute focus block. You can also hit Space on your keyboard.',
  tutorial5Title: 'Session progress',
  tutorial5Body: 'Each dot represents one focus session. Complete 4 in a row to earn a long break. The cycle then resets automatically.',
  tutorial6Title: 'Background music',
  tutorial6Body: 'Press + to add your own audio files to the playlist. Focus music plays during work sessions; calming rain sounds play automatically during breaks.',
  tutorial7Title: 'Sound effects',
  tutorial7Body: 'Toggle notification sounds on or off — this controls button clicks and phase-end alerts, not the background music.',
  tutorial8Title: 'Light & dark mode',
  tutorial8Body: 'Switch between light and dark themes here. Your preference is saved automatically so it persists across sessions.',
}

const de: Translations = {
  phaseFocus: 'Fokus',
  phaseShortBreak: 'Kurze Pause',
  phaseLongBreak: 'Lange Pause',
  tooltipSettings: 'Einstellungen',
  tooltipTutorial: 'Tutorial öffnen',
  tooltipLightMode: 'Zu hellem Modus wechseln',
  tooltipDarkMode: 'Zu dunklem Modus wechseln',
  dropToQueue: 'Ablegen um zur Warteschlange hinzuzufügen',
  sessionsCompleted: '{n} von {total} Fokussitzungen abgeschlossen',
  tooltipReset: 'Timer zurücksetzen',
  tooltipPause: 'Timer pausieren',
  tooltipResume: 'Timer fortsetzen',
  tooltipStart: 'Fokussitzung starten',
  btnPause: 'Pausieren',
  btnResume: 'Fortsetzen',
  btnStart: 'Starten',
  tooltipSkip: 'Zur nächsten Phase springen',
  queueHint: 'Füge eine Aufgabe zur Warteschlange hinzu, bevor du den Timer startest.',
  tooltipUnmute: 'Ton einschalten',
  tooltipMute: 'Ton ausschalten',
  muted: 'Stumm',
  soundOn: 'Ton an',
  tooltipHidePlaylist: 'Playlist ausblenden',
  tooltipOpenPlaylist: 'Playlist öffnen',
  playlistLabel: 'Playlist',
  tooltipPrevTrack: 'Vorheriger Titel',
  tooltipPauseMusic: 'Musik pausieren',
  tooltipPlayMusic: 'Musik abspielen',
  tooltipNextTrack: 'Nächster Titel',
  tooltipDisableRepeat: 'Wiederholung deaktivieren',
  tooltipLoopPlaylist: 'Playlist wiederholen',
  tooltipAddAudio: 'Audiodatei zur Playlist hinzufügen',
  noTracks: 'Keine Titel — drücke + um Audiodateien hinzuzufügen.',
  tooltipRemoveFromPlaylist: 'Aus Playlist entfernen',
  queue: 'Warteschlange',
  untitledTask: 'Aufgabe ohne Titel',
  tooltipMarkDone: 'Als erledigt markieren',
  tooltipReturnPlanned: 'Zur geplanten Liste zurückkehren',
  timerSettings: 'Timer-Einstellungen',
  fieldFocus: 'Fokus (Minuten)',
  fieldShortBreak: 'Kurze Pause (Minuten)',
  fieldLongBreak: 'Lange Pause (Minuten)',
  fieldSessions: 'Sitzungen vor langer Pause',
  btnResetDefaults: 'Auf Standard zurücksetzen',
  btnSave: 'Speichern',
  language: 'Sprache',
  restTitle: 'Zeit zum Ausruhen!',
  restBody: 'Gute Arbeit! Steh vom Bildschirm auf, strecke dich und erhol dich. Deine Pause hat begonnen.',
  focusTitle: 'Zeit zum Fokussieren!',
  focusBody: 'Pause vorbei. Kläre deinen Kopf, wähle deine nächste Aufgabe und leg los. Du schaffst das.',
  gotIt: 'Verstanden',
  planned: 'Geplant',
  addTask: 'Aufgabe hinzufügen',
  tooltipDragReorder: 'Ziehen zum Umsortieren oder auf den Timer ablegen',
  writeTask: 'Aufgabe schreiben…',
  tooltipDeleteTask: 'Aufgabe löschen',
  footerStart: 'start/pause',
  footerReset: 'zurücksetzen',
  footerSkip: 'überspringen',
  footerCredit: 'Pomodoro Timer — für persönliche Produktivität erstellt',
  skipTutorial: 'Tutorial überspringen',
  back: 'Zurück',
  next: 'Weiter',
  finish: 'Fertig',
  tutorial1Title: 'Plane deine Aufgaben',
  tutorial1Body: 'Das ist deine Aufgabenliste. Füge hier Aufgaben für alles hinzu, was du heute erledigen musst.',
  tutorial2Title: 'Neue Aufgabe hinzufügen',
  tutorial2Body: 'Klicke diese Schaltfläche, um eine Aufgabe zu erstellen. Tippe alles ein, worauf du dich konzentrieren möchtest — und ziehe es dann auf den Timer.',
  tutorial3Title: 'Der Pomodoro-Timer',
  tutorial3Body: 'Ziehe eine Aufgabe aus einer der Spalten und lege sie hier ab, um sie in deine Fokus-Warteschlange hinzuzufügen. Der Timer startet erst, wenn du eine Aufgabe bereit hast.',
  tutorial4Title: 'Deine Sitzung starten',
  tutorial4Body: 'Wenn eine Aufgabe in der Warteschlange ist, drücke Starten für einen 25-Minuten-Fokusblock. Du kannst auch die Leertaste drücken.',
  tutorial5Title: 'Sitzungsfortschritt',
  tutorial5Body: 'Jeder Punkt steht für eine Fokussitzung. Schließe 4 hintereinander ab, um eine lange Pause zu verdienen. Der Zyklus startet dann automatisch neu.',
  tutorial6Title: 'Hintergrundmusik',
  tutorial6Body: 'Drücke + um eigene Audiodateien zur Playlist hinzuzufügen. Fokusmusik spielt während Arbeitssitzungen; beruhigende Regengeräusche spielen automatisch während Pausen.',
  tutorial7Title: 'Soundeffekte',
  tutorial7Body: 'Schalte Benachrichtigungsgeräusche ein oder aus — das steuert Schaltflächenklicks und Phasenende-Benachrichtigungen, nicht die Hintergrundmusik.',
  tutorial8Title: 'Hell- & Dunkel-Modus',
  tutorial8Body: 'Wechsle hier zwischen hellem und dunklem Design. Deine Einstellung wird automatisch gespeichert und sitzungsübergreifend beibehalten.',
}

const uk: Translations = {
  phaseFocus: 'Фокус',
  phaseShortBreak: 'Коротка перерва',
  phaseLongBreak: 'Довга перерва',
  tooltipSettings: 'Налаштування',
  tooltipTutorial: 'Відкрити навчання',
  tooltipLightMode: 'Переключити на світлу тему',
  tooltipDarkMode: 'Переключити на темну тему',
  dropToQueue: 'Перетягніть, щоб додати до черги',
  sessionsCompleted: '{n} з {total} сесій фокусу завершено',
  tooltipReset: 'Скинути таймер',
  tooltipPause: 'Призупинити таймер',
  tooltipResume: 'Продовжити таймер',
  tooltipStart: 'Почати сесію фокусу',
  btnPause: 'Пауза',
  btnResume: 'Продовжити',
  btnStart: 'Старт',
  tooltipSkip: 'Перейти до наступної фази',
  queueHint: 'Додайте завдання до черги перед запуском таймера.',
  tooltipUnmute: 'Увімкнути звук сесії',
  tooltipMute: 'Вимкнути звук сесії',
  muted: 'Без звуку',
  soundOn: 'Звук увімкнено',
  tooltipHidePlaylist: 'Приховати плейлист',
  tooltipOpenPlaylist: 'Відкрити плейлист',
  playlistLabel: 'Плейлист',
  tooltipPrevTrack: 'Попередній трек',
  tooltipPauseMusic: 'Призупинити музику',
  tooltipPlayMusic: 'Відтворити музику',
  tooltipNextTrack: 'Наступний трек',
  tooltipDisableRepeat: 'Вимкнути повтор',
  tooltipLoopPlaylist: 'Повторювати плейлист',
  tooltipAddAudio: 'Додати аудіофайл до плейлиста',
  noTracks: 'Треків немає — натисніть + щоб додати аудіофайли.',
  tooltipRemoveFromPlaylist: 'Видалити з плейлиста',
  queue: 'Черга',
  untitledTask: 'Завдання без назви',
  tooltipMarkDone: 'Позначити як виконане',
  tooltipReturnPlanned: 'Повернути до списку планів',
  timerSettings: 'Налаштування таймера',
  fieldFocus: 'Фокус (хвилини)',
  fieldShortBreak: 'Коротка перерва (хвилини)',
  fieldLongBreak: 'Довга перерва (хвилини)',
  fieldSessions: 'Сесії до довгої перерви',
  btnResetDefaults: 'Скинути до типових',
  btnSave: 'Зберегти',
  language: 'Мова',
  restTitle: 'Час відпочити!',
  restBody: 'Чудова робота! Відійдіть від екрана, потягніться та відновіться. Ваша перерва почалася.',
  focusTitle: 'Час зосередитись!',
  focusBody: 'Перерва закінчилась. Очистіть думки, оберіть наступне завдання та поверніться до роботи. У вас вийде!',
  gotIt: 'Зрозуміло',
  planned: 'Заплановано',
  addTask: 'Додати завдання',
  tooltipDragReorder: 'Перетягніть для переупорядкування або на таймер',
  writeTask: 'Напишіть завдання…',
  tooltipDeleteTask: 'Видалити завдання',
  footerStart: 'старт/пауза',
  footerReset: 'скинути',
  footerSkip: 'пропустити',
  footerCredit: 'Pomodoro Timer — створено для особистої продуктивності',
  skipTutorial: 'Пропустити навчання',
  back: 'Назад',
  next: 'Далі',
  finish: 'Завершити',
  tutorial1Title: 'Плануйте свої завдання',
  tutorial1Body: 'Це ваш список завдань. Додайте сюди завдання для всього, що потрібно зробити сьогодні.',
  tutorial2Title: 'Додати нове завдання',
  tutorial2Body: 'Натисніть цю кнопку, щоб створити завдання. Напишіть будь-що, на чому хочете зосередитись — потім перетягніть на таймер.',
  tutorial3Title: 'Таймер Помодоро',
  tutorial3Body: 'Перетягніть завдання з будь-якого стовпця та киньте сюди, щоб додати до черги фокусу. Таймер не запуститься, доки у вас не буде завдання.',
  tutorial4Title: 'Почніть сесію',
  tutorial4Body: 'Коли завдання є у черзі, натисніть Старт для 25-хвилинного блоку фокусу. Можна також натиснути пробіл.',
  tutorial5Title: 'Прогрес сесій',
  tutorial5Body: 'Кожна крапка — це одна сесія фокусу. Завершіть 4 поспіль, щоб заробити тривалу перерву. Цикл потім автоматично скидається.',
  tutorial6Title: 'Фонова музика',
  tutorial6Body: 'Натисніть + щоб додати власні аудіофайли до плейлиста. Музика для фокусу грає під час робочих сесій; заспокійливі звуки дощу автоматично відтворюються під час перерв.',
  tutorial7Title: 'Звукові ефекти',
  tutorial7Body: 'Вмикайте або вимикайте звуки сповіщень — це керує кліками кнопок та сигналами кінця фази, а не фоновою музикою.',
  tutorial8Title: 'Світла та темна тема',
  tutorial8Body: 'Переключайтесь між світлою та темною темами тут. Ваші налаштування зберігаються автоматично та зберігаються між сесіями.',
}

export const translations: Record<Lang, Translations> = { en, de, uk }

/** Replace {key} placeholders in a translation string. */
export function fmt(str: string, vars: Record<string, string | number>): string {
  return str.replace(/\{(\w+)\}/g, (_, key) => String(vars[key] ?? ''))
}
