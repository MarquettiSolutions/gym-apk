import { groupConsecutiveBy } from '../grouping';

describe('groupConsecutiveBy', () => {
  it('agrupa corridas consecutivas con la misma key no nula', () => {
    const items = [
      { id: 'a', group: 'g1' },
      { id: 'b', group: 'g1' },
      { id: 'c', group: 'g2' },
    ];

    const result = groupConsecutiveBy(items, i => i.group);

    expect(result).toEqual([
      { groupId: 'g1', items: [items[0], items[1]] },
      { groupId: 'g2', items: [items[2]] },
    ]);
  });

  it('nunca fusiona items con key null entre sí, aunque sean consecutivos', () => {
    const items = [
      { id: 'a', group: null },
      { id: 'b', group: null },
    ];

    const result = groupConsecutiveBy(items, i => i.group);

    expect(result).toEqual([
      { groupId: null, items: [items[0]] },
      { groupId: null, items: [items[1]] },
    ]);
  });

  it('no fusiona dos corridas separadas de la misma key si no son consecutivas', () => {
    const items = [
      { id: 'a', group: 'g1' },
      { id: 'b', group: null },
      { id: 'c', group: 'g1' },
    ];

    const result = groupConsecutiveBy(items, i => i.group);

    expect(result).toEqual([
      { groupId: 'g1', items: [items[0]] },
      { groupId: null, items: [items[1]] },
      { groupId: 'g1', items: [items[2]] },
    ]);
  });

  it('devuelve lista vacía para input vacío', () => {
    expect(groupConsecutiveBy([], () => null)).toEqual([]);
  });
});
