export const es = {
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
    history: {
      title: 'Historial',
      placeholder: 'Todavía no hay sesiones registradas.',
    },
    settings: {
      title: 'Ajustes',
      placeholder: 'Próximamente: descanso por defecto, unidad de peso y tema.',
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
      emptyDays: 'Agregá al menos un día para armar este plan.',
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
      emptyExercises: 'Agregá ejercicios desde el catálogo para este día.',
      addExerciseButton: 'Agregar ejercicio',
      setsRepsFormat: (sets: number, reps: number) => `${sets}x${reps}`,
      restFormat: (seconds: number) => `Descanso ${seconds}s`,
      weightFormat: (weight: number) => `${weight} kg`,
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
      dragHandleLabel: 'Mantené presionado para arrastrar y reordenar',
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
};
