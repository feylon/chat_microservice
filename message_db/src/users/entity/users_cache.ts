import { Entity, Column, PrimaryColumn } from 'typeorm';

@Entity('users_cache')
export class UserCacheEntity {
  @PrimaryColumn()
  id!: string;

  @Column()
  username!: string;

  @Column({ nullable: true })
  avatarUrl!: string;
}
