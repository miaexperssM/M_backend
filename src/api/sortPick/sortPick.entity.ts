import { Column, Entity } from 'typeorm';
import { CommonEntity } from '../../utils/entity';

@Entity('sortPick')
export class SortPick extends CommonEntity {
  @Column()
  public pickLevel: number;

  @Column()
  public port: number;

  @Column()
  public zoneId: number;

  @Column()
  public comunaName: string;

  @Column('boolean', { default: 0 })
  public isDeleted: boolean;

  @Column()
  public createdBy: number;

  @Column()
  public updatedBy: number;
}
