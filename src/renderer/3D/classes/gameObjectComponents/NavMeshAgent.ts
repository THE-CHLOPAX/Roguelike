import { GameObjectComponent } from '@tgdf';

import { MovableGameObject } from '../gameObjects/MovableGameObject';

export class NavMeshAgent extends GameObjectComponent {
  constructor(gameObject: MovableGameObject) {
    super(gameObject);
  }
}
