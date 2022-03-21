import { Order } from '../order/order.entity';
import { Column, Entity, OneToMany, OneToOne } from 'typeorm';
import { CommonEntity } from '../../utils/entity';
import { type } from 'os';
import { Zone } from 'api/zone/zone.entity';

@Entity('account')
export class Account extends CommonEntity {
  @Column({ length: '30' })
  public accountId: string;

  @Column()
  public name: string;

  @Column({ unique: true, length: '300' })
  public email: string;

  @Column({ nullable: true, length: '30' })
  public permissions: string;

  @Column('text')
  public password: string;

  @Column('boolean', { default: 0 })
  public isDeleted: boolean;

  @Column()
  public createdBy: number;

  @OneToMany(
    type => Zone,
    zone => zone.account,
  )
  public zones: Zone[];
}
