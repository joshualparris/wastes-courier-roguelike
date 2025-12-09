import { GameConstants } from "../constants";

// 0 = floor, 1 = wall, 2 = door (closed), 3 = exit pod
export type Tile = 0 | 1 | 2 | 3;

export class GridSystem {
  private tiles: Tile[] = [];
  private occupancy = new Map<string, string>();

  setTiles(tiles: Tile[]) {
    this.tiles = tiles;
  }

  clearOccupancy() {
    this.occupancy.clear();
  }

  idx(x: number, y: number) {
    return y * GameConstants.GRID_WIDTH + x;
  }

  key(x: number, y: number) {
    return `${x},${y}`;
  }

  inside(x: number, y: number) {
    return x >= 0 && y >= 0 && x < GameConstants.GRID_WIDTH && y < GameConstants.GRID_HEIGHT;
  }

  isWall(x: number, y: number) {
    if (!this.inside(x, y)) return true;
    const tile = this.tiles[this.idx(x, y)];
    return tile === 1 || tile === 2;
  }

  getTile(x: number, y: number) {
    return this.tiles[this.idx(x, y)];
  }

  setTile(x: number, y: number, value: Tile) {
    this.tiles[this.idx(x, y)] = value;
  }

  isDoorClosed(x: number, y: number) {
    return this.getTile(x, y) === 2;
  }

  openDoor(x: number, y: number) {
    if (this.isDoorClosed(x, y)) {
      this.setTile(x, y, 0);
    }
  }

  actorIdAt(x: number, y: number) {
    return this.occupancy.get(this.key(x, y));
  }

  setActorAt(x: number, y: number, actorId: string) {
    this.occupancy.set(this.key(x, y), actorId);
  }

  clearActorAt(x: number, y: number) {
    this.occupancy.delete(this.key(x, y));
  }

  moveActor(actorId: string, fromX: number, fromY: number, toX: number, toY: number) {
    this.clearActorAt(fromX, fromY);
    this.setActorAt(toX, toY, actorId);
  }
}
