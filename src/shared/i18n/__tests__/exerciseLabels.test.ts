import {
  exerciseMatchesSearch,
  localizedEquipment,
  localizedExerciseName,
  localizedInstructions,
  localizedMuscleGroup,
  normalizeSearchText,
} from '../exerciseLabels';
import { exerciseInstructionsEs } from '../exerciseInstructionsEs';
import { exerciseInstructionsPt } from '../exerciseInstructionsPt';
import { exerciseNameTranslations } from '../exerciseNames';
import { en } from '../en';
import { es } from '../es';
import { pt } from '../pt';

const catalogExercise = { name: 'Barbell Deadlift', isCustom: false };

describe('localizedExerciseName', () => {
  it('traduce ejercicios del catálogo a español y portugués', () => {
    expect(localizedExerciseName(catalogExercise, 'es')).toBe(
      'Peso muerto con barra',
    );
    expect(localizedExerciseName(catalogExercise, 'pt')).toBe(
      'Levantamento terra com barra',
    );
  });

  it('en inglés devuelve el nombre canónico', () => {
    expect(localizedExerciseName(catalogExercise, 'en')).toBe(
      'Barbell Deadlift',
    );
  });

  it('cae al nombre original si no hay traducción', () => {
    expect(
      localizedExerciseName(
        { name: 'Some Unknown Move', isCustom: false },
        'es',
      ),
    ).toBe('Some Unknown Move');
  });

  it('la edición local del usuario gana sobre el diccionario, por idioma', () => {
    const overrides = new Map([['ex1|es', 'Peso muerto convencional']]);
    const exercise = { id: 'ex1', ...catalogExercise };
    expect(localizedExerciseName(exercise, 'es', overrides)).toBe(
      'Peso muerto convencional',
    );
    expect(localizedExerciseName(exercise, 'pt', overrides)).toBe(
      'Levantamento terra com barra',
    );
    expect(
      exerciseMatchesSearch(exercise, 'es', 'convencional', overrides),
    ).toBe(true);
  });

  it('nunca traduce ejercicios personalizados', () => {
    expect(
      localizedExerciseName({ name: 'Barbell Deadlift', isCustom: true }, 'pt'),
    ).toBe('Barbell Deadlift');
  });

  it('todas las traducciones del catálogo tienen es y pt no vacíos', () => {
    const entries = Object.entries(exerciseNameTranslations);
    expect(entries).toHaveLength(876);
    for (const [, value] of entries) {
      expect(value.es.trim()).not.toBe('');
      expect(value.pt.trim()).not.toBe('');
    }
  });
});

describe('localizedInstructions', () => {
  const original = 'Stand up.\nLower the bar.';
  const exercise = {
    name: 'Barbell Deadlift',
    isCustom: false,
    instructions: original,
  };

  it('traduce las instrucciones del catálogo a español y portugués', () => {
    expect(localizedInstructions(exercise, 'es')).toBe(
      exerciseInstructionsEs['Barbell Deadlift'],
    );
    expect(localizedInstructions(exercise, 'pt')).toBe(
      exerciseInstructionsPt['Barbell Deadlift'],
    );
    expect(localizedInstructions(exercise, 'es')).not.toBe(original);
    expect(localizedInstructions(exercise, 'pt')).not.toBe(original);
  });

  it('en inglés devuelve el texto original', () => {
    expect(localizedInstructions(exercise, 'en')).toBe(original);
  });

  it('cae al texto original si el ejercicio no tiene traducción', () => {
    expect(
      localizedInstructions({ ...exercise, name: 'Some Unknown Move' }, 'es'),
    ).toBe(original);
  });

  it('nunca traduce ejercicios personalizados', () => {
    expect(localizedInstructions({ ...exercise, isCustom: true }, 'pt')).toBe(
      original,
    );
  });

  it('devuelve null si el ejercicio no tiene instrucciones', () => {
    expect(
      localizedInstructions({ ...exercise, instructions: null }, 'es'),
    ).toBe(null);
  });

  it('cubre todo el catálogo en es y pt, con pasos no vacíos', () => {
    const names = Object.keys(exerciseNameTranslations);
    for (const dictionary of [exerciseInstructionsEs, exerciseInstructionsPt]) {
      const withInstructions = Object.keys(dictionary);
      // 5 ejercicios de la fuente no traen instrucciones.
      expect(withInstructions).toHaveLength(names.length - 5);
      for (const name of withInstructions) {
        expect(names).toContain(name);
        for (const step of (dictionary[name] ?? '').split('\n')) {
          expect(step.trim()).not.toBe('');
        }
      }
    }
    expect(Object.keys(exerciseInstructionsEs).sort()).toEqual(
      Object.keys(exerciseInstructionsPt).sort(),
    );
  });
});

describe('localizedMuscleGroup / localizedEquipment', () => {
  it('traduce cada músculo de una lista separada por coma', () => {
    expect(
      localizedMuscleGroup(
        { muscleGroup: 'chest, triceps, lower back', isCustom: false },
        'es',
      ),
    ).toBe('Pecho, Tríceps, Zona lumbar');
    expect(
      localizedMuscleGroup({ muscleGroup: 'calves', isCustom: false }, 'pt'),
    ).toBe('Panturrilhas');
  });

  it('no repite un músculo que aparece como primario y secundario', () => {
    expect(
      localizedMuscleGroup(
        { muscleGroup: 'quadriceps, quadriceps', isCustom: false },
        'es',
      ),
    ).toBe('Cuádriceps');
  });

  it('traduce el equipo y deja pasar valores desconocidos y nulos', () => {
    expect(
      localizedEquipment({ equipment: 'dumbbell', isCustom: false }, 'pt'),
    ).toBe('Halter');
    expect(
      localizedEquipment({ equipment: 'sandbag', isCustom: false }, 'es'),
    ).toBe('sandbag');
    expect(
      localizedEquipment({ equipment: null, isCustom: false }, 'es'),
    ).toBeNull();
  });

  it('no toca músculo/equipo de ejercicios personalizados', () => {
    expect(
      localizedMuscleGroup({ muscleGroup: 'chest', isCustom: true }, 'es'),
    ).toBe('chest');
    expect(
      localizedEquipment({ equipment: 'dumbbell', isCustom: true }, 'es'),
    ).toBe('dumbbell');
  });

  it('los 3 idiomas cubren las mismas claves de músculos y equipo', () => {
    expect(Object.keys(es.muscleGroups).sort()).toEqual(
      Object.keys(en.muscleGroups).sort(),
    );
    expect(Object.keys(pt.muscleGroups).sort()).toEqual(
      Object.keys(en.muscleGroups).sort(),
    );
    expect(Object.keys(es.equipment).sort()).toEqual(
      Object.keys(en.equipment).sort(),
    );
    expect(Object.keys(pt.equipment).sort()).toEqual(
      Object.keys(en.equipment).sort(),
    );
  });
});

describe('búsqueda', () => {
  it('normaliza tildes y mayúsculas', () => {
    expect(normalizeSearchText('Sentádilla')).toBe('sentadilla');
  });

  it('encuentra por nombre traducido o por el original en inglés', () => {
    const squat = { name: 'Barbell Full Squat', isCustom: false };
    expect(exerciseMatchesSearch(squat, 'es', 'sentadilla')).toBe(true);
    expect(exerciseMatchesSearch(squat, 'pt', 'agachamento')).toBe(true);
    expect(exerciseMatchesSearch(squat, 'es', 'squat')).toBe(true);
    expect(exerciseMatchesSearch(squat, 'es', 'remo')).toBe(false);
  });

  it('un ejercicio personalizado solo se busca por lo que escribió el usuario', () => {
    const custom = { name: 'Mi Sentadilla', isCustom: true };
    expect(exerciseMatchesSearch(custom, 'pt', 'agachamento')).toBe(false);
    expect(exerciseMatchesSearch(custom, 'pt', 'sentadilla')).toBe(true);
  });
});
