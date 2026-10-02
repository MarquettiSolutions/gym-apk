#!/usr/bin/env node
// Carga un plan de entrenamiento directo en la base de datos SQLite de
// gym-apk en un dispositivo/emulador conectado por ADB, sin tocar la UI.
// Ver SKILL.md en esta misma carpeta para el flujo completo y las
// condiciones de uso (solo builds debuggable, un dispositivo a la vez).

import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { mkdtempSync, readFileSync, writeFileSync, copyFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const APP_PKG = 'com.nodylabs.gymapk';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../../..');

function usageAndExit(message) {
  if (message) console.error(`Error: ${message}\n`);
  console.error(
    'Uso: node apply-plan.mjs <plan.json> [--serial <device-id>] [--no-activate]',
  );
  process.exit(1);
}

function parseArgs(argv) {
  const args = { planPath: null, serial: null, activateOverride: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--serial') {
      args.serial = argv[++i];
    } else if (a === '--no-activate') {
      args.activateOverride = false;
    } else if (!args.planPath && !a.startsWith('--')) {
      args.planPath = a;
    } else {
      usageAndExit(`argumento desconocido: ${a}`);
    }
  }
  if (!args.planPath) usageAndExit('falta la ruta al plan.json');
  return args;
}

function adb(serial, args, opts = {}) {
  const fullArgs = serial ? ['-s', serial, ...args] : args;
  return execFileSync('adb', fullArgs, { encoding: 'utf8', ...opts });
}

function resolveSerial(requested) {
  const out = execFileSync('adb', ['devices'], { encoding: 'utf8' });
  const lines = out
    .split('\n')
    .slice(1)
    .map(l => l.trim())
    .filter(l => l.endsWith('\tdevice'));
  const serials = lines.map(l => l.split('\t')[0]);
  if (requested) {
    if (!serials.includes(requested)) {
      usageAndExit(
        `el dispositivo ${requested} no aparece en 'adb devices' (conectados: ${serials.join(', ') || 'ninguno'})`,
      );
    }
    return requested;
  }
  if (serials.length === 0) {
    usageAndExit("no hay dispositivos/emuladores en 'adb devices'");
  }
  if (serials.length > 1) {
    usageAndExit(
      `hay ${serials.length} dispositivos conectados (${serials.join(', ')}); pasá --serial <id>`,
    );
  }
  return serials[0];
}

function sqlEscape(value) {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return value ? '1' : '0';
  return `'${String(value).replace(/'/g, "''")}'`;
}

function normalize(str) {
  return str
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

function loadPlan(planPath) {
  const raw = JSON.parse(readFileSync(planPath, 'utf8'));
  if (!raw.planName || typeof raw.planName !== 'string') {
    throw new Error('planName es obligatorio (string)');
  }
  if (!Array.isArray(raw.days) || raw.days.length === 0) {
    throw new Error('days debe ser un array con al menos un día');
  }
  for (const day of raw.days) {
    if (
      typeof day.weekday !== 'number' ||
      day.weekday < 0 ||
      day.weekday > 6
    ) {
      throw new Error(
        `weekday inválido (${day.weekday}): debe ser 0=domingo..6=sábado`,
      );
    }
    if (!Array.isArray(day.exercises) || day.exercises.length === 0) {
      throw new Error(`el día weekday=${day.weekday} no tiene ejercicios`);
    }
    for (const ex of day.exercises) {
      if (!ex.name || typeof ex.name !== 'string') {
        throw new Error('cada ejercicio necesita "name"');
      }
      if (!Number.isInteger(ex.sets) || ex.sets <= 0) {
        throw new Error(`"sets" inválido para ${ex.name}`);
      }
      if (!Number.isInteger(ex.reps) || ex.reps <= 0) {
        throw new Error(`"reps" inválido para ${ex.name}`);
      }
    }
  }
  return raw;
}

async function loadNameTranslations() {
  const mod = await import(
    path.join(REPO_ROOT, 'src/shared/i18n/exerciseNames.ts')
  );
  return mod.exerciseNameTranslations;
}

function buildExerciseIndex(dbRows, translations) {
  // dbName -> { id, synonyms: Set<string normalizado> }
  const bySynonym = new Map(); // normalizado -> [{ id, dbName }]
  function addSynonym(normalized, entry) {
    if (!bySynonym.has(normalized)) bySynonym.set(normalized, []);
    const list = bySynonym.get(normalized);
    if (!list.some(e => e.id === entry.id)) list.push(entry);
  }
  for (const row of dbRows) {
    const entry = { id: row.id, dbName: row.name };
    addSynonym(normalize(row.name), entry);
    const t = translations[row.name];
    if (t) {
      if (t.es) addSynonym(normalize(t.es), entry);
      if (t.pt) addSynonym(normalize(t.pt), entry);
    }
  }
  return bySynonym;
}

function resolveExercise(name, index, dbRows) {
  const n = normalize(name);
  const exact = index.get(n);
  if (exact && exact.length === 1) return { id: exact[0].id };
  if (exact && exact.length > 1) {
    return { candidates: exact.map(e => ({ id: e.id, name: e.dbName })) };
  }
  // Fuzzy: substring en cualquier dirección sobre nombres de DB.
  const substringMatches = dbRows.filter(
    row => normalize(row.name).includes(n) || n.includes(normalize(row.name)),
  );
  if (substringMatches.length === 1) {
    return { id: substringMatches[0].id };
  }
  if (substringMatches.length > 1) {
    return {
      candidates: substringMatches
        .slice(0, 10)
        .map(row => ({ id: row.id, name: row.name })),
    };
  }
  return { candidates: [] };
}

async function main() {
  const { planPath, serial: requestedSerial, activateOverride } = parseArgs(
    process.argv.slice(2),
  );
  const plan = loadPlan(planPath);
  const activate = activateOverride === null ? plan.activate !== false : activateOverride;

  const serial = resolveSerial(requestedSerial);
  console.log(`Dispositivo: ${serial}`);

  console.log('Cerrando la app (force-stop) para leer la DB de forma consistente...');
  adb(serial, ['shell', 'am', 'force-stop', APP_PKG]);

  const workdir = mkdtempSync(path.join(tmpdir(), 'gymapk-plan-'));
  const dbPath = path.join(workdir, 'gymapk.db');

  const pulled = adb(serial, [
    'exec-out',
    'run-as',
    APP_PKG,
    'cat',
    'databases/gymapk.db',
  ], { maxBuffer: 1024 * 1024 * 64, encoding: 'buffer' });
  writeFileSync(dbPath, pulled);

  const header = pulled.subarray(0, 16).toString('utf8');
  if (!header.startsWith('SQLite format 3')) {
    throw new Error(
      `no se pudo leer la DB vía run-as (¿build debuggable? ¿paquete instalado?). ` +
        `Primeros bytes: ${pulled.subarray(0, 200).toString('utf8')}`,
    );
  }

  const backupPath = path.join(workdir, `gymapk.backup-${Date.now()}.db`);
  copyFileSync(dbPath, backupPath);
  console.log(`Backup de la DB original: ${backupPath}`);

  const userId = execFileSync('sqlite3', [dbPath, 'SELECT id FROM users LIMIT 1;'], {
    encoding: 'utf8',
  }).trim();
  if (!userId) {
    throw new Error(
      'no hay fila en users: abrí la app al menos una vez en este dispositivo antes de correr esta skill',
    );
  }

  const exerciseRowsRaw = execFileSync(
    'sqlite3',
    [dbPath, '-separator', '\x1f', 'SELECT id, name FROM exercises;'],
    { encoding: 'utf8' },
  );
  const dbRows = exerciseRowsRaw
    .split('\n')
    .filter(Boolean)
    .map(line => {
      const [id, name] = line.split('\x1f');
      return { id, name };
    });

  const translations = await loadNameTranslations();
  const index = buildExerciseIndex(dbRows, translations);

  const unresolved = [];
  const resolvedPlan = { ...plan, days: [] };
  for (const day of plan.days) {
    const exercises = [];
    for (const ex of day.exercises) {
      const result = resolveExercise(ex.name, index, dbRows);
      if (result.id) {
        exercises.push({ ...ex, exerciseId: result.id });
      } else {
        unresolved.push({ name: ex.name, candidates: result.candidates });
      }
    }
    resolvedPlan.days.push({ ...day, exercises });
  }

  if (unresolved.length > 0) {
    console.log(
      JSON.stringify({ status: 'unresolved_exercises', unresolved }, null, 2),
    );
    console.error(
      '\nNo se tocó la base de datos. Resolvé la ambigüedad/typo en el plan.json (podés pasar el nombre exacto que' +
        ' aparece en "candidates", o el exerciseId directamente agregando "exerciseId" en vez de "name") y volvé a correr.',
    );
    process.exit(2);
  }

  const now = new Date().toISOString();
  const planId = randomUUID();
  const statements = [];
  statements.push('PRAGMA foreign_keys = ON;');
  statements.push('BEGIN TRANSACTION;');
  if (activate) {
    statements.push(
      `UPDATE plans SET is_active = 0, updated_at = ${sqlEscape(now)} WHERE user_id = ${sqlEscape(userId)};`,
    );
  }
  statements.push(
    `INSERT INTO plans (id, user_id, name, is_active, created_at, updated_at) VALUES (` +
      `${sqlEscape(planId)}, ${sqlEscape(userId)}, ${sqlEscape(plan.planName)}, ` +
      `${activate ? 1 : 0}, ${sqlEscape(now)}, ${sqlEscape(now)});`,
  );

  const summary = { planId, planName: plan.planName, activated: activate, days: [] };

  for (const day of resolvedPlan.days) {
    const dayId = randomUUID();
    statements.push(
      `INSERT INTO plan_days (id, plan_id, weekday, label, created_at, updated_at) VALUES (` +
        `${sqlEscape(dayId)}, ${sqlEscape(planId)}, ${day.weekday}, ${sqlEscape(day.label ?? null)}, ` +
        `${sqlEscape(now)}, ${sqlEscape(now)});`,
    );
    const supersetGroupIds = new Map();
    let orderIndex = 0;
    const exerciseSummaries = [];
    for (const ex of day.exercises) {
      let supersetGroupId = null;
      if (ex.supersetGroup) {
        if (!supersetGroupIds.has(ex.supersetGroup)) {
          supersetGroupIds.set(ex.supersetGroup, randomUUID());
        }
        supersetGroupId = supersetGroupIds.get(ex.supersetGroup);
      }
      const rowId = randomUUID();
      statements.push(
        `INSERT INTO plan_day_exercises (id, plan_day_id, exercise_id, order_index, target_sets, target_reps, target_weight, rest_seconds, notes, superset_group_id, created_at, updated_at) VALUES (` +
          `${sqlEscape(rowId)}, ${sqlEscape(dayId)}, ${sqlEscape(ex.exerciseId)}, ${orderIndex}, ` +
          `${ex.sets}, ${ex.reps}, ${ex.weight ?? null}, ${ex.restSeconds ?? 30}, ` +
          `${sqlEscape(ex.notes ?? null)}, ${sqlEscape(supersetGroupId)}, ${sqlEscape(now)}, ${sqlEscape(now)});`,
      );
      orderIndex += 1;
      exerciseSummaries.push({ name: ex.name, exerciseId: ex.exerciseId });
    }
    summary.days.push({
      dayId,
      weekday: day.weekday,
      label: day.label ?? null,
      exercises: exerciseSummaries,
    });
  }
  statements.push('COMMIT;');

  const sqlScript = statements.join('\n');
  writeFileSync(path.join(workdir, 'apply.sql'), sqlScript);

  execFileSync('sqlite3', ['-bail', dbPath], {
    input: sqlScript,
    encoding: 'utf8',
  });

  console.log('Escribiendo la DB modificada de vuelta al dispositivo...');
  const remoteTmp = `/data/local/tmp/gymapk-new-${Date.now()}.db`;
  adb(serial, ['push', dbPath, remoteTmp]);
  // `adb shell` re-serializa varios argv en una sola línea remota sin
  // preservar comillas por token: si el `>` viaja como argv suelto, el
  // shell remoto lo ve como texto literal en vez de una redirección. Por
  // eso acá se arma un único string ya citado y se pasa como un solo argv
  // a `adb shell`, no como tokens separados.
  adb(serial, [
    'shell',
    `run-as ${APP_PKG} sh -c "cat ${remoteTmp} > databases/gymapk.db"`,
  ]);
  adb(serial, ['shell', `rm -f ${remoteTmp}`]);

  console.log('Reabriendo la app...');
  adb(serial, ['shell', 'am', 'start', '-n', `${APP_PKG}/.MainActivity`]);

  console.log(JSON.stringify({ status: 'ok', ...summary, backupPath }, null, 2));
}

main().catch(err => {
  console.error(`\nFalló: ${err.message}`);
  process.exit(1);
});
