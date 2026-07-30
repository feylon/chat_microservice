import { ConversationEntity } from '../../conversations/entity/conversations';
import { FileEntity } from '../../files/entity/files';
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, Index, ManyToOne, OneToOne, JoinColumn, UpdateDateColumn } from 'typeorm';

@Entity('messages')
export class MessageEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column()
  conversationId!: string;

  @ManyToOne(() => ConversationEntity, (conversation) => conversation.messages)
  @JoinColumn({ name: 'conversationId' })
  conversation!: ConversationEntity;

  @Index()
  @Column()
  senderId!: string;

  @Column('text', { nullable: true })
  content!: string | null;

  @Column({ default: 'text' })
  messageType!: 'text' | 'file';

  @OneToOne(() => FileEntity, (file) => file.message, { nullable: true })
  file!: FileEntity;

  @Index()
  @CreateDateColumn()
  createdAt!: Date;

  @Index()
  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ default: false })
  isRead!: boolean;

  @Column({ default: false, select: false })
  isDelete!: boolean;
}