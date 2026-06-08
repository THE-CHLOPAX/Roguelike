import { Entity } from '../../../gameObjects/Entity';
import { getEnemiesInRange } from './getEnemiesInRange';
import { EntityAI } from '../../../gameObjects/EntityAI';

export function getTargetEnemy(entity: EntityAI): Entity | null {
  const enemiesInRange = getEnemiesInRange(entity);
  if (enemiesInRange.length === 0) return null;

  const enemiesSortedByDistance = enemiesInRange.sort((a, b) => {
    const distanceA = entity.position.distanceTo(a.position);
    const distanceB = entity.position.distanceTo(b.position);
    return distanceA - distanceB;
  });

  return enemiesSortedByDistance[0];
}
