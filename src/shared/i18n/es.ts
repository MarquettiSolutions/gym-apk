// Español (Latinoamérica) — tuteo neutro ("tú"), sin vocabulario ibérico
// (nada de "vosotros", "coger", etc.) ni voseo rioplatense.
export const es = {
  // Índice 0 = domingo ... 6 = sábado, igual que `Date.prototype.getDay()`
  // (spec 4.4) — el mismo orden que usa `weekday` en la DB.
  weekdays: [
    'Domingo',
    'Lunes',
    'Martes',
    'Miércoles',
    'Jueves',
    'Viernes',
    'Sábado',
  ],
  // Valores de `exercises.muscle_group`/`equipment` (vienen en inglés de
  // free-exercise-db) → texto para mostrar. Clave = valor original en minúsculas.
  muscleGroups: {
    abdominals: 'Abdominales',
    abductors: 'Abductores',
    adductors: 'Aductores',
    biceps: 'Bíceps',
    calves: 'Pantorrillas',
    chest: 'Pecho',
    forearms: 'Antebrazos',
    glutes: 'Glúteos',
    hamstrings: 'Isquiotibiales',
    lats: 'Dorsales',
    'lower back': 'Zona lumbar',
    'middle back': 'Espalda media',
    neck: 'Cuello',
    quadriceps: 'Cuádriceps',
    shoulders: 'Hombros',
    traps: 'Trapecios',
    triceps: 'Tríceps',
  },
  equipment: {
    'body only': 'Peso corporal',
    bands: 'Bandas elásticas',
    barbell: 'Barra',
    cable: 'Polea',
    dumbbell: 'Mancuerna',
    'e-z curl bar': 'Barra Z',
    'exercise ball': 'Pelota de estabilidad',
    'foam roll': 'Rodillo de espuma',
    kettlebells: 'Pesa rusa',
    machine: 'Máquina',
    'medicine ball': 'Balón medicinal',
    other: 'Otro',
  },
  tabs: {
    today: 'Plan de hoy',
    plans: 'Mis planes',
    exercises: 'Ejercicios',
    history: 'Historial',
    settings: 'Ajustes',
  },
  screens: {
    today: {
      title: 'Plan de hoy',
      placeholder: 'Todavía no hay un entrenamiento configurado para hoy.',
    },
    exercises: {
      title: 'Ejercicios',
      placeholder: 'El catálogo de ejercicios todavía no se importó.',
    },
    settings: {
      title: 'Ajustes',
    },
  },
  common: {
    loading: 'Cargando...',
    save: 'Guardar',
    cancel: 'Cancelar',
    create: 'Crear',
    add: 'Agregar',
    edit: 'Editar',
    rename: 'Renombrar',
    delete: 'Eliminar',
    duplicate: 'Duplicar',
    activate: 'Activar',
    activeBadge: 'Activo',
    confirmDeleteButton: 'Sí, eliminar',
    optional: 'opcional',
  },
  plans: {
    list: {
      title: 'Mis planes',
      empty: 'Todavía no creaste ningún plan de entrenamiento.',
      createButton: 'Crear plan',
      newPlanTitle: 'Nuevo plan',
      nameLabel: 'Nombre del plan',
      namePlaceholder: 'Ej. Fuerza 3 días',
      daysCount: (n: number) => `${n} ${n === 1 ? 'día' : 'días'}`,
      deleteConfirmTitle: 'Eliminar plan',
      deleteConfirmMessage: (name: string) =>
        `¿Eliminar "${name}"? Esta acción no se puede deshacer.`,
    },
    editor: {
      renameTitle: 'Renombrar plan',
      planNameLabel: 'Nombre del plan',
      daysTitle: 'Días de entrenamiento',
      emptyDays: 'Agrega al menos un día para armar este plan.',
      addDayButton: 'Agregar día',
      addDayTitle: 'Nuevo día',
      weekdayLabel: 'Día de la semana',
      dayLabelLabel: 'Nombre del día (opcional)',
      dayLabelPlaceholder: 'Ej. Día A - Empuje',
      exercisesCount: (n: number) =>
        `${n} ${n === 1 ? 'ejercicio' : 'ejercicios'}`,
      deleteDayConfirmTitle: 'Eliminar día',
      deleteDayConfirmMessage:
        '¿Eliminar este día y todos sus ejercicios? Esta acción no se puede deshacer.',
      deletePlanConfirmTitle: 'Eliminar plan',
      deletePlanConfirmMessage:
        '¿Eliminar este plan completo? Esta acción no se puede deshacer.',
    },
    dayEditor: {
      editDayTitle: 'Editar día',
      emptyExercises: 'Agrega ejercicios desde el catálogo para este día.',
      addExerciseButton: 'Agregar ejercicio',
      setsRepsFormat: (sets: number, reps: number) => `${sets}x${reps}`,
      restFormat: (seconds: number) => `Descanso ${seconds}s`,
      weightFormat: (weight: number, unit: string) => `${weight} ${unit}`,
      editExerciseTitle: 'Editar ejercicio',
      setsLabel: 'Series',
      repsLabel: 'Repeticiones',
      weightLabel: 'Peso objetivo (opcional)',
      restLabel: 'Descanso (segundos)',
      notesLabel: 'Notas (opcional)',
      deleteExerciseConfirmTitle: 'Quitar ejercicio',
      deleteExerciseConfirmMessage: '¿Quitar este ejercicio del día?',
      moveUp: 'Subir',
      moveDown: 'Bajar',
      dragHandleLabel: 'Mantén presionado para arrastrar y reordenar',
      groupButton: 'Superserie',
      cancelGroupButton: 'Cancelar',
      confirmGroupButton: (count: number) => `Confirmar superserie (${count})`,
      groupSelectionHint:
        'Toca 2 o más ejercicios para agruparlos en una superserie.',
      ungroupButton: 'Desagrupar',
      ungroupConfirmTitle: 'Desagrupar superserie',
      ungroupConfirmMessage:
        '¿Deshacer esta superserie? Los ejercicios vuelven a ejecutarse por separado.',
      supersetBadgeLabel: 'Superserie',
      createSupersetErrorTitle: 'No se pudo crear la superserie',
    },
    exercisePicker: {
      title: 'Elegir ejercicio',
      searchPlaceholder: 'Buscar ejercicio...',
      allMuscleGroups: 'Todos',
      empty: 'No se encontraron ejercicios.',
      configureTitle: 'Configurar ejercicio',
    },
  },
  workoutSession: {
    today: {
      noActivePlanMessage:
        'Todavía no tienes un plan activo. Elige uno en "Mis planes" para ver tu entrenamiento de hoy.',
      restDayMessage: 'Hoy no tienes entrenamiento planificado. ¡A descansar!',
      startButton: 'Comenzar entrenamiento',
      continueButton: 'Continuar entrenamiento',
    },
    session: {
      finishButton: 'Finalizar entrenamiento',
      finishConfirmTitle: 'Finalizar entrenamiento',
      finishConfirmMessage:
        'Todavía hay series sin registrar. ¿Quieres finalizar igual?',
      finishConfirmButton: 'Sí, finalizar',
      skipExerciseButton: 'Omitir ejercicio',
      skipExerciseConfirmTitle: 'Omitir ejercicio',
      skipExerciseConfirmMessage:
        '¿Omitir las series pendientes de este ejercicio?',
      setLabel: (n: number) => `Serie ${n}`,
      setDoneFormat: (
        reps: number | null,
        weight: number | null,
        unit: string,
      ) =>
        weight !== null
          ? `${reps ?? 0} reps x ${weight} ${unit}`
          : `${reps ?? 0} reps`,
      setSkippedLabel: 'Omitida',
      setPendingButton: 'Registrar',
      registerSetTitle: 'Registrar serie',
      repsLabel: 'Repeticiones realizadas',
      weightLabel: 'Peso usado (opcional)',
      markDoneButton: 'Marcar hecha',
      emptySession: 'Este día no tiene ejercicios cargados.',
    },
    restTimer: {
      title: 'Descanso',
      pauseButton: 'Pausar',
      resumeButton: 'Reanudar',
      skipButton: 'Saltar descanso',
      addSecondsButton: (n: number) => `+${n}s`,
      subtractSecondsButton: (n: number) => `-${n}s`,
      notificationTitle: '¡Descanso terminado!',
      notificationBody: 'Es hora de la siguiente serie.',
      channelName: 'Temporizador de descanso',
    },
  },
  history: {
    list: {
      title: 'Historial',
      empty: 'Todavía no hay sesiones registradas.',
      streakLabel: (n: number) =>
        `${n} ${n === 1 ? 'día' : 'días'} seguidos entrenando`,
      noStreak: 'Empieza hoy tu racha de entrenamiento.',
      deletedPlanLabel: 'Plan eliminado',
      bodyWeightButton: 'Peso corporal',
      statusCompleted: 'Completada',
      statusSkipped: 'Omitida',
      statusInProgress: 'En curso',
      setsFormat: (done: number, total: number) => `${done}/${total} series`,
    },
    detail: {
      title: 'Detalle de sesión',
      empty: 'Esta sesión no tiene series registradas.',
      setLabel: (n: number) => `Serie ${n}`,
      setDoneFormat: (
        reps: number | null,
        weight: number | null,
        unit: string,
      ) =>
        weight !== null
          ? `${reps ?? 0} reps x ${weight} ${unit}`
          : `${reps ?? 0} reps`,
      setSkippedLabel: 'Omitida',
    },
    exerciseProgress: {
      title: 'Progreso del ejercicio',
      empty: 'Todavía no hay registros de este ejercicio.',
    },
  },
  notifications: {
    dailyReminder: {
      channelName: 'Recordatorio diario',
      title: 'Hora de entrenar',
      body: 'No te olvides de revisar tu plan de hoy.',
    },
  },
  bodyWeight: {
    title: 'Peso corporal',
    empty: 'Todavía no registraste tu peso.',
    currentLabel: 'Peso actual',
    addButton: 'Agregar registro',
    addTitle: 'Nuevo registro de peso',
    weightLabel: (unit: string) => `Peso (${unit})`,
    dateTimeLabel: 'Fecha y hora',
    filterWeek: 'Semana',
    filterMonth: 'Mes',
    filterAll: 'Todo',
    deleteConfirmTitle: 'Eliminar registro',
    deleteConfirmMessage:
      '¿Eliminar este registro de peso? Esta acción no se puede deshacer.',
  },
  exercises: {
    title: 'Ejercicios',
    searchPlaceholder: 'Buscar ejercicio...',
    empty: 'No se encontraron ejercicios.',
    createButton: 'Crear ejercicio personalizado',
    createTitle: 'Nuevo ejercicio',
    nameLabel: 'Nombre',
    muscleGroupLabel: 'Grupo muscular (opcional)',
    equipmentLabel: 'Equipo (opcional)',
    choosePhotoButton: 'Elegir foto',
    changePhotoButton: 'Cambiar foto',
    chooseVideoButton: 'Elegir video',
    changeVideoButton: 'Cambiar video',
    videoSelectedLabel: 'Video seleccionado',
    createErrorTitle: 'No se pudo crear el ejercicio',
  },
  exerciseDetail: {
    instructionsTitle: 'Instrucciones',
    muscleGroupLabel: 'Grupo muscular',
    equipmentLabel: 'Equipo',
    offlineBannerMessage: 'Conéctate para ver el video la primera vez.',
    viewDetailLink: 'Ver detalle del ejercicio',
    notFound: 'No se encontró el ejercicio.',
    editName: 'Editar nombre',
    editNameTitle: 'Editar nombre del ejercicio',
    nameFieldLabel: 'Nombre',
    restoreOriginal: 'Restaurar original',
    nameEmptyError: 'El nombre no puede estar vacío.',
    nameTooLongError: (max: number) =>
      `El nombre puede tener como máximo ${max} caracteres.`,
    confirmTitle: 'Guardar nombre',
    confirmMessage:
      'Elige qué hacer con tu cambio. Las sugerencias son públicas: se publican como una issue en el repositorio de la app (github.com/MarquettiSolutions/gym-apk) con tu cuenta de GitHub.',
    saveLocalOnly: 'Solo guardar en mi teléfono',
    saveAndSend: 'Guardar y enviar sugerencia',
    openBrowserError:
      'Tu nombre se guardó, pero no se pudo abrir la página de la sugerencia. Revisa tu conexión y tu navegador.',
  },
  settings: {
    sections: {
      training: 'Entrenamiento',
      weight: 'Peso',
      appearance: 'Apariencia',
      language: 'Idioma',
      timer: 'Temporizador',
      notifications: 'Notificaciones',
      data: 'Datos',
      about: 'Acerca de',
    },
    defaultRestSecondsLabel: 'Descanso por defecto (segundos)',
    weightUnitLabel: 'Unidad de peso',
    weightUnitOptions: {
      kg: 'Kilogramos (kg)',
      lb: 'Libras (lb)',
    },
    themeLabel: 'Tema',
    themeOptions: {
      light: 'Claro',
      dark: 'Oscuro',
      system: 'Sistema',
    },
    languageLabel: 'Idioma',
    languageOptions: {
      en: 'Inglés',
      es: 'Español',
      pt: 'Portugués',
      system: 'Sistema',
    },
    timerSoundLabel: 'Sonido al terminar el descanso',
    timerVibrationLabel: 'Vibración al terminar el descanso',
    dailyReminderLabel: 'Recordatorio diario de entrenamiento',
    dailyReminderTimeLabel: 'Hora del recordatorio',
    dailyReminderTimeFormat: (hour: number, minute: number) =>
      `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
    exportButton: 'Exportar backup',
    exportHint:
      'Genera un archivo con tus planes, sesiones, historial y peso corporal para guardarlo o compartirlo.',
    exportSuccessTitle: 'Backup exportado',
    exportSuccessMessage:
      'Se generó el archivo. Elige dónde guardarlo o compartirlo.',
    exportErrorTitle: 'No se pudo exportar',
    exportErrorMessage:
      'Ocurrió un error generando el backup. Intenta de nuevo.',
    importButton: 'Importar backup',
    importHint:
      'Fusiona los datos de un archivo de backup con los que ya tienes en la app, sin perder lo que ya cargaste.',
    importConfirmTitle: 'Importar backup',
    importConfirmMessage:
      'Esto va a fusionar los datos del archivo con los que ya tienes en la app. Los registros existentes no se pierden.',
    importConfirmButton: 'Sí, importar',
    importSuccessTitle: 'Backup importado',
    importSuccessMessage: 'Los datos del archivo se fusionaron con los tuyos.',
    importSkippedMessage: (n: number) =>
      `${n} ${
        n === 1 ? 'registro' : 'registros'
      } no se pudieron reenlazar a un ejercicio del catálogo y se omitieron.`,
    importErrorTitle: 'No se pudo importar',
    importErrorMessage: 'El archivo elegido no es un backup válido.',
    versionLabel: (version: string, buildNumber: string) =>
      `Versión ${version} (build ${buildNumber})`,
  },
};
