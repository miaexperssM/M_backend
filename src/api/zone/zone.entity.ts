import { Account } from '../account/account.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { CommonEntity } from '../../utils/entity';
import { Order } from 'api/order/order.entity';


@Entity('zone')
export class Zone extends CommonEntity {
  @Column()
  public title: string;

  @Column()
  public description: string;

  @Column('boolean', { default: false })
  public isDeleted: boolean;

  @Column()
  public createdBy: number;

  @Column('text')
  public points: string;

  @Column()
  public inChargeBy: number;

  @ManyToOne(
    type => Account,
    account => account.zones,
    { nullable: false },
  )
  public account: Account;

}
