import { MessageEntity } from '../../messages/entity/messages';
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';


@Entity('conversations')
export class ConversationEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('simple-array')
  participants!: string[];

  @Column({ default: 'private' })
  type!: 'private' | 'group';

  @OneToMany(() => MessageEntity, (message) => message.conversation)
  messages!: MessageEntity[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}