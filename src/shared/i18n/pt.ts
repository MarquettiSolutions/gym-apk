// Português (Brasil) — vocabulário e construções do Brasil, não de Portugal
// (nada de "tu"/"vós" nem termos como "ecrã", "telemóvel", etc.).
export const pt = {
  // Índice 0 = domingo ... 6 = sábado, igual que `Date.prototype.getDay()`
  // (spec 4.4) — mesma ordem usada por `weekday` no banco de dados.
  weekdays: [
    'Domingo',
    'Segunda-feira',
    'Terça-feira',
    'Quarta-feira',
    'Quinta-feira',
    'Sexta-feira',
    'Sábado',
  ],
  // Valores de `exercises.muscle_group`/`equipment` (vienen en inglés de
  // free-exercise-db) → texto para mostrar. Clave = valor original en minúsculas.
  muscleGroups: {
    abdominals: 'Abdominais',
    abductors: 'Abdutores',
    adductors: 'Adutores',
    biceps: 'Bíceps',
    calves: 'Panturrilhas',
    chest: 'Peito',
    forearms: 'Antebraços',
    glutes: 'Glúteos',
    hamstrings: 'Posteriores de coxa',
    lats: 'Dorsais',
    'lower back': 'Lombar',
    'middle back': 'Meio das costas',
    neck: 'Pescoço',
    quadriceps: 'Quadríceps',
    shoulders: 'Ombros',
    traps: 'Trapézio',
    triceps: 'Tríceps',
  },
  equipment: {
    'body only': 'Peso corporal',
    bands: 'Faixas elásticas',
    barbell: 'Barra',
    cable: 'Polia',
    dumbbell: 'Halter',
    'e-z curl bar': 'Barra W',
    'exercise ball': 'Bola suíça',
    'foam roll': 'Rolo de espuma',
    kettlebells: 'Kettlebell',
    machine: 'Máquina',
    'medicine ball': 'Medicine ball',
    other: 'Outro',
  },
  tabs: {
    today: 'Treino de hoje',
    plans: 'Meus planos',
    exercises: 'Exercícios',
    history: 'Histórico',
    settings: 'Ajustes',
  },
  screens: {
    today: {
      title: 'Treino de hoje',
      placeholder: 'Ainda não há um treino configurado para hoje.',
    },
    exercises: {
      title: 'Exercícios',
      placeholder: 'O catálogo de exercícios ainda não foi importado.',
    },
    settings: {
      title: 'Ajustes',
    },
  },
  common: {
    loading: 'Carregando...',
    save: 'Salvar',
    cancel: 'Cancelar',
    create: 'Criar',
    add: 'Adicionar',
    edit: 'Editar',
    rename: 'Renomear',
    delete: 'Excluir',
    duplicate: 'Duplicar',
    activate: 'Ativar',
    activeBadge: 'Ativo',
    confirmDeleteButton: 'Sim, excluir',
    optional: 'opcional',
  },
  plans: {
    list: {
      title: 'Meus planos',
      empty: 'Você ainda não criou nenhum plano de treino.',
      createButton: 'Criar plano',
      newPlanTitle: 'Novo plano',
      nameLabel: 'Nome do plano',
      namePlaceholder: 'Ex. Força 3 dias',
      daysCount: (n: number) => `${n} ${n === 1 ? 'dia' : 'dias'}`,
      deleteConfirmTitle: 'Excluir plano',
      deleteConfirmMessage: (name: string) =>
        `Excluir "${name}"? Esta ação não pode ser desfeita.`,
    },
    editor: {
      renameTitle: 'Renomear plano',
      planNameLabel: 'Nome do plano',
      daysTitle: 'Dias de treino',
      emptyDays: 'Adicione pelo menos um dia para montar este plano.',
      addDayButton: 'Adicionar dia',
      addDayTitle: 'Novo dia',
      weekdayLabel: 'Dia da semana',
      dayLabelLabel: 'Nome do dia (opcional)',
      dayLabelPlaceholder: 'Ex. Dia A - Empurrar',
      exercisesCount: (n: number) =>
        `${n} ${n === 1 ? 'exercício' : 'exercícios'}`,
      deleteDayConfirmTitle: 'Excluir dia',
      deleteDayConfirmMessage:
        'Excluir este dia e todos os seus exercícios? Esta ação não pode ser desfeita.',
      deletePlanConfirmTitle: 'Excluir plano',
      deletePlanConfirmMessage:
        'Excluir este plano por completo? Esta ação não pode ser desfeita.',
    },
    dayEditor: {
      editDayTitle: 'Editar dia',
      emptyExercises: 'Adicione exercícios do catálogo para este dia.',
      addExerciseButton: 'Adicionar exercício',
      setsRepsFormat: (sets: number, reps: number) => `${sets}x${reps}`,
      restFormat: (seconds: number) => `Descanso ${seconds}s`,
      weightFormat: (weight: number, unit: string) => `${weight} ${unit}`,
      editExerciseTitle: 'Editar exercício',
      setsLabel: 'Séries',
      repsLabel: 'Repetições',
      weightLabel: 'Peso alvo (opcional)',
      restLabel: 'Descanso (segundos)',
      notesLabel: 'Notas (opcional)',
      deleteExerciseConfirmTitle: 'Remover exercício',
      deleteExerciseConfirmMessage: 'Remover este exercício do dia?',
      moveUp: 'Mover para cima',
      moveDown: 'Mover para baixo',
      dragHandleLabel: 'Mantenha pressionado para arrastar e reordenar',
      groupButton: 'Superserie',
      cancelGroupButton: 'Cancelar',
      confirmGroupButton: (count: number) => `Confirmar superserie (${count})`,
      groupSelectionHint:
        'Toque em 2 ou mais exercícios para agrupá-los em uma superserie.',
      ungroupButton: 'Desagrupar',
      ungroupConfirmTitle: 'Desagrupar superserie',
      ungroupConfirmMessage:
        'Desfazer esta superserie? Os exercícios voltam a ser executados separadamente.',
      supersetBadgeLabel: 'Superserie',
      createSupersetErrorTitle: 'Não foi possível criar a superserie',
    },
    exercisePicker: {
      title: 'Escolher exercício',
      searchPlaceholder: 'Buscar exercício...',
      allMuscleGroups: 'Todos',
      empty: 'Nenhum exercício encontrado.',
      configureTitle: 'Configurar exercício',
    },
  },
  workoutSession: {
    today: {
      noActivePlanMessage:
        'Você ainda não tem um plano ativo. Escolha um em "Meus planos" para ver seu treino de hoje.',
      restDayMessage:
        'Hoje você não tem treino planejado. Aproveite para descansar!',
      startButton: 'Começar treino',
      continueButton: 'Continuar treino',
    },
    session: {
      finishButton: 'Finalizar treino',
      finishConfirmTitle: 'Finalizar treino',
      finishConfirmMessage:
        'Ainda há séries não registradas. Quer finalizar mesmo assim?',
      finishConfirmButton: 'Sim, finalizar',
      skipExerciseButton: 'Pular exercício',
      skipExerciseConfirmTitle: 'Pular exercício',
      skipExerciseConfirmMessage: 'Pular as séries pendentes deste exercício?',
      setLabel: (n: number) => `Série ${n}`,
      setDoneFormat: (
        reps: number | null,
        weight: number | null,
        unit: string,
      ) =>
        weight !== null
          ? `${reps ?? 0} reps x ${weight} ${unit}`
          : `${reps ?? 0} reps`,
      setSkippedLabel: 'Pulada',
      setPendingButton: 'Registrar',
      registerSetTitle: 'Registrar série',
      repsLabel: 'Repetições realizadas',
      weightLabel: 'Peso usado (opcional)',
      markDoneButton: 'Marcar como feita',
      emptySession: 'Este dia não tem exercícios carregados.',
    },
    restTimer: {
      title: 'Descanso',
      pauseButton: 'Pausar',
      resumeButton: 'Retomar',
      skipButton: 'Pular descanso',
      addSecondsButton: (n: number) => `+${n}s`,
      subtractSecondsButton: (n: number) => `-${n}s`,
      notificationTitle: 'Descanso terminado!',
      notificationBody: 'Hora da próxima série.',
      channelName: 'Temporizador de descanso',
    },
  },
  history: {
    list: {
      title: 'Histórico',
      empty: 'Ainda não há sessões registradas.',
      streakLabel: (n: number) =>
        `${n} ${n === 1 ? 'dia' : 'dias'} seguidos treinando`,
      noStreak: 'Comece hoje sua sequência de treinos.',
      deletedPlanLabel: 'Plano excluído',
      bodyWeightButton: 'Peso corporal',
      statusCompleted: 'Concluída',
      statusSkipped: 'Pulada',
      statusInProgress: 'Em andamento',
      setsFormat: (done: number, total: number) => `${done}/${total} séries`,
    },
    detail: {
      title: 'Detalhe da sessão',
      empty: 'Esta sessão não tem séries registradas.',
      setLabel: (n: number) => `Série ${n}`,
      setDoneFormat: (
        reps: number | null,
        weight: number | null,
        unit: string,
      ) =>
        weight !== null
          ? `${reps ?? 0} reps x ${weight} ${unit}`
          : `${reps ?? 0} reps`,
      setSkippedLabel: 'Pulada',
    },
    exerciseProgress: {
      title: 'Progresso do exercício',
      empty: 'Ainda não há registros deste exercício.',
    },
  },
  notifications: {
    dailyReminder: {
      channelName: 'Lembrete diário',
      title: 'Hora de treinar',
      body: 'Não se esqueça de conferir seu treino de hoje.',
    },
  },
  bodyWeight: {
    title: 'Peso corporal',
    empty: 'Você ainda não registrou seu peso.',
    currentLabel: 'Peso atual',
    addButton: 'Adicionar registro',
    addTitle: 'Novo registro de peso',
    weightLabel: (unit: string) => `Peso (${unit})`,
    dateTimeLabel: 'Data e hora',
    filterWeek: 'Semana',
    filterMonth: 'Mês',
    filterAll: 'Tudo',
    deleteConfirmTitle: 'Excluir registro',
    deleteConfirmMessage:
      'Excluir este registro de peso? Esta ação não pode ser desfeita.',
  },
  exercises: {
    title: 'Exercícios',
    searchPlaceholder: 'Buscar exercício...',
    empty: 'Nenhum exercício encontrado.',
    createButton: 'Criar exercício personalizado',
    createTitle: 'Novo exercício',
    nameLabel: 'Nome',
    muscleGroupLabel: 'Grupo muscular (opcional)',
    equipmentLabel: 'Equipamento (opcional)',
    choosePhotoButton: 'Escolher foto',
    changePhotoButton: 'Trocar foto',
    chooseVideoButton: 'Escolher vídeo',
    changeVideoButton: 'Trocar vídeo',
    videoSelectedLabel: 'Vídeo selecionado',
    createErrorTitle: 'Não foi possível criar o exercício',
  },
  exerciseDetail: {
    instructionsTitle: 'Instruções',
    muscleGroupLabel: 'Grupo muscular',
    equipmentLabel: 'Equipamento',
    offlineBannerMessage:
      'Conecte-se à internet para ver o vídeo pela primeira vez.',
    viewDetailLink: 'Ver detalhe do exercício',
    notFound: 'Exercício não encontrado.',
  },
  settings: {
    sections: {
      training: 'Treino',
      weight: 'Peso',
      appearance: 'Aparência',
      language: 'Idioma',
      timer: 'Temporizador',
      notifications: 'Notificações',
      data: 'Dados',
      about: 'Sobre',
    },
    defaultRestSecondsLabel: 'Descanso padrão (segundos)',
    weightUnitLabel: 'Unidade de peso',
    weightUnitOptions: {
      kg: 'Quilogramas (kg)',
      lb: 'Libras (lb)',
    },
    themeLabel: 'Tema',
    themeOptions: {
      light: 'Claro',
      dark: 'Escuro',
      system: 'Sistema',
    },
    languageLabel: 'Idioma',
    languageOptions: {
      en: 'Inglês',
      es: 'Espanhol',
      pt: 'Português',
      system: 'Sistema',
    },
    timerSoundLabel: 'Som ao terminar o descanso',
    timerVibrationLabel: 'Vibração ao terminar o descanso',
    dailyReminderLabel: 'Lembrete diário de treino',
    dailyReminderTimeLabel: 'Horário do lembrete',
    dailyReminderTimeFormat: (hour: number, minute: number) =>
      `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
    exportButton: 'Exportar backup',
    exportHint:
      'Gera um arquivo com seus planos, sessões, histórico e peso corporal para salvar ou compartilhar.',
    exportSuccessTitle: 'Backup exportado',
    exportSuccessMessage:
      'O arquivo foi gerado. Escolha onde salvar ou compartilhar.',
    exportErrorTitle: 'Não foi possível exportar',
    exportErrorMessage: 'Ocorreu um erro ao gerar o backup. Tente novamente.',
    importButton: 'Importar backup',
    importHint:
      'Mescla os dados de um arquivo de backup com os que você já tem no app, sem perder o que já foi registrado.',
    importConfirmTitle: 'Importar backup',
    importConfirmMessage:
      'Isso vai mesclar os dados do arquivo com os que você já tem no app. Os registros existentes não são perdidos.',
    importConfirmButton: 'Sim, importar',
    importSuccessTitle: 'Backup importado',
    importSuccessMessage: 'Os dados do arquivo foram mesclados com os seus.',
    importSkippedMessage: (n: number) =>
      `${n} ${
        n === 1 ? 'registro' : 'registros'
      } não puderam ser vinculados a um exercício do catálogo e foram ignorados.`,
    importErrorTitle: 'Não foi possível importar',
    importErrorMessage: 'O arquivo escolhido não é um backup válido.',
    versionLabel: (version: string, buildNumber: string) =>
      `Versão ${version} (build ${buildNumber})`,
  },
};
