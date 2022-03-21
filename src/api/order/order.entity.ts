import { Column, Entity, ManyToOne } from 'typeorm';
import { CommonEntity } from '../../utils/entity';

@Entity('order')
export class Order extends CommonEntity {
  @Column()
  public MAWB: string;

  @Column()
  public containerNumber: string;

  @Column({ unique: true, length: '300' })
  public trackingNumber: string;

  @Column()
  public shipper: string;

  @Column()
  public shipperPhoneNumber: string;

  @Column()
  public shipperAddress: string;

  @Column()
  public destinationCountry: string;

  @Column()
  public recipient: string;

  @Column()
  public RUT: string;

  @Column()
  public recipientPhoneNumber: string;

  @Column()
  public recipientEmail: string;

  @Column({ nullable: true })
  public region: string;

  @Column({ nullable: true })
  public province: string;

  @Column({ nullable: true })
  public comuna: string;

  @Column()
  public address: string;

  @Column('float')
  public weight: number;

  @Column('float')
  public value: number;

  @Column()
  public description: string;

  @Column('float')
  public quantity: number;

  @Column('boolean', { default: 0 })
  public isDeleted: boolean;

  @Column()
  public createdBy: number;
}
