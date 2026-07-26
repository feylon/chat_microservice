import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { MessageEntity } from '../../messages/entity/messages';

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
