import { Column, Entity, ManyToOne } from 'typeorm';
import { CommonEntity } from '../../utils/entity';

@Entity('order')
export class Order extends CommonEntity {
  @Column({ nullable: true })
  public MAWB: string;

  @Column({ nullable: true })
  public containerNumber: string;

  @Column({ unique: true, length: '300' })
  public trackingNumber: string;

  @Column({ nullable: true })
  public shipper: string;

  @Column({ nullable: true })
  public shipperPhoneNumber: string;

  @Column({ nullable: true })
  public shipperAddress: string;

  @Column()
  public destinationCountry: string;

  @Column()
  public recipient: string;

  @Column({ nullable: true })
  public RUT: string;

  @Column()
  public recipientPhoneNumber: string;

  @Column({ nullable: true })
  public recipientEmail: string;

  @Column()
  public region: string;

  @Column()
  public province: string;

  @Column()
  public comuna: string;

  @Column()
  public address: string;

  @Column('float',{ nullable: true })
  public weight: number;

  @Column('float',{ nullable: true })
  public value: number;

  @Column({ nullable: true })
  public description: string;

  @Column('float',{ nullable: true })
  public quantity: number;

  @Column('boolean', { default: 0 })
  public isDeleted: boolean;

  @Column()
  public createdBy: number;
}
